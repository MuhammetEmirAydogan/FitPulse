import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, KeyboardAvoidingView, Platform, Modal
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useLocalization } from '../context/LocalizationContext';
import { useApp } from '../context/AppContext';
import { calculateCaloriesAndMacros } from '../utils/fitnessCalculations';
import { CalorieResults, ActivityLevel, Goal } from '../types';
import { COLORS, FONTS, RADIUS, SPACING } from '../utils/theme';
import { StarBorder } from '../components/StarBorder';
import { AnimatedBentoCard } from '../components/AnimatedBentoCard';
import { MaleSilhouette, FemaleSilhouette } from '../components/BodySilhouettes';
import { HeightMeasurementSvg } from '../components/HeightMeasurementSvg';
import { WeightScaleSvg, AgeSvg } from '../components/CalorieSvgs';

interface Props {
  onComplete: () => void;
  onPlanCreationRequest: (results: CalorieResults) => void;
}

type Step = 'gender' | 'age' | 'height' | 'weight' | 'activity' | 'goal' | 'result';

const activityOptions: { value: ActivityLevel; labelKey: string; subtitleKey: string; icon: string }[] = [
  { value: 'sedentary', labelKey: 'activitySedentary', subtitleKey: 'activitySedentarySub', icon: 'bed-outline' },
  { value: 'light', labelKey: 'activityLight', subtitleKey: 'activityLightSub', icon: 'walk-outline' },
  { value: 'moderate', labelKey: 'activityModerate', subtitleKey: 'activityModerateSub', icon: 'bicycle-outline' },
  { value: 'active', labelKey: 'activityActive', subtitleKey: 'activityActiveSub', icon: 'pulse-outline' },
  { value: 'very_active', labelKey: 'activityVeryActive', subtitleKey: 'activityVeryActiveSub', icon: 'trophy-outline' },
];

const goalOptions: { value: Goal; labelKey: string; icon: string }[] = [
  { value: 'lose', labelKey: 'goalLose', icon: 'trending-down-outline' },
  { value: 'maintain', labelKey: 'goalMaintain', icon: 'remove-outline' },
  { value: 'gain', labelKey: 'goalGain', icon: 'trending-up-outline' },
];

export const CalorieCalculatorScreen: React.FC<Props> = ({ onComplete, onPlanCreationRequest }) => {
  const { t, language } = useLocalization();
  const { handleSaveCalorieResult, calorieHistory, handleDeleteCalorie } = useApp();

  const [step, setStep] = useState<Step>('gender');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [age, setAge] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [weight, setWeight] = useState('');
  const [activity, setActivity] = useState<ActivityLevel>('moderate');
  const [goal, setGoal] = useState<Goal>('maintain');
  const [result, setResult] = useState<CalorieResults | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showAllHistory, setShowAllHistory] = useState(false);

  const steps: Step[] = ['gender', 'age', 'height', 'weight', 'activity', 'goal', 'result'];
  const stepIdx = steps.indexOf(step);
  const progress = (stepIdx + 1) / steps.length;

  const handleNext = () => {
    // Sayısal adımlarda boş/geçersiz değerle ilerlemeyi engelle
    if (step === 'age' || step === 'height' || step === 'weight') {
      const raw = step === 'age' ? age : step === 'height' ? heightCm : weight;
      const val = parseFloat(raw);
      if (!val || isNaN(val) || val <= 0) {
        setError(t('calorieInvalidInputs'));
        return;
      }
    }

    if (step === 'goal') {
      const res = calculateCaloriesAndMacros({
        gender,
        age: parseInt(age),
        height: parseInt(heightCm),
        weight: parseInt(weight),
        activityLevel: activity,
        goal,
      });
      // Geçersiz/aralık dışı değerlerde null döner — çökmeyi önle, kullanıcıyı uyar
      if (!res) {
        setError(t('calorieInvalidInputs'));
        return;
      }
      setError(null);
      setResult(res);
      setStep('result');
      // Firestore'a kaydet
      handleSaveCalorieResult(res, goal);
    } else {
      setError(null);
      setStep(steps[stepIdx + 1]);
    }
  };

  const handleBack = () => {
    setError(null);
    if (stepIdx === 0) onComplete();
    else setStep(steps[stepIdx - 1]);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Ionicons name="calculator-outline" size={28} color={COLORS.cyan} style={{ marginBottom: 8 }} />
          <Text style={styles.headerTitle}>{t('calorieCalcTitle')}</Text>
          <Text style={styles.headerSubtitle}>{t('calorieCalcSubtitle')}</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          {/* Adım 1: Cinsiyet */}
          {step === 'gender' && (
            <>
              <Text style={styles.question}>{t('bodyFatGenderQuestion')}</Text>
              <View style={styles.silhouetteRow}>
                <TouchableOpacity style={styles.silhouetteOption} onPress={() => setGender('male')} activeOpacity={0.7}>
                  {gender === 'male' && (
                    <View style={styles.checkmarkContainer}>
                      <View style={styles.checkmarkCircle}>
                        <Ionicons name="checkmark" size={14} color="white" />
                      </View>
                    </View>
                  )}
                  {gender === 'male' && <View style={styles.silhouetteGlow} />}
                  <MaleSilhouette width={130} height={180} color={gender === 'male' ? COLORS.cyan : '#3A4050'} opacity={gender === 'male' ? 1 : 0.5} />
                  <Text style={[styles.silhouetteLabel, gender === 'male' && styles.silhouetteLabelActive]}>{t('male')}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.silhouetteOption} onPress={() => setGender('female')} activeOpacity={0.7}>
                  {gender === 'female' && (
                    <View style={styles.checkmarkContainer}>
                      <View style={styles.checkmarkCircle}>
                        <Ionicons name="checkmark" size={14} color="white" />
                      </View>
                    </View>
                  )}
                  {gender === 'female' && <View style={styles.silhouetteGlow} />}
                  <FemaleSilhouette width={130} height={180} color={gender === 'female' ? COLORS.cyan : '#3A4050'} opacity={gender === 'female' ? 1 : 0.5} />
                  <Text style={[styles.silhouetteLabel, gender === 'female' && styles.silhouetteLabelActive]}>{t('female')}</Text>
                </TouchableOpacity>
              </View>

              {/* Geçmiş Hesaplamalar */}
              {calorieHistory && calorieHistory.length > 0 && (
                <View style={styles.historySection}>
                  <View style={styles.historyHeader}>
                    <Ionicons name="time-outline" size={18} color={COLORS.cyan} />
                    <Text style={styles.historyTitle}>{t('weightHistoryTitle')}</Text>
                  </View>
                  {calorieHistory.slice(0, 5).map(item => (
                    <View key={item.id} style={styles.historyItem}>
                      <View style={styles.historyLeft}>
                        <View style={{ gap: 2 }}>
                          <Text style={styles.historyVal}>{item.calories} kcal</Text>
                          <Text style={styles.historyGoalText}>
                            {item.goal === 'lose' ? t('goalLose') : item.goal === 'gain' ? t('goalGain') : t('goalMaintain')}
                          </Text>
                        </View>
                        <Text style={styles.historyDate}>
                          {new Date(item.date).toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US')}
                        </Text>
                      </View>
                      <TouchableOpacity onPress={() => handleDeleteCalorie(item.id)} style={styles.deleteBtn}>
                        <Ionicons name="trash-outline" size={16} color={COLORS.red} />
                      </TouchableOpacity>
                    </View>
                  ))}

                  {calorieHistory.length > 5 && (
                    <TouchableOpacity
                      style={styles.seeAllBtn}
                      onPress={() => setShowAllHistory(true)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.seeAllBtnText}>
                        {language === 'tr'
                          ? `Tüm Geçmişi Gör (${calorieHistory.length} Hesaplama)`
                          : `See All History (${calorieHistory.length} Calculations)`}
                      </Text>
                      <Ionicons name="chevron-forward" size={16} color={COLORS.cyan} />
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </>
          )}

          {/* Adım 2: Yaş */}
          {step === 'age' && (
            <View style={styles.measureStepContainer}>
              <View style={styles.svgWrapper}>
                <AgeSvg width={180} height={180} />
              </View>
              <Text style={styles.question}>{t('calorieCalcAge')}</Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.bigInput} value={age} onChangeText={setAge}
                  keyboardType="number-pad" placeholder="25"
                  placeholderTextColor={COLORS.textGray} selectionColor={COLORS.cyan}
                />
                <Text style={styles.unit}>yaş</Text>
              </View>
            </View>
          )}

          {/* Adım 3: Boy */}
          {step === 'height' && (
            <View style={styles.measureStepContainer}>
              <View style={styles.svgWrapper}>
                <HeightMeasurementSvg width={220} height={260} gender={gender} />
              </View>
              <Text style={styles.question}>{t('calorieCalcHeight')}</Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.bigInput} value={heightCm} onChangeText={setHeightCm}
                  keyboardType="decimal-pad" placeholder="170"
                  placeholderTextColor={COLORS.textGray} selectionColor={COLORS.cyan}
                />
                <Text style={styles.unit}>cm</Text>
              </View>
            </View>
          )}

          {/* Adım 4: Kilo */}
          {step === 'weight' && (
            <View style={styles.measureStepContainer}>
              <View style={styles.svgWrapper}>
                <WeightScaleSvg width={180} height={180} />
              </View>
              <Text style={styles.question}>{t('calorieCalcWeight')}</Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.bigInput} value={weight} onChangeText={setWeight}
                  keyboardType="decimal-pad" placeholder="70"
                  placeholderTextColor={COLORS.textGray} selectionColor={COLORS.cyan}
                />
                <Text style={styles.unit}>kg</Text>
              </View>
            </View>
          )}

          {/* Adım 5: Aktivite */}
          {step === 'activity' && (
            <>
              <Text style={styles.question}>{t('calorieCalcActivityQuestion')}</Text>
              {activityOptions.map((opt, i) => (
                <AnimatedBentoCard
                  key={opt.value}
                  style={[styles.listOption, activity === opt.value && styles.listOptionSelected, { marginTop: i === 0 ? 0 : SPACING.md }]}
                  onPress={() => setActivity(opt.value)}
                >
                  <Ionicons name={opt.icon as any} size={28} color={activity === opt.value ? COLORS.cyan : COLORS.textGray} style={{ marginRight: 16 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.optionLabel, activity === opt.value && { color: COLORS.cyan }]}>{t(opt.labelKey)}</Text>
                    <Text style={styles.optionSubtitle}>{t(opt.subtitleKey)}</Text>
                  </View>
                  <View style={[styles.radioOuter, activity === opt.value && styles.radioSelected]}>
                    {activity === opt.value && <View style={styles.radioInner} />}
                  </View>
                </AnimatedBentoCard>
              ))}
            </>
          )}

          {/* Adım 6: Hedef */}
          {step === 'goal' && (
            <>
              <Text style={styles.question}>{t('calorieCalcGoalQuestion')}</Text>
              {goalOptions.map((opt, i) => (
                <AnimatedBentoCard
                  key={opt.value}
                  style={[styles.listOption, goal === opt.value && styles.listOptionSelected, { marginTop: i === 0 ? 0 : SPACING.md }]}
                  onPress={() => setGoal(opt.value)}
                >
                  <Ionicons name={opt.icon as any} size={28} color={goal === opt.value ? COLORS.cyan : COLORS.textGray} style={{ marginRight: 16 }} />
                  <Text style={[styles.optionLabel, goal === opt.value && { color: COLORS.cyan }]}>{t(opt.labelKey)}</Text>
                  <View style={[styles.radioOuter, goal === opt.value && styles.radioSelected]}>
                    {goal === opt.value && <View style={styles.radioInner} />}
                  </View>
                </AnimatedBentoCard>
              ))}
            </>
          )}

          {/* Adım 7: Sonuç */}
          {step === 'result' && result && (
            <View style={styles.resultContainer}>
              <View style={styles.bigCalCard}>
                <Ionicons name="body-outline" size={40} color={COLORS.cyan} style={{ marginBottom: 12 }} />
                <Text style={styles.calLabel}>{t('calorieCalcDailyNeeds')}</Text>
                <Text style={styles.calNumber}>{result.calories}</Text>
                <Text style={styles.calUnit}>{t('calorieCalcPerDay')}</Text>
              </View>

              <View style={styles.macroRow}>
                {[
                  { label: 'Protein', value: `${result.protein}g`, icon: 'fitness-outline', color: COLORS.cyan },
                  { label: t('calorieCalcCarbs'), value: `${result.carbs}g`, icon: 'leaf-outline', color: COLORS.yellow },
                  { label: t('calorieCalcFat'), value: `${result.fat}g`, icon: 'flame-outline', color: COLORS.orange },
                ].map(macro => (
                  <View key={macro.label} style={styles.macroCard}>
                    <Ionicons name={macro.icon as any} size={24} color={macro.color} />
                    <Text style={styles.macroValue}>{macro.value}</Text>
                    <Text style={styles.macroLabel}>{macro.label}</Text>
                  </View>
                ))}
              </View>

              <StarBorder color={COLORS.cyan} speed={2500} radius={RADIUS.full} style={{ alignSelf: 'stretch', marginBottom: SPACING.md }}>
                <TouchableOpacity style={styles.createPlanBtn} onPress={() => onPlanCreationRequest(result)} activeOpacity={0.8}>
                  <Ionicons name="sparkles" size={18} color="white" style={{ marginRight: 8 }} />
                  <Text style={styles.createPlanBtnText}>{t('calorieCalcCreatePlanButton')}</Text>
                </TouchableOpacity>
              </StarBorder>

              <TouchableOpacity onPress={onComplete} style={styles.doneBtn}>
                <Text style={styles.doneBtnText}>{t('doneButton')}</Text>
              </TouchableOpacity>
            </View>
          )}

          {error && (
            <View style={styles.errorBox}>
              <Ionicons name="warning-outline" size={18} color={COLORS.orange} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
        </ScrollView>

        {step !== 'result' && (
          <View style={styles.navRow}>
            <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
              <Ionicons name="arrow-back" size={20} color={COLORS.textGray} />
              <Text style={styles.backBtnText}>{t('backButton')}</Text>
            </TouchableOpacity>
            <StarBorder color={COLORS.cyan} speed={2200} radius={RADIUS.full}>
              <TouchableOpacity onPress={handleNext} activeOpacity={0.8}>
                <LinearGradient colors={[COLORS.cyan, COLORS.blue]} style={styles.nextBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                  <Text style={styles.nextBtnText}>{t('nextButton')}</Text>
                  <Ionicons name="arrow-forward" size={20} color="white" style={{ marginLeft: 8 }} />
                </LinearGradient>
              </TouchableOpacity>
            </StarBorder>
          </View>
        )}
        {/* Tüm Geçmiş Modalı */}
        <Modal
          visible={showAllHistory}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowAllHistory(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <View style={styles.modalHeaderTitleRow}>
                  <Ionicons name="time-outline" size={22} color={COLORS.cyan} />
                  <Text style={styles.modalTitle}>
                    {language === 'tr' ? 'Hesaplama Geçmişi' : 'Calculation History'}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setShowAllHistory(false)} style={styles.modalCloseBtn}>
                  <Ionicons name="close" size={24} color={COLORS.textWhite} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalScroll} contentContainerStyle={styles.modalScrollContent}>
                {calorieHistory && calorieHistory.map(item => (
                  <View key={item.id} style={styles.historyItem}>
                    <View style={styles.historyLeft}>
                      <View style={{ gap: 2 }}>
                        <Text style={styles.historyVal}>{item.calories} kcal</Text>
                        <Text style={styles.historyGoalText}>
                          {item.goal === 'lose' ? t('goalLose') : item.goal === 'gain' ? t('goalGain') : t('goalMaintain')}
                        </Text>
                      </View>
                      <Text style={styles.historyDate}>
                        {new Date(item.date).toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US')}
                      </Text>
                    </View>
                    <TouchableOpacity onPress={() => handleDeleteCalorie(item.id)} style={styles.deleteBtn}>
                      <Ionicons name="trash-outline" size={16} color={COLORS.red} />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { alignItems: 'center', padding: SPACING.xl, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  headerTitle: { fontSize: FONTS.sizes.xxl, fontWeight: 'bold', color: COLORS.textWhite, marginBottom: 4 },
  headerSubtitle: { fontSize: FONTS.sizes.sm, color: COLORS.textGray, marginBottom: SPACING.md, textAlign: 'center' },
  progressBar: { width: '100%', height: 3, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 2 },
  progressFill: { height: 3, backgroundColor: COLORS.cyan, borderRadius: 2 },
  scroll: { padding: SPACING.xl, paddingBottom: 80 },
  question: { fontSize: FONTS.sizes.xxl, fontWeight: 'bold', color: COLORS.textWhite, marginBottom: SPACING.xl, textAlign: 'center' },
  silhouetteRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-end', gap: SPACING.xl, marginTop: SPACING.xl, paddingVertical: SPACING.lg },
  silhouetteOption: { alignItems: 'center', position: 'relative', paddingTop: 28 },
  silhouetteGlow: {
    position: 'absolute', top: 30, left: -10, right: -10, bottom: 30, borderRadius: 80,
    backgroundColor: 'rgba(64,224,208,0.08)', shadowColor: COLORS.cyan,
    shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.3, shadowRadius: 30, elevation: 8,
  },
  checkmarkContainer: { position: 'absolute', top: 0, alignSelf: 'center', zIndex: 10 },
  checkmarkCircle: {
    width: 24, height: 24, borderRadius: 12, backgroundColor: COLORS.cyan,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: COLORS.cyan, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.5, shadowRadius: 6, elevation: 6,
  },
  silhouetteLabel: { color: COLORS.textGray, fontWeight: 'bold', fontSize: FONTS.sizes.md, marginTop: SPACING.md },
  silhouetteLabelActive: { color: COLORS.cyan },
  measureStepContainer: { alignItems: 'center' },
  svgWrapper: { alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.lg, marginTop: SPACING.md },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, marginTop: SPACING.xl },
  bigInput: {
    fontSize: 48, fontWeight: 'bold', color: COLORS.textWhite,
    borderBottomWidth: 2, borderBottomColor: COLORS.cyan,
    minWidth: 120, textAlign: 'center', paddingVertical: SPACING.sm,
  },
  unit: { fontSize: FONTS.sizes.xxl, color: COLORS.textGray },
  listOption: { flexDirection: 'row', alignItems: 'center', padding: SPACING.lg, marginBottom: SPACING.md },
  listOptionSelected: { borderColor: COLORS.cyan, backgroundColor: 'rgba(64,224,208,0.08)' },
  optionLabel: { color: COLORS.textWhite, fontWeight: 'bold', fontSize: FONTS.sizes.md },
  optionSubtitle: { color: COLORS.textGray, fontSize: FONTS.sizes.sm, marginTop: 2 },
  radioOuter: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: COLORS.textGray, alignItems: 'center', justifyContent: 'center' },
  radioSelected: { borderColor: COLORS.cyan },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.cyan },
  resultContainer: { alignItems: 'center' },
  bigCalCard: {
    backgroundColor: COLORS.bgCard, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: RADIUS.xl, padding: SPACING.xxl, alignItems: 'center', width: '100%', marginBottom: SPACING.xl,
  },
  calLabel: { fontSize: FONTS.sizes.lg, fontWeight: 'bold', color: COLORS.textWhite, marginBottom: SPACING.sm },
  calNumber: { fontSize: 64, fontWeight: 'bold', color: COLORS.cyan },
  calUnit: { fontSize: FONTS.sizes.sm, color: COLORS.textGray },
  macroRow: { flexDirection: 'row', gap: SPACING.md, width: '100%', marginBottom: SPACING.xl },
  macroCard: {
    flex: 1, backgroundColor: COLORS.bgCard, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: RADIUS.lg, padding: SPACING.md, alignItems: 'center', gap: 4,
  },
  macroValue: { fontSize: FONTS.sizes.xl, fontWeight: 'bold', color: COLORS.textWhite },
  macroLabel: { fontSize: FONTS.sizes.xs, color: COLORS.textGray },
  createPlanBtn: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.cyan,
    borderRadius: RADIUS.full, paddingVertical: 14, paddingHorizontal: SPACING.xxl,
  },
  createPlanBtnText: { color: 'white', fontWeight: 'bold', fontSize: FONTS.sizes.md },
  doneBtn: { paddingVertical: SPACING.md },
  doneBtnText: { color: COLORS.textGray, fontSize: FONTS.sizes.md },
  errorBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,127,80,0.1)', borderRadius: RADIUS.md,
    padding: SPACING.md, marginTop: SPACING.md, gap: 8,
  },
  errorText: { color: COLORS.orange, fontSize: FONTS.sizes.sm, flex: 1 },
  navRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: SPACING.xl, borderTopWidth: 1, borderTopColor: COLORS.border },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  backBtnText: { color: COLORS.textGray, fontSize: FONTS.sizes.md },
  nextBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: SPACING.xxl, borderRadius: RADIUS.full },
  nextBtnText: { color: 'white', fontWeight: 'bold', fontSize: FONTS.sizes.md },
  historySection: {
    marginTop: SPACING.xxl,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.xl,
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: SPACING.md,
  },
  historyTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: 'bold',
    color: COLORS.textWhite,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.bgCard,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  historyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
    paddingRight: SPACING.md,
  },
  historyVal: {
    color: COLORS.textWhite,
    fontWeight: 'bold',
    fontSize: FONTS.sizes.md,
  },
  historyGoalText: {
    color: COLORS.cyan,
    fontSize: FONTS.sizes.xs,
  },
  historyDate: {
    color: COLORS.textGray,
    fontSize: FONTS.sizes.sm,
  },
  deleteBtn: {
    padding: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#151922',
    borderTopLeftRadius: RADIUS.lg,
    borderTopRightRadius: RADIUS.lg,
    maxHeight: '80%',
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.xl,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalHeaderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: 'bold',
    color: COLORS.textWhite,
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalScroll: {
    padding: SPACING.xl,
  },
  modalScrollContent: {
    paddingBottom: SPACING.xl,
  },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: SPACING.md,
    marginTop: SPACING.sm,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(64,224,208,0.15)',
  },
  seeAllBtnText: {
    color: COLORS.cyan,
    fontSize: FONTS.sizes.sm,
    fontWeight: 'bold',
  },
});
