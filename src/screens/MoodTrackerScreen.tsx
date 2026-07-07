import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    TextInput, KeyboardAvoidingView, Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import {
    collection, addDoc, getDocs, query, orderBy, limit, serverTimestamp,
} from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { useApp } from '../context/AppContext';
import { useLocalization } from '../context/LocalizationContext';
import { COLORS, FONTS, RADIUS, SPACING } from '../utils/theme';
import { StarBorder } from '../components/StarBorder';
import { AnimatedBentoCard } from '../components/AnimatedBentoCard';

// ─── Tipler ───────────────────────────────────────────────────────────────────

type MoodValue = 'great' | 'good' | 'neutral' | 'bad' | 'terrible';

interface MoodEntry {
    id: string;
    mood: MoodValue;
    note: string;
    date: string;
}

interface MoodOption {
    value: MoodValue;
    labelKey: string;
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
    emoji: string;
}

const MOOD_OPTIONS: MoodOption[] = [
    { value: 'great', labelKey: 'moodGreat', icon: 'thumbs-up', color: '#48BB78', emoji: '😄' },
    { value: 'good', labelKey: 'moodGood', icon: 'happy-outline', color: '#67E8F9', emoji: '😊' },
    { value: 'neutral', labelKey: 'moodNeutral', icon: 'remove-circle-outline', color: '#F6C90E', emoji: '😐' },
    { value: 'bad', labelKey: 'moodBad', icon: 'sad-outline', color: '#FF7F50', emoji: '😔' },
    { value: 'terrible', labelKey: 'moodTerrible', icon: 'thumbs-down', color: '#FF6B6B', emoji: '😢' },
];

// ─── Bileşen ──────────────────────────────────────────────────────────────────

export const MoodTrackerScreen: React.FC = () => {
    const { t } = useLocalization();
    const { firebaseUid } = useApp();

    const [selectedMood, setSelectedMood] = useState<MoodValue>('neutral');
    const [note, setNote] = useState('');
    const [entries, setEntries] = useState<MoodEntry[]>([]);
    const [saved, setSaved] = useState(false);
    const [loading, setLoading] = useState(true);

    // ─── Firestore'dan yükle ─────────────────────────────────────────────────
    const loadEntries = useCallback(async () => {
        if (!firebaseUid) { setLoading(false); return; }
        try {
            const snap = await getDocs(
                query(
                    collection(db, 'moodEntries', firebaseUid, 'entries'),
                    orderBy('date', 'desc'),
                    limit(60),
                )
            );
            const loaded: MoodEntry[] = snap.docs.map(d => ({
                id: d.id,
                mood: d.data().mood as MoodValue,
                note: d.data().note || '',
                date: d.data().date,
            }));
            setEntries(loaded);
        } catch (e) {
            console.error('Mood yükleme hatası:', e);
        } finally {
            setLoading(false);
        }
    }, [firebaseUid]);

    useEffect(() => {
        loadEntries();
    }, [loadEntries]);

    // ─── Firestore'a kaydet ──────────────────────────────────────────────────
    const saveEntry = async () => {
        if (!firebaseUid) return;

        const now = new Date().toISOString();
        const newEntry: Omit<MoodEntry, 'id'> = {
            mood: selectedMood,
            note: note.trim(),
            date: now,
        };

        try {
            const docRef = await addDoc(
                collection(db, 'moodEntries', firebaseUid, 'entries'),
                { ...newEntry, createdAt: serverTimestamp() }
            );
            // Optimistic update — en başa ekle
            setEntries(prev => [{ id: docRef.id, ...newEntry }, ...prev].slice(0, 60));
        } catch (e) {
            console.error('Mood kayıt hatası:', e);
        }

        setNote('');
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    // ─── Yardımcılar ─────────────────────────────────────────────────────────
    const getMoodOption = (mood: MoodValue) => MOOD_OPTIONS.find(o => o.value === mood)!;

    const formatDate = (iso: string) => {
        const d = new Date(iso);
        const now = new Date();
        const diff = now.getTime() - d.getTime();
        const dayMs = 86400000;
        const hh = d.getHours().toString().padStart(2, '0');
        const mm = d.getMinutes().toString().padStart(2, '0');

        if (diff < dayMs && d.getDate() === now.getDate())
            return `${t('moodToday')} ${hh}:${mm}`;
        if (diff < 2 * dayMs)
            return `${t('moodYesterday')} ${hh}:${mm}`;
        return `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth() + 1).toString().padStart(2, '0')}.${d.getFullYear()} ${hh}:${mm}`;
    };

    const getWeeklyStats = () => {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const weekEntries = entries.filter(e => new Date(e.date) >= weekAgo);
        const counts: Record<MoodValue, number> = { great: 0, good: 0, neutral: 0, bad: 0, terrible: 0 };
        weekEntries.forEach(e => counts[e.mood]++);
        return { counts, total: weekEntries.length };
    };

    const weeklyStats = getWeeklyStats();

    // ─── Render ───────────────────────────────────────────────────────────────
    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerEmoji}>😊</Text>
                    <Text style={styles.headerTitle}>{t('moodTitle')}</Text>
                    <Text style={styles.headerSubtitle}>{t('moodSubtitle')}</Text>
                </View>

                {/* Mood Seçim Kartı */}
                <AnimatedBentoCard style={styles.moodCard}>
                    <Text style={styles.moodQuestion}>{t('moodQuestion')}</Text>

                    <View style={styles.moodRow}>
                        {MOOD_OPTIONS.map(option => {
                            const isSelected = selectedMood === option.value;
                            return (
                                <TouchableOpacity
                                    key={option.value}
                                    style={[
                                        styles.moodOption,
                                        isSelected && { backgroundColor: option.color + '20', borderColor: option.color },
                                    ]}
                                    onPress={() => setSelectedMood(option.value)}
                                    activeOpacity={0.7}
                                >
                                    <Ionicons
                                        name={option.icon}
                                        size={28}
                                        color={isSelected ? option.color : COLORS.textGray}
                                    />
                                    <Text style={[
                                        styles.moodOptionLabel,
                                        isSelected && { color: option.color, fontWeight: '700' },
                                    ]}>
                                        {t(option.labelKey)}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    {/* Not girişi */}
                    <View style={styles.noteContainer}>
                        <Ionicons name="chatbox-outline" size={18} color={COLORS.textGray} style={{ marginRight: 8 }} />
                        <TextInput
                            style={styles.noteInput}
                            placeholder={t('moodNotePlaceholder')}
                            placeholderTextColor={COLORS.textGray}
                            value={note}
                            onChangeText={setNote}
                            multiline
                            maxLength={200}
                            selectionColor={COLORS.cyan}
                        />
                    </View>

                    {/* Kaydet butonu */}
                    <StarBorder color={getMoodOption(selectedMood).color} speed={2500} radius={RADIUS.full} style={{ alignSelf: 'stretch' }}>
                        <TouchableOpacity onPress={saveEntry} activeOpacity={0.8} disabled={!firebaseUid}>
                            <LinearGradient
                                colors={saved ? ['#48BB78', '#38B2AC'] : [getMoodOption(selectedMood).color, COLORS.blue]}
                                style={styles.saveBtn}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                            >
                                <Ionicons
                                    name={saved ? 'checkmark-circle' : 'save-outline'}
                                    size={20}
                                    color="white"
                                    style={{ marginRight: 8 }}
                                />
                                <Text style={styles.saveBtnText}>
                                    {saved ? t('moodSaved') : t('moodSaveButton')}
                                </Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </StarBorder>
                </AnimatedBentoCard>

                {/* Haftalık İstatistik */}
                {weeklyStats.total > 0 && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="bar-chart-outline" size={20} color={COLORS.cyan} />
                            <Text style={styles.sectionTitle}>{t('moodWeeklyStats')}</Text>
                        </View>
                        <View style={styles.statsRow}>
                            {MOOD_OPTIONS.map(opt => {
                                const count = weeklyStats.counts[opt.value];
                                const pct = weeklyStats.total > 0 ? (count / weeklyStats.total) * 100 : 0;
                                return (
                                    <View key={opt.value} style={styles.statItem}>
                                        <View style={styles.statBarContainer}>
                                            <View style={[styles.statBar, { height: `${Math.max(pct, 5)}%`, backgroundColor: opt.color }]} />
                                        </View>
                                        <Text style={styles.statEmoji}>{opt.emoji}</Text>
                                        <Text style={styles.statCount}>{count}</Text>
                                    </View>
                                );
                            })}
                        </View>
                    </View>
                )}

                {/* Geçmiş */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="calendar-outline" size={20} color={COLORS.cyan} />
                        <Text style={styles.sectionTitle}>{t('moodHistory')}</Text>
                    </View>

                    {loading ? (
                        <AnimatedBentoCard style={styles.emptyCard}>
                            <Text style={styles.emptyText}>Yükleniyor...</Text>
                        </AnimatedBentoCard>
                    ) : entries.length === 0 ? (
                        <AnimatedBentoCard style={styles.emptyCard}>
                            <Text style={styles.emptyEmoji}>😊</Text>
                            <Text style={styles.emptyText}>{t('moodEmpty')}</Text>
                        </AnimatedBentoCard>
                    ) : (
                        entries.slice(0, 15).map(entry => {
                            const opt = getMoodOption(entry.mood);
                            return (
                                <View key={entry.id} style={styles.historyItem}>
                                    <View style={[styles.historyIcon, { backgroundColor: opt.color + '20' }]}>
                                        <Ionicons name={opt.icon} size={20} color={opt.color} />
                                    </View>
                                    <View style={styles.historyContent}>
                                        <View style={styles.historyTop}>
                                            <Text style={[styles.historyMood, { color: opt.color }]}>{t(opt.labelKey)}</Text>
                                            <Text style={styles.historyDate}>{formatDate(entry.date)}</Text>
                                        </View>
                                        {entry.note ? (
                                            <Text style={styles.historyNote} numberOfLines={2}>{entry.note}</Text>
                                        ) : null}
                                    </View>
                                </View>
                            );
                        })
                    )}
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContent: { padding: SPACING.xl, paddingBottom: 80 },
    header: { alignItems: 'center', marginBottom: SPACING.xl },
    headerEmoji: { fontSize: 40, marginBottom: SPACING.sm },
    headerTitle: { fontSize: FONTS.sizes.xxl, fontWeight: 'bold', color: '#F6C90E', marginBottom: 4 },
    headerSubtitle: { fontSize: FONTS.sizes.sm, color: COLORS.textGray, textAlign: 'center' },
    moodCard: { padding: SPACING.xl, marginBottom: SPACING.xl },
    moodQuestion: { fontSize: FONTS.sizes.lg, fontWeight: 'bold', color: COLORS.textWhite, textAlign: 'center', marginBottom: SPACING.lg },
    moodRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.xl },
    moodOption: {
        alignItems: 'center', padding: SPACING.md, borderRadius: RADIUS.lg,
        borderWidth: 1.5, borderColor: 'transparent', flex: 1, marginHorizontal: 2,
    },
    moodOptionLabel: { fontSize: 10, color: COLORS.textGray, fontWeight: '600', marginTop: 6, textAlign: 'center' },
    noteContainer: {
        flexDirection: 'row', alignItems: 'flex-start', backgroundColor: COLORS.bgCard,
        borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.lg,
        padding: SPACING.lg, marginBottom: SPACING.lg, minHeight: 60,
    },
    noteInput: { flex: 1, color: COLORS.textWhite, fontSize: FONTS.sizes.sm, textAlignVertical: 'top', minHeight: 40 },
    saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, paddingHorizontal: SPACING.xxl, borderRadius: RADIUS.full },
    saveBtnText: { color: 'white', fontWeight: 'bold', fontSize: FONTS.sizes.md },
    section: { marginBottom: SPACING.xl },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: SPACING.md },
    sectionTitle: { fontSize: FONTS.sizes.lg, fontWeight: 'bold', color: COLORS.textWhite },
    statsRow: {
        flexDirection: 'row', justifyContent: 'space-between', backgroundColor: COLORS.bgCard,
        borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.xl,
        padding: SPACING.lg, height: 160, alignItems: 'flex-end',
    },
    statItem: { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
    statBarContainer: { flex: 1, width: 20, justifyContent: 'flex-end', marginBottom: 4 },
    statBar: { width: 20, borderRadius: 10, minHeight: 4 },
    statEmoji: { fontSize: 16, marginTop: 4 },
    statCount: { fontSize: 11, color: COLORS.textGray, fontWeight: '600' },
    emptyCard: { padding: SPACING.xxl, alignItems: 'center' },
    emptyEmoji: { fontSize: 36, marginBottom: SPACING.md },
    emptyText: { color: COLORS.textGray, fontSize: FONTS.sizes.sm, textAlign: 'center' },
    historyItem: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.bgCard,
        borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.lg,
        padding: SPACING.md, marginBottom: SPACING.sm,
    },
    historyIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginRight: SPACING.md },
    historyContent: { flex: 1 },
    historyTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    historyMood: { fontWeight: 'bold', fontSize: FONTS.sizes.md },
    historyDate: { color: COLORS.textGray, fontSize: FONTS.sizes.xs },
    historyNote: { color: COLORS.textGray, fontSize: FONTS.sizes.sm, marginTop: 4 },
});
