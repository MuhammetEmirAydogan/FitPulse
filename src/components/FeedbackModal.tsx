import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, Modal, ScrollView, TouchableOpacity, TextInput,
  Animated, Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useLocalization } from '../context/LocalizationContext';
import { WorkoutFeedback, FeedbackRating, FeedbackReason } from '../types';
import { COLORS, FONTS, RADIUS, SPACING } from '../utils/theme';

interface Props {
  onClose: () => void;
  onSubmit: (feedback: WorkoutFeedback) => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const RATING_OPTIONS: { value: FeedbackRating; labelKey: string; emoji: string; color: string; gradient: string[] }[] = [
  { value: 'too_easy', labelKey: 'feedbackTooEasy', emoji: '😴', color: '#60A5FA', gradient: ['#3B82F6', '#60A5FA'] },
  { value: 'easy', labelKey: 'feedbackEasy', emoji: '😊', color: COLORS.cyan, gradient: [COLORS.cyan, COLORS.teal] },
  { value: 'just_right', labelKey: 'feedbackJustRight', emoji: '💪', color: COLORS.green, gradient: [COLORS.green, '#34D399'] },
  { value: 'hard', labelKey: 'feedbackHard', emoji: '😤', color: COLORS.orange, gradient: [COLORS.orange, '#FB923C'] },
  { value: 'too_hard', labelKey: 'feedbackTooHard', emoji: '🥵', color: '#EF4444', gradient: ['#EF4444', '#F87171'] },
];

const REASON_OPTIONS: { value: FeedbackReason; labelKey: string; icon: string }[] = [
  { value: 'duration_long', labelKey: 'reasonDurationLong', icon: 'time-outline' },
  { value: 'complexity_high', labelKey: 'reasonComplexityHigh', icon: 'construct-outline' },
  { value: 'energy_low', labelKey: 'reasonEnergyLow', icon: 'battery-dead-outline' },
  { value: 'intensity_high', labelKey: 'reasonIntensityHigh', icon: 'flame-outline' },
  { value: 'muscle_strain', labelKey: 'reasonMuscleStrain', icon: 'body-outline' },
  { value: 'rest_short', labelKey: 'reasonRestShort', icon: 'pause-outline' },
  { value: 'intensity_low', labelKey: 'reasonIntensityLow', icon: 'trending-down-outline' },
  { value: 'duration_short', labelKey: 'reasonDurationShort', icon: 'timer-outline' },
  { value: 'more_reps', labelKey: 'reasonMoreReps', icon: 'repeat-outline' },
];

export const FeedbackModal: React.FC<Props> = ({ onClose, onSubmit }) => {
  const { t } = useLocalization();
  const [rating, setRating] = useState<FeedbackRating | null>(null);
  const [reasons, setReasons] = useState<FeedbackReason[]>([]);
  const [customFeedback, setCustomFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Animations
  const emojiScales = useRef(RATING_OPTIONS.map(() => new Animated.Value(1))).current;
  const reasonsOpacity = useRef(new Animated.Value(0)).current;
  const reasonsTranslateY = useRef(new Animated.Value(20)).current;
  const successScale = useRef(new Animated.Value(0)).current;
  const successOpacity = useRef(new Animated.Value(0)).current;
  const checkmarkRotate = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const bgColorAnim = useRef(new Animated.Value(0)).current;

  const selectRating = (value: FeedbackRating, index: number) => {
    setRating(value);

    // Bounce animation on selected emoji
    Animated.sequence([
      Animated.timing(emojiScales[index], { toValue: 1.4, duration: 150, useNativeDriver: true }),
      Animated.spring(emojiScales[index], { toValue: 1.15, friction: 3, useNativeDriver: true }),
    ]).start();

    // Reset other emojis
    emojiScales.forEach((scale, i) => {
      if (i !== index) {
        Animated.timing(scale, { toValue: 0.85, duration: 200, useNativeDriver: true }).start();
      }
    });

    // Animate bg color
    Animated.timing(bgColorAnim, { toValue: index, duration: 300, useNativeDriver: false }).start();

    // Slide in reasons
    Animated.parallel([
      Animated.timing(reasonsOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.spring(reasonsTranslateY, { toValue: 0, friction: 6, useNativeDriver: true }),
    ]).start();
  };

  const toggleReason = (reason: FeedbackReason) => {
    setReasons(prev =>
      prev.includes(reason) ? prev.filter(r => r !== reason) : [...prev, reason]
    );
  };

  const handleSubmit = () => {
    if (!rating) return;

    // Show success animation
    setSubmitted(true);

    Animated.parallel([
      Animated.spring(successScale, { toValue: 1, friction: 4, tension: 60, useNativeDriver: true }),
      Animated.timing(successOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(checkmarkRotate, { toValue: 1, duration: 600, useNativeDriver: true }),
    ]).start();

    // Pulse effect
    const pulse = () => {
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.2, duration: 500, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      ]).start();
    };
    pulse();

    // Submit after delay
    setTimeout(() => {
      onSubmit({ rating, reasons, customFeedback: customFeedback || undefined });
    }, 2000);
  };

  const selectedOption = RATING_OPTIONS.find(o => o.value === rating);
  const checkmarkSpin = checkmarkRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Success screen
  if (submitted) {
    return (
      <Modal visible transparent animationType="fade" onRequestClose={() => { }}>
        <View style={styles.successOverlay}>
          <Animated.View style={[styles.successContainer, {
            transform: [{ scale: successScale }],
            opacity: successOpacity,
          }]}>
            <Animated.View style={[styles.successCircle, {
              transform: [{ scale: pulseAnim }],
              backgroundColor: selectedOption?.color || COLORS.green,
            }]}>
              <Animated.View style={{ transform: [{ rotate: checkmarkSpin }] }}>
                <Ionicons name="checkmark" size={60} color="white" />
              </Animated.View>
            </Animated.View>
            <Text style={styles.successTitle}>{t('feedbackSuccessTitle')}</Text>
            <Text style={styles.successMessage}>{t('feedbackSuccessMessage')}</Text>
            <View style={styles.successBadge}>
              <Ionicons name="sparkles" size={16} color={COLORS.yellow} />
              <Text style={styles.successBadgeText}>{t('feedbackSuccessBadge')}</Text>
            </View>
          </Animated.View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Ionicons name="close" size={24} color={COLORS.textGray} />
          </TouchableOpacity>

          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <Text style={styles.title}>{t('feedbackTitle')}</Text>
            <Text style={styles.subtitle}>{t('feedbackSubtitle')}</Text>

            {/* 5-Level Emoji Rating */}
            <View style={styles.emojiRow}>
              {RATING_OPTIONS.map((opt, index) => (
                <TouchableOpacity
                  key={opt.value}
                  onPress={() => selectRating(opt.value, index)}
                  activeOpacity={0.7}
                  style={styles.emojiTouchable}
                >
                  <Animated.View style={[
                    styles.emojiContainer,
                    rating === opt.value && { borderColor: opt.color, backgroundColor: `${opt.color}20` },
                    { transform: [{ scale: emojiScales[index] }] },
                  ]}>
                    <Text style={styles.emoji}>{opt.emoji}</Text>
                  </Animated.View>
                  <Text style={[
                    styles.emojiLabel,
                    rating === opt.value && { color: opt.color, fontWeight: 'bold' },
                  ]}>
                    {t(opt.labelKey)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Selected rating highlight */}
            {rating && selectedOption && (
              <View style={[styles.selectedBanner, { borderColor: selectedOption.color }]}>
                <Text style={styles.selectedEmoji}>{selectedOption.emoji}</Text>
                <Text style={[styles.selectedText, { color: selectedOption.color }]}>
                  {t(selectedOption.labelKey)}
                </Text>
              </View>
            )}

            {/* Reasons */}
            {rating && (
              <Animated.View style={{
                opacity: reasonsOpacity,
                transform: [{ translateY: reasonsTranslateY }],
              }}>
                <Text style={styles.sectionTitle}>{t('feedbackWhyTitle')}</Text>
                <View style={styles.reasonsGrid}>
                  {REASON_OPTIONS.map(opt => (
                    <TouchableOpacity
                      key={opt.value}
                      style={[styles.reasonTag, reasons.includes(opt.value) && styles.reasonTagSelected]}
                      onPress={() => toggleReason(opt.value)}
                      activeOpacity={0.8}
                    >
                      <Ionicons
                        name={opt.icon as any}
                        size={14}
                        color={reasons.includes(opt.value) ? COLORS.cyan : COLORS.textGray}
                        style={{ marginRight: 4 }}
                      />
                      <Text style={[styles.reasonText, reasons.includes(opt.value) && styles.reasonTextSelected]}>
                        {t(opt.labelKey)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.sectionTitle}>{t('feedbackCustomTitle')}</Text>
                <TextInput
                  style={styles.textArea}
                  value={customFeedback}
                  onChangeText={setCustomFeedback}
                  placeholder={t('feedbackCustomPlaceholder')}
                  placeholderTextColor={COLORS.textGray}
                  multiline
                  numberOfLines={3}
                />
              </Animated.View>
            )}

            <TouchableOpacity onPress={handleSubmit} disabled={!rating} activeOpacity={0.8}>
              <LinearGradient
                colors={rating && selectedOption ? (selectedOption.gradient as [string, string]) : ['#4A5568', '#4A5568']}
                style={styles.submitBtn}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              >
                <Ionicons name="send" size={18} color="white" style={{ marginRight: 8 }} />
                <Text style={styles.submitBtnText}>{t('feedbackSubmitButton')}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#1A202C', borderTopLeftRadius: RADIUS.xl, borderTopRightRadius: RADIUS.xl,
    maxHeight: '92%',
  },
  handle: {
    width: 40, height: 4, backgroundColor: COLORS.textGrayDark,
    borderRadius: 2, alignSelf: 'center', marginVertical: SPACING.sm,
  },
  closeBtn: { position: 'absolute', top: 16, right: 16, zIndex: 1 },
  scroll: { padding: SPACING.xl, paddingBottom: 50 },
  title: { fontSize: FONTS.sizes.xxl, fontWeight: 'bold', color: COLORS.textWhite, marginBottom: SPACING.sm },
  subtitle: { fontSize: FONTS.sizes.sm, color: COLORS.textGray, marginBottom: SPACING.xl, lineHeight: 20 },

  // Emoji rating
  emojiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.xs,
  },
  emojiTouchable: {
    alignItems: 'center',
    width: (SCREEN_WIDTH - SPACING.xl * 2 - SPACING.xs * 2) / 5 - 4,
  },
  emojiContainer: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: COLORS.bgCard, borderWidth: 2, borderColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center', marginBottom: 6,
  },
  emoji: { fontSize: 28 },
  emojiLabel: { fontSize: 10, color: COLORS.textGray, textAlign: 'center' },

  // Selected banner
  selectedBanner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderRadius: RADIUS.lg,
    backgroundColor: 'rgba(255,255,255,0.03)', padding: SPACING.md,
    marginBottom: SPACING.md, gap: SPACING.sm,
  },
  selectedEmoji: { fontSize: 24 },
  selectedText: { fontSize: FONTS.sizes.lg, fontWeight: 'bold' },

  // Sections
  sectionTitle: { fontSize: FONTS.sizes.md, fontWeight: 'bold', color: COLORS.textWhite, marginBottom: SPACING.md, marginTop: SPACING.lg },
  reasonsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.md },
  reasonTag: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.bgCard, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: RADIUS.full, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
  },
  reasonTagSelected: { backgroundColor: 'rgba(64,224,208,0.12)', borderColor: COLORS.cyan },
  reasonText: { color: COLORS.textGray, fontSize: FONTS.sizes.sm },
  reasonTextSelected: { color: COLORS.cyan, fontWeight: 'bold' },
  textArea: {
    backgroundColor: COLORS.bgCard, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: RADIUS.lg, padding: SPACING.lg, color: COLORS.textWhite,
    fontSize: FONTS.sizes.md, textAlignVertical: 'top', minHeight: 80, marginBottom: SPACING.xl,
  },
  submitBtn: {
    borderRadius: RADIUS.full, paddingVertical: 16, alignItems: 'center',
    flexDirection: 'row', justifyContent: 'center',
  },
  submitBtnText: { color: 'white', fontWeight: 'bold', fontSize: FONTS.sizes.md },

  // Success screen
  successOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.85)',
    alignItems: 'center', justifyContent: 'center',
  },
  successContainer: {
    alignItems: 'center', paddingHorizontal: SPACING.xxl,
  },
  successCircle: {
    width: 120, height: 120, borderRadius: 60,
    alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.xl,
  },
  successTitle: {
    fontSize: FONTS.sizes.xxl, fontWeight: 'bold', color: COLORS.textWhite,
    marginBottom: SPACING.sm, textAlign: 'center',
  },
  successMessage: {
    fontSize: FONTS.sizes.md, color: COLORS.textGray, textAlign: 'center',
    lineHeight: 22, marginBottom: SPACING.xl,
  },
  successBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(255,215,0,0.1)', borderWidth: 1, borderColor: 'rgba(255,215,0,0.3)',
    borderRadius: RADIUS.full, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm,
  },
  successBadgeText: {
    color: COLORS.yellow, fontSize: FONTS.sizes.sm, fontWeight: 'bold',
  },
});
