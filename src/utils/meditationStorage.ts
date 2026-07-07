import {
  collection, addDoc, getDocs, deleteDoc,
  doc, query, orderBy, limit, serverTimestamp,
} from 'firebase/firestore';
import { db, auth } from '../config/firebaseConfig';

// =============================================
// TYPES
// =============================================

export interface MeditationLog {
  id: string;
  theme: string;
  duration: string;       // '3min' | '5min' | '10min' | 'timer'
  date: string;           // ISO string
  durationSeconds: number;
}

export interface FavoriteMeditation {
  id: string;
  theme: string;
  script: string;
  date: string;
  duration: string;
}

export interface MeditationStats {
  totalSessions: number;
  totalMinutes: number;
  weekSessions: number;
  weekMinutes: number;
  currentStreak: number;
}

// =============================================
// YARDIMCI — mevcut kullanıcı UID'i
// =============================================

const getUid = (): string | null => auth.currentUser?.uid ?? null;

// =============================================
// HISTORY
// =============================================

export const getMeditationHistory = async (): Promise<MeditationLog[]> => {
  const uid = getUid();
  if (!uid) return [];
  try {
    const snap = await getDocs(
      query(
        collection(db, 'meditation', uid, 'logs'),
        orderBy('date', 'desc'),
        limit(200),
      )
    );
    return snap.docs.map(d => ({
      id: d.id,
      theme: d.data().theme,
      duration: d.data().duration,
      date: d.data().date,
      durationSeconds: d.data().durationSeconds,
    }));
  } catch { return []; }
};

export const saveMeditationLog = async (
  log: Omit<MeditationLog, 'id' | 'date'>
): Promise<void> => {
  const uid = getUid();
  if (!uid) return;
  try {
    await addDoc(collection(db, 'meditation', uid, 'logs'), {
      theme: log.theme,
      duration: log.duration,
      durationSeconds: log.durationSeconds,
      date: new Date().toISOString(),
      createdAt: serverTimestamp(),
    });
  } catch (e) {
    console.error('Meditasyon log kayıt hatası:', e);
  }
};

export const getMeditationStats = async (): Promise<MeditationStats> => {
  const history = await getMeditationHistory();
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const weekLogs = history.filter(h => new Date(h.date) >= weekAgo);

  // Streak hesapla
  let currentStreak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const uniqueDays = [...new Set(
    history.map(h => {
      const d = new Date(h.date);
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    })
  )].sort((a, b) => b - a);

  for (let i = 0; i < uniqueDays.length; i++) {
    const expectedDay = new Date(today.getTime() - i * 24 * 60 * 60 * 1000).getTime();
    if (uniqueDays[i] === expectedDay) {
      currentStreak++;
    } else {
      break;
    }
  }

  return {
    totalSessions: history.length,
    totalMinutes: Math.round(history.reduce((sum, h) => sum + h.durationSeconds, 0) / 60),
    weekSessions: weekLogs.length,
    weekMinutes: Math.round(weekLogs.reduce((sum, h) => sum + h.durationSeconds, 0) / 60),
    currentStreak,
  };
};

// =============================================
// FAVORITES
// =============================================

export const getFavorites = async (): Promise<FavoriteMeditation[]> => {
  const uid = getUid();
  if (!uid) return [];
  try {
    const snap = await getDocs(
      query(
        collection(db, 'meditation', uid, 'favorites'),
        orderBy('date', 'desc'),
        limit(100),
      )
    );
    return snap.docs.map(d => ({
      id: d.id,
      theme: d.data().theme,
      script: d.data().script,
      date: d.data().date,
      duration: d.data().duration,
    }));
  } catch { return []; }
};

export const addFavorite = async (
  fav: Omit<FavoriteMeditation, 'id' | 'date'>
): Promise<void> => {
  const uid = getUid();
  if (!uid) return;
  try {
    await addDoc(collection(db, 'meditation', uid, 'favorites'), {
      theme: fav.theme,
      script: fav.script,
      duration: fav.duration,
      date: new Date().toISOString(),
      createdAt: serverTimestamp(),
    });
  } catch (e) {
    console.error('Favori ekle hatası:', e);
  }
};

export const removeFavorite = async (id: string): Promise<void> => {
  const uid = getUid();
  if (!uid) return;
  try {
    await deleteDoc(doc(db, 'meditation', uid, 'favorites', id));
  } catch (e) {
    console.error('Favori sil hatası:', e);
  }
};

export const isFavorite = async (script: string): Promise<boolean> => {
  const favorites = await getFavorites();
  return favorites.some(f => f.script === script);
};
