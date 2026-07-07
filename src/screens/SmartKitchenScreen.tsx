import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, ActivityIndicator, Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { useApp } from '../context/AppContext';
import { useLocalization } from '../context/LocalizationContext';
import { generateRecipesFromImage } from '../services/geminiService';
import { SmartKitchenResponse, SmartKitchenRecipe, IngredientDetail } from '../types';
import { COLORS, FONTS, RADIUS, SPACING } from '../utils/theme';
import { StarBorder } from '../components/StarBorder';

export const SmartKitchenScreen: React.FC = () => {
  const { t } = useLocalization();
  const { firebaseUid } = useApp();

  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SmartKitchenResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<SmartKitchenRecipe | null>(null);
  const [saved, setSaved] = useState(false);

  // ─── Fotoğraf seç ──────────────────────────────────────────────────────────
  const pickImage = async (fromCamera: boolean) => {
    try {
      let res: ImagePicker.ImagePickerResult;
      if (fromCamera) {
        const perm = await ImagePicker.requestCameraPermissionsAsync();
        if (!perm.granted) {
          Alert.alert(t('permissionDenied'), t('cameraPermissionRequired'));
          return;
        }
        res = await ImagePicker.launchCameraAsync({
          mediaTypes: ['images'],
          quality: 0.4,
          allowsEditing: true,
          base64: true,
        });
      } else {
        const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!perm.granted) {
          Alert.alert(t('permissionDenied'), t('libraryPermissionRequired'));
          return;
        }
        res = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          quality: 0.4,
          allowsEditing: true,
          base64: true,
        });
      }

      if (!res.canceled && res.assets[0]) {
        const asset = res.assets[0];
        setImage(asset.uri);
        setResult(null);
        setError(null);
        setSaved(false);
        await analyzeImage(asset.base64 || '');
      }
    } catch (e) {
      setError(t('imagePickError'));
    }
  };

  // ─── Görüntü analiz et + Firestore'a kaydet ────────────────────────────────
  const analyzeImage = async (base64: string) => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await generateRecipesFromImage(base64, t);

      // Yiyecek tespit edilemedi veya boş yanıt alındı
      if (!res || !res.identifiedIngredients || res.identifiedIngredients.length === 0 || !res.recipes || res.recipes.length === 0) {
        setError(t('sk_noFoodDetected'));
        setResult(null);
        setLoading(false);
        return;
      }

      setResult(res);

      // Firestore'a kaydet
      if (firebaseUid && res.recipes.length > 0) {
        await addDoc(collection(db, 'smartKitchen', firebaseUid, 'history'), {
          identifiedIngredients: res.identifiedIngredients,
          recipes: res.recipes.map(r => ({
            name: r.name,
            description: r.description,
            calories: r.calories,
            proteinContent: r.proteinContent,
            ingredients: r.ingredients,
            steps: r.steps,
          })),
          date: new Date().toISOString(),
          createdAt: serverTimestamp(),
        });
        setSaved(true);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : t('errorGemini'));
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  // ─── Tarif detay ekranı ────────────────────────────────────────────────────
  if (selectedRecipe) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.backRow} onPress={() => setSelectedRecipe(null)}>
          <Ionicons name="arrow-back" size={20} color={COLORS.textGray} />
          <Text style={styles.backText}>{t('backButton')}</Text>
        </TouchableOpacity>

        <Text style={styles.recipeName}>{selectedRecipe.name}</Text>
        <Text style={styles.recipeDesc}>{selectedRecipe.description}</Text>

        <View style={styles.recipeMacroRow}>
          <View style={styles.recipeMacroCard}>
            <Ionicons name="flame-outline" size={18} color={COLORS.orange} />
            <Text style={styles.recipeMacroValue}>{selectedRecipe.calories}</Text>
          </View>
          <View style={styles.recipeMacroCard}>
            <Ionicons name="fitness-outline" size={18} color={COLORS.cyan} />
            <Text style={styles.recipeMacroValue}>{selectedRecipe.proteinContent} protein</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>{t('recipeIngredients')}</Text>
        {selectedRecipe.ingredients.map((ing, i) => (
          <View key={i} style={styles.bulletRow}>
            <View style={styles.bullet} />
            <Text style={styles.bulletText}>{ing}</Text>
            {selectedRecipe.ingredientDetails?.[i] && (
              <Text style={styles.ingredientCal}>{selectedRecipe.ingredientDetails[i].calories}</Text>
            )}
          </View>
        ))}

        <Text style={styles.sectionTitle}>{t('recipeSteps')}</Text>
        {selectedRecipe.steps.map((step, i) => (
          <View key={i} style={styles.stepRow}>
            <Text style={styles.stepNumber}>{i + 1}</Text>
            <Text style={styles.stepText}>{step}</Text>
          </View>
        ))}
      </ScrollView>
    );
  }

  // ─── Ana ekran ─────────────────────────────────────────────────────────────
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      <View style={styles.titleSection}>
        <Ionicons name="restaurant-outline" size={40} color={COLORS.cyan} style={{ marginBottom: 12 }} />
        <Text style={styles.title}>{t('sk_title')}</Text>
        <Text style={styles.subtitle}>{t('sk_subtitle')}</Text>
      </View>

      {/* Fotoğraf seçici */}
      {!image ? (
        <View style={styles.uploadArea}>
          <Ionicons name="camera-outline" size={48} color={COLORS.textGray} style={{ marginBottom: 16 }} />
          <Text style={styles.uploadText}>{t('sk_uploadPrompt')}</Text>
          <View style={styles.pickBtnRow}>
            <StarBorder color={COLORS.cyan} speed={2500} radius={RADIUS.full} style={{ flex: 1 }}>
              <TouchableOpacity style={styles.pickBtn} onPress={() => pickImage(true)} activeOpacity={0.8}>
                <LinearGradient colors={[COLORS.cyan, COLORS.blue]} style={styles.pickBtnInner} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                  <Ionicons name="camera" size={20} color="white" />
                  <Text style={styles.pickBtnText}>{t('sk_camera')}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </StarBorder>
            <StarBorder color={COLORS.cyan} speed={3000} radius={RADIUS.full} style={{ flex: 1 }}>
              <TouchableOpacity style={styles.pickBtn} onPress={() => pickImage(false)} activeOpacity={0.8}>
                <View style={[styles.pickBtnInner, styles.pickBtnOutline]}>
                  <Ionicons name="images" size={20} color={COLORS.cyan} />
                  <Text style={[styles.pickBtnText, { color: COLORS.cyan }]}>{t('sk_gallery')}</Text>
                </View>
              </TouchableOpacity>
            </StarBorder>
          </View>
        </View>
      ) : (
        <View>
          <Image source={{ uri: image }} style={styles.selectedImage} />
          <View style={styles.retakeRow}>
            <TouchableOpacity style={styles.retakeBtn} onPress={() => { setImage(null); setResult(null); setSaved(false); }}>
              <Ionicons name="refresh" size={16} color={COLORS.textGray} />
              <Text style={styles.retakeBtnText}>{t('sk_retake')}</Text>
            </TouchableOpacity>
            {saved && (
              <View style={styles.savedBadge}>
                <Ionicons name="checkmark-circle" size={14} color={COLORS.green} />
                <Text style={styles.savedBadgeText}>Kaydedildi</Text>
              </View>
            )}
          </View>
        </View>
      )}

      {loading && (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={COLORS.cyan} />
          <Text style={styles.loadingText}>{t('sk_analyzing')}</Text>
        </View>
      )}

      {error && (
        <View style={styles.errorBox}>
          <Ionicons name="warning-outline" size={18} color={COLORS.orange} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {result && (
        <>
          {result.identifiedIngredients.length > 0 && (
            <View style={styles.ingredientsBox}>
              <Text style={styles.sectionTitle}>{t('sk_identifiedIngredients')}</Text>
              <View style={styles.tagsRow}>
                {result.identifiedIngredients.map((ing, i) => (
                  <View key={i} style={styles.tag}>
                    <Text style={styles.tagText}>{ing}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          <Text style={styles.sectionTitle}>{t('sk_recipes')}</Text>
          {result.recipes.map((recipe, i) => (
            <TouchableOpacity
              key={i}
              style={styles.recipeCard}
              onPress={() => setSelectedRecipe(recipe)}
              activeOpacity={0.8}
            >
              <Text style={styles.recipeCardName}>{recipe.name}</Text>
              <Text style={styles.recipeCardDesc} numberOfLines={2}>{recipe.description}</Text>
              <View style={styles.recipeCardMeta}>
                <View style={styles.metaTag}>
                  <Ionicons name="flame-outline" size={14} color={COLORS.orange} />
                  <Text style={styles.metaTagText}>{recipe.calories}</Text>
                </View>
                <View style={styles.metaTag}>
                  <Ionicons name="fitness-outline" size={14} color={COLORS.cyan} />
                  <Text style={styles.metaTagText}>{recipe.proteinContent}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: SPACING.xl, paddingBottom: 80 },
  titleSection: { alignItems: 'center', marginBottom: SPACING.xxl },
  title: { fontSize: FONTS.sizes.xxl, fontWeight: 'bold', color: COLORS.textWhite, marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: FONTS.sizes.md, color: COLORS.textGray, textAlign: 'center' },
  uploadArea: {
    backgroundColor: COLORS.bgCard, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: RADIUS.xl, padding: SPACING.xxl, alignItems: 'center', marginBottom: SPACING.xl,
    borderStyle: 'dashed',
  },
  uploadText: { color: COLORS.textGray, fontSize: FONTS.sizes.md, textAlign: 'center', marginBottom: SPACING.xl },
  pickBtnRow: { flexDirection: 'row', gap: SPACING.md, width: '100%' },
  pickBtn: { flex: 1 },
  pickBtnInner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, borderRadius: RADIUS.full, paddingVertical: 12,
  },
  pickBtnOutline: { borderWidth: 1, borderColor: COLORS.cyan, backgroundColor: 'transparent' },
  pickBtnText: { color: 'white', fontWeight: 'bold', fontSize: FONTS.sizes.sm },
  selectedImage: { width: '100%', height: 220, borderRadius: RADIUS.xl, marginBottom: SPACING.md },
  retakeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.md, marginBottom: SPACING.xl },
  retakeBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  retakeBtnText: { color: COLORS.textGray, fontSize: FONTS.sizes.sm },
  savedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  savedBadgeText: { color: COLORS.green, fontSize: FONTS.sizes.sm, fontWeight: 'bold' },
  loadingBox: { alignItems: 'center', gap: 12, padding: SPACING.xl },
  loadingText: { color: COLORS.textGray, fontSize: FONTS.sizes.md },
  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(255,127,80,0.1)', borderRadius: RADIUS.md,
    padding: SPACING.md, marginBottom: SPACING.xl,
  },
  errorText: { color: COLORS.orange, fontSize: FONTS.sizes.sm, flex: 1 },
  ingredientsBox: { marginBottom: SPACING.xl },
  sectionTitle: { fontSize: FONTS.sizes.lg, fontWeight: 'bold', color: COLORS.textWhite, marginBottom: SPACING.md },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  tag: {
    backgroundColor: 'rgba(64,224,208,0.1)', borderWidth: 1, borderColor: 'rgba(64,224,208,0.3)',
    borderRadius: RADIUS.full, paddingHorizontal: SPACING.md, paddingVertical: 4,
  },
  tagText: { color: COLORS.cyan, fontSize: FONTS.sizes.xs, fontWeight: 'bold' },
  recipeCard: {
    backgroundColor: COLORS.bgCard, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: RADIUS.lg, padding: SPACING.lg, marginBottom: SPACING.md,
  },
  recipeCardName: { fontSize: FONTS.sizes.md, fontWeight: 'bold', color: COLORS.textWhite, marginBottom: 4 },
  recipeCardDesc: { fontSize: FONTS.sizes.sm, color: COLORS.textGray, marginBottom: SPACING.sm, lineHeight: 20 },
  recipeCardMeta: { flexDirection: 'row', gap: SPACING.sm },
  metaTag: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaTagText: { color: COLORS.textGray, fontSize: FONTS.sizes.xs },
  backRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.xl },
  backText: { color: COLORS.textGray, fontSize: FONTS.sizes.md },
  recipeName: { fontSize: FONTS.sizes.xxl, fontWeight: 'bold', color: COLORS.textWhite, marginBottom: 8 },
  recipeDesc: { fontSize: FONTS.sizes.md, color: COLORS.textGray, marginBottom: SPACING.xl, lineHeight: 22 },
  recipeMacroRow: { flexDirection: 'row', gap: SPACING.md, marginBottom: SPACING.xl },
  recipeMacroCard: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: COLORS.bgCard, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: RADIUS.md, padding: SPACING.md,
  },
  recipeMacroValue: { color: COLORS.textWhite, fontSize: FONTS.sizes.sm, fontWeight: 'bold' },
  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm, marginBottom: SPACING.sm },
  bullet: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.cyan, marginTop: 7 },
  bulletText: { color: COLORS.textGray, fontSize: FONTS.sizes.sm, flex: 1, lineHeight: 22 },
  ingredientCal: { color: COLORS.orange, fontSize: FONTS.sizes.xs, fontWeight: 'bold', minWidth: 60, textAlign: 'right' },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.md, marginBottom: SPACING.md },
  stepNumber: {
    width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.cyan,
    color: 'white', fontWeight: 'bold', textAlign: 'center', lineHeight: 28,
    fontSize: FONTS.sizes.sm,
  },
  stepText: { color: COLORS.textGray, fontSize: FONTS.sizes.sm, flex: 1, lineHeight: 22 },
});
