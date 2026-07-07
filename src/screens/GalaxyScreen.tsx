import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalization } from '../context/LocalizationContext';
import { HistoryItem } from '../types';
import { COLORS, FONTS, RADIUS, SPACING } from '../utils/theme';

const { width } = Dimensions.get('window');

interface Props {
  history: HistoryItem[];
}

export const GalaxyScreen: React.FC<Props> = ({ history }) => {
  const { t } = useLocalization();

  // Group history by month
  const grouped: Record<string, HistoryItem[]> = {};
  history.forEach(item => {
    const key = new Date(item.date).toLocaleDateString('default', { month: 'long', year: 'numeric' });
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(item);
  });

  const feedbackIcon: Record<string, string> = {
    easy: 'happy-outline',
    just_right: 'remove-outline',
    hard: 'sad-outline',
  };

  const feedbackColor: Record<string, string> = {
    easy: COLORS.cyan,
    just_right: COLORS.yellow,
    hard: COLORS.orange,
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>{t('historyTitle')}</Text>
      <Text style={styles.subtitle}>{t('historySubtitle')}</Text>

      {history.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="star-outline" size={60} color="rgba(255,255,255,0.2)" />
          <Text style={styles.emptyText}>{t('historyEmpty')}</Text>
        </View>
      ) : (
        // Star timeline view
        <>
          {/* Summary stats */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Ionicons name="star" size={24} color={COLORS.yellow} />
              <Text style={styles.statNumber}>{history.length}</Text>
              <Text style={styles.statLabel}>{t('historyTotalPlans')}</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="flame" size={24} color={COLORS.orange} />
              <Text style={styles.statNumber}>
                {history.filter(h => h.feedback?.rating === 'just_right').length}
              </Text>
              <Text style={styles.statLabel}>{t('historyJustRight')}</Text>
            </View>
          </View>

          {/* Timeline */}
          <View style={styles.timeline}>
            {/* All stars in a grid */}
            <Text style={styles.sectionLabel}>{t('historyJourneyLabel')}</Text>
            <View style={styles.starsGrid}>
              {history.map((item, index) => {
                const rating = item.feedback?.rating;
                return (
                  <View key={index} style={styles.starItem}>
                    <Ionicons
                      name={rating ? feedbackIcon[rating] as any : 'star'}
                      size={28}
                      color={rating ? feedbackColor[rating] : COLORS.yellow}
                    />
                    <Text style={styles.starDate}>
                      {new Date(item.date).toLocaleDateString('tr', { day: 'numeric', month: 'short' })}
                    </Text>
                  </View>
                );
              })}
            </View>

            {/* Month groups list */}
            {Object.entries(grouped).reverse().map(([month, items]) => (
              <View key={month} style={styles.monthGroup}>
                <Text style={styles.monthLabel}>{month}</Text>
                {items.slice().reverse().map((item, i) => (
                  <View key={`${month}-${i}`} style={styles.historyCard}>
                    <View style={styles.historyCardLeft}>
                      <Ionicons
                        name={item.feedback ? feedbackIcon[item.feedback.rating] as any : 'star-outline'}
                        size={20}
                        color={item.feedback ? feedbackColor[item.feedback.rating] : COLORS.textGray}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.historyCardTitle} numberOfLines={1}>{item.plan.title}</Text>
                      <Text style={styles.historyCardDate}>{new Date(item.date).toLocaleDateString()}</Text>
                    </View>
                    {item.heartRateData && (item.heartRateData.daily || item.heartRateData.preWorkout || item.heartRateData.postWorkout) && (
                      <View style={styles.hrBadge}>
                        <Ionicons name="heart" size={14} color={COLORS.red} />
                        <Text style={styles.hrText}>
                          {item.heartRateData.daily ? (
                            `${item.heartRateData.daily} BPM`
                          ) : (
                            `${item.heartRateData.preWorkout || '--'} → ${item.heartRateData.postWorkout || '--'}`
                          )}
                        </Text>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            ))}
          </View>
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: SPACING.xl, paddingBottom: 80 },
  title: { fontSize: FONTS.sizes.xxxl, fontWeight: 'bold', color: COLORS.textWhite, marginTop: SPACING.md, marginBottom: SPACING.sm },
  subtitle: { fontSize: FONTS.sizes.md, color: COLORS.textGray, marginBottom: SPACING.xl },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingTop: 80, gap: 16 },
  emptyText: { color: COLORS.textGray, fontSize: FONTS.sizes.md, textAlign: 'center' },
  statsRow: { flexDirection: 'row', gap: SPACING.md, marginBottom: SPACING.xl },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.bgCard,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    alignItems: 'center',
    gap: 4,
  },
  statNumber: { fontSize: FONTS.sizes.xxl, fontWeight: 'bold', color: COLORS.textWhite },
  statLabel: { fontSize: FONTS.sizes.xs, color: COLORS.textGray, textAlign: 'center' },
  timeline: {},
  sectionLabel: { fontSize: FONTS.sizes.lg, fontWeight: 'bold', color: COLORS.textWhite, marginBottom: SPACING.md },
  starsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  starItem: { alignItems: 'center', width: 50 },
  starDate: { fontSize: 9, color: COLORS.textGray, textAlign: 'center', marginTop: 2 },
  monthGroup: { marginBottom: SPACING.xl },
  monthLabel: { fontSize: FONTS.sizes.md, fontWeight: 'bold', color: COLORS.cyan, marginBottom: SPACING.sm },
  historyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    gap: SPACING.md,
  },
  historyCardLeft: {
    width: 32,
    alignItems: 'center',
  },
  historyCardTitle: { color: COLORS.textWhite, fontWeight: 'bold', fontSize: FONTS.sizes.sm },
  historyCardDate: { color: COLORS.textGray, fontSize: FONTS.sizes.xs, marginTop: 2 },
  hrBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  hrText: { color: COLORS.red, fontSize: FONTS.sizes.xs },
});
