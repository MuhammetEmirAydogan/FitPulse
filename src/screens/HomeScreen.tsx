import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useLocalization } from '../context/LocalizationContext';
import { User, HistoryItem } from '../types';
import { COLORS, FONTS, RADIUS, SPACING } from '../utils/theme';
import { StarBorder } from '../components/StarBorder';

const { width } = Dimensions.get('window');

interface Props {
  user: User | null;
  streak: number;
  history: HistoryItem[];
  hasActivePlan: boolean;
  onStartWizard: () => void;
  onViewPlan: () => void;
  onStartBodyFatWizard: () => void;
  onStartCalorieCalculator: () => void;
}

// ─── Sun Glow Button ──────────────────────────────────────────────────────────
const SunGlowButton: React.FC<{
  onPress: () => void;
  hasActivePlan: boolean;
  label: string;
}> = ({ onPress, hasActivePlan, label }) => {
  // Expanding ripple waves (3 staggered)
  const ripple1 = useRef(new Animated.Value(0)).current;
  const ripple2 = useRef(new Animated.Value(0)).current;
  const ripple3 = useRef(new Animated.Value(0)).current;
  // Ambient glow behind button
  const ambientAnim = useRef(new Animated.Value(0)).current;
  // Button breathing
  const breatheAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Ripple wave 1 — expands outward and fades
    const startRipple = (anim: Animated.Value, delay: number) => {
      const loop = () => {
        anim.setValue(0);
        Animated.timing(anim, {
          toValue: 1,
          duration: 3000,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }).start(() => loop());
      };
      setTimeout(loop, delay);
    };

    startRipple(ripple1, 0);
    startRipple(ripple2, 1000);
    startRipple(ripple3, 2000);

    // Ambient glow pulsing
    Animated.loop(
      Animated.sequence([
        Animated.timing(ambientAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(ambientAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Button breathing
    Animated.loop(
      Animated.sequence([
        Animated.timing(breatheAnim, {
          toValue: 1,
          duration: 2500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(breatheAnim, {
          toValue: 0,
          duration: 2500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const baseColor = hasActivePlan ? '#40E0D0' : '#FF7F50';
  const baseColorRgb = hasActivePlan ? '64,224,208' : '255,127,80';

  const BTN_SIZE = PULSE_SIZE;

  // Ripple animations — scale up from button size and fade out
  const makeRipple = (anim: Animated.Value) => ({
    scale: anim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.6] }),
    opacity: anim.interpolate({ inputRange: [0, 0.1, 0.7, 1], outputRange: [0, 0.3, 0.06, 0] }),
  });

  const r1 = makeRipple(ripple1);
  const r2 = makeRipple(ripple2);
  const r3 = makeRipple(ripple3);

  // Ambient glow
  const ambientScale = ambientAnim.interpolate({ inputRange: [0, 1], outputRange: [1.15, 1.3] });
  const ambientOpacity = ambientAnim.interpolate({ inputRange: [0, 1], outputRange: [0.2, 0.35] });

  // Button breathe
  const buttonScale = breatheAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.04] });

  const CONTAINER_SIZE = BTN_SIZE * 1.5;

  return (
    <View style={[sunStyles.container, { width: CONTAINER_SIZE, height: CONTAINER_SIZE }]}>
      {/* Expanding ripple wave 3 */}
      <Animated.View
        style={[
          sunStyles.ripple,
          {
            width: BTN_SIZE,
            height: BTN_SIZE,
            borderRadius: BTN_SIZE / 2,
            borderColor: `rgba(${baseColorRgb},0.4)`,
            transform: [{ scale: r3.scale }],
            opacity: r3.opacity,
          },
        ]}
      />

      {/* Expanding ripple wave 2 */}
      <Animated.View
        style={[
          sunStyles.ripple,
          {
            width: BTN_SIZE,
            height: BTN_SIZE,
            borderRadius: BTN_SIZE / 2,
            borderColor: `rgba(${baseColorRgb},0.5)`,
            transform: [{ scale: r2.scale }],
            opacity: r2.opacity,
          },
        ]}
      />

      {/* Expanding ripple wave 1 */}
      <Animated.View
        style={[
          sunStyles.ripple,
          {
            width: BTN_SIZE,
            height: BTN_SIZE,
            borderRadius: BTN_SIZE / 2,
            borderColor: `rgba(${baseColorRgb},0.6)`,
            transform: [{ scale: r1.scale }],
            opacity: r1.opacity,
          },
        ]}
      />

      {/* Ambient warm glow */}
      <Animated.View
        style={[
          sunStyles.ambientGlow,
          {
            width: BTN_SIZE + 30,
            height: BTN_SIZE + 30,
            borderRadius: (BTN_SIZE + 30) / 2,
            backgroundColor: `rgba(${baseColorRgb},0.15)`,
            transform: [{ scale: ambientScale }],
            opacity: ambientOpacity,
          },
        ]}
      />

      {/* Main button with breathing */}
      <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
        <StarBorder
          color={baseColor}
          speed={2000}
          radius={BTN_SIZE / 2}
          style={{ width: BTN_SIZE, height: BTN_SIZE }}
        >
          <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.88}
            style={{ width: BTN_SIZE, height: BTN_SIZE, borderRadius: BTN_SIZE / 2, overflow: 'hidden' }}
          >
            <LinearGradient
              colors={hasActivePlan ? ['#40E0D0', '#008B8B'] : ['#FF7F50', '#FFA500']}
              start={{ x: 0.2, y: 0 }}
              end={{ x: 0.8, y: 1 }}
              style={[sunStyles.button, { width: BTN_SIZE, height: BTN_SIZE, borderRadius: BTN_SIZE / 2 }]}
            >
              <Ionicons
                name={hasActivePlan ? 'fitness' : 'add'}
                size={28}
                color="#FFFFFF"
                style={{ marginBottom: 6 }}
              />
              <Text style={sunStyles.buttonText}>{label}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </StarBorder>
      </Animated.View>
    </View>
  );
};

const sunStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  ripple: {
    position: 'absolute',
    borderWidth: 1.5,
    backgroundColor: 'transparent',
  },
  ambientGlow: {
    position: 'absolute',
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: FONTS.sizes.md,
    textAlign: 'center',
    paddingHorizontal: SPACING.lg,
  },
});

// ─── Main HomeScreen ──────────────────────────────────────────────────────────
export const HomeScreen: React.FC<Props> = ({
  user, streak, history, hasActivePlan, onStartWizard, onViewPlan, onStartBodyFatWizard, onStartCalorieCalculator
}) => {
  const { t } = useLocalization();

  const handlePulsePress = () => {
    if (hasActivePlan) onViewPlan();
    else onStartWizard();
  };

  return (
    <View style={styles.root}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.brandLabel}>{t('fitpulseTitle')}</Text>

        <Text style={styles.welcomeTitle}>
          {t('homeWelcome', { name: user?.name?.split(' ')[0] || 'User' })}
        </Text>
        <Text style={styles.subtitle}>
          {hasActivePlan ? t('planReady') : streak > 0 ? t('homeStreakSubtitle', { count: streak }) : t('homeGreeting')}
        </Text>

        {/* Sun Glow Pulse Button */}
        <SunGlowButton
          onPress={handlePulsePress}
          hasActivePlan={hasActivePlan}
          label={hasActivePlan ? t('continuePlanButton') : t('createPlanButton')}
        />

        {/* Yağ Oranı Kartı */}
        <StarBorder color="#FF6B6B" speed={3500} radius={RADIUS.xl} style={{ width: '100%', marginBottom: SPACING.lg }}>
          <TouchableOpacity onPress={onStartBodyFatWizard} activeOpacity={0.85}>
            <LinearGradient
              colors={['rgba(255,107,107,0.12)', 'rgba(255,127,80,0.06)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.fatCardInner}
            >
              <View style={styles.fatCardLeft}>
                <View style={styles.fatIconBg}>
                  <Ionicons name="body" size={26} color="#FF6B6B" />
                </View>
                <View style={{ marginLeft: SPACING.md, flex: 1 }}>
                  <Text style={styles.fatCardTitle}>{t('homeCalculateBodyFat')}</Text>
                  <Text style={styles.fatCardSub}>{t('homeCalculateBodyFatSubtitle')}</Text>
                </View>
              </View>
              <View style={styles.fatCardArrow}>
                <Ionicons name="chevron-forward" size={18} color="#FF6B6B" />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </StarBorder>

        {/* Kalori Hesaplama Kartı */}
        <StarBorder color="#4ADE80" speed={3000} radius={RADIUS.xl} style={{ width: '100%', marginBottom: SPACING.xl }}>
          <TouchableOpacity onPress={onStartCalorieCalculator} activeOpacity={0.85}>
            <LinearGradient
              colors={['rgba(74,222,128,0.12)', 'rgba(34,197,94,0.06)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.fatCardInner}
            >
              <View style={styles.fatCardLeft}>
                <View style={[styles.fatIconBg, { backgroundColor: 'rgba(74,222,128,0.12)', borderColor: 'rgba(74,222,128,0.25)' }]}>
                  <Ionicons name="calculator" size={26} color="#4ADE80" />
                </View>
                <View style={{ marginLeft: SPACING.md, flex: 1 }}>
                  <Text style={styles.fatCardTitle}>{t('calorieCalcTitle')}</Text>
                  <Text style={styles.fatCardSub}>{t('calorieCalcSubtitle')}</Text>
                </View>
              </View>
              <View style={[styles.fatCardArrow, { backgroundColor: 'rgba(74,222,128,0.1)' }]}>
                <Ionicons name="chevron-forward" size={18} color="#4ADE80" />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </StarBorder>

        {(streak > 0 || history.length > 0) && (
          <View style={styles.statsRow}>
            {streak > 0 && (
              <View style={styles.statChip}>
                <Ionicons name="flame" size={15} color={COLORS.orange} />
                <Text style={styles.statChipText}>{streak} {t('successStreak')}</Text>
              </View>
            )}
            {history.length > 0 && (
              <View style={styles.statChip}>
                <Ionicons name="trophy" size={15} color={COLORS.yellow} />
                <Text style={styles.statChipText}>{history.length} {t('historyTotalPlans')}</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const PULSE_SIZE = width * 0.38;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0d1117',
    overflow: 'hidden',
  },
  scroll: {
    alignItems: 'center',
    paddingBottom: 40,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xl,
  },
  brandLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#40E0D0',
    letterSpacing: 5,
    textTransform: 'uppercase',
    marginBottom: SPACING.sm,
  },
  welcomeTitle: {
    fontSize: FONTS.sizes.xxxl,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: SPACING.sm,
    lineHeight: 42,
  },
  subtitle: {
    fontSize: FONTS.sizes.md,
    color: '#718096',
    textAlign: 'center',
    marginBottom: SPACING.xxxl + 8,
  },
  fatCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.lg,
  },
  fatCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  fatIconBg: {
    width: 50,
    height: 50,
    borderRadius: 15,
    backgroundColor: 'rgba(255,107,107,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,107,107,0.25)',
  },
  fatCardTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 3,
  },
  fatCardSub: {
    fontSize: FONTS.sizes.sm,
    color: '#718096',
  },
  fatCardArrow: {
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: 'rgba(255,107,107,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: SPACING.md,
  },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: '100%',
  },
  statChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 50,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  statChipText: {
    color: '#718096',
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
  },
});
