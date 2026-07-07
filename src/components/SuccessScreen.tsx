import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Modal
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useLocalization } from '../context/LocalizationContext';
import { Plan, HeartRateData } from '../types';
import { COLORS, FONTS, RADIUS, SPACING } from '../utils/theme';

interface Props {
  plan: Plan;
  newStreak: number;
  heartRateData?: HeartRateData;
  onContinue: () => void;
  onClose: () => void;
}

export const SuccessScreen: React.FC<Props> = ({
  plan, newStreak, heartRateData, onContinue, onClose
}) => {
  const { t } = useLocalization();
  const mealsDone = plan.mealPlan.length;
  const workoutsDone = plan.workoutPlan.length;

  return (
    <Modal visible transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Ionicons name="close" size={24} color={COLORS.textGray} />
          </TouchableOpacity>

          <Text style={styles.emoji}>🎉</Text>
          <Text style={styles.title}>{t('successTitle')}</Text>
          <Text style={styles.subtitle}>{t('successSubtitle')}</Text>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Ionicons name="restaurant-outline" size={24} color={COLORS.cyan} />
              <Text style={styles.statNumber}>{mealsDone}</Text>
              <Text style={styles.statLabel}>{t('successMeals')}</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="flash-outline" size={24} color={COLORS.cyan} />
              <Text style={styles.statNumber}>{workoutsDone}</Text>
              <Text style={styles.statLabel}>{t('successExercises')}</Text>
            </View>
          </View>

          {/* Streak */}
          {newStreak > 0 && (
            <View style={styles.streakRow}>
              <Ionicons name="flame" size={24} color={COLORS.orange} />
              <Text style={styles.streakText}>
                <Text style={{ fontWeight: 'bold' }}>{newStreak}</Text> {t('successStreak')}
              </Text>
            </View>
          )}

          {/* Heart Rate */}
          {heartRateData?.preWorkout && heartRateData?.postWorkout && (
            <View style={styles.hrRow}>
              <Ionicons name="heart" size={18} color={COLORS.red} />
              <Text style={styles.hrText}>
                {heartRateData.preWorkout} → {heartRateData.postWorkout} BPM
              </Text>
            </View>
          )}

          <TouchableOpacity onPress={onContinue} activeOpacity={0.8} style={{ width: '100%' }}>
            <LinearGradient
              colors={[COLORS.cyan, COLORS.blue]}
              style={styles.continueBtn}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            >
              <Text style={styles.continueBtnText}>{t('successContinueButton')}</Text>
              <Ionicons name="arrow-forward" size={20} color="white" style={{ marginLeft: 8 }} />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: SPACING.xl },
  card: {
    backgroundColor: '#2D3748', borderRadius: RADIUS.xl, padding: SPACING.xxl,
    alignItems: 'center', borderWidth: 1, borderColor: COLORS.border,
  },
  closeBtn: { position: 'absolute', top: 16, right: 16 },
  emoji: { fontSize: 48, marginBottom: SPACING.md },
  title: { fontSize: FONTS.sizes.xxl, fontWeight: 'bold', color: COLORS.cyan, textAlign: 'center', marginBottom: SPACING.sm },
  subtitle: { fontSize: FONTS.sizes.md, color: COLORS.textGray, textAlign: 'center', marginBottom: SPACING.xl },
  statsRow: { flexDirection: 'row', gap: SPACING.lg, marginBottom: SPACING.xl },
  statCard: {
    backgroundColor: COLORS.bgCard, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: RADIUS.lg, padding: SPACING.xl, alignItems: 'center', minWidth: 100, gap: 4,
  },
  statNumber: { fontSize: FONTS.sizes.xxl, fontWeight: 'bold', color: COLORS.textWhite },
  statLabel: { fontSize: FONTS.sizes.xs, color: COLORS.textGray },
  streakRow: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  streakText: { color: COLORS.textWhite, fontSize: FONTS.sizes.md },
  hrRow: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  hrText: { color: COLORS.textGray, fontSize: FONTS.sizes.sm },
  continueBtn: {
    borderRadius: RADIUS.full, paddingVertical: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    marginTop: SPACING.md,
  },
  continueBtnText: { color: 'white', fontWeight: 'bold', fontSize: FONTS.sizes.md },
});
