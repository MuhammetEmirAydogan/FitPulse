import React, { useState, useMemo } from 'react';
import { View, StyleSheet, StatusBar, Platform, useWindowDimensions } from 'react-native';
import { TabView } from 'react-native-tab-view';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LocalizationProvider } from './src/context/LocalizationContext';
import { AppProvider, useApp } from './src/context/AppContext';
import { AuthScreen } from './src/screens/AuthScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { WizardScreen } from './src/screens/WizardScreen';
import { CurrentPlanScreen } from './src/screens/CurrentPlanScreen';
import { GalaxyScreen } from './src/screens/GalaxyScreen';
import { BodyFatWizardScreen } from './src/screens/BodyFatWizardScreen';
import { CalorieCalculatorScreen } from './src/screens/CalorieCalculatorScreen';
import { HeartRateMonitorScreen } from './src/screens/HeartRateMonitorScreen';
import { MentalRhythmsScreen } from './src/screens/MentalRhythmsScreen';
import { SmartKitchenScreen } from './src/screens/SmartKitchenScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { MoodTrackerScreen } from './src/screens/MoodTrackerScreen';
import { AnalyticsScreen } from './src/screens/AnalyticsScreen';
import { RecipeModal } from './src/components/RecipeModal';
import { VideoPlayerModal } from './src/components/VideoPlayerModal';
import { SuccessScreen } from './src/components/SuccessScreen';
import { FeedbackModal } from './src/components/FeedbackModal';
import { BottomNavigation } from './src/components/BottomNavigation';
import { AppHeader } from './src/components/AppHeader';
import { MealItem, WorkoutItem, Plan, HeartRateData, WorkoutFeedback, CalorieResults } from './src/types';

export type ViewName =
  | 'home' | 'wizard' | 'current_plan' | 'history' | 'settings'
  | 'body_fat_wizard' | 'heart_rate_monitor' | 'mental_rhythms'
  | 'calorie_calculator' | 'smart_kitchen' | 'profile' | 'mood' | 'analytics';

const MainApp: React.FC = () => {
  const insets = useSafeAreaInsets();
  const {
    isAuthenticated, user, activePlan, isPlanConfirmed, history, streak, weightHistory,
    initialBodyFat, initialCalorieTarget,
    handleAuthSuccess, handleLogout, handleUserUpdate, handleAddWeight, handleDeleteWeight,
    handlePlanGenerated, handleToggleItemCompletion, handlePlanConfirm,
    handleSavePulse, handleLogDailyPulse, finalizePlanCompletion, finalizeHistory,
    setInitialBodyFat, setInitialCalorieTarget,
  } = useApp();

  const layout = useWindowDimensions();

  const routes = useMemo(() => [
    { key: 'home', title: 'home' },
    { key: 'wizard', title: 'wizard' },
    { key: 'smart_kitchen', title: 'smart_kitchen' },
    { key: 'calorie_calculator', title: 'calorie_calculator' },
    { key: 'body_fat_wizard', title: 'body_fat_wizard' },
    { key: 'mental_rhythms', title: 'mental_rhythms' },
    { key: 'analytics', title: 'analytics' },
    { key: 'current_plan', title: 'current_plan' },
    { key: 'mood', title: 'mood' },
    { key: 'heart_rate_monitor', title: 'heart_rate_monitor' },
    { key: 'history', title: 'history' },
    { key: 'profile', title: 'profile' },
    { key: 'settings', title: 'settings' },
  ], []);

  const [index, setIndex] = useState(0);

  const setView = (v: ViewName) => {
    // Calculator ve Wizard ekranlarına her girdiğinde key'i artır → remount
    if (v === 'body_fat_wizard') setBodyFatKey(prev => prev + 1);
    if (v === 'calorie_calculator') setCalorieKey(prev => prev + 1);
    if (v === 'wizard') setWizardKey(prev => prev + 1);
    const idx = routes.findIndex(r => r.key === v);
    if (idx !== -1) setIndex(idx);
  };

  const view = routes[index].key as ViewName;
  const [selectedMeal, setSelectedMeal] = useState<MealItem | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<WorkoutItem | null>(null);
  const [completionPayload, setCompletionPayload] = useState<{ plan: Plan; newStreak: number; heartRateData?: HeartRateData } | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isPlanGenerating, setIsPlanGenerating] = useState(false);

  // Calculator ekranları için key counter — her navigasyonda artırılır
  // React component'ı remount eder → state sıfırlanır
  const [bodyFatKey, setBodyFatKey] = useState(0);
  const [calorieKey, setCalorieKey] = useState(0);
  const [wizardKey, setWizardKey] = useState(0);

  // AuthScreen artık (user, uid) döndürüyor — handleAuthSuccess bunu bekliyor
  if (!isAuthenticated) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <AuthScreen onAuthSuccess={handleAuthSuccess} />
      </View>
    );
  }

  const handleMarkCompleted = () => {
    const payload = finalizePlanCompletion();
    if (payload) { setCompletionPayload(payload); setShowSuccess(true); }
  };
  const handleSuccessContinue = () => { setShowSuccess(false); setShowFeedback(true); };
  const handleSuccessClose = () => {
    finalizeHistory(undefined, completionPayload || undefined);
    setShowSuccess(false); setCompletionPayload(null); setView('home');
  };
  const handleFeedbackSubmit = (feedback: WorkoutFeedback) => {
    finalizeHistory(feedback, completionPayload || undefined);
    setShowFeedback(false); setCompletionPayload(null); setView('home');
  };
  const handleFeedbackClose = () => {
    finalizeHistory(undefined, completionPayload || undefined);
    setShowFeedback(false); setCompletionPayload(null); setView('home');
  };
  const handleStartFromBodyFat = (bfp: number) => { setInitialBodyFat(bfp); setView('wizard'); };
  const handleStartFromCalories = (results: CalorieResults) => { setInitialCalorieTarget(results); setView('wizard'); };

  const handlePlanGenerating = () => {
    setIsPlanGenerating(true);
    setView('current_plan');
  };

  const handlePlanGeneratedWithReset = (plan: Plan) => {
    setIsPlanGenerating(false);
    handlePlanGenerated(plan);
    setView('current_plan');
  };

  const latestFeedback = [...history].reverse().find(h => h.feedback)?.feedback;
  const latestHeartRate = [...history].reverse().find(h => h.heartRateData)?.heartRateData;

  const renderScene = ({ route }: { route: { key: string } }) => {
    switch (route.key) {
      case 'wizard':
        return <WizardScreen key={`wiz_${wizardKey}`} onPlanGenerated={handlePlanGeneratedWithReset} onPlanGenerating={handlePlanGenerating} lastFeedback={latestFeedback} lastHeartRateData={latestHeartRate} initialBodyFat={initialBodyFat} initialCalorieTarget={initialCalorieTarget} onBack={() => setView('home')} hasActivePlan={!!activePlan} onGoToCurrentPlan={() => setView('current_plan')} />;
      case 'current_plan':
        return <CurrentPlanScreen activePlanState={activePlan} isPlanConfirmed={isPlanConfirmed} history={history} onConfirm={handlePlanConfirm} onMarkCompleted={handleMarkCompleted} onCreateAnother={() => setView('wizard')} onStartWizard={() => setView('wizard')} onToggleItem={handleToggleItemCompletion} onShowRecipe={setSelectedMeal} onShowVideo={setSelectedExercise} isPlanGenerating={isPlanGenerating} />;
      case 'history':
        return <GalaxyScreen history={history} />;
      case 'body_fat_wizard':
        return <BodyFatWizardScreen key={`bf_${bodyFatKey}`} onComplete={() => setView('home')} onPlanCreationRequest={handleStartFromBodyFat} />;
      case 'calorie_calculator':
        return <CalorieCalculatorScreen key={`cal_${calorieKey}`} onComplete={() => setView('home')} onPlanCreationRequest={handleStartFromCalories} />;
      case 'heart_rate_monitor':
        return <HeartRateMonitorScreen onSavePulse={(phase, bpm) => { handleSavePulse(phase, bpm); }} onLogDaily={(bpm) => { handleLogDailyPulse(bpm); }} onBack={() => setView(activePlan ? 'current_plan' : 'home')} isPlanActive={!!activePlan} />;
      case 'mental_rhythms':
        return <MentalRhythmsScreen />;
      case 'smart_kitchen':
        return <SmartKitchenScreen />;
      case 'settings':
        return <SettingsScreen user={user!} onUserUpdate={handleUserUpdate} onLogout={handleLogout} />;
      case 'profile':
        return <ProfileScreen user={user} history={history} streak={streak} weightHistory={weightHistory} onAddWeight={handleAddWeight} onDeleteWeight={handleDeleteWeight} onUpdateUser={handleUserUpdate} />;
      case 'mood':
        return <MoodTrackerScreen />;
      case 'analytics':
        return <AnalyticsScreen history={history} />;
      default:
        return <HomeScreen user={user} streak={streak} history={history} hasActivePlan={!!activePlan} onStartWizard={() => setView('wizard')} onViewPlan={() => setView('current_plan')} onStartBodyFatWizard={() => setView('body_fat_wizard')} onStartCalorieCalculator={() => setView('calorie_calculator')} />;
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor="#0d1117" />

      {/* Modals */}
      {showSuccess && completionPayload && (
        <SuccessScreen plan={completionPayload.plan} newStreak={completionPayload.newStreak} heartRateData={completionPayload.heartRateData} onContinue={handleSuccessContinue} onClose={handleSuccessClose} />
      )}
      {showFeedback && <FeedbackModal onClose={handleFeedbackClose} onSubmit={handleFeedbackSubmit} />}
      {selectedMeal && <RecipeModal meal={selectedMeal} onClose={() => setSelectedMeal(null)} />}
      {selectedExercise && <VideoPlayerModal exerciseName={selectedExercise.exercise} onClose={() => setSelectedExercise(null)} />}

      <AppHeader streak={streak} />

      <View style={styles.content}>
        <TabView
          navigationState={{ index, routes }}
          renderScene={renderScene}
          onIndexChange={setIndex}
          initialLayout={{ width: layout.width }}
          renderTabBar={() => null}
          swipeEnabled={true}
          lazy={true}
        />
      </View>

      <BottomNavigation
        activeView={view}
        onNavigate={(v) => setView(v as ViewName)}
        hasActivePlan={!!activePlan}
        bottomInset={insets.bottom}
      />
    </View>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <LocalizationProvider>
        <AppProvider>
          <MainApp />
        </AppProvider>
      </LocalizationProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d1117' },
  content: { flex: 1 },
});
