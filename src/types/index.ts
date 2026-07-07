export interface User {
  name: string;
  email: string;
  photoUrl?: string;
  xp: number;
  level: number;
}

export interface MealItem {
  id: string;
  mealName: string;
  description: string;
}

export interface Nutrition {
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
}

export interface Recipe {
  ingredients: string[];
  steps: string[];
  prepTime: string;
  nutrition: Nutrition;
}

export type MealPlan = MealItem[];

export interface WorkoutItem {
  id: string;
  exercise: string;
  details: string;
  videoUrl?: string;
}

export type WorkoutPlan = WorkoutItem[];

export interface Plan {
  title: string;
  focus: string;
  duration: string;
  mealPlan: MealPlan;
  workoutPlan: WorkoutPlan;
}

export interface HeartRateData {
  daily?: number | null;
  preWorkout?: number | null;
  postWorkout?: number | null;
}

export interface ActivePlanState {
  plan: Plan;
  completionStatus: Record<string, boolean>;
  heartRateData?: HeartRateData;
}

export type FeedbackRating = 'too_easy' | 'easy' | 'just_right' | 'hard' | 'too_hard';
export type FeedbackReason =
  | 'duration_long'
  | 'complexity_high'
  | 'energy_low'
  | 'intensity_low'
  | 'duration_short'
  | 'more_reps'
  | 'intensity_high'
  | 'muscle_strain'
  | 'rest_short';

export interface WorkoutFeedback {
  rating: FeedbackRating;
  reasons?: FeedbackReason[];
  customFeedback?: string;
}

export interface HistoryItem {
  date: string; // ISO string (RN'de Date yerine string kullanıyoruz)
  plan: Plan;
  feedback?: WorkoutFeedback;
  heartRateData?: HeartRateData;
}

export interface BodyFatInputs {
  gender: 'male' | 'female';
  height: number;
  neck: number;
  waist: number;
  hip?: number;
}

export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
export type Goal = 'lose' | 'maintain' | 'gain';

export interface CalorieCalculatorInputs {
  gender: 'male' | 'female';
  age: number;
  height: number;
  weight: number;
  activityLevel: ActivityLevel;
  goal: Goal;
}

export interface CalorieResults {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface IngredientDetail {
  name: string;
  calories: string;
}

export interface SmartKitchenRecipe {
  name: string;
  description: string;
  ingredients: string[];
  ingredientDetails: IngredientDetail[];
  steps: string[];
  proteinContent: string;
  calories: string;
}

export interface SmartKitchenResponse {
  identifiedIngredients: string[];
  recipes: SmartKitchenRecipe[];
}

export interface WeightLog {
  id: string;
  date: string;
  weight: number;
}

export type Language = 'en' | 'es' | 'de' | 'fr' | 'zh' | 'tr';
