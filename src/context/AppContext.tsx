import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import {
  doc, getDoc, setDoc, updateDoc, deleteDoc,
  collection, addDoc, getDocs, query, orderBy, limit, deleteField, serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from '../config/firebaseConfig';

// Firestore undefined değerleri kabul etmez — objelerdeki undefined alanları temizle
const stripUndefined = (obj: any): any => {
  if (obj === null || obj === undefined) return null;
  if (Array.isArray(obj)) return obj.map(stripUndefined);
  if (typeof obj === 'object' && obj instanceof Date) return obj;
  if (typeof obj === 'object') {
    const cleaned: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        cleaned[key] = stripUndefined(value);
      }
    }
    return cleaned;
  }
  return obj;
};
import {
  User, ActivePlanState, HistoryItem, WeightLog,
  Plan, WorkoutFeedback, HeartRateData, CalorieResults,
} from '../types';

// Her plan tamamlamada kazanılan deneyim puanı (XP).
const XP_PER_COMPLETION = 50;

// Seviye hesabı: her seviye bir öncekinden daha fazla XP gerektirir (kademeli olarak zorlaşır).
const calculateLevelFromXP = (xp: number): number => {
  let level = 1;
  let requiredForNext = 100;
  while (xp >= requiredForNext) {
    level++;
    requiredForNext += level * 100;
  }
  return level;
};

// ─── Ek tipler ────────────────────────────────────────────────────────────────

export interface BodyFatLog {
  id: string;
  date: string;
  percentage: number;
  gender: 'male' | 'female';
}

export interface CalorieLog {
  id: string;
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  goal: string;
}

export interface HeartRateLog {
  id: string;
  date: string;
  bpm: number;
  type: 'daily' | 'pre' | 'post';
}

// ─── Context tipi ─────────────────────────────────────────────────────────────

interface AppContextType {
  isAuthenticated: boolean;
  firebaseUid: string | null;
  user: User | null;
  activePlan: ActivePlanState | null;
  isPlanConfirmed: boolean;
  history: HistoryItem[];
  streak: number;
  weightHistory: WeightLog[];
  bodyFatHistory: BodyFatLog[];
  calorieHistory: CalorieLog[];
  heartRateLogs: HeartRateLog[];
  initialBodyFat: number | null;
  initialCalorieTarget: CalorieResults | null;
  handleAuthSuccess: (userData: User, uid: string) => void;
  handleLogout: () => void;
  handleUserUpdate: (updatedUser: User) => void;
  handleAddWeight: (weight: number) => void;
  handleDeleteWeight: (id: string) => void;
  handlePlanGenerated: (plan: Plan) => void;
  handleToggleItemCompletion: (itemId: string) => void;
  handlePlanConfirm: () => void;
  handleMarkCompleted: () => void;
  handleSavePulse: (phase: 'pre' | 'post', bpm: number) => void;
  handleLogDailyPulse: (bpm: number) => void;
  finalizePlanCompletion: () => { plan: Plan; newStreak: number; heartRateData?: HeartRateData } | null;
  finalizeHistory: (feedback?: WorkoutFeedback, payload?: { plan: Plan; newStreak: number; heartRateData?: HeartRateData }) => void;
  handleSaveBodyFat: (percentage: number, gender: 'male' | 'female') => void;
  handleSaveCalorieResult: (result: CalorieResults, goal: string) => void;
  handleDeleteBodyFat: (id: string) => void;
  handleDeleteCalorie: (id: string) => void;
  setInitialBodyFat: (val: number | null) => void;
  setInitialCalorieTarget: (val: CalorieResults | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// ─── AsyncStorage anahtarları (offline fallback için) ─────────────────────────

const KEYS = {
  activePlan: 'fitpulse_activePlan',
  isPlanConfirmed: 'fitpulse_isPlanConfirmed',
};

// ─── Provider ─────────────────────────────────────────────────────────────────

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [firebaseUid, setFirebaseUid] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [activePlan, setActivePlan] = useState<ActivePlanState | null>(null);
  const [isPlanConfirmed, setIsPlanConfirmed] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [streak, setStreak] = useState(0);
  const [weightHistory, setWeightHistory] = useState<WeightLog[]>([]);
  const [bodyFatHistory, setBodyFatHistory] = useState<BodyFatLog[]>([]);
  const [calorieHistory, setCalorieHistory] = useState<CalorieLog[]>([]);
  const [heartRateLogs, setHeartRateLogs] = useState<HeartRateLog[]>([]);
  const [initialBodyFat, setInitialBodyFat] = useState<number | null>(null);
  const [initialCalorieTarget, setInitialCalorieTarget] = useState<CalorieResults | null>(null);
  const [loaded, setLoaded] = useState(false);

  // ─── Firebase Auth dinleyicisi ───────────────────────────────────────────────
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const uid = firebaseUser.uid;
        setFirebaseUid(uid);
        // Tüm veriyi Firestore'dan yükle — handleAuthSuccess'ten gelmiş olsa bile
        // bu sayede streak, xp vs. doğru değerlerle override edilir
        await loadUserDataFromFirestore(uid);
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        setFirebaseUid(null);
        setUser(null);
        setActivePlan(null);
        setIsPlanConfirmed(false);
        setHistory([]);
        setWeightHistory([]);
        setBodyFatHistory([]);
        setCalorieHistory([]);
        setHeartRateLogs([]);
        setStreak(0);
      }
      setLoaded(true);
    });
    return () => unsubscribe();
  }, []);

  // ─── Firestore'dan kullanıcı verilerini yükle ────────────────────────────────
  const loadUserDataFromFirestore = async (uid: string) => {
    try {
      // Kullanıcı profili
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setUser({
          name: data.name || '',
          email: data.email || '',
          photoUrl: data.photoUrl,
          xp: data.xp || 0,
          level: data.level || 1,
        });
        setStreak(data.streak || 0);
      }

      // Aktif plan — önce Firestore'dan yükle, fallback: AsyncStorage
      try {
        const activePlanDoc = await getDoc(doc(db, 'activePlans', uid));
        if (activePlanDoc.exists()) {
          const apData = activePlanDoc.data();
          setActivePlan({
            plan: apData.plan,
            completionStatus: apData.completionStatus || {},
            heartRateData: apData.heartRateData || { preWorkout: null, postWorkout: null },
          });
          setIsPlanConfirmed(apData.isPlanConfirmed || false);
          // AsyncStorage'ı da güncelle (hızlı okuma için)
          AsyncStorage.setItem(KEYS.activePlan, JSON.stringify({
            plan: apData.plan,
            completionStatus: apData.completionStatus || {},
            heartRateData: apData.heartRateData || { preWorkout: null, postWorkout: null },
          })).catch(() => {});
          AsyncStorage.setItem(KEYS.isPlanConfirmed, JSON.stringify(apData.isPlanConfirmed || false)).catch(() => {});
        } else {
          // Firestore'da yoksa AsyncStorage'dan oku (offline fallback)
          const [planRaw, confirmedRaw] = await Promise.all([
            AsyncStorage.getItem(KEYS.activePlan),
            AsyncStorage.getItem(KEYS.isPlanConfirmed),
          ]);
          if (planRaw) setActivePlan(JSON.parse(planRaw));
          if (confirmedRaw) setIsPlanConfirmed(JSON.parse(confirmedRaw));
        }
      } catch {
        // Firestore hata verirse AsyncStorage'dan oku
        const [planRaw, confirmedRaw] = await Promise.all([
          AsyncStorage.getItem(KEYS.activePlan),
          AsyncStorage.getItem(KEYS.isPlanConfirmed),
        ]);
        if (planRaw) setActivePlan(JSON.parse(planRaw));
        if (confirmedRaw) setIsPlanConfirmed(JSON.parse(confirmedRaw));
      }

      // Kilo geçmişi
      const weightSnap = await getDocs(
        query(collection(db, 'users', uid, 'weightHistory'), orderBy('date', 'desc'), limit(50))
      );
      const weights: WeightLog[] = weightSnap.docs.map(d => ({ id: d.id, ...d.data() } as WeightLog));
      setWeightHistory(weights.reverse());

      // Antrenman geçmişi
      const workoutSnap = await getDocs(
        query(collection(db, 'users', uid, 'workoutHistory'), orderBy('date', 'asc'), limit(100))
      );
      const workouts: HistoryItem[] = workoutSnap.docs.map(d => d.data() as HistoryItem);
      setHistory(workouts);

      // Streak yanma kontrolü (eğer 1 günden fazla süredir antrenman yapılmadıysa sıfırla)
      const realWorkoutsOnly = workouts.filter(w => w.plan && w.plan.title !== 'Günlük Nabız Ölçümü');
      if (realWorkoutsOnly.length > 0) {
        const lastWorkout = realWorkoutsOnly[realWorkoutsOnly.length - 1]; // En son antrenman
        const lastWorkoutDate = new Date(lastWorkout.date);
        lastWorkoutDate.setHours(0, 0, 0, 0);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const diffDays = Math.round((today.getTime() - lastWorkoutDate.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays > 1) {
          setStreak(0);
          updateDoc(doc(db, 'users', uid), { streak: 0 }).catch(() => {});
        }
      } else {
        setStreak(0);
        updateDoc(doc(db, 'users', uid), { streak: 0 }).catch(() => {});
      }

      // Vücut yağ geçmişi
      const bfSnap = await getDocs(
        query(collection(db, 'users', uid, 'bodyFatHistory'), orderBy('date', 'desc'), limit(50))
      );
      setBodyFatHistory(bfSnap.docs.map(d => ({ id: d.id, ...d.data() } as BodyFatLog)));

      // Kalori geçmişi
      const calSnap = await getDocs(
        query(collection(db, 'users', uid, 'calorieHistory'), orderBy('date', 'desc'), limit(50))
      );
      setCalorieHistory(calSnap.docs.map(d => ({ id: d.id, ...d.data() } as CalorieLog)));

      // Kalp atışı logları
      const hrSnap = await getDocs(
        query(collection(db, 'heartRateLogs', uid, 'logs'), orderBy('date', 'desc'), limit(100))
      );
      setHeartRateLogs(hrSnap.docs.map(d => ({ id: d.id, ...d.data() } as HeartRateLog)));

    } catch (e) {
      console.error('Firestore yükleme hatası:', e);
    }
  };

  // ─── Aktif plan değişince AsyncStorage'a kaydet (hızlı okuma için) ───────────
  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem(KEYS.activePlan, JSON.stringify(activePlan)).catch(() => { });
    AsyncStorage.setItem(KEYS.isPlanConfirmed, JSON.stringify(isPlanConfirmed)).catch(() => { });
  }, [activePlan, isPlanConfirmed, loaded]);

  // ─── Kullanıcı profili Firestore'a yaz ──────────────────────────────────────
  const syncUserToFirestore = useCallback(async (uid: string, userData: User, newStreak?: number) => {
    try {
      await setDoc(doc(db, 'users', uid), {
        name: userData.name,
        email: userData.email,
        photoUrl: userData.photoUrl || null,
        xp: userData.xp || 0,
        level: userData.level || 1,
        streak: newStreak !== undefined ? newStreak : streak,
        updatedAt: serverTimestamp(),
      }, { merge: true });
    } catch (e) {
      console.error('Kullanıcı sync hatası:', e);
    }
  }, [streak]);

  // ─── handleAuthSuccess ───────────────────────────────────────────────────────
  // Sadece uid ve auth durumunu set eder.
  // User data yüklemesi tamamen onAuthStateChanged → loadUserDataFromFirestore tarafından yapılır.
  // Bu sayede streak/xp sıfırlanma riski ortadan kalkar.
  const handleAuthSuccess = useCallback((userData: User, uid: string) => {
    // user'ı geçici olarak set ediyoruz ki UI boş kalmasın
    // onAuthStateChanged tetiklenince Firestore'dan gerçek veri yüklenecek
    setUser({ ...userData, xp: userData.xp || 0, level: userData.level || 1 });
    setFirebaseUid(uid);
    setIsAuthenticated(true);
    // NOT: syncUserToFirestore burada çağrılmıyor — streak/xp'yi sıfırlamayı önler
  }, []);

  // ─── handleLogout ────────────────────────────────────────────────────────────
  const handleLogout = useCallback(async () => {
    try {
      await signOut(auth);
      await AsyncStorage.multiRemove([KEYS.activePlan, KEYS.isPlanConfirmed]);
    } catch (e) {
      console.error('Çıkış hatası:', e);
    }
    setIsAuthenticated(false);
    setFirebaseUid(null);
    setUser(null);
    setActivePlan(null);
    setIsPlanConfirmed(false);
    setHistory([]);
    setWeightHistory([]);
    setBodyFatHistory([]);
    setCalorieHistory([]);
    setHeartRateLogs([]);
    setStreak(0);
  }, []);

  // ─── handleUserUpdate ────────────────────────────────────────────────────────
  const handleUserUpdate = useCallback((updatedUser: User) => {
    setUser(updatedUser);
    if (firebaseUid) syncUserToFirestore(firebaseUid, updatedUser);
  }, [firebaseUid, syncUserToFirestore]);

  // ─── handleAddWeight ─────────────────────────────────────────────────────────
  const handleAddWeight = useCallback(async (weight: number) => {
    const newLog: WeightLog = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString(),
      weight,
    };
    setWeightHistory(prev => [...prev, newLog]);

    if (firebaseUid) {
      try {
        await addDoc(collection(db, 'users', firebaseUid, 'weightHistory'), {
          weight: newLog.weight,
          date: newLog.date,
        });
      } catch (e) {
        console.error('Kilo kayıt hatası:', e);
      }
    }
  }, [firebaseUid]);

  // ─── handleDeleteWeight ──────────────────────────────────────────────────────
  const handleDeleteWeight = useCallback(async (id: string) => {
    setWeightHistory(prev => prev.filter(log => log.id !== id));

    if (firebaseUid) {
      try {
        await deleteDoc(doc(db, 'users', firebaseUid, 'weightHistory', id));
      } catch (e) {
        console.error('Kilo silme hatası:', e);
      }
    }
  }, [firebaseUid]);

  // ─── handleSaveBodyFat ───────────────────────────────────────────────────────
  const handleSaveBodyFat = useCallback(async (percentage: number, gender: 'male' | 'female') => {
    const newLog: BodyFatLog = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString(),
      percentage,
      gender,
    };
    setBodyFatHistory(prev => [newLog, ...prev]);

    if (firebaseUid) {
      try {
        await addDoc(collection(db, 'users', firebaseUid, 'bodyFatHistory'), {
          percentage,
          gender,
          date: newLog.date,
        });
      } catch (e) {
        console.error('Vücut yağ kayıt hatası:', e);
      }
    }
  }, [firebaseUid]);

  // ─── handleSaveCalorieResult ─────────────────────────────────────────────────
  const handleSaveCalorieResult = useCallback(async (result: CalorieResults, goal: string) => {
    const newLog: CalorieLog = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString(),
      calories: result.calories,
      protein: result.protein,
      carbs: result.carbs,
      fat: result.fat,
      goal,
    };
    setCalorieHistory(prev => [newLog, ...prev]);

    if (firebaseUid) {
      try {
        await addDoc(collection(db, 'users', firebaseUid, 'calorieHistory'), {
          calories: result.calories,
          protein: result.protein,
          carbs: result.carbs,
          fat: result.fat,
          goal,
          date: newLog.date,
        });
      } catch (e) {
        console.error('Kalori kayıt hatası:', e);
      }
    }
  }, [firebaseUid]);

  // ─── handleDeleteBodyFat ─────────────────────────────────────────────────────
  const handleDeleteBodyFat = useCallback(async (id: string) => {
    setBodyFatHistory(prev => prev.filter(log => log.id !== id));

    if (firebaseUid) {
      try {
        await deleteDoc(doc(db, 'users', firebaseUid, 'bodyFatHistory', id));
      } catch (e) {
        console.error('Vücut yağ silme hatası:', e);
      }
    }
  }, [firebaseUid]);

  // ─── handleDeleteCalorie ─────────────────────────────────────────────────────
  const handleDeleteCalorie = useCallback(async (id: string) => {
    setCalorieHistory(prev => prev.filter(log => log.id !== id));

    if (firebaseUid) {
      try {
        await deleteDoc(doc(db, 'users', firebaseUid, 'calorieHistory', id));
      } catch (e) {
        console.error('Kalori silme hatası:', e);
      }
    }
  }, [firebaseUid]);


  // ─── handlePlanGenerated ─────────────────────────────────────────────────────
  const handlePlanGenerated = useCallback((plan: Plan) => {
    const planWithIds: Plan = {
      ...plan,
      mealPlan: plan.mealPlan.map(item => ({ ...item, id: Math.random().toString(36).substr(2, 9) })),
      workoutPlan: plan.workoutPlan.map(item => ({ ...item, id: Math.random().toString(36).substr(2, 9) })),
    };
    const completionStatus: Record<string, boolean> = {};
    planWithIds.mealPlan.forEach(item => (completionStatus[item.id] = false));
    planWithIds.workoutPlan.forEach(item => (completionStatus[item.id] = false));
    setActivePlan({
      plan: planWithIds,
      completionStatus,
      heartRateData: { preWorkout: null, postWorkout: null },
    });
    setIsPlanConfirmed(false);
    setInitialBodyFat(null);
    setInitialCalorieTarget(null);

    // Firestore'a aktif planı yaz
    if (firebaseUid) {
      setDoc(doc(db, 'activePlans', firebaseUid), {
        plan: planWithIds,
        completionStatus,
        heartRateData: { preWorkout: null, postWorkout: null },
        isPlanConfirmed: false,
        generatedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }).catch(e => console.error('Plan kayıt hatası:', e));
    }
  }, [firebaseUid]);

  // ─── handleToggleItemCompletion ──────────────────────────────────────────────
  const handleToggleItemCompletion = useCallback((itemId: string) => {
    setActivePlan(prev => {
      if (!prev) return null;
      const updated = {
        ...prev,
        completionStatus: { ...prev.completionStatus, [itemId]: !prev.completionStatus[itemId] },
      };
      // Firestore güncelle
      if (firebaseUid) {
        updateDoc(doc(db, 'activePlans', firebaseUid), {
          completionStatus: updated.completionStatus,
          updatedAt: serverTimestamp(),
        }).catch(() => { });
      }
      return updated;
    });
  }, [firebaseUid]);

  // ─── handlePlanConfirm ───────────────────────────────────────────────────────
  const handlePlanConfirm = useCallback(() => {
    setIsPlanConfirmed(true);
    if (firebaseUid) {
      updateDoc(doc(db, 'activePlans', firebaseUid), {
        isPlanConfirmed: true,
        updatedAt: serverTimestamp(),
      }).catch(() => { });
    }
  }, [firebaseUid]);

  // ─── handleMarkCompleted ─────────────────────────────────────────────────────
  const handleMarkCompleted = useCallback(() => {
    // Completion flow consumer tarafında tetiklenir
  }, []);

  // ─── handleSavePulse ─────────────────────────────────────────────────────────
  const handleSavePulse = useCallback((phase: 'pre' | 'post', bpm: number) => {
    setActivePlan(prev => {
      if (!prev) return null;
      const newHeartRateData = { ...prev.heartRateData } as HeartRateData;
      if (phase === 'pre') newHeartRateData.preWorkout = bpm;
      else newHeartRateData.postWorkout = bpm;

      if (firebaseUid) {
        updateDoc(doc(db, 'activePlans', firebaseUid), {
          heartRateData: newHeartRateData,
          updatedAt: serverTimestamp(),
        }).catch(() => { });
      }
      return { ...prev, heartRateData: newHeartRateData };
    });
  }, [firebaseUid]);

  // ─── handleLogDailyPulse ─────────────────────────────────────────────────────
  const handleLogDailyPulse = useCallback(async (bpm: number) => {
    const now = new Date().toISOString();
    const dailyItem: HistoryItem = {
      date: now,
      plan: {
        title: 'Günlük Nabız Ölçümü',
        focus: 'Genel',
        duration: '1dk',
        mealPlan: [],
        workoutPlan: [],
      },
      heartRateData: { daily: bpm },
    };
    setHistory(prev => [...prev, dailyItem]);

    if (firebaseUid) {
      try {
        // Antrenman geçmişine ekle
        await addDoc(collection(db, 'users', firebaseUid, 'workoutHistory'), stripUndefined(dailyItem));
        // Kalp atışı loguna da ekle
        const hrLog: Omit<HeartRateLog, 'id'> = { date: now, bpm, type: 'daily' };
        const hrRef = await addDoc(collection(db, 'heartRateLogs', firebaseUid, 'logs'), stripUndefined(hrLog));
        setHeartRateLogs(prev => [{ id: hrRef.id, ...hrLog }, ...prev]);
      } catch (e) {
        console.error('Nabız log hatası:', e);
      }
    }
  }, [firebaseUid]);

  // ─── finalizePlanCompletion ──────────────────────────────────────────────────
  const finalizePlanCompletion = useCallback(() => {
    if (!activePlan) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Günlük nabız ölçümleri streak hesabını bozmasın diye filtreleme yapıyoruz
    const workoutHistoryOnly = history.filter(item => item.plan && item.plan.title !== 'Günlük Nabız Ölçümü');
    const sortedHistory = [...workoutHistoryOnly].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    const lastCompletionDate = sortedHistory.length > 0
      ? new Date(sortedHistory[sortedHistory.length - 1].date)
      : null;

    let newStreak = streak;
    if (lastCompletionDate) {
      lastCompletionDate.setHours(0, 0, 0, 0);
      const diffDays = Math.round((today.getTime() - lastCompletionDate.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) newStreak = streak + 1;
      else if (diffDays > 1) newStreak = 1;
    } else {
      newStreak = 1;
    }

    const payload = { plan: activePlan.plan, newStreak, heartRateData: activePlan.heartRateData };
    setActivePlan(null);
    setIsPlanConfirmed(false);

    // Aktif planı Firestore'dan sil
    if (firebaseUid) {
      deleteDoc(doc(db, 'activePlans', firebaseUid)).catch(() => { });
    }

    return payload;
  }, [activePlan, history, streak, firebaseUid]);

  // ─── finalizeHistory ─────────────────────────────────────────────────────────
  const finalizeHistory = useCallback(async (
    feedback?: WorkoutFeedback,
    payload?: { plan: Plan; newStreak: number; heartRateData?: HeartRateData }
  ) => {
    if (!payload) return;

    const completedItem: HistoryItem = {
      date: new Date().toISOString(),
      plan: payload.plan,
      feedback,
      heartRateData: payload.heartRateData,
    };
    setHistory(prev => [...prev, completedItem]);
    setStreak(payload.newStreak);

    let updatedUser = user;
    if (user) {
      const newXP = (user.xp || 0) + XP_PER_COMPLETION;
      updatedUser = { ...user, xp: newXP, level: calculateLevelFromXP(newXP) };
      setUser(updatedUser);
    }

    if (firebaseUid) {
      try {
        // Antrenman geçmişine ekle
        await addDoc(collection(db, 'users', firebaseUid, 'workoutHistory'), stripUndefined(completedItem));

        // Kalp atışı logları (pre/post varsa)
        if (payload.heartRateData) {
          const { preWorkout, postWorkout } = payload.heartRateData;
          const now = completedItem.date;
          if (preWorkout) {
            await addDoc(collection(db, 'heartRateLogs', firebaseUid, 'logs'), {
              date: now, bpm: preWorkout, type: 'pre',
            });
          }
          if (postWorkout) {
            await addDoc(collection(db, 'heartRateLogs', firebaseUid, 'logs'), {
              date: now, bpm: postWorkout, type: 'post',
            });
          }
        }

        // Kullanıcı profili güncelle (xp + streak)
        if (updatedUser) {
          await syncUserToFirestore(firebaseUid, updatedUser, payload.newStreak);
        }
      } catch (e) {
        console.error('Geçmiş kayıt hatası:', e);
      }
    }
  }, [firebaseUid, user, syncUserToFirestore]);

  // ─── Yükleniyor ──────────────────────────────────────────────────────────────
  if (!loaded) return null;

  return (
    <AppContext.Provider value={{
      isAuthenticated,
      firebaseUid,
      user,
      activePlan,
      isPlanConfirmed,
      history,
      streak,
      weightHistory,
      bodyFatHistory,
      calorieHistory,
      heartRateLogs,
      initialBodyFat,
      initialCalorieTarget,
      handleAuthSuccess,
      handleLogout,
      handleUserUpdate,
      handleAddWeight,
      handleDeleteWeight,
      handlePlanGenerated,
      handleToggleItemCompletion,
      handlePlanConfirm,
      handleMarkCompleted,
      handleSavePulse,
      handleLogDailyPulse,
      finalizePlanCompletion,
      finalizeHistory,
      handleSaveBodyFat,
      handleSaveCalorieResult,
      handleDeleteBodyFat,
      handleDeleteCalorie,
      setInitialBodyFat,
      setInitialCalorieTarget,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
