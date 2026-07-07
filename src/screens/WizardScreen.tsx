import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  ActivityIndicator, TextInput, Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalization } from '../context/LocalizationContext';
import { Plan, WorkoutFeedback, HeartRateData, CalorieResults } from '../types';
import { generatePlan } from '../services/geminiService';
import { COLORS, FONTS, RADIUS, SPACING } from '../utils/theme';
import { StarBorder } from '../components/StarBorder';
import Svg, { Path, G, Circle, Rect, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';

const CardioPulseIcon: React.FC<{ fill: string, size?: number }> = ({ fill, size = 32 }) => {
  const baseColor = "rgba(255,255,255,0.25)";
  const strokeW = "2.5";
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      {/* Heart Outline */}
      <Path
        d="M 50 80 C 50 80, 20 55, 20 35 C 20 20, 38 15, 50 30 C 62 15, 80 20, 80 35 C 80 55, 50 80, 50 80 Z"
        fill="transparent"
        stroke={fill}
        strokeWidth={strokeW}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Pulse Line */}
      <Path
        d="M 25 45 L 35 45 L 42 25 L 50 70 L 58 45 L 75 45"
        fill="transparent"
        stroke={fill}
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

const MuscleAnatomyIcon: React.FC<{ muscle: string, fill: string, size?: number }> = ({ muscle, fill, size = 32 }) => {
  const baseColor = "rgba(255,255,255,0.25)";
  const strokeW = "2.5";

  // A much smoother, full-body unisex outline
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      {/* Head & Neck */}
      <Path d="M43 15 C 43 10, 57 10, 57 15 C 57 20, 53 23, 53 25 L 47 25 C 47 23, 43 20, 43 15 Z" fill="transparent" stroke={baseColor} strokeWidth={strokeW} strokeLinecap="round" strokeLinejoin="round" />

      {/* Shoulders, Arms, Torso, Legs (Continuous smooth outline) */}
      <Path
        d="M 47 25 
           L 53 25 
           C 60 25, 68 28, 70 33 
           C 72 38, 73 53, 70 60
           L 66 60
           C 65 50, 64 45, 62 45
           L 62 65
           C 62 70, 65 85, 65 92
           L 58 92
           C 57 80, 55 65, 52 65
           L 48 65
           C 45 65, 43 80, 42 92
           L 35 92
           C 35 85, 38 70, 38 65
           L 38 45
           C 36 45, 35 50, 34 60
           L 30 60
           C 27 53, 28 38, 30 33
           C 32 28, 40 25, 47 25 Z"
        fill="transparent"
        stroke={baseColor}
        strokeWidth={strokeW}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Muscle Highlights */}
      {muscle === 'Full Body' && (
        <G opacity={0.6}>
          <Path d="M43 15 C 43 10, 57 10, 57 15 C 57 20, 53 23, 53 25 L 47 25 C 47 23, 43 20, 43 15 Z" fill={fill} />
          <Path d="M 47 25 L 53 25 C 60 25, 68 28, 70 33 C 72 38, 73 53, 70 60 L 66 60 C 65 50, 64 45, 62 45 L 62 65 C 62 70, 65 85, 65 92 L 58 92 C 57 80, 55 65, 52 65 L 48 65 C 45 65, 43 80, 42 92 L 35 92 C 35 85, 38 70, 38 65 L 38 45 C 36 45, 35 50, 34 60 L 30 60 C 27 53, 28 38, 30 33 C 32 28, 40 25, 47 25 Z" fill={fill} />
        </G>
      )}

      {muscle === 'Chest' && (
        <Path d="M40 33 C 45 32, 55 32, 60 33 C 62 38, 58 42, 50 42 C 42 42, 38 38, 40 33 Z" fill={fill} opacity={0.7} />
      )}

      {muscle === 'Back' && (
        <Path d="M40 33 L 60 33 L 57 52 L 43 52 Z" fill={fill} opacity={0.7} />
      )}

      {muscle === 'Shoulders' && (
        <G>
          <Path d="M 38 27 C 33 27, 28 32, 30 38 C 33 34, 36 32, 38 32 Z" fill={fill} opacity={0.8} />
          <Path d="M 62 27 C 67 27, 72 32, 70 38 C 67 34, 64 32, 62 32 Z" fill={fill} opacity={0.8} />
        </G>
      )}

      {muscle === 'Arms' && (
        <G>
          <Path d="M 30 38 C 28 45, 29 55, 33 58 C 34 50, 36 45, 37 40 Z" fill={fill} opacity={0.8} />
          <Path d="M 70 38 C 72 45, 71 55, 67 58 C 66 50, 64 45, 63 40 Z" fill={fill} opacity={0.8} />
        </G>
      )}

      {muscle === 'Abs' && (
        <G>
          <Rect x="44" y="44" width="5" height="4" rx="1" fill={fill} opacity={0.8} />
          <Rect x="51" y="44" width="5" height="4" rx="1" fill={fill} opacity={0.8} />
          <Rect x="44" y="49" width="5" height="4" rx="1" fill={fill} opacity={0.8} />
          <Rect x="51" y="49" width="5" height="4" rx="1" fill={fill} opacity={0.8} />
          <Rect x="44" y="54" width="5" height="4" rx="1" fill={fill} opacity={0.8} />
          <Rect x="51" y="54" width="5" height="4" rx="1" fill={fill} opacity={0.8} />
        </G>
      )}

      {muscle === 'Legs' && (
        <G>
          <Path d="M 38 65 C 36 72, 35 80, 37 83 C 40 83, 42 75, 43 65 Z" fill={fill} opacity={0.8} />
          <Path d="M 62 65 C 64 72, 65 80, 63 83 C 60 83, 58 75, 57 65 Z" fill={fill} opacity={0.8} />
        </G>
      )}

      {muscle === 'Glutes' && (
        <Path d="M 38 62 C 45 66, 55 66, 62 62 C 60 58, 40 58, 38 62 Z" fill={fill} opacity={0.8} />
      )}

      {muscle === 'Calves' && (
        <G>
          <Path d="M 37 83 C 35 87, 35 91, 37 92 C 40 91, 39 85, 38 83 Z" fill={fill} opacity={0.8} />
          <Path d="M 63 83 C 65 87, 65 91, 63 92 C 60 91, 61 85, 62 83 Z" fill={fill} opacity={0.8} />
        </G>
      )}
    </Svg>
  );
};

interface WizardOption {
  value: string;
  labelKey: string;
  icon: string; // Ionicon name
  iconFamily?: 'Ionicons' | 'MaterialCommunityIcons';
  subtitleKey?: string;
  color?: string;
}

interface WizardStep {
  id: string;
  questionKey: string;
  options: WizardOption[];
  layout: 'grid' | 'list';
  multiSelect?: boolean;
}

interface Props {
  onPlanGenerated: (plan: Plan) => void;
  onPlanGenerating?: () => void;
  lastFeedback?: WorkoutFeedback;
  lastHeartRateData?: HeartRateData;
  initialBodyFat?: number | null;
  initialCalorieTarget?: CalorieResults | null;
  onBack: () => void;
  hasActivePlan?: boolean;
  onGoToCurrentPlan?: () => void;
}

export const WizardScreen: React.FC<Props> = ({
  onPlanGenerated, onPlanGenerating, lastFeedback, lastHeartRateData,
  initialBodyFat, initialCalorieTarget, onBack,
  hasActivePlan = false, onGoToCurrentPlan,
}) => {
  const { t } = useLocalization();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activePlanWarningDismissed, setActivePlanWarningDismissed] = useState(false);

  const steps: WizardStep[] = useMemo(() => [
    {
      id: 'mood', questionKey: 'wizardQuestionMood', layout: 'grid',
      options: [
        { value: 'Energized', labelKey: 'wizardMoodEnergized', icon: 'flash-outline', color: COLORS.yellow },
        { value: 'Good', labelKey: 'wizardMoodGood', icon: 'happy-outline', color: COLORS.cyan },
        { value: 'A Little Tired', labelKey: 'wizardMoodTired', icon: 'battery-half-outline', color: COLORS.blue },
        { value: 'Stressed', labelKey: 'wizardMoodStressed', icon: 'sad-outline', color: COLORS.orange },
      ]
    },
    {
      id: 'goal', questionKey: 'wizardQuestionGoal', layout: 'grid', multiSelect: true,
      options: [
        { value: 'Fat Loss', labelKey: 'wizardGoalFatLoss', icon: 'flame-outline', color: COLORS.orange },
        { value: 'Muscle Gain', labelKey: 'wizardGoalMuscleGain', icon: 'barbell-outline', color: COLORS.cyan },
        { value: 'Stamina', labelKey: 'wizardGoalStamina', icon: 'battery-charging-outline', color: COLORS.red },
        { value: 'Flexibility', labelKey: 'wizardGoalFlexibility', icon: 'yoga', iconFamily: 'MaterialCommunityIcons', color: COLORS.yellow },
        { value: 'General Form', labelKey: 'wizardGoalGeneralForm', icon: 'shield-check-outline', iconFamily: 'MaterialCommunityIcons', color: COLORS.green },
        { value: 'Posture Correction', labelKey: 'wizardGoalPosture', icon: 'human-male-height', iconFamily: 'MaterialCommunityIcons', color: COLORS.pink },
      ]
    },
    {
      id: 'muscleGroup', questionKey: 'wizardQuestionMuscleGroup', layout: 'grid', multiSelect: true,
      options: [
        { value: 'Chest', labelKey: 'muscleChest', icon: 'shield-outline', iconFamily: 'MaterialCommunityIcons', color: COLORS.red },
        { value: 'Back', labelKey: 'muscleBack', icon: 'rowing', iconFamily: 'MaterialCommunityIcons', color: COLORS.blue },
        { value: 'Shoulders', labelKey: 'muscleShoulders', icon: 'human-handsup', iconFamily: 'MaterialCommunityIcons', color: COLORS.orange },
        { value: 'Arms (Biceps/Triceps)', labelKey: 'muscleArms', icon: 'arm-flex', iconFamily: 'MaterialCommunityIcons', color: COLORS.cyan },
        { value: 'Abs / Core', labelKey: 'muscleAbs', icon: 'view-grid-outline', iconFamily: 'MaterialCommunityIcons', color: COLORS.yellow },
        { value: 'Legs (Quads/Hamstrings)', labelKey: 'muscleLegs', icon: 'run', iconFamily: 'MaterialCommunityIcons', color: COLORS.green },
        { value: 'Glutes', labelKey: 'muscleGlutes', icon: 'seat-outline', iconFamily: 'MaterialCommunityIcons', color: COLORS.pink },
        { value: 'Calves', labelKey: 'muscleCalves', icon: 'shoe-sneaker', iconFamily: 'MaterialCommunityIcons', color: COLORS.teal },
        { value: 'Full Body', labelKey: 'wizardFocusFullBody', icon: 'body-outline', color: COLORS.purple },
        { value: 'Cardio', labelKey: 'wizardFocusCardio', icon: 'heart-outline', color: COLORS.coral },
      ]
    },
    {
      id: 'duration', questionKey: 'wizardQuestionDuration', layout: 'grid',
      options: [
        { value: '15 Minutes', labelKey: 'wizardDuration15', icon: 'time-outline', color: COLORS.cyan },
        { value: '30 Minutes', labelKey: 'wizardDuration30', icon: 'time-outline', color: COLORS.green },
        { value: '45 Minutes', labelKey: 'wizardDuration45', icon: 'time-outline', color: COLORS.yellow },
        { value: '60+ Minutes', labelKey: 'wizardDuration60', icon: 'timer-outline', color: COLORS.orange },
      ]
    },

    {
      id: 'level', questionKey: 'wizardQuestionLevel', layout: 'list',
      options: [
        { value: 'Sedentary', labelKey: 'wizardLevelSedentary', icon: 'cafe-outline', subtitleKey: 'wizardLevelSedentarySub', color: COLORS.textGray },
        { value: 'Beginner', labelKey: 'wizardLevelBeginner', icon: 'footsteps-outline', subtitleKey: 'wizardLevelBeginnerSub', color: COLORS.green },
        { value: 'Intermediate', labelKey: 'wizardLevelIntermediate', icon: 'trending-up-outline', subtitleKey: 'wizardLevelIntermediateSub', color: COLORS.yellow },
        { value: 'Advanced', labelKey: 'wizardLevelAdvanced', icon: 'barbell-outline', subtitleKey: 'wizardLevelAdvancedSub', color: COLORS.orange },
        { value: 'Pro', labelKey: 'wizardLevelPro', icon: 'trophy-outline', subtitleKey: 'wizardLevelProSub', color: COLORS.red },
      ]
    },
    {
      id: 'environment', questionKey: 'wizardQuestionEnvironment', layout: 'grid', multiSelect: true,
      options: [
        { value: 'Home', labelKey: 'wizardEnvHome', icon: 'home-outline', color: COLORS.cyan },
        { value: 'Gym', labelKey: 'wizardEnvGym', icon: 'dumbbell', iconFamily: 'MaterialCommunityIcons', color: COLORS.orange },
        { value: 'Outdoors', labelKey: 'wizardEnvOutdoors', icon: 'trail-sign-outline', color: COLORS.green },
        { value: 'Office', labelKey: 'wizardEnvOffice', icon: 'briefcase-outline', color: COLORS.purple },
        { value: 'Hotel', labelKey: 'wizardEnvHotel', icon: 'bed-outline', color: COLORS.yellow },
        { value: 'Calisthenics Park', labelKey: 'wizardEnvPark', icon: 'forest', iconFamily: 'MaterialCommunityIcons', color: COLORS.coral },
      ]
    },
    {
      id: 'equipment', questionKey: 'wizardQuestionEquipment', layout: 'grid', multiSelect: true,
      options: [
        { value: 'Bodyweight Only', labelKey: 'equipmentOptBodyweightOnly', icon: 'human-handsup', iconFamily: 'MaterialCommunityIcons', color: COLORS.cyan },
        { value: 'Full Gym Access', labelKey: 'wizardEquipGym', icon: 'weight-lifter', iconFamily: 'MaterialCommunityIcons', color: COLORS.red },
        { value: 'Dumbbells', labelKey: 'wizardEquipDumbbells', icon: 'dumbbell', iconFamily: 'MaterialCommunityIcons', color: COLORS.textGray },
        { value: 'Barbell & Plates', labelKey: 'wizardEquipBarbell', icon: 'barbell', color: COLORS.cyan },
        { value: 'Kettlebell', labelKey: 'wizardEquipKettlebell', icon: 'kettlebell', iconFamily: 'MaterialCommunityIcons', color: COLORS.red },
        { value: 'Cable Machine', labelKey: 'wizardEquipCable', icon: 'car-shift-pattern', iconFamily: 'MaterialCommunityIcons', color: COLORS.orange },
        { value: 'Pull-up Bar', labelKey: 'wizardEquipPullup', icon: 'align-vertical-top', iconFamily: 'MaterialCommunityIcons', color: COLORS.yellow },
        { value: 'Resistance Bands', labelKey: 'wizardEquipBands', icon: 'infinite-outline', color: COLORS.purple },
        { value: 'Workout Bench', labelKey: 'wizardEquipBench', icon: 'seat-flat', iconFamily: 'MaterialCommunityIcons', color: COLORS.coral },
        { value: 'Cardio Machines', labelKey: 'wizardEquipCardioMachine', icon: 'run', iconFamily: 'MaterialCommunityIcons', color: COLORS.green },
        { value: 'Yoga Mat', labelKey: 'equipmentOptYogaMat', icon: 'rug', iconFamily: 'MaterialCommunityIcons', color: COLORS.green },
        { value: 'Jump Rope', labelKey: 'equipmentOptJumpRope', icon: 'jump-rope', iconFamily: 'MaterialCommunityIcons', color: COLORS.yellow },
      ]
    },
    {
      id: 'recovery', questionKey: 'wizardQuestionRecovery', layout: 'list',
      options: [
        { value: 'Fresh', labelKey: 'wizardRecFresh', icon: 'battery-high', iconFamily: 'MaterialCommunityIcons', subtitleKey: 'wizardRecFreshSub', color: COLORS.green },
        { value: 'Slightly Sore', labelKey: 'wizardRecSore', icon: 'battery-medium', iconFamily: 'MaterialCommunityIcons', subtitleKey: 'wizardRecSoreSub', color: COLORS.yellow },
        { value: 'Very Sore', labelKey: 'wizardRecVerySore', icon: 'battery-low', iconFamily: 'MaterialCommunityIcons', subtitleKey: 'wizardRecVerySoreSub', color: COLORS.red },
      ]
    },
    {
      id: 'sleep', questionKey: 'wizardQuestionSleep', layout: 'list',
      options: [
        { value: 'Good', labelKey: 'wizardSleepGood', icon: 'sunny-outline', color: COLORS.yellow },
        { value: 'Average', labelKey: 'wizardSleepAverage', icon: 'cloudy-outline', color: COLORS.cyan },
        { value: 'Poor', labelKey: 'wizardSleepPoor', icon: 'moon-outline', color: COLORS.textGray },
      ]
    },
    {
      id: 'diet', questionKey: 'wizardQuestionDiet', layout: 'grid', multiSelect: true,
      options: [
        { value: 'Anything', labelKey: 'wizardDietAnything', icon: 'silverware-fork-knife', iconFamily: 'MaterialCommunityIcons', color: COLORS.cyan },
        { value: 'Vegetarian', labelKey: 'wizardDietVegetarian', icon: 'carrot', iconFamily: 'MaterialCommunityIcons', color: COLORS.orange },
        { value: 'Vegan', labelKey: 'wizardDietVegan', icon: 'sprout', iconFamily: 'MaterialCommunityIcons', color: COLORS.green },
        { value: 'Gluten-Free', labelKey: 'dietOptGluten-Free', icon: 'barley-off', iconFamily: 'MaterialCommunityIcons', color: COLORS.yellow },
        { value: 'Pescatarian', labelKey: 'dietOptPescatarian', icon: 'fish', iconFamily: 'MaterialCommunityIcons', color: COLORS.blue },
        { value: 'Keto', labelKey: 'dietOptKeto', icon: 'food-steak', iconFamily: 'MaterialCommunityIcons', color: COLORS.red },
        { value: 'Intermittent Fasting', labelKey: 'dietOptIF', icon: 'timer-sand', iconFamily: 'MaterialCommunityIcons', color: COLORS.purple },
        { value: 'Paleo', labelKey: 'dietOptPaleo', icon: 'bone', iconFamily: 'MaterialCommunityIcons', color: COLORS.coral },
        { value: 'Lactose-Free', labelKey: 'dietOptLactoseFree', icon: 'cup-off', iconFamily: 'MaterialCommunityIcons', color: COLORS.cyan },
        { value: 'Halal', labelKey: 'dietOptHalal', icon: 'food-halal', iconFamily: 'MaterialCommunityIcons', color: COLORS.green },
      ]
    },
    {
      id: 'cuisine', questionKey: 'wizardQuestionCuisine', layout: 'grid', multiSelect: true,
      options: [
        { value: 'Anything', labelKey: 'wizardCuisineAnything', icon: 'earth', iconFamily: 'MaterialCommunityIcons', color: COLORS.cyan },
        { value: 'Turkish', labelKey: 'wizardCuisineTurkish', icon: 'food-turkey', iconFamily: 'MaterialCommunityIcons', color: COLORS.red },
        { value: 'Mediterranean', labelKey: 'wizardCuisineMediterranean', icon: 'fruit-grapes', iconFamily: 'MaterialCommunityIcons', color: COLORS.purple },
        { value: 'Asian', labelKey: 'wizardCuisineAsian', icon: 'noodles', iconFamily: 'MaterialCommunityIcons', color: COLORS.orange },
        { value: 'Italian', labelKey: 'wizardCuisineItalian', icon: 'pizza', iconFamily: 'MaterialCommunityIcons', color: COLORS.green },
        { value: 'Mexican', labelKey: 'wizardCuisineMexican', icon: 'chili-mild', iconFamily: 'MaterialCommunityIcons', color: COLORS.red },
        { value: 'Indian', labelKey: 'wizardCuisineIndian', icon: 'bowl-mix', iconFamily: 'MaterialCommunityIcons', color: COLORS.yellow },
        { value: 'American', labelKey: 'wizardCuisineAmerican', icon: 'hamburger', iconFamily: 'MaterialCommunityIcons', color: COLORS.coral },
        { value: 'French', labelKey: 'wizardCuisineFrench', icon: 'baguette', iconFamily: 'MaterialCommunityIcons', color: COLORS.yellow },
        { value: 'Middle Eastern', labelKey: 'wizardCuisineMiddleEastern', icon: 'food-drumstick', iconFamily: 'MaterialCommunityIcons', color: COLORS.green },
      ]
    },
  ], []);

  const step = steps[currentStep];
  const totalSteps = steps.length;
  const progress = (currentStep + 1) / totalSteps;

  const getCurrentValue = () => answers[step.id];

  const handleSelect = (value: string) => {
    if (step.multiSelect) {
      const current = (answers[step.id] as string[]) || [];
      const updated = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      setAnswers(prev => ({ ...prev, [step.id]: updated }));
    } else {
      setAnswers(prev => ({ ...prev, [step.id]: value }));
    }
  };

  const isSelected = (value: string) => {
    const current = getCurrentValue();
    if (step.multiSelect) return (current as string[] || []).includes(value);
    return current === value;
  };

  const canProceed = () => {
    const current = getCurrentValue();
    if (step.multiSelect) return (current as string[] || []).length > 0;
    return !!current;
  };

  const handleNext = async () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      await handleGenerate();
    }
  };

  const handleBack = () => {
    if (currentStep === 0) onBack();
    else setCurrentStep(prev => prev - 1);
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    // Immediately switch to current_plan view so the user can see the loading state there
    if (onPlanGenerating) onPlanGenerating();
    try {
      const planAnswers: any = { ...answers };
      if (initialBodyFat) planAnswers.bodyFat = initialBodyFat;
      if (initialCalorieTarget) planAnswers.calorieTarget = initialCalorieTarget;

      const plan = await generatePlan(planAnswers, t, lastFeedback, lastHeartRateData);
      if (plan) {
        onPlanGenerated(plan);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : t('errorGemini'));
      setIsGenerating(false);
    }
  };

  // Show active plan warning if user hasn't dismissed it yet
  if (hasActivePlan && !activePlanWarningDismissed) {
    return (
      <View key="warning-screen" style={styles.loadingContainer}>
        <Ionicons name="warning-outline" size={64} color={COLORS.orange} />
        <Text style={[styles.loadingText, { color: COLORS.textWhite, fontSize: FONTS.sizes.xl, fontWeight: 'bold', marginTop: 16 }]}>
          {t('activePlanWarningTitle')}
        </Text>
        <Text style={[styles.loadingText, { textAlign: 'center', marginTop: 8, marginBottom: 24 }]}>
          {t('activePlanWarningSubtitle')}
        </Text>
        <StarBorder color={COLORS.cyan} speed={2200} radius={RADIUS.full}>
          <TouchableOpacity
            onPress={() => { if (onGoToCurrentPlan) onGoToCurrentPlan(); }}
            activeOpacity={0.8}
          >
            <LinearGradient colors={[COLORS.cyan, COLORS.blue]} style={{ paddingVertical: 14, paddingHorizontal: 32, borderRadius: RADIUS.full, flexDirection: 'row', alignItems: 'center' }} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <Ionicons name="clipboard-outline" size={18} color="white" style={{ marginRight: 8 }} />
              <Text style={{ color: 'white', fontWeight: 'bold', fontSize: FONTS.sizes.md }}>{t('activePlanWarningGoToPlan')}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </StarBorder>
        <TouchableOpacity onPress={() => setActivePlanWarningDismissed(true)} style={{ marginTop: 16, paddingVertical: 10, paddingHorizontal: 20 }} activeOpacity={0.7}>
          <Text style={{ color: COLORS.textGray, fontSize: FONTS.sizes.sm }}>{t('activePlanWarningContinueAnyway')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (isGenerating) {
    return (
      <View key="loading-screen" style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.cyan} />
        <Text style={styles.loadingText}>{t('generatingPlanMessage')}</Text>
      </View>
    );
  }

  const renderOption = (option: WizardOption) => {
    const selected = isSelected(option.value);
    const iconColor = option.color || (selected ? COLORS.cyan : COLORS.textGray);
    const baseBorderColor = option.color ? option.color + '40' : COLORS.border;
    const activeBorderColor = iconColor;
    const finalBorderColor = selected ? activeBorderColor : baseBorderColor;
    const bgColor = selected ? iconColor + '15' : 'transparent';
    const IconComponent = option.iconFamily === 'MaterialCommunityIcons' ? MaterialCommunityIcons : Ionicons;

    const renderIcon = (size: number, style?: any) => {
      if (step.id === 'muscleGroup') {
        const muscleMap: Record<string, string> = {
          'Chest': 'Chest',
          'Back': 'Back',
          'Shoulders': 'Shoulders',
          'Arms (Biceps/Triceps)': 'Arms',
          'Abs / Core': 'Abs',
          'Legs (Quads/Hamstrings)': 'Legs',
          'Glutes': 'Glutes',
          'Calves': 'Calves',
          'Full Body': 'Full Body',
          'Cardio': 'Cardio'
        };
        const mappedMuscle = muscleMap[option.value];
        if (mappedMuscle) {
          if (mappedMuscle === 'Cardio') {
            return (
              <View style={[style, { alignItems: 'center', justifyContent: 'center' }]}>
                <CardioPulseIcon fill={iconColor} size={size + 16} />
              </View>
            );
          }
          return (
            <View style={[style, { alignItems: 'center', justifyContent: 'center' }]}>
              <MuscleAnatomyIcon muscle={mappedMuscle} fill={iconColor} size={size + 16} />
            </View>
          );
        }
        // Fallback for any unmapped options
        return <IconComponent name={option.icon as any} size={size} color={iconColor} style={style} />;
      }
      return <IconComponent name={option.icon as any} size={size} color={iconColor} style={style} />;
    };

    if (step.layout === 'list') {
      return (
        <TouchableOpacity
          key={option.value}
          style={[styles.listOption, { borderColor: finalBorderColor, backgroundColor: bgColor }]}
          onPress={() => handleSelect(option.value)}
          activeOpacity={0.8}
        >
          {renderIcon(28, { marginRight: 16 })}
          <View style={{ flex: 1 }}>
            <Text style={[styles.optionLabel, selected && { color: iconColor }]}>{t(option.labelKey)}</Text>
            {option.subtitleKey && (
              <Text style={styles.optionSubtitle}>{t(option.subtitleKey)}</Text>
            )}
          </View>
          <View style={[styles.radioOuter, { borderColor: finalBorderColor }]}>
            {selected && <View style={[styles.radioInner, { backgroundColor: iconColor }]} />}
          </View>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        key={option.value}
        style={[styles.gridOption, { borderColor: finalBorderColor, backgroundColor: bgColor }]}
        onPress={() => handleSelect(option.value)}
        activeOpacity={0.8}
      >
        <View style={[styles.radioOuter, styles.radioTopRight, { borderColor: finalBorderColor }]}>
          {selected && <View style={[styles.radioInner, { backgroundColor: iconColor }]} />}
        </View>
        {renderIcon(32, { marginBottom: 8 })}
        <Text style={[styles.gridOptionLabel, selected && { color: iconColor }]}>{t(option.labelKey)}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View key="wizard-main-screen" style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.stepText}>{t('wizardStep', { current: currentStep + 1, total: totalSteps })}</Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.question}>{t(step.questionKey)}</Text>

        {error && (
          <View style={styles.errorBox}>
            <Ionicons name="warning-outline" size={18} color={COLORS.orange} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={step.layout === 'grid' ? styles.gridContainer : styles.listContainer}>
          {step.options.map(renderOption)}
        </View>
      </ScrollView>

      {/* Navigation Buttons */}
      <View style={styles.navRow}>
        <TouchableOpacity style={styles.backBtn} onPress={handleBack} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={20} color={COLORS.textGray} />
          <Text style={styles.backBtnText}>{t('backButton')}</Text>
        </TouchableOpacity>

        {canProceed() ? (
          <StarBorder color={COLORS.cyan} speed={2200} radius={RADIUS.full}>
            <TouchableOpacity onPress={handleNext} activeOpacity={0.8}>
              <LinearGradient
                colors={[COLORS.cyan, COLORS.blue]}
                style={styles.nextBtn}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              >
                <Text style={styles.nextBtnText}>
                  {currentStep === totalSteps - 1 ? t('generatePlanButton') : t('nextButton')}
                </Text>
                <Ionicons name="arrow-forward" size={20} color="white" style={{ marginLeft: 8 }} />
              </LinearGradient>
            </TouchableOpacity>
          </StarBorder>
        ) : (
          <TouchableOpacity disabled activeOpacity={0.8}>
            <LinearGradient
              colors={['#4A5568', '#4A5568']}
              style={styles.nextBtn}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            >
              <Text style={styles.nextBtnText}>
                {currentStep === totalSteps - 1 ? t('generatePlanButton') : t('nextButton')}
              </Text>
              <Ionicons name="arrow-forward" size={20} color="white" style={{ marginLeft: 8 }} />
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  loadingText: {
    color: COLORS.textGray,
    fontSize: FONTS.sizes.md,
    textAlign: 'center',
  },
  header: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.md,
  },
  stepText: {
    color: COLORS.textGray,
    fontSize: FONTS.sizes.sm,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  progressBar: {
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
  },
  progressFill: {
    height: 3,
    backgroundColor: COLORS.cyan,
    borderRadius: 2,
  },
  scroll: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.xl,
  },
  question: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: 'bold',
    color: COLORS.textWhite,
    marginVertical: SPACING.xl,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,127,80,0.1)',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    gap: 8,
  },
  errorText: {
    color: COLORS.orange,
    fontSize: FONTS.sizes.sm,
    flex: 1,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  listContainer: {
    gap: SPACING.md,
  },
  gridOption: {
    width: '47%',
    backgroundColor: COLORS.bgCard,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
    position: 'relative',
  },
  gridOptionSelected: {
    borderColor: COLORS.cyan,
    backgroundColor: 'rgba(64,224,208,0.08)',
  },
  gridOptionLabel: {
    color: COLORS.textWhite,
    fontWeight: 'bold',
    fontSize: FONTS.sizes.sm,
    textAlign: 'center',
  },
  listOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
  },
  listOptionSelected: {
    borderColor: COLORS.cyan,
    backgroundColor: 'rgba(64,224,208,0.08)',
  },
  optionLabel: {
    color: COLORS.textWhite,
    fontWeight: 'bold',
    fontSize: FONTS.sizes.md,
  },
  optionLabelSelected: {
    color: COLORS.cyan,
  },
  optionSubtitle: {
    color: COLORS.textGray,
    fontSize: FONTS.sizes.sm,
    marginTop: 2,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: COLORS.textGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: {
    borderColor: COLORS.cyan,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.cyan,
  },
  radioTopRight: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.xl,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  backBtnText: {
    color: COLORS.textGray,
    fontSize: FONTS.sizes.md,
  },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: SPACING.xxl,
    borderRadius: RADIUS.full,
  },
  nextBtnText: {
    color: COLORS.textWhite,
    fontWeight: 'bold',
    fontSize: FONTS.sizes.md,
  },
});
