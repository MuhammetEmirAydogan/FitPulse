import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, Modal, ScrollView, TouchableOpacity, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalization } from '../context/LocalizationContext';
import { getRecipeDetails } from '../services/geminiService';
import { MealItem, Recipe } from '../types';
import { COLORS, FONTS, RADIUS, SPACING } from '../utils/theme';

interface Props {
  meal: MealItem | null;
  onClose: () => void;
}

export const RecipeModal: React.FC<Props> = ({ meal, onClose }) => {
  const { t } = useLocalization();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    if (!meal) {
      // Reset state when meal is cleared
      setRecipe(null);
      setError(null);
      setLoading(false);
      return;
    }
    const fetch = async () => {
      setLoading(true);
      setError(null);
      setRecipe(null);
      try {
        const r = await getRecipeDetails(meal, t);
        setRecipe(r);
      } catch (e) {
        setError(e instanceof Error ? e.message : t('errorGemini'));
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [meal, retryKey]);

  return (
    <Modal visible={!!meal} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <Text style={styles.title} numberOfLines={2}>{meal?.mealName}</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close-circle" size={28} color={COLORS.textGray} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
            {loading && (
              <View style={styles.loadingBox}>
                <ActivityIndicator size="large" color={COLORS.cyan} />
                <Text style={styles.loadingText}>{t('recipeLoading')}</Text>
              </View>
            )}

            {error && (
              <View style={styles.errorBox}>
                <Ionicons name="warning-outline" size={18} color={COLORS.orange} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.errorText}>{error}</Text>
                  <TouchableOpacity
                    onPress={() => setRetryKey(k => k + 1)}
                    style={styles.retryBtn}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="refresh-outline" size={14} color={COLORS.orange} />
                    <Text style={styles.retryBtnText}>{t('recipeRetryButton')}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {recipe && (
              <>
                {/* Nutrition */}
                <View style={styles.nutritionRow}>
                  {[
                    { label: t('recipeCalories'), value: recipe.nutrition.calories, icon: 'flame-outline', color: COLORS.orange },
                    { label: 'Protein', value: recipe.nutrition.protein, icon: 'fitness-outline', color: COLORS.cyan },
                    { label: t('recipeCarbs'), value: recipe.nutrition.carbs, icon: 'leaf-outline', color: COLORS.yellow },
                    { label: t('recipeFat'), value: recipe.nutrition.fat, icon: 'water-outline', color: COLORS.blue },
                  ].map(item => (
                    <View key={item.label} style={styles.nutritionCard}>
                      <Ionicons name={item.icon as any} size={18} color={item.color} />
                      <Text style={styles.nutritionValue} numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.7}>{item.value}</Text>
                      <Text style={styles.nutritionLabel} numberOfLines={1}>{item.label}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.metaRow}>
                  <Ionicons name="time-outline" size={16} color={COLORS.textGray} />
                  <Text style={styles.metaText}>{recipe.prepTime}</Text>
                </View>

                <Text style={styles.sectionTitle}>{t('recipeIngredients')}</Text>
                {recipe.ingredients.map((ing, i) => (
                  <View key={i} style={styles.bulletRow}>
                    <View style={styles.bullet} />
                    <Text style={styles.bulletText}>{ing}</Text>
                  </View>
                ))}

                <Text style={styles.sectionTitle}>{t('recipeSteps')}</Text>
                {recipe.steps.map((step, i) => (
                  <View key={i} style={styles.stepRow}>
                    <Text style={styles.stepNum}>{i + 1}</Text>
                    <Text style={styles.stepText}>{step}</Text>
                  </View>
                ))}
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#2D3748', borderTopLeftRadius: RADIUS.xl, borderTopRightRadius: RADIUS.xl,
    maxHeight: '90%', paddingBottom: 40,
  },
  handle: {
    width: 40, height: 4, backgroundColor: COLORS.textGrayDark,
    borderRadius: 2, alignSelf: 'center', marginVertical: SPACING.sm,
  },
  header: {
    flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between',
    padding: SPACING.xl, paddingTop: 0,
  },
  title: { fontSize: FONTS.sizes.xl, fontWeight: 'bold', color: COLORS.textWhite, flex: 1, marginRight: SPACING.md },
  scroll: { padding: SPACING.xl, paddingTop: 0 },
  loadingBox: { alignItems: 'center', gap: 12, paddingVertical: SPACING.xxl },
  loadingText: { color: COLORS.textGray, fontSize: FONTS.sizes.md },
  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(255,127,80,0.1)', borderRadius: RADIUS.md, padding: SPACING.md,
  },
  errorText: { color: COLORS.orange, fontSize: FONTS.sizes.sm, flex: 1 },
  retryBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  retryBtnText: { color: COLORS.orange, fontSize: FONTS.sizes.xs, fontWeight: 'bold' },
  nutritionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.lg },
  nutritionCard: {
    flex: 1, minWidth: 70, backgroundColor: COLORS.bgCard, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: RADIUS.md, padding: SPACING.sm, alignItems: 'center', gap: 2,
  },
  nutritionValue: { fontSize: FONTS.sizes.xs, fontWeight: 'bold', color: COLORS.textWhite, textAlign: 'center' },
  nutritionLabel: { fontSize: 10, color: COLORS.textGray, textAlign: 'center' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: SPACING.xl },
  metaText: { color: COLORS.textGray, fontSize: FONTS.sizes.sm },
  sectionTitle: { fontSize: FONTS.sizes.lg, fontWeight: 'bold', color: COLORS.textWhite, marginBottom: SPACING.md, marginTop: SPACING.lg },
  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm, marginBottom: SPACING.sm },
  bullet: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.cyan, marginTop: 7 },
  bulletText: { color: COLORS.textGray, fontSize: FONTS.sizes.sm, flex: 1, lineHeight: 22 },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.md, marginBottom: SPACING.md },
  stepNum: {
    width: 26, height: 26, borderRadius: 13, backgroundColor: COLORS.cyan,
    color: 'white', fontWeight: 'bold', textAlign: 'center', lineHeight: 26, fontSize: FONTS.sizes.sm,
  },
  stepText: { color: COLORS.textGray, fontSize: FONTS.sizes.sm, flex: 1, lineHeight: 22 },
});
