import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
  Animated, Image, Alert, Dimensions, Easing
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebaseConfig';
import { useLocalization } from '../context/LocalizationContext';
import { User } from '../types';
import { COLORS, FONTS, RADIUS, SPACING } from '../utils/theme';
import { StarBorder } from '../components/StarBorder';

const { width, height } = Dimensions.get('window');

// ─── Floating Particles Component ─────────────────────────────────────────────
const PARTICLE_COUNT = 18;

interface Particle {
  x: number;
  y: number;
  r: number;
  opacity: number;
  speed: number;
  anim: Animated.Value;
}

const FloatingParticles: React.FC = () => {
  const particles = useRef<Particle[]>(
    Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 2 + 0.8,
      opacity: Math.random() * 0.4 + 0.1,
      speed: Math.random() * 8000 + 6000,
      anim: new Animated.Value(0),
    }))
  ).current;

  useEffect(() => {
    particles.forEach((p) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(p.anim, {
            toValue: 1,
            duration: p.speed,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(p.anim, {
            toValue: 0,
            duration: p.speed,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      ).start();
    });
  }, []);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {particles.map((p, i) => {
        const translateY = p.anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -(30 + Math.random() * 40)],
        });
        const translateX = p.anim.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [0, (Math.random() - 0.5) * 20, 0],
        });
        const opacity = p.anim.interpolate({
          inputRange: [0, 0.3, 0.7, 1],
          outputRange: [p.opacity * 0.5, p.opacity, p.opacity, p.opacity * 0.5],
        });

        return (
          <Animated.View
            key={i}
            style={{
              position: 'absolute',
              left: p.x,
              top: p.y,
              width: p.r * 2,
              height: p.r * 2,
              borderRadius: p.r,
              backgroundColor: i % 3 === 0 ? 'rgba(64,224,208,0.6)' : 'rgba(255,255,255,0.5)',
              transform: [{ translateY }, { translateX }],
              opacity,
            }}
          />
        );
      })}
    </View>
  );
};

// ─── Animated Input Component ─────────────────────────────────────────────────
interface AnimatedInputProps {
  icon: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address';
  autoCapitalize?: 'none' | 'sentences';
}

const AnimatedInput: React.FC<AnimatedInputProps> = ({
  icon, placeholder, value, onChangeText, secureTextEntry, keyboardType, autoCapitalize,
}) => {
  const borderAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handleFocus = () => {
    Animated.parallel([
      Animated.timing(borderAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1.02,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleBlur = () => {
    Animated.parallel([
      Animated.timing(borderAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(255,255,255,0.1)', 'rgba(64,224,208,0.5)'],
  });

  const iconColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#4A5568', '#40E0D0'],
  });

  return (
    <Animated.View style={[styles.inputWrapper, { transform: [{ scale: scaleAnim }] }]}>
      <Animated.View style={[styles.inputBorder, { borderColor }]}>
        <Animated.Text style={[styles.inputIcon]}>
          <Ionicons name={icon as any} size={20} color="#4A5568" />
        </Animated.Text>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#4A5568"
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
        />
      </Animated.View>
    </Animated.View>
  );
};

// ─── Shimmer Button Component ─────────────────────────────────────────────────
const ShimmerButton: React.FC<{
  onPress: () => void;
  loading: boolean;
  label: string;
  hasInput: boolean;
}> = ({ onPress, loading, label, hasInput }) => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Continuous shimmer
    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 2500,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  // Glow when user types
  useEffect(() => {
    Animated.timing(glowAnim, {
      toValue: hasInput ? 1 : 0,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [hasInput]);

  const shimmerTranslateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-width, width],
  });

  const buttonScale = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.02],
  });

  return (
    <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
      <StarBorder color="#40E0D0" speed={2000} radius={50} style={{ marginTop: SPACING.sm }}>
        <TouchableOpacity onPress={onPress} disabled={loading} activeOpacity={0.85}>
          <LinearGradient
            colors={['#40E0D0', '#008B8B']}
            style={styles.submitButton}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          >
            {/* Shimmer overlay */}
            <Animated.View
              style={[
                styles.shimmerOverlay,
                { transform: [{ translateX: shimmerTranslateX }] },
              ]}
            >
              <LinearGradient
                colors={[
                  'rgba(255,255,255,0)',
                  'rgba(255,255,255,0.15)',
                  'rgba(255,255,255,0)',
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
              />
            </Animated.View>

            {loading
              ? <ActivityIndicator color="white" />
              : <Text style={styles.submitButtonText}>{label}</Text>
            }
          </LinearGradient>
        </TouchableOpacity>
      </StarBorder>
    </Animated.View>
  );
};

// ─── Main Auth Screen ─────────────────────────────────────────────────────────
interface Props {
  onAuthSuccess: (user: User, uid: string) => void;
}

export const AuthScreen: React.FC<Props> = ({ onAuthSuccess }) => {
  const { t } = useLocalization();
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // ── Stagger fade-in animations ──
  const logoFadeAnim = useRef(new Animated.Value(0)).current;
  const logoSlideAnim = useRef(new Animated.Value(30)).current;
  const cardFadeAnim = useRef(new Animated.Value(0)).current;
  const cardSlideAnim = useRef(new Animated.Value(40)).current;

  // ── Logo floating animation ──
  const floatAnim = useRef(new Animated.Value(0)).current;

  // ── Logo pulse/glow ──
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Stagger entrance: logo fades in first, then card
    Animated.stagger(300, [
      Animated.parallel([
        Animated.timing(logoFadeAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(logoSlideAnim, {
          toValue: 0,
          duration: 800,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(cardFadeAnim, {
          toValue: 1,
          duration: 700,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(cardSlideAnim, {
          toValue: 0,
          duration: 700,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Continuous float
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -10,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Logo pulse glow
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const pulseScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.25],
  });
  const pulseOpacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0],
  });

  const hasInput = email.length > 0 || password.length > 0 || name.length > 0;

  const getFirebaseErrorMessage = (code: string): string => {
    switch (code) {
      case 'auth/email-already-in-use': return 'Bu email adresi zaten kullanılıyor.';
      case 'auth/invalid-email': return 'Geçersiz email adresi.';
      case 'auth/weak-password': return 'Şifre en az 6 karakter olmalı.';
      case 'auth/user-not-found': return 'Bu email ile kayıtlı kullanıcı bulunamadı.';
      case 'auth/wrong-password': return 'Şifre hatalı.';
      case 'auth/invalid-credential': return 'Email veya şifre hatalı.';
      case 'auth/too-many-requests': return 'Çok fazla deneme. Lütfen bekleyin.';
      case 'auth/network-request-failed': return 'İnternet bağlantısı yok.';
      default: return 'Bir hata oluştu. Lütfen tekrar deneyin.';
    }
  };

  const handleSubmit = async () => {
    setErrorMsg(null);

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Email ve şifre boş bırakılamaz.');
      return;
    }
    if (!isLogin && !name.trim()) {
      setErrorMsg('İsim boş bırakılamaz.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Şifre en az 6 karakter olmalı.');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
        const uid = cred.user.uid;

        const userDoc = await getDoc(doc(db, 'users', uid));
        let userData: User;

        if (userDoc.exists()) {
          const data = userDoc.data();
          userData = {
            name: data.name || cred.user.displayName || 'FitPulse User',
            email: cred.user.email || email,
            photoUrl: data.photoUrl,
            xp: data.xp || 0,
            level: data.level || 1,
          };
        } else {
          userData = {
            name: cred.user.displayName || 'FitPulse User',
            email: cred.user.email || email,
            xp: 0,
            level: 1,
          };
          await setDoc(doc(db, 'users', uid), {
            ...userData,
            streak: 0,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        }

        onAuthSuccess(userData, uid);
      } else {
        const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
        const uid = cred.user.uid;

        await updateProfile(cred.user, { displayName: name.trim() });

        const userData: User = {
          name: name.trim(),
          email: cred.user.email || email,
          xp: 0,
          level: 1,
        };

        await setDoc(doc(db, 'users', uid), {
          name: userData.name,
          email: userData.email,
          photoUrl: null,
          xp: 0,
          level: 1,
          streak: 0,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        onAuthSuccess(userData, uid);
      }
    } catch (err: any) {
      const msg = getFirebaseErrorMessage(err.code || '');
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Floating star particles */}
      <FloatingParticles />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          {/* Logo — fade-in + float + pulse glow */}
          <Animated.View
            style={[
              styles.logoSection,
              {
                opacity: logoFadeAnim,
                transform: [
                  { translateY: Animated.add(logoSlideAnim, floatAnim) },
                ],
              },
            ]}
          >
            {/* Pulse glow ring behind logo */}
            <View style={styles.logoContainer}>
              <Animated.View
                style={[
                  styles.pulseRing,
                  {
                    transform: [{ scale: pulseScale }],
                    opacity: pulseOpacity,
                  },
                ]}
              />
              <Image
                source={require('../../assets/logo.jpg')}
                style={styles.logoImg}
                resizeMode="contain"
              />
            </View>

            <Text style={styles.appTitle}>
              <Text style={{ color: '#FFFFFF' }}>Fit</Text>
              <Text style={{ color: '#40E0D0' }}>Pulse</Text>
            </Text>
            <Text style={styles.appSubtitle}>{t('homeGreeting')}</Text>
          </Animated.View>

          {/* Form Card — fade-in from below */}
          <Animated.View
            style={[
              styles.card,
              {
                opacity: cardFadeAnim,
                transform: [{ translateY: cardSlideAnim }],
              },
            ]}
          >
            <Text style={styles.formTitle}>
              {isLogin ? t('loginTitle') : t('registerTitle')}
            </Text>

            {!isLogin && (
              <AnimatedInput
                icon="person-outline"
                placeholder={t('namePlaceholder')}
                value={name}
                onChangeText={setName}
              />
            )}

            <AnimatedInput
              icon="mail-outline"
              placeholder={t('emailPlaceholder')}
              value={email}
              onChangeText={(text) => { setEmail(text); setErrorMsg(null); }}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <AnimatedInput
              icon="lock-closed-outline"
              placeholder={t('passwordPlaceholder')}
              value={password}
              onChangeText={(text) => { setPassword(text); setErrorMsg(null); }}
              secureTextEntry
            />

            {/* Error message */}
            {errorMsg && (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle-outline" size={16} color="#FC8181" />
                <Text style={styles.errorText}>{errorMsg}</Text>
              </View>
            )}

            {/* Shimmer button with typing glow */}
            <ShimmerButton
              onPress={handleSubmit}
              loading={loading}
              label={isLogin ? t('loginButton') : t('registerButton')}
              hasInput={hasInput}
            />

            <View style={styles.switchRow}>
              <Text style={styles.switchText}>
                {isLogin ? t('noAccount') : t('hasAccount')}{' '}
              </Text>
              <TouchableOpacity onPress={() => { setIsLogin(!isLogin); setErrorMsg(null); }}>
                <Text style={styles.switchLink}>
                  {isLogin ? t('registerHere') : t('loginHere')}
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d1117',
    overflow: 'hidden',
  },
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: 40,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: SPACING.xxxl,
  },
  logoContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  pulseRing: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: '#40E0D0',
    backgroundColor: 'rgba(64,224,208,0.08)',
  },
  logoImg: {
    width: 100,
    height: 100,
    borderRadius: 24,
  },
  appTitle: {
    fontSize: FONTS.sizes.huge,
    fontWeight: '800',
    marginBottom: SPACING.xs,
  },
  appSubtitle: {
    fontSize: FONTS.sizes.md,
    color: '#718096',
  },
  card: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 24,
    padding: SPACING.xxl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  formTitle: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: SPACING.xxl,
  },
  inputWrapper: {
    marginBottom: SPACING.lg,
  },
  inputBorder: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 50,
    overflow: 'hidden',
  },
  inputIcon: {
    paddingLeft: 16,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    paddingLeft: 12,
    paddingRight: 16,
    color: '#FFFFFF',
    fontSize: FONTS.sizes.md,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(252,129,129,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(252,129,129,0.3)',
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  errorText: {
    color: '#FC8181',
    fontSize: FONTS.sizes.sm,
    flex: 1,
  },
  submitButton: {
    borderRadius: 50,
    paddingVertical: 16,
    alignItems: 'center',
    overflow: 'hidden',
  },
  shimmerOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 80,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: FONTS.sizes.lg,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.xl,
  },
  switchText: {
    color: '#718096',
    fontSize: FONTS.sizes.sm,
  },
  switchLink: {
    color: '#40E0D0',
    fontWeight: '700',
    fontSize: FONTS.sizes.sm,
  },
});
