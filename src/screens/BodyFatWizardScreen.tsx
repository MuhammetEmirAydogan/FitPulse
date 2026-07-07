import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, KeyboardAvoidingView, Platform, Modal
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useLocalization } from '../context/LocalizationContext';
import { useApp } from '../context/AppContext';
import { calculateBodyFatPercentage } from '../utils/fitnessCalculations';
import { COLORS, FONTS, RADIUS, SPACING } from '../utils/theme';
import { StarBorder } from '../components/StarBorder';
import { AnimatedBentoCard } from '../components/AnimatedBentoCard';
import { MaleSilhouette, FemaleSilhouette } from '../components/BodySilhouettes';
import { HeightMeasurementSvg } from '../components/HeightMeasurementSvg';
import { BodyMeasurementSvg } from '../components/BodyMeasurementSvg';

interface Props {
  onComplete: () => void;
  onPlanCreationRequest: (bfp: number) => void;
}

type Step = 'gender' | 'height' | 'neck' | 'waist' | 'hip' | 'result';

export const BodyFatWizardScreen: React.FC<Props> = ({ onComplete, onPlanCreationRequest }) => {
  const { t, language } = useLocalization();
  const { handleSaveBodyFat, bodyFatHistory, handleDeleteBodyFat } = useApp();

  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [height, setHeight] = useState('');
  const [neck, setNeck] = useState('');
  const [waist, setWaist] = useState('');
  const [hip, setHip] = useState('');
  const [step, setStep] = useState<Step>('gender');
  const [result, setResult] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showAllHistory, setShowAllHistory] = useState(false);

  const steps: Step[] = gender === 'female'
    ? ['gender', 'height', 'neck', 'waist', 'hip', 'result']
    : ['gender', 'height', 'neck', 'waist', 'result'];

  const stepIdx = steps.indexOf(step);
  const progress = (stepIdx + 1) / steps.length;

  const handleNext = () => {
    const idx = steps.indexOf(step);
    if ((step === 'waist' && gender === 'male') || (step === 'hip' && gender === 'female')) {
      const bfp = calculateBodyFatPercentage({
        gender,
        height: parseFloat(height),
        neck: parseFloat(neck),
        waist: parseFloat(waist),
        hip: gender === 'female' ? parseFloat(hip) : undefined,
      });
      if (bfp === null) {
        setError(t('bodyFatInvalidInputs'));
        return;
      }
      setResult(bfp);
      setStep('result');
      // Firestore'a kaydet
      handleSaveBodyFat(bfp, gender);
    } else if (idx < steps.length - 1) {
      setStep(steps[idx + 1]);
    }
  };

  const handleBack = () => {
    const idx = steps.indexOf(step);
    if (idx === 0) onComplete();
    else setStep(steps[idx - 1]);
  };

  const getBFCategory = (bfp: number) => {
    if (gender === 'male') {
      if (bfp < 6) return { label: t('bfCategoryEssential'), color: COLORS.blue };
      if (bfp < 14) return { label: t('bfCategoryAthletes'), color: COLORS.green };
      if (bfp < 18) return { label: t('bfCategoryFitness'), color: COLORS.cyan };
      if (bfp < 25) return { label: t('bfCategoryAverage'), color: COLORS.yellow };
      return { label: t('bfCategoryObese'), color: COLORS.red };
    } else {
      if (bfp < 14) return { label: t('bfCategoryEssential'), color: COLORS.blue };
      if (bfp < 21) return { label: t('bfCategoryAthletes'), color: COLORS.green };
      if (bfp < 25) return { label: t('bfCategoryFitness'), color: COLORS.cyan };
      if (bfp < 32) return { label: t('bfCategoryAverage'), color: COLORS.yellow };
      return { label: t('bfCategoryObese'), color: COLORS.red };
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.headerBox}>
          <Ionicons name="body-outline" size={32} color={COLORS.cyan} style={{ marginBottom: 8 }} />
          <Text style={styles.headerTitle}>{t('bodyFatTitle')}</Text>
          <Text style={styles.headerSubtitle}>{t('bodyFatSubtitle')}</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {step === 'gender' && (
            <>
              <Text style={styles.question}>{t('bodyFatGenderQuestion')}</Text>
              <View style={styles.silhouetteRow}>
                <TouchableOpacity
                  style={styles.silhouetteOption}
                  onPress={() => setGender('male')}
                  activeOpacity={0.7}
                >
                  {gender === 'male' && (
                    <View style={styles.checkmarkContainer}>
                      <View style={styles.checkmarkCircle}>
                        <Ionicons name="checkmark" size={14} color="white" />
                      </View>
                    </View>
                  )}
                  {gender === 'male' && <View style={styles.silhouetteGlow} />}
                  <MaleSilhouette
                    width={130} height={180}
                    color={gender === 'male' ? COLORS.cyan : '#3A4050'}
                    opacity={gender === 'male' ? 1 : 0.5}
                  />
                  <Text style={[styles.silhouetteLabel, gender === 'male' && styles.silhouetteLabelActive]}>
                    {t('male')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.silhouetteOption}
                  onPress={() => setGender('female')}
                  activeOpacity={0.7}
                >
                  {gender === 'female' && (
                    <View style={styles.checkmarkContainer}>
                      <View style={styles.checkmarkCircle}>
                        <Ionicons name="checkmark" size={14} color="white" />
                      </View>
                    </View>
                  )}
                  {gender === 'female' && <View style={styles.silhouetteGlow} />}
                  <FemaleSilhouette
                    width={130} height={180}
                    color={gender === 'female' ? COLORS.cyan : '#3A4050'}
                    opacity={gender === 'female' ? 1 : 0.5}
                  />
                  <Text style={[styles.silhouetteLabel, gender === 'female' && styles.silhouetteLabelActive]}>
                    {t('female')}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Geçmiş Ölçümler */}
              {bodyFatHistory && bodyFatHistory.length > 0 && (
                <View style={styles.historySection}>
                  <View style={styles.historyHeader}>
                    <Ionicons name="time-outline" size={18} color={COLORS.cyan} />
                    <Text style={styles.historyTitle}>{t('weightHistoryTitle')}</Text>
                  </View>
                  {bodyFatHistory.slice(0, 5).map(item => (
                    <View key={item.id} style={styles.historyItem}>
                      <View style={styles.historyLeft}>
                        <Ionicons name={item.gender === 'male' ? 'male' : 'female'} size={14} color={COLORS.textGray} />
                        <Text style={styles.historyVal}>{item.percentage.toFixed(1)}%</Text>
                        <Text style={styles.historyDate}>
                          {new Date(item.date).toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US')}
                        </Text>
                      </View>
                      <TouchableOpacity onPress={() => handleDeleteBodyFat(item.id)} style={styles.deleteBtn}>
                        <Ionicons name="trash-outline" size={16} color={COLORS.red} />
                      </TouchableOpacity>
                    </View>
                  ))}

                  {bodyFatHistory.length > 5 && (
                    <TouchableOpacity
                      style={styles.seeAllBtn}
                      onPress={() => setShowAllHistory(true)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.seeAllBtnText}>
                        {language === 'tr'
                          ? `Tüm Geçmişi Gör (${bodyFatHistory.length} Ölçüm)`
                          : `See All History (${bodyFatHistory.length} Measures)`}
                      </Text>
                      <Ionicons name="chevron-forward" size={16} color={COLORS.cyan} />
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </>
          )}

          {step === 'height' && (
            <View style={styles.heightStepContainer}>
              <View style={styles.heightSvgWrapper}>
                <HeightMeasurementSvg width={220} height={260} gender={gender} />
              </View>
              <Text style={styles.question}>{t('bodyFatHeightQuestion')}</Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.bigInput}
                  value={height}
                  onChangeText={setHeight}
                  keyboardType="decimal-pad"
                  placeholder="0"
                  placeholderTextColor={COLORS.textGray}
                  selectionColor={COLORS.cyan}
                />
                <Text style={styles.unit}>cm</Text>
              </View>
            </View>
          )}

          {step === 'neck' && (
            <View style={styles.heightStepContainer}>
              <View style={styles.heightSvgWrapper}>
                <BodyMeasurementSvg width={200} height={240} gender={gender} highlightArea="neck" />
              </View>
              <Text style={styles.question}>{t('bodyFatNeckQuestion')}</Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.bigInput}
                  value={neck}
                  onChangeText={setNeck}
                  keyboardType="decimal-pad"
                  placeholder="0"
                  placeholderTextColor={COLORS.textGray}
                  selectionColor={COLORS.cyan}
                />
                <Text style={styles.unit}>cm</Text>
              </View>
            </View>
          )}

          {step === 'waist' && (
            <View style={styles.heightStepContainer}>
              <View style={styles.heightSvgWrapper}>
                <BodyMeasurementSvg width={200} height={240} gender={gender} highlightArea="waist" />
              </View>
              <Text style={styles.question}>{t('bodyFatWaistQuestion')}</Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.bigInput}
                  value={waist}
                  onChangeText={setWaist}
                  keyboardType="decimal-pad"
                  placeholder="0"
                  placeholderTextColor={COLORS.textGray}
                  selectionColor={COLORS.cyan}
                />
                <Text style={styles.unit}>cm</Text>
              </View>
            </View>
          )}

          {step === 'hip' && (
            <View style={styles.heightStepContainer}>
              <View style={styles.heightSvgWrapper}>
                <BodyMeasurementSvg width={200} height={240} gender={gender} highlightArea="hip" />
              </View>
              <Text style={styles.question}>{t('bodyFatHipQuestion')}</Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.bigInput}
                  value={hip}
                  onChangeText={setHip}
                  keyboardType="decimal-pad"
                  placeholder="0"
                  placeholderTextColor={COLORS.textGray}
                  selectionColor={COLORS.cyan}
                />
                <Text style={styles.unit}>cm</Text>
              </View>
            </View>
          )}

          {step === 'result' && result !== null && (
            <View style={styles.resultContainer}>
              <Ionicons name="body-outline" size={48} color={COLORS.cyan} style={{ marginBottom: 16 }} />
              <Text style={styles.resultLabel}>{t('bodyFatResultLabel')}</Text>
              <Text style={styles.resultNumber}>
                {result.toFixed(1)}<Text style={styles.resultPercent}>%</Text>
              </Text>
              <View style={[styles.categoryBadge, { borderColor: getBFCategory(result).color }]}>
                <Text style={[styles.categoryText, { color: getBFCategory(result).color }]}>
                  {getBFCategory(result).label}
                </Text>
              </View>

              <StarBorder color={COLORS.cyan} speed={2500} radius={RADIUS.full} style={{ marginBottom: SPACING.md, alignSelf: 'stretch' }}>
                <TouchableOpacity
                  style={styles.createPlanBtn}
                  onPress={() => onPlanCreationRequest(result)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="sparkles" size={18} color="white" style={{ marginRight: 8 }} />
                  <Text style={styles.createPlanBtnText}>{t('bodyFatCreatePlanButton')}</Text>
                </TouchableOpacity>
              </StarBorder>

              <TouchableOpacity onPress={onComplete} style={styles.doneBtn} activeOpacity={0.7}>
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
                <LinearGradient
                  colors={[COLORS.cyan, COLORS.blue]}
                  style={styles.nextBtn}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                >
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
                    {language === 'tr' ? 'Ölçüm Geçmişi' : 'Measurement History'}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setShowAllHistory(false)} style={styles.modalCloseBtn}>
                  <Ionicons name="close" size={24} color={COLORS.textWhite} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalScroll} contentContainerStyle={styles.modalScrollContent}>
                {bodyFatHistory && bodyFatHistory.map(item => (
                  <View key={item.id} style={styles.historyItem}>
                    <View style={styles.historyLeft}>
                      <Ionicons name={item.gender === 'male' ? 'male' : 'female'} size={14} color={COLORS.textGray} />
                      <Text style={styles.historyVal}>{item.percentage.toFixed(1)}%</Text>
                      <Text style={styles.historyDate}>
                        {new Date(item.date).toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US')}
                      </Text>
                    </View>
                    <TouchableOpacity onPress={() => handleDeleteBodyFat(item.id)} style={styles.deleteBtn}>
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
  headerBox: {
    alignItems: 'center',
    padding: SPACING.xl,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: { fontSize: FONTS.sizes.xxl, fontWeight: 'bold', color: COLORS.textWhite, marginBottom: 4 },
  headerSubtitle: { fontSize: FONTS.sizes.sm, color: COLORS.textGray, marginBottom: SPACING.md, textAlign: 'center' },
  progressBar: { width: '100%', height: 3, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 2 },
  progressFill: { height: 3, backgroundColor: COLORS.cyan, borderRadius: 2 },
  scroll: { padding: SPACING.xl },
  question: { fontSize: FONTS.sizes.xxl, fontWeight: 'bold', color: COLORS.textWhite, marginBottom: SPACING.xl },
  silhouetteRow: {
    flexDirection: 'row', justifyContent: 'center',
    alignItems: 'flex-end', gap: SPACING.xl,
    marginTop: SPACING.xl, paddingVertical: SPACING.lg,
  },
  silhouetteOption: { alignItems: 'center', position: 'relative', paddingTop: 28 },
  silhouetteGlow: {
    position: 'absolute', top: 30, left: -10, right: -10, bottom: 30,
    borderRadius: 80, backgroundColor: 'rgba(64,224,208,0.08)',
    shadowColor: COLORS.cyan, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3, shadowRadius: 30, elevation: 8,
  },
  checkmarkContainer: { position: 'absolute', top: 0, alignSelf: 'center', zIndex: 10 },
  checkmarkCircle: {
    width: 24, height: 24, borderRadius: 12, backgroundColor: COLORS.cyan,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: COLORS.cyan, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5, shadowRadius: 6, elevation: 6,
  },
  silhouetteLabel: { color: COLORS.textGray, fontWeight: 'bold', fontSize: FONTS.sizes.md, marginTop: SPACING.md },
  silhouetteLabelActive: { color: COLORS.cyan },
  heightStepContainer: { alignItems: 'center' },
  heightSvgWrapper: { alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.lg, marginTop: SPACING.md },
  measureContainer: { alignItems: 'center', paddingTop: SPACING.xl },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, marginTop: SPACING.xl },
  bigInput: {
    fontSize: 48, fontWeight: 'bold', color: COLORS.textWhite,
    borderBottomWidth: 2, borderBottomColor: COLORS.cyan,
    minWidth: 120, textAlign: 'center', paddingVertical: SPACING.sm,
  },
  unit: { fontSize: FONTS.sizes.xxl, color: COLORS.textGray },
  resultContainer: { alignItems: 'center', paddingTop: SPACING.xl },
  resultLabel: { fontSize: FONTS.sizes.md, color: COLORS.textGray, marginBottom: SPACING.sm },
  resultNumber: { fontSize: 72, fontWeight: 'bold', color: COLORS.cyan },
  resultPercent: { fontSize: FONTS.sizes.xxl, color: COLORS.cyan },
  categoryBadge: {
    borderWidth: 1, borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.xl, paddingVertical: SPACING.sm,
    marginTop: SPACING.md, marginBottom: SPACING.xl,
  },
  categoryText: { fontWeight: 'bold', fontSize: FONTS.sizes.md },
  createPlanBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.cyan, borderRadius: RADIUS.full,
    paddingVertical: 14, paddingHorizontal: SPACING.xxl,
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
  navRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: SPACING.xl, borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  backBtnText: { color: COLORS.textGray, fontSize: FONTS.sizes.md },
  nextBtn: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 14, paddingHorizontal: SPACING.xxl, borderRadius: RADIUS.full,
  },
  nextBtnText: { color: 'white', fontWeight: 'bold', fontSize: FONTS.sizes.md },
  
  // History styles
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
    gap: SPACING.md,
  },
  historyVal: {
    color: COLORS.textWhite,
    fontWeight: 'bold',
    fontSize: FONTS.sizes.md,
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
