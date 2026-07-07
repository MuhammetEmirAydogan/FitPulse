import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalization } from '../context/LocalizationContext';
import { HistoryItem } from '../types';
import { TimeRange, calculateMuscleHeat } from '../utils/muscleMapping';
import { MuscleHeatmapSvg } from '../components/MuscleHeatmapSvg';
import { AnimatedBentoCard } from '../components/AnimatedBentoCard';
import { StarBorder } from '../components/StarBorder';
import { COLORS, FONTS, RADIUS, SPACING } from '../utils/theme';

interface Props {
    history: HistoryItem[];
}

const RANGES: { value: TimeRange; labelKey: string }[] = [
    { value: 'day', labelKey: 'timeRangeDay' },
    { value: 'week', labelKey: 'timeRangeWeek' },
    { value: 'month', labelKey: 'timeRangeMonth' },
    { value: 'year', labelKey: 'timeRangeYear' },
];

export const AnalyticsScreen: React.FC<Props> = ({ history }) => {
    const { t } = useLocalization();
    const insets = useSafeAreaInsets();
    const [selectedRange, setSelectedRange] = useState<TimeRange>('week');

    const heatmapData = useMemo(() => {
        return calculateMuscleHeat(history, selectedRange);
    }, [history, selectedRange]);

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={[
                styles.scrollContent,
                { paddingTop: Platform.OS === 'ios' ? insets.top + 20 : 40, paddingBottom: insets.bottom + 100 }
            ]}
            showsVerticalScrollIndicator={false}
        >
            {/* Header */}
            <View style={styles.header}>
                <StarBorder color={COLORS.cyan} radius={30}>
                    <View style={styles.iconContainer}>
                        <Ionicons name="pulse" size={28} color={COLORS.cyan} />
                    </View>
                </StarBorder>
                <Text style={styles.title}>{t('analyticsTitle')}</Text>
                <Text style={styles.subtitle}>{t('analyticsSubtitle')}</Text>
            </View>

            {/* Segmented Control */}
            <View style={styles.segmentContainer}>
                {RANGES.map((range) => {
                    const isActive = selectedRange === range.value;
                    return (
                        <TouchableOpacity
                            key={range.value}
                            onPress={() => setSelectedRange(range.value)}
                            style={[
                                styles.segmentButton,
                                isActive && styles.segmentActive
                            ]}
                            activeOpacity={0.7}
                        >
                            <Text
                                style={[
                                    styles.segmentText,
                                    isActive && styles.segmentTextActive
                                ]}
                                numberOfLines={1}
                                adjustsFontSizeToFit
                            >
                                {t(range.labelKey)}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            {/* Main Content Area */}
            <View style={styles.contentRow}>

                {/* Heatmap Area */}
                <AnimatedBentoCard style={styles.heatmapCard}>
                    {/* Legend */}
                    <View style={styles.legendRow}>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: '#38B2AC' }]} />
                            <Text style={styles.legendText}>Low</Text>
                        </View>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: '#FC4B6C' }]} />
                            <Text style={styles.legendText}>High</Text>
                        </View>
                    </View>

                    <MuscleHeatmapSvg scores={heatmapData.scores} width={200} height={350} />
                </AnimatedBentoCard>

                {/* Overview Stats */}
                <View style={styles.statsColumn}>
                    <AnimatedBentoCard style={styles.statCard}>
                        <View style={styles.statHeader}>
                            <Ionicons name="calendar-outline" size={20} color={COLORS.cyan} />
                            <Text style={styles.statTitle} numberOfLines={1} adjustsFontSizeToFit>
                                {t('analyticsOverview')}
                            </Text>
                        </View>
                        <Text style={styles.statSubtitle} numberOfLines={1}>{t(RANGES.find(r => r.value === selectedRange)?.labelKey || 'timeRangeWeek')}</Text>

                        {heatmapData.totalWorkouts === 0 ? (
                            <Text style={styles.emptyText}>{t('analyticsNoData')}</Text>
                        ) : (
                            <View style={styles.statValueRow}>
                                <Text style={styles.statLargeValue}>{heatmapData.totalWorkouts}</Text>
                                <Text style={styles.statLabel}>{t('analyticsWorkoutsCompleted')}</Text>
                            </View>
                        )}
                    </AnimatedBentoCard>

                    {/* Additional cards can be placed here later, e.g. most trained muscle */}
                    {heatmapData.totalWorkouts > 0 && (
                        <AnimatedBentoCard style={[styles.statCard, { marginTop: SPACING.lg }]}>
                            <View style={styles.statHeader}>
                                <Ionicons name="flame-outline" size={20} color={COLORS.cyan} />
                                <Text style={styles.statTitle} numberOfLines={1} adjustsFontSizeToFit>{t('analyticsMostActive')}</Text>
                            </View>
                            {(() => {
                                const maxScore = Math.max(...Object.values(heatmapData.scores));
                                if (maxScore === 0) return <Text style={styles.emptyText}>-</Text>;
                                const topMuscle = Object.entries(heatmapData.scores).find(([_, score]) => score === maxScore)?.[0] || 'N/A';
                                return (
                                    <Text style={styles.statTopMuscle}>{t(`muscle_${topMuscle}`)}</Text>
                                );
                            })()}
                        </AnimatedBentoCard>
                    )}

                </View>
            </View>

        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.bgBlack,
    },
    scrollContent: {
        padding: SPACING.lg,
    },
    header: {
        alignItems: 'center',
        marginBottom: SPACING.xl,
    },
    iconContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(64, 224, 208, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: FONTS.sizes.xxl,
        fontWeight: 'bold',
        color: '#FFF',
        marginTop: SPACING.md,
        marginBottom: 4,
    },
    subtitle: {
        fontSize: FONTS.sizes.sm,
        color: COLORS.textGray,
        textAlign: 'center',
    },
    segmentContainer: {
        flexDirection: 'row',
        backgroundColor: COLORS.bgCard,
        borderRadius: RADIUS.full,
        padding: 6,
        marginBottom: SPACING.xxl,
    },
    segmentButton: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: RADIUS.full,
    },
    segmentActive: {
        backgroundColor: COLORS.cyan,
    },
    segmentText: {
        color: COLORS.textGray,
        fontWeight: '600',
        fontSize: FONTS.sizes.sm,
    },
    segmentTextActive: {
        color: '#000',
        fontWeight: 'bold',
    },
    contentRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: SPACING.lg,
    },
    heatmapCard: {
        flex: 1,
        padding: SPACING.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    statsColumn: {
        flex: 1,
    },
    statCard: {
        padding: SPACING.lg,
    },
    statHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: SPACING.md,
    },
    statTitle: {
        fontSize: FONTS.sizes.md,
        fontWeight: 'bold',
        color: COLORS.textWhite,
        flex: 1,
    },
    statSubtitle: {
        fontSize: FONTS.sizes.sm,
        color: COLORS.cyan,
        marginBottom: SPACING.md,
        marginTop: -SPACING.sm,
    },
    emptyText: {
        color: COLORS.textGray,
        fontSize: FONTS.sizes.sm,
    },
    statValueRow: {
        alignItems: 'center',
    },
    statLargeValue: {
        fontSize: 36,
        fontWeight: '900',
        color: COLORS.cyan,
    },
    statLabel: {
        fontSize: FONTS.sizes.sm,
        color: COLORS.textGray,
        textAlign: 'center',
        marginTop: 4,
    },
    statTopMuscle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: COLORS.cyan,
        textTransform: 'capitalize',
    },
    legendRow: {
        position: 'absolute',
        top: 10,
        left: 10,
        gap: 4,
        zIndex: 10,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    legendDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    legendText: {
        fontSize: 10,
        color: COLORS.textGray,
    }
});
