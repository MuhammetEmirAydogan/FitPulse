import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput,
  KeyboardAvoidingView, Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useLocalization } from '../context/LocalizationContext';
import { COLORS, FONTS, RADIUS, SPACING } from '../utils/theme';
import { AnimatedBentoCard } from '../components/AnimatedBentoCard';
import { StarBorder } from '../components/StarBorder';

interface Props {
  onSavePulse: (phase: 'pre' | 'post', bpm: number) => void;
  onLogDaily: (bpm: number) => void;
  onBack: () => void;
  isPlanActive: boolean;
}

type MeasureType = 'daily' | 'pre' | 'post';

export const HeartRateMonitorScreen: React.FC<Props> = ({ onSavePulse, onLogDaily, onBack, isPlanActive }) => {
  const { t } = useLocalization();
  const [selectedType, setSelectedType] = useState<MeasureType | null>(null);
  const [bpmInput, setBpmInput] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    const bpm = parseInt(bpmInput);
    if (!bpm || bpm < 30 || bpm > 250) return;

    if (selectedType === 'pre') onSavePulse('pre', bpm);
    else if (selectedType === 'post') onSavePulse('post', bpm);
    else if (selectedType === 'daily') onLogDaily(bpm);

    setSaved(true);
  };

  const handleDone = () => {
    setSaved(false);
    setSelectedType(null);
    setBpmInput('');
    onBack();
  };

  const getBpmCategory = (bpm: number) => {
    if (bpm < 60) return { label: t('hrCategoryLow'), color: COLORS.blue };
    if (bpm <= 100) return { label: t('hrCategoryNormal'), color: COLORS.green };
    if (bpm <= 140) return { label: t('hrCategoryElevated'), color: COLORS.yellow };
    return { label: t('hrCategoryHigh'), color: COLORS.red };
  };

  if (selectedType && !saved) {
    const bpm = parseInt(bpmInput);
    const category = bpm > 30 && bpm < 250 ? getBpmCategory(bpm) : null;

    return (
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.container}>
          <TouchableOpacity style={styles.backRow} onPress={() => setSelectedType(null)}>
            <Ionicons name="arrow-back" size={20} color={COLORS.textGray} />
            <Text style={styles.backText}>{t('backButton')}</Text>
          </TouchableOpacity>

          <View style={styles.heartCenter}>
            <Ionicons name="heart" size={80} color={COLORS.red} style={{ marginBottom: 16 }} />
            <Text style={styles.bpmTitle}>{t('hrEnterBpm')}</Text>

            <View style={styles.bpmInputRow}>
              <TextInput
                style={styles.bpmInput}
                value={bpmInput}
                onChangeText={setBpmInput}
                keyboardType="number-pad"
                placeholder="72"
                placeholderTextColor={COLORS.textGray}
                maxLength={3}
                selectionColor={COLORS.red}
              />
              <Text style={styles.bpmUnit}>BPM</Text>
            </View>

            {category && (
              <View style={[styles.categoryBadge, { borderColor: category.color }]}>
                <Text style={[styles.categoryText, { color: category.color }]}>{category.label}</Text>
              </View>
            )}

            <TouchableOpacity onPress={handleSave} activeOpacity={0.8} style={{ width: '80%' }}>
              <LinearGradient colors={[COLORS.red, '#FF6B6B']} style={styles.saveBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                <Text style={styles.saveBtnText}>{t('hrSaveButton')}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    );
  }

  if (saved) {
    return (
      <View style={[styles.container, styles.heartCenter, { justifyContent: 'center', paddingBottom: 100 }]}>
        <Ionicons name="checkmark-circle" size={100} color={COLORS.green} style={{ marginBottom: 24 }} />
        <Text style={[styles.title, { marginBottom: 32 }]}>{t('hrSaved')}</Text>
        
        <StarBorder color={COLORS.green} speed={3000} radius={RADIUS.xl} style={{ width: '80%', marginBottom: 48 }}>
          <View style={{ padding: SPACING.xxxl, alignItems: 'center', borderRadius: RADIUS.xl }}>
            <Text style={{ fontSize: FONTS.sizes.sm, color: COLORS.textGray, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>{t('hrTitle')}</Text>
            <Text style={{ fontSize: 72, fontWeight: 'bold', color: COLORS.green }}>{bpmInput}</Text>
            <Text style={{ fontSize: FONTS.sizes.lg, color: COLORS.textGray }}>BPM</Text>
          </View>
        </StarBorder>

        <TouchableOpacity onPress={handleDone} activeOpacity={0.8} style={{ width: '80%' }}>
          <LinearGradient colors={[COLORS.green, COLORS.teal]} style={styles.saveBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <Text style={styles.saveBtnText}>{t('doneButton')}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      <TouchableOpacity style={styles.backRow} onPress={onBack}>
        <Ionicons name="arrow-back" size={20} color={COLORS.textGray} />
        <Text style={styles.backText}>{t('backButton')}</Text>
      </TouchableOpacity>

      <View style={styles.titleSection}>
        <Ionicons name="heart" size={40} color={COLORS.red} style={{ marginBottom: 12 }} />
        <Text style={styles.title}>{t('hrTitle')}</Text>
      </View>

      {!isPlanActive && (
        <View style={styles.warningBox}>
          <Ionicons name="warning-outline" size={18} color={COLORS.yellow} />
          <Text style={styles.warningText}>{t('hrNoPlanWarning')}</Text>
        </View>
      )}

      {[
        { type: 'daily' as MeasureType, labelKey: 'hrDailyMeasure', icon: 'heart-outline', color: COLORS.red, disabled: false },
        { type: 'pre' as MeasureType, labelKey: 'hrPreWorkout', icon: 'sunny-outline', color: COLORS.orange, disabled: !isPlanActive },
        { type: 'post' as MeasureType, labelKey: 'hrPostWorkout', icon: 'moon-outline', color: COLORS.indigo, disabled: !isPlanActive },
      ].map((opt, i) => (
        <AnimatedBentoCard
          key={opt.type}
          style={[styles.typeOption, opt.disabled && styles.typeOptionDisabled, { marginTop: i === 0 ? 0 : SPACING.md }]}
          onPress={() => !opt.disabled && setSelectedType(opt.type)}
          disabled={opt.disabled}
        >
          <Ionicons name={opt.icon as any} size={28} color={opt.disabled ? COLORS.textGrayDark : opt.color} />
          <Text style={[styles.typeLabel, opt.disabled && styles.typeLabelDisabled]}>{t(opt.labelKey)}</Text>
          {!opt.disabled && <Ionicons name="chevron-forward" size={20} color={COLORS.textGray} />}
        </AnimatedBentoCard>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: SPACING.xl, paddingBottom: 80 },
  backRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.xl },
  backText: { color: COLORS.textGray, fontSize: FONTS.sizes.md },
  titleSection: { alignItems: 'center', marginBottom: SPACING.xxl },
  title: { fontSize: FONTS.sizes.xxl, fontWeight: 'bold', color: COLORS.textWhite, textAlign: 'center' },
  warningBox: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    backgroundColor: 'rgba(246,201,14,0.1)', borderRadius: RADIUS.md,
    padding: SPACING.md, marginBottom: SPACING.xl, borderWidth: 1, borderColor: 'rgba(246,201,14,0.3)',
  },
  warningText: { color: COLORS.yellow, fontSize: FONTS.sizes.sm, flex: 1 },
  typeOption: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.lg,
    padding: SPACING.xl, marginBottom: SPACING.md,
  },
  typeOptionDisabled: { opacity: 0.4 },
  typeLabel: { color: COLORS.textWhite, fontWeight: 'bold', fontSize: FONTS.sizes.lg, flex: 1 },
  typeLabelDisabled: { color: COLORS.textGrayDark },
  heartCenter: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.xl },
  bpmTitle: { fontSize: FONTS.sizes.xl, fontWeight: 'bold', color: COLORS.textWhite, marginBottom: SPACING.xl },
  bpmInputRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, marginBottom: SPACING.xl },
  bpmInput: {
    fontSize: 64, fontWeight: 'bold', color: COLORS.textWhite,
    borderBottomWidth: 2, borderBottomColor: COLORS.red, minWidth: 120,
    textAlign: 'center', paddingVertical: SPACING.sm,
  },
  bpmUnit: { fontSize: FONTS.sizes.xxl, color: COLORS.textGray },
  categoryBadge: {
    borderWidth: 1, borderRadius: RADIUS.full, paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.sm, marginBottom: SPACING.xl,
  },
  categoryText: { fontWeight: 'bold', fontSize: FONTS.sizes.md },
  saveBtn: { borderRadius: RADIUS.full, paddingVertical: 16, alignItems: 'center' },
  saveBtnText: { color: 'white', fontWeight: 'bold', fontSize: FONTS.sizes.md },
  savedBpm: { fontSize: FONTS.sizes.huge, fontWeight: 'bold', color: COLORS.green, marginBottom: SPACING.xl },
  doneBtn: { paddingVertical: SPACING.md },
  doneBtnText: { color: COLORS.textGray, fontSize: FONTS.sizes.md },
});
