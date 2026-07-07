import { BodyFatInputs, CalorieCalculatorInputs, ActivityLevel, Goal, CalorieResults } from '../types';

// =============================================
// Validasyon yardımcıları
// =============================================

const isInRange = (val: number, min: number, max: number): boolean =>
  !isNaN(val) && val >= min && val <= max;

// =============================================
// VÜCUT YAĞI HESAPLAMA (US Navy Yöntemi)
// =============================================

export const calculateBodyFatPercentage = (inputs: BodyFatInputs): number | null => {
  const { gender, height, neck, waist, hip } = inputs;

  // Temel varlık kontrolü
  if (!height || !neck || !waist || (gender === 'female' && !hip)) {
    return null;
  }

  // Gerçekçi aralık kontrolleri
  if (!isInRange(height, 100, 250)) return null;
  if (!isInRange(neck, 20, 60)) return null;
  if (!isInRange(waist, 40, 200)) return null;
  if (gender === 'female' && hip && !isInRange(hip, 50, 200)) return null;

  // Boyun, belden büyük olamaz (negatif logaritma olur)
  if (waist <= neck) return null;

  const heightIn = height * 0.393701;
  const neckIn = neck * 0.393701;
  const waistIn = waist * 0.393701;

  let bfp: number;

  // ABD Donanması (U.S. Navy) formülü: çevre ölçüleri ve logaritma ile vücut yağ oranı hesaplanır.
  if (gender === 'male') {
    bfp = 86.010 * Math.log10(waistIn - neckIn) - 70.041 * Math.log10(heightIn) + 36.76;
  } else {
    const hipIn = hip! * 0.393701;
    // Bel + kalça değeri boyun değerinden büyük olmalı
    if ((waistIn + hipIn) <= neckIn) return null;
    bfp = 163.205 * Math.log10(waistIn + hipIn - neckIn) - 97.684 * Math.log10(heightIn) - 78.387;
  }

  if (isNaN(bfp) || bfp < 2 || bfp > 60) {
    return null;
  }

  // 1 ondalık basamağa yuvarla
  return Math.round(bfp * 10) / 10;
};

// =============================================
// KALORİ VE MAKRO HESAPLAMA (Mifflin-St Jeor)
// =============================================

export const calculateCaloriesAndMacros = (inputs: CalorieCalculatorInputs): CalorieResults | null => {
  const { gender, age, height, weight, activityLevel, goal } = inputs;

  // Temel varlık kontrolü
  if (!age || !height || !weight) {
    return null;
  }

  // Gerçekçi aralık kontrolleri
  if (!isInRange(age, 10, 100)) return null;
  if (!isInRange(height, 100, 250)) return null;
  if (!isInRange(weight, 20, 500)) return null;

  let bmr: number;
  // Mifflin-St Jeor denklemi: cinsiyete göre bazal metabolizma hızı (BMR).
  if (gender === 'male') {
    bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;
  } else {
    bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161;
  }

  // BMR alt sınır kontrolü
  if (bmr < 800) bmr = 800;

  const activityMultipliers: Record<ActivityLevel, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };
  // TDEE: BMR × aktivite katsayısı = günlük toplam enerji ihtiyacı.
  const tdee = bmr * activityMultipliers[activityLevel];

  const goalAdjustments: Record<Goal, number> = {
    lose: -400,
    maintain: 0,
    gain: 400,
  };
  const finalCalories = Math.round(tdee + goalAdjustments[goal]);

  // Protein hesaplama: kilo bazlı (daha doğru)
  let proteinGramsPerKg: number;
  let carbRatio: number;
  let fatRatio: number;

  switch (goal) {
    case 'lose':
      proteinGramsPerKg = 2.0; // Yağ yakımında yüksek protein koruyucu
      carbRatio = 0.35;
      fatRatio = 0.25;
      break;
    case 'gain':
      proteinGramsPerKg = 1.8; // Kas kazanımı için yüksek protein
      carbRatio = 0.45;
      fatRatio = 0.25;
      break;
    default:
      proteinGramsPerKg = 1.6; // Koruma
      carbRatio = 0.40;
      fatRatio = 0.30;
  }

  const proteinGrams = Math.round(weight * proteinGramsPerKg);
  const proteinCalories = proteinGrams * 4;

  // Kalan kalorileri karbonhidrat ve yağa dağıt
  const remainingCalories = finalCalories - proteinCalories;
  const carbCalorieRatio = carbRatio / (carbRatio + fatRatio);
  const fatCalorieRatio = fatRatio / (carbRatio + fatRatio);

  const carbsGrams = Math.round((remainingCalories * carbCalorieRatio) / 4);
  const fatGrams = Math.round((remainingCalories * fatCalorieRatio) / 9);

  return {
    calories: finalCalories,
    protein: proteinGrams,
    carbs: Math.max(carbsGrams, 50),  // Minimum 50g karbs
    fat: Math.max(fatGrams, 20),       // Minimum 20g yağ
  };
};

