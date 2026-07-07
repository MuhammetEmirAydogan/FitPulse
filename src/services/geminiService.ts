import { GoogleGenAI, Type } from '@google/genai';
import {
  Plan, WorkoutFeedback, FeedbackRating, FeedbackReason,
  Recipe, MealItem, HeartRateData, CalorieResults, SmartKitchenResponse
} from '../types';

// API anahtarı .env dosyasından okunur (EXPO_PUBLIC_GEMINI_API_KEY).
// Güvenlik: anahtar kaynak koda gömülmez; .env dosyası .gitignore ile korunur.
const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY ?? '';

if (!API_KEY || API_KEY.length < 20) {
  console.error('FitPulse Uyarı: API Anahtarı eksik! services/geminiService.ts dosyasına anahtarını ekle.');
}

// Web versiyonuyla birebir aynı — @google/genai SDK kullanıyoruz
const ai = new GoogleGenAI({ apiKey: API_KEY });

// Ana model ile yedek model: geçici hatada 2.5 Flash'tan 2.0 Flash'a otomatik geçilir.
const PRIMARY_MODEL = 'gemini-2.5-flash';
const FALLBACK_MODEL = 'gemini-2.0-flash';


// =============================================
// SCHEMA TANIMLARI
// =============================================

// ŞEMA ZORLAMASI: AI çıktısı bu katı JSON yapısına uymak zorundadır (serbest metin/halüsinasyon engellenir).
const planSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "A creative and motivational title for the entire plan (e.g., 'Sunrise Power-Up')." },
    focus: { type: Type.STRING, description: "The main focus of the workout (e.g., 'Full Body Strength')." },
    duration: { type: Type.STRING, description: "The estimated total duration of the workout (e.g., '45-60 minutes')." },
    mealPlan: {
      type: Type.ARRAY,
      description: "An array of meals for the day.",
      items: {
        type: Type.OBJECT,
        properties: {
          mealName: { type: Type.STRING, description: "The name of the meal. Should be in the requested language." },
          description: { type: Type.STRING, description: "A brief description of the meal." },
        },
        required: ['mealName', 'description'],
      },
    },
    workoutPlan: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          exercise: {
            type: Type.STRING,
            description: "CRITICAL: The standard, internationally recognized name of the exercise in English. This name is used to search for videos, so accuracy is paramount.",
          },
          details: {
            type: Type.STRING,
            description: "A clear description of how to perform the exercise, including sets, reps, and form cues.",
          },
        },
        required: ['exercise', 'details'],
      },
    },
  },
  required: ['title', 'focus', 'duration', 'mealPlan', 'workoutPlan'],
};

const recipeSchema = {
  type: Type.OBJECT,
  properties: {
    ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
    steps: { type: Type.ARRAY, items: { type: Type.STRING } },
    prepTime: { type: Type.STRING },
    nutrition: {
      type: Type.OBJECT,
      properties: {
        calories: { type: Type.STRING },
        protein: { type: Type.STRING },
        carbs: { type: Type.STRING },
        fat: { type: Type.STRING },
      },
      required: ['calories', 'protein', 'carbs', 'fat'],
    },
  },
  required: ['ingredients', 'steps', 'prepTime', 'nutrition'],
};

const smartKitchenSchema = {
  type: Type.OBJECT,
  properties: {
    identifiedIngredients: { type: Type.ARRAY, items: { type: Type.STRING } },
    recipes: {
      type: Type.ARRAY,
      description: "3 healthy, protein-focused recipes using ONLY the identified ingredients.",
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          description: { type: Type.STRING },
          ingredients: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of ingredients used, only from identified ingredients + basic pantry staples" },
          ingredientDetails: {
            type: Type.ARRAY,
            description: "Detailed calorie info per ingredient used in the recipe",
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING, description: "Ingredient name with quantity" },
                calories: { type: Type.STRING, description: "Estimated calories for the specified quantity (e.g. '120 kcal')" },
              },
              required: ['name', 'calories'],
            },
          },
          steps: { type: Type.ARRAY, items: { type: Type.STRING } },
          proteinContent: { type: Type.STRING },
          calories: { type: Type.STRING },
        },
        required: ['name', 'description', 'ingredients', 'ingredientDetails', 'steps', 'proteinContent', 'calories'],
      },
    },
  },
  required: ['identifiedIngredients', 'recipes'],
};

// =============================================
// PLAN OLUŞTURMA
// =============================================

type PlanAnswers = {
  [key: string]: string | string[] | number | CalorieResults;
};

export const generatePlan = async (
  answers: PlanAnswers,
  t: (key: string, options?: Record<string, string | number>) => string,
  lastWorkoutFeedback?: WorkoutFeedback,
  lastHeartRateData?: HeartRateData
): Promise<Plan | null> => {

  let bodyFatInstruction = '';
  if (answers.bodyFat && typeof answers.bodyFat === 'number') {
    bodyFatInstruction = `\n- ${t('promptBodyFatLabel')}: ${(answers.bodyFat as number).toFixed(1)}%. ${t('promptBodyFatInstruction')}`;
  }

  let calorieTargetInstruction = '';
  if (answers.calorieTarget && typeof answers.calorieTarget === 'object') {
    const target = answers.calorieTarget as CalorieResults;
    calorieTargetInstruction = `\n- ${t('promptCalorieTargetLabel')}: ${t('promptCalorieTargetInstruction', {
      calories: target.calories,
      protein: target.protein,
      carbs: target.carbs,
      fat: target.fat,
    })}`;
  }

  let heartRateInstruction = '';
  if (lastHeartRateData?.preWorkout && lastHeartRateData?.postWorkout) {
    const increase = lastHeartRateData.postWorkout - lastHeartRateData.preWorkout;
    const dataText = t('promptHeartRateData', { pre: lastHeartRateData.preWorkout, post: lastHeartRateData.postWorkout });
    let instruction = '';
    if (increase < 40) instruction = t('promptHeartRateInstructionGood');
    else if (increase > 80) instruction = t('promptHeartRateInstructionSlow');
    heartRateInstruction = `\n${t('promptHeartRatePreamble')}: ${dataText}. ${instruction}`;
  }

  let feedbackInstruction = '';
  if (lastWorkoutFeedback) {
    const ratingMap: Record<FeedbackRating, string> = {
      too_easy: t('promptFeedbackTooEasy'),
      easy: t('promptFeedbackEasy'),
      just_right: t('promptFeedbackRight'),
      hard: t('promptFeedbackHard'),
      too_hard: t('promptFeedbackTooHard'),
    };
    feedbackInstruction = `\n${t('promptFeedbackPreamble')}: ${ratingMap[lastWorkoutFeedback.rating]}`;

    if (lastWorkoutFeedback.reasons?.length) {
      const reasonMap: Record<FeedbackReason, string> = {
        duration_long: t('promptReasonDurationLong'),
        complexity_high: t('promptReasonComplexityHigh'),
        energy_low: t('promptReasonEnergyLow'),
        intensity_low: t('promptReasonIntensityLow'),
        duration_short: t('promptReasonDurationShort'),
        more_reps: t('promptReasonMoreReps'),
        intensity_high: t('promptReasonIntensityHigh'),
        muscle_strain: t('promptReasonMuscleStrain'),
        rest_short: t('promptReasonRestShort'),
      };
      const reasonTexts = lastWorkoutFeedback.reasons.map(r => `- ${reasonMap[r]}`).join('\n');
      feedbackInstruction += `\n${t('promptFeedbackReason')}\n${reasonTexts}`;
    }
    if (lastWorkoutFeedback.customFeedback) {
      feedbackInstruction += `\n${t('promptCustomFeedbackPreamble')} "${lastWorkoutFeedback.customFeedback}"`;
    }
  }

  // Goal ve kas grubu artık çoklu seçim (dizi) olabilir — normalize et.
  const goalList = Array.isArray(answers.goal)
    ? (answers.goal as string[])
    : (answers.goal ? [answers.goal as string] : []);
  const goalText = goalList.join(', ');

  // Kas grubu seçimi (çoklu) prompt'a "body focus" olarak iletilir.
  const bodyFocusList = Array.isArray(answers.muscleGroup)
    ? (answers.muscleGroup as string[])
    : (answers.muscleGroup ? [answers.muscleGroup as string] : []);
  const bodyFocusText = bodyFocusList.join(', ');

  let structureInstruction = '';
  // Seçilen her hedef için yapı talimatı ekle; hiçbiri eşleşmezse varsayılanı kullan.
  const goalStructureMap: Record<string, string> = {
    'Muscle Gain': t('promptStructureMuscleGain'),
    'Fat Loss': t('promptStructureFatLoss'),
    'Stamina': t('promptStructureStamina'),
  };
  const matchedGoalInstructions = goalList.map(g => goalStructureMap[g]).filter(Boolean);
  structureInstruction += matchedGoalInstructions.length > 0
    ? matchedGoalInstructions.join(' ')
    : t('promptStructureDefault');

  switch (answers.level) {
    case 'Beginner': structureInstruction += ` ${t('promptStructureBeginner')}`; break;
    case 'Advanced': structureInstruction += ` ${t('promptStructureAdvanced')}`; break;
  }
  // KOŞULLU BAĞLAM ENJEKSİYONU: Ruh hâli, iyileşme ve uyku durumuna göre prompt'a dinamik talimat eklenir.
  const mood = answers.mood as string;
  if (mood === 'A Little Tired' || mood === 'Stressed') {
    structureInstruction += ` ${t('promptStructureTired')}`;
  }
  if (answers.recovery === 'Very Sore') {
    structureInstruction += ' User is VERY sore. Focus on active recovery, mobility, and very light movement. Avoid heavy lifting.';
  } else if (answers.recovery === 'Slightly Sore') {
    structureInstruction += ' User is slightly sore. Ensure a thorough warmup and avoid max intensity on sore muscle groups.';
  }
  if (answers.sleep === 'Poor') {
    structureInstruction += ' User had poor sleep. Reduce overall volume and intensity to prevent injury and burnout.';
  }
  if (bodyFocusText) {
    structureInstruction += ` PRIMARY WORKOUT FOCUS: ${bodyFocusText}. Ensure the majority of exercises target this area.`;
  }

  const equipmentList = (answers.equipment as string[])?.length > 0
    ? (answers.equipment as string[]).join(', ')
    : 'Bodyweight Only';

  // Diğer çoklu seçim alanları — diziyi okunabilir, tutarlı listeye çevir.
  const environmentList = Array.isArray(answers.environment)
    ? (answers.environment as string[]).join(', ')
    : (answers.environment as string) || '';
  const dietList = Array.isArray(answers.diet)
    ? (answers.diet as string[]).join(', ')
    : (answers.diet as string) || '';
  const cuisineList = Array.isArray(answers.cuisine)
    ? (answers.cuisine as string[]).join(', ')
    : (answers.cuisine as string) || '';

  // 3 KATMANLI PROMPT: 1) Persona/rol  2) yukarıdaki koşullu talimatlar  3) JSON şema zorlaması birlikte gönderilir.
  const prompt = `
${t('promptPreamble')} ${t('promptPhilosophy')} "${t('homeGreeting')}". ${t('promptTone')} ${t('promptLanguageInstruction')}

${t('promptTask')}
- ${t('promptMoodLabel')}: ${answers.mood}
- ${t('promptGoalLabel')}: ${goalText}
- Duration Preference: ${answers.duration}
- Body Focus: ${bodyFocusText || 'Full Body'}
- ${t('promptLevelLabel')}: ${answers.level}
- ${t('promptEquipmentLabel')}: ${equipmentList}
- Environment: ${environmentList}
- Recovery Status: ${answers.recovery}
- Sleep Quality: ${answers.sleep}
- ${t('promptDietLabel')}: ${dietList}
- ${t('promptCuisineLabel')}: ${cuisineList}${bodyFatInstruction}${calorieTargetInstruction}
${heartRateInstruction}
${feedbackInstruction}

${t('promptPlanStructureInstruction')} ${structureInstruction}

${t('promptWorkoutInstruction')}

${t('promptJsonInstruction')}
`;

  try {
    if (!API_KEY || API_KEY.length < 20) {
      throw new Error(t('errorApiKey'));
    }
    // HATA TOLERANSI: En fazla 3 deneme; 503/429 gibi geçici hatalarda artan beklemeyle yedek modele geçilir.
    const MAX_RETRIES = 3;
    let lastError: any;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      const activeModel = attempt === 0 ? PRIMARY_MODEL : FALLBACK_MODEL;
      try {
        const result = await ai.models.generateContent({
          model: activeModel,
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: planSchema,
          },
        });

        const jsonText = result.text?.trim();
        if (!jsonText) throw new Error(t('errorEmptyPlan'));
        return JSON.parse(jsonText) as Plan;
      } catch (retryErr: any) {
        lastError = retryErr;
        const msg = retryErr?.message || '';
        if ((msg.includes('503') || msg.includes('UNAVAILABLE') || msg.includes('429') || msg.includes('demand')) && attempt < MAX_RETRIES - 1) {
          console.warn(`Gemini 503/429/demand — ${attempt + 1}. deneme, ${3 * (attempt + 1)}s bekliyor. Sonraki deneme modeli: ${attempt === 0 ? FALLBACK_MODEL : PRIMARY_MODEL}...`);
          await new Promise(r => setTimeout(r, 3000 * (attempt + 1)));
          continue;
        }
        throw retryErr;
      }
    }
    throw lastError;

  } catch (e) {
    console.error('generatePlan error:', e);
    if (e instanceof Error && (e.message.includes('API_KEY') || e.message.includes(t('errorApiKey')))) {
      throw new Error(t('errorApiKey'));
    }
    throw new Error(t('errorGemini'));
  }
};

// =============================================
// TARİF DETAYI
// =============================================

export const getRecipeDetails = async (
  meal: MealItem,
  t: (key: string, options?: Record<string, string | number>) => string
): Promise<Recipe | null> => {
  const prompt = `
    ${t('promptRecipePreamble')}
    - ${t('promptRecipeMealName')}: ${meal.mealName}
    - ${t('promptRecipeDescription')}: ${meal.description}
    ${t('promptLanguageInstruction')}
    ${t('promptJsonInstruction')}
  `;

  try {
    if (!API_KEY || API_KEY.length < 20) {
      throw new Error(t('errorApiKey'));
    }
    // HATA TOLERANSI: En fazla 3 deneme; 503/429 gibi geçici hatalarda artan beklemeyle yedek modele geçilir.
    const MAX_RETRIES = 3;
    let lastError: any;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      const activeModel = attempt === 0 ? PRIMARY_MODEL : FALLBACK_MODEL;
      try {
        const result = await ai.models.generateContent({
          model: activeModel,
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: recipeSchema,
          },
        });

        const jsonText = result.text?.trim();
        if (!jsonText) throw new Error(t('errorEmptyPlan'));
        return JSON.parse(jsonText) as Recipe;
      } catch (retryErr: any) {
        lastError = retryErr;
        const msg = retryErr?.message || '';
        if ((msg.includes('503') || msg.includes('UNAVAILABLE') || msg.includes('429') || msg.includes('demand')) && attempt < MAX_RETRIES - 1) {
          console.warn(`Gemini 503/429/demand (Recipe) — ${attempt + 1}. deneme, ${3 * (attempt + 1)}s bekliyor. Sonraki deneme modeli: ${attempt === 0 ? FALLBACK_MODEL : PRIMARY_MODEL}...`);
          await new Promise(r => setTimeout(r, 3000 * (attempt + 1)));
          continue;
        }
        throw retryErr;
      }
    }
    throw lastError;

  } catch (e) {
    console.error('getRecipeDetails error:', e);
    if (e instanceof Error && (e.message.includes('API_KEY') || e.message.includes(t('errorApiKey')))) {
      throw new Error(t('errorApiKey'));
    }
    throw new Error(t('errorGeminiRecipe'));
  }
};

// =============================================
// MEDİTASYON SCRİPTİ
// =============================================

export const generateMeditationScript = async (
  theme: string,
  t: (key: string, options?: Record<string, string | number>) => string,
  duration: '3min' | '5min' | '10min' = '5min',
  userName?: string,
  meditationHistory?: { totalSessions: number; streakDays: number }
): Promise<string> => {
  const durationMap = { '3min': '2-3', '5min': '4-5', '10min': '8-10' };
  const durationText = durationMap[duration];

  // Kişiselleştirme bölümü
  let personalization = '';
  if (userName) {
    personalization += `\n${t('promptMeditationPersonalName', { name: userName })}`;
  }
  if (meditationHistory) {
    if (meditationHistory.totalSessions === 0) {
      personalization += `\n${t('promptMeditationNewUser')}`;
    } else if (meditationHistory.totalSessions > 10) {
      personalization += `\n${t('promptMeditationExperienced', {
        sessions: meditationHistory.totalSessions,
        streak: meditationHistory.streakDays
      })}`;
    }
  }

  const prompt = `
    ${t('promptMeditationPreamble')}
    ${t('promptLanguageInstruction')}
    ${t('promptMeditationTask', { theme, duration: durationText })}
    ${personalization}
  `;

  try {
    if (!API_KEY || API_KEY.length < 20) {
      throw new Error(t('errorApiKey'));
    }
    // HATA TOLERANSI: En fazla 3 deneme; 503/429 gibi geçici hatalarda artan beklemeyle yedek modele geçilir.
    const MAX_RETRIES = 3;
    let lastError: any;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      const activeModel = attempt === 0 ? PRIMARY_MODEL : FALLBACK_MODEL;
      try {
        const response = await ai.models.generateContent({
          model: activeModel,
          contents: prompt,
        });

        const text = response.text?.trim();
        if (!text) throw new Error('Generated script was empty.');
        return text;
      } catch (retryErr: any) {
        lastError = retryErr;
        const msg = retryErr?.message || '';
        if ((msg.includes('503') || msg.includes('UNAVAILABLE') || msg.includes('429') || msg.includes('demand')) && attempt < MAX_RETRIES - 1) {
          console.warn(`Gemini 503/429/demand (Meditation) — ${attempt + 1}. deneme, ${3 * (attempt + 1)}s bekliyor. Sonraki deneme modeli: ${attempt === 0 ? FALLBACK_MODEL : PRIMARY_MODEL}...`);
          await new Promise(r => setTimeout(r, 3000 * (attempt + 1)));
          continue;
        }
        throw retryErr;
      }
    }
    throw lastError;

  } catch (e) {
    // Demo dayanıklılığı: Gemini senaryoyu üretemezse (503/429/ağ vb.) hata fırlatmak yerine
    // hazır yedek meditasyon metniyle devam edilir; ElevenLabs metni yine seslendirir, akış bozulmaz.
    console.warn('generateMeditationScript: Gemini üretemedi, yedek meditasyon metnine geçildi.', e);
    return t('meditationFallbackScript');
  }
};

// =============================================
// SMART KITCHEN — GÖRSEL ANALİZ
// =============================================

export const generateRecipesFromImage = async (
  base64Image: string,
  t: (key: string) => string
): Promise<SmartKitchenResponse | null> => {
  const prompt = `
    ${t('sk_promptPreamble')}
    ${t('sk_promptFoodCheck')}
    ${t('sk_promptTask')}
    ${t('sk_promptRequirements')}
    ${t('sk_promptStrictRules')}
    ${t('promptLanguageInstruction')}
    ${t('promptJsonInstruction')}
  `;

  try {
    if (!API_KEY || API_KEY.length < 20) {
      throw new Error(t('errorApiKey'));
    }

    // HATA TOLERANSI: En fazla 3 deneme; 503/429 gibi geçici hatalarda artan beklemeyle yedek modele geçilir.
    const MAX_RETRIES = 3;
    let lastError: any;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      const activeModel = attempt === 0 ? PRIMARY_MODEL : FALLBACK_MODEL;
      try {
        const result = await ai.models.generateContent({
          model: activeModel,
          contents: {
            parts: [
              // MULTİMODAL: Görsel (base64) ve metin aynı istekte modele iletilir (Akıllı Mutfak).
              { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
              { text: prompt },
            ],
          } as any,
          config: {
            responseMimeType: 'application/json',
            responseSchema: smartKitchenSchema,
          },
        });

        const jsonText = result.text?.trim();
        if (!jsonText) throw new Error('Empty response from Vision API');
        return JSON.parse(jsonText) as SmartKitchenResponse;
      } catch (retryErr: any) {
        lastError = retryErr;
        const msg = retryErr?.message || '';
        if ((msg.includes('503') || msg.includes('UNAVAILABLE') || msg.includes('429') || msg.includes('demand')) && attempt < MAX_RETRIES - 1) {
          console.warn(`Gemini 503/429/demand (Vision) — ${attempt + 1}. deneme, ${3 * (attempt + 1)}s bekliyor. Sonraki deneme modeli: ${attempt === 0 ? FALLBACK_MODEL : PRIMARY_MODEL}...`);
          await new Promise(r => setTimeout(r, 3000 * (attempt + 1)));
          continue;
        }
        throw retryErr;
      }
    }
    throw lastError;

  } catch (e) {
    console.error('generateRecipesFromImage error:', e);
    if (e instanceof Error && (e.message.includes('API_KEY') || e.message.includes(t('errorApiKey')))) {
      throw new Error(t('errorApiKey'));
    }
    throw new Error(t('errorGemini'));
  }
};
