import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useLocalization } from '../context/LocalizationContext';
import { ActivePlanState, MealItem, WorkoutItem, HistoryItem } from '../types';
import { COLORS, FONTS, RADIUS, SPACING } from '../utils/theme';
import { StarBorder } from '../components/StarBorder';

interface Props {
  activePlanState: ActivePlanState | null;
  isPlanConfirmed: boolean;
  isPlanGenerating?: boolean;
  history: HistoryItem[];
  onConfirm: () => void;
  onMarkCompleted: () => void;
  onCreateAnother: () => void;
  onStartWizard: () => void;
  onToggleItem: (id: string) => void;
  onShowRecipe: (meal: MealItem) => void;
  onShowVideo: (exercise: WorkoutItem) => void;
}

const getMealIcon = (mealName: string): string => {
  const lower = mealName.toLowerCase();
  if (lower.includes('breakfast') || lower.includes('kahvaltı')) return 'sunny-outline';
  if (lower.includes('lunch') || lower.includes('öğle')) return 'partly-sunny-outline';
  if (lower.includes('dinner') || lower.includes('akşam')) return 'moon-outline';
  if (lower.includes('snack') || lower.includes('ara')) return 'nutrition-outline';
  return 'restaurant-outline';
};

export const CurrentPlanScreen: React.FC<Props> = ({
  activePlanState, isPlanConfirmed, isPlanGenerating = false, history,
  onConfirm, onMarkCompleted, onCreateAnother, onStartWizard,
  onToggleItem, onShowRecipe, onShowVideo,
}) => {
  const { t } = useLocalization();

  // Plan is being generated — show a full-screen loading indicator
  if (isPlanGenerating) {
    return (
      <View style={[styles.emptyContainer, { gap: 16 }]}>
        <ActivityIndicator size="large" color="#40E0D0" />
        <Text style={styles.emptyTitle}>{t('planGeneratingTitle')}</Text>
        <Text style={styles.emptySubtitle}>{t('planGeneratingSubtitle')}</Text>
      </View>
    );
  }

  // No plan
  if (!activePlanState) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="clipboard-outline" size={80} color="rgba(255,255,255,0.2)" />
        <Text style={styles.emptyTitle}>{t('noPlanTitle')}</Text>
        <Text style={styles.emptySubtitle}>{t('noPlanSubtitle')}</Text>
        <StarBorder color={COLORS.cyan} speed={2200} radius={RADIUS.full}>
          <TouchableOpacity onPress={onStartWizard} activeOpacity={0.8}>
            <LinearGradient colors={[COLORS.cyan, COLORS.blue]} style={styles.emptyButton} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <Text style={styles.emptyButtonText}>{t('createPlanButton')}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </StarBorder>

        {history.length > 0 && (
          <View style={styles.historySection}>
            <Text style={styles.historyTitle}>{t('planHistoryTitle')}</Text>
            {history.slice(-3).reverse().map((item, i) => (
              <View key={i} style={styles.historyCard}>
                <Text style={styles.historyPlanTitle} numberOfLines={1}>{item.plan.title}</Text>
                <Text style={styles.historyDate}>{new Date(item.date).toLocaleDateString()}</Text>
                {item.feedback && (
                  <View style={styles.feedbackBadge}>
                    <Ionicons name="star" size={12} color={COLORS.yellow} />
                    <Text style={styles.feedbackBadgeText}>{t(`feedback_${item.feedback.rating}`)}</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}
      </View>
    );
  }

  const { plan, completionStatus } = activePlanState;
  const allItems = [...plan.mealPlan.map(m => m.id), ...plan.workoutPlan.map(w => w.id)];
  const completedCount = allItems.filter(id => completionStatus[id]).length;
  const totalCount = allItems.length;
  const completionPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      {/* Plan Header */}
      <View style={styles.planHeader}>
        <Text style={styles.planTitle}>{plan.title}</Text>
        <View style={styles.planMeta}>
          <View style={styles.metaItem}>
            <Ionicons name="flash-outline" size={16} color={COLORS.cyan} />
            <Text style={styles.metaText} numberOfLines={2}>{plan.focus}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={16} color={COLORS.cyan} />
            <Text style={styles.metaText} numberOfLines={1}>{plan.duration}</Text>
          </View>
        </View>

        {/* Progress bar */}
        <View style={styles.progressRow}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${completionPercent}%` }]} />
          </View>
          <Text style={styles.progressText}>{completionPercent}%</Text>
        </View>
      </View>

      {/* Feedback acknowledgment banner */}
      {history.some(h => h.feedback) && (
        <View style={styles.feedbackBanner}>
          <Ionicons name="sparkles" size={16} color={COLORS.yellow} />
          <Text style={styles.feedbackBannerText}>{t('feedbackBannerText')}</Text>
        </View>
      )}

      {/* Meal Plan */}
      <View style={styles.sectionHeader}>
        <Ionicons name="restaurant-outline" size={20} color={COLORS.cyan} />
        <Text style={styles.sectionTitle}>{t('mealPlanTitle')}</Text>
      </View>

      {plan.mealPlan.map(meal => (
        <TouchableOpacity
          key={meal.id}
          style={[styles.card, completionStatus[meal.id] && styles.cardCompleted]}
          activeOpacity={0.8}
        >
          <View style={styles.cardRow}>
            <View style={styles.cardLeft}>
              <View style={styles.mealIconRow}>
                <Ionicons name={getMealIcon(meal.mealName) as any} size={20} color={COLORS.yellow} />
                <Text style={[styles.mealName, completionStatus[meal.id] && styles.strikethrough]}>
                  {meal.mealName}
                </Text>
              </View>
              <Text style={[styles.mealDesc, completionStatus[meal.id] && styles.strikethrough]}>
                {meal.description}
              </Text>
            </View>
            <TouchableOpacity onPress={() => onToggleItem(meal.id)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons
                name={completionStatus[meal.id] ? 'checkbox' : 'square-outline'}
                size={24}
                color={completionStatus[meal.id] ? COLORS.cyan : COLORS.textGray}
              />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => onShowRecipe(meal)}
            activeOpacity={0.7}
          >
            <Ionicons name="book-outline" size={16} color={COLORS.cyan} />
            <Text style={styles.actionBtnText}>{t('getRecipeButton')}</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      ))}

      {/* Workout Plan */}
      <View style={styles.sectionHeader}>
        <Ionicons name="flash-outline" size={20} color={COLORS.cyan} />
        <Text style={styles.sectionTitle}>{t('workoutPlanTitle')}</Text>
      </View>

      {plan.workoutPlan.map(item => (
        <TouchableOpacity
          key={item.id}
          style={[styles.card, completionStatus[item.id] && styles.cardCompleted]}
          activeOpacity={0.8}
        >
          <View style={styles.cardRow}>
            <View style={styles.cardLeft}>
              <Text style={[styles.mealName, completionStatus[item.id] && styles.strikethrough]}>
                {item.exercise}
              </Text>
              <Text style={[styles.mealDesc, completionStatus[item.id] && styles.strikethrough]}>
                {item.details}
              </Text>
            </View>
            <TouchableOpacity onPress={() => onToggleItem(item.id)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons
                name={completionStatus[item.id] ? 'checkbox' : 'square-outline'}
                size={24}
                color={completionStatus[item.id] ? COLORS.cyan : COLORS.textGray}
              />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={[styles.actionBtn, { gap: 4 }]}
            onPress={() => onShowVideo(item)}
            activeOpacity={0.7}
          >
            <Ionicons name="play-circle-outline" size={16} color={COLORS.orange} />
            <Text style={[styles.actionBtnText, { color: COLORS.orange }]}>{t('playVideoButton')}</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      ))}

      {/* Action buttons */}
      <View style={styles.actionRow}>
        {!isPlanConfirmed ? (
          <StarBorder color={COLORS.cyan} speed={2200} radius={RADIUS.full} style={{ flex: 1 }}>
            <TouchableOpacity onPress={onConfirm} activeOpacity={0.8}>
              <LinearGradient colors={[COLORS.cyan, COLORS.blue]} style={styles.mainButton} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                <Text style={styles.mainButtonText}>{t('confirmPlanButton')}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </StarBorder>
        ) : (
          <StarBorder color={COLORS.green} speed={2200} radius={RADIUS.full} style={{ flex: 1 }}>
            <TouchableOpacity onPress={onMarkCompleted} activeOpacity={0.8}>
              <LinearGradient colors={[COLORS.green, COLORS.teal]} style={styles.mainButton} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                <Ionicons name="checkmark-circle-outline" size={20} color="white" style={{ marginRight: 8 }} />
                <Text style={styles.mainButtonText}>{t('markCompletedButton')}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </StarBorder>
        )}
      </View>
      <TouchableOpacity onPress={onCreateAnother} style={styles.createAnotherBtn} activeOpacity={0.7}>
        <Text style={styles.createAnotherText}>{t('createAnotherButton')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: SPACING.xl, paddingBottom: 80 },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
    paddingBottom: 60,
    gap: 12,
  },
  emptyTitle: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: 'bold',
    color: COLORS.textWhite,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textGray,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  emptyButton: {
    paddingVertical: 14,
    paddingHorizontal: SPACING.xxxl,
    borderRadius: RADIUS.full,
  },
  emptyButtonText: { color: 'white', fontWeight: 'bold', fontSize: FONTS.sizes.md },
  historySection: { width: '100%', marginTop: SPACING.xl },
  historyTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: 'bold',
    color: COLORS.textWhite,
    marginBottom: SPACING.md,
  },
  historyCard: {
    backgroundColor: COLORS.bgCard,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  historyPlanTitle: { color: COLORS.textWhite, fontWeight: 'bold', flex: 1, fontSize: FONTS.sizes.sm },
  historyDate: { color: COLORS.textGray, fontSize: FONTS.sizes.xs, marginRight: SPACING.sm },
  feedbackBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  feedbackBadgeText: { color: COLORS.yellow, fontSize: FONTS.sizes.xs },
  planHeader: {
    backgroundColor: COLORS.bgCard,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    marginTop: SPACING.md,
    marginBottom: SPACING.xl,
  },
  planTitle: { fontSize: FONTS.sizes.xl, fontWeight: 'bold', color: COLORS.cyan, marginBottom: SPACING.md },
  planMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.md, marginBottom: SPACING.md },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4, flexShrink: 1 },
  metaText: { color: COLORS.textGray, fontSize: FONTS.sizes.sm, flexShrink: 1 },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
  },
  progressFill: { height: 4, backgroundColor: COLORS.cyan, borderRadius: 2 },
  progressText: { color: COLORS.cyan, fontSize: FONTS.sizes.sm, fontWeight: 'bold', width: 36 },
  feedbackBanner: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    backgroundColor: 'rgba(255,215,0,0.08)', borderWidth: 1, borderColor: 'rgba(255,215,0,0.2)',
    borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.lg,
  },
  feedbackBannerText: { color: COLORS.yellow, fontSize: FONTS.sizes.sm, flex: 1 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
    marginTop: SPACING.sm,
  },
  sectionTitle: { fontSize: FONTS.sizes.lg, fontWeight: 'bold', color: COLORS.textWhite },
  card: {
    backgroundColor: COLORS.bgCard,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  cardCompleted: { opacity: 0.5 },
  cardRow: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.md },
  cardLeft: { flex: 1 },
  mealIconRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: 4 },
  mealName: { fontSize: FONTS.sizes.md, fontWeight: 'bold', color: COLORS.textWhite },
  mealDesc: { fontSize: FONTS.sizes.sm, color: COLORS.textGray, lineHeight: 20 },
  strikethrough: { textDecorationLine: 'line-through' },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: SPACING.sm,
  },
  actionBtnText: { color: COLORS.cyan, fontWeight: 'bold', fontSize: FONTS.sizes.sm },
  actionRow: { marginTop: SPACING.xl, flexDirection: 'row' },
  mainButton: {
    borderRadius: RADIUS.full,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainButtonText: { color: 'white', fontWeight: 'bold', fontSize: FONTS.sizes.md },
  createAnotherBtn: { alignItems: 'center', paddingVertical: SPACING.lg },
  createAnotherText: { color: COLORS.textGray, fontSize: FONTS.sizes.sm },
});
