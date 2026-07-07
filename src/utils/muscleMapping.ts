import { HistoryItem } from '../types';

export type TimeRange = 'day' | 'week' | 'month' | 'year';

export type MuscleGroup =
    | 'chest'
    | 'back'
    | 'shoulders'
    | 'biceps'
    | 'triceps'
    | 'abs'
    | 'quads'
    | 'hamstrings'
    | 'calves'
    | 'glutes'
    | 'forearms'
    | 'neck'
    | 'obliques';

// A simple dictionary mapping common exercise keywords (in English/Turkish) to primary muscle groups.
// In a real app, this would be a much larger database or returned by the AI.
const EXERCISE_MUSCLE_MAP: Record<string, MuscleGroup[]> = {
    // Chest
    bench: ['chest', 'triceps', 'shoulders'],
    pushup: ['chest', 'triceps', 'shoulders'],
    'push up': ['chest', 'triceps', 'shoulders'],
    fly: ['chest'],
    'şınav': ['chest', 'triceps', 'shoulders'],
    'göğüs': ['chest'],

    // Back
    pullup: ['back', 'biceps'],
    'pull up': ['back', 'biceps'],
    row: ['back', 'biceps'],
    deadlift: ['back', 'hamstrings', 'glutes', 'forearms'],
    pulldown: ['back', 'biceps'],
    'barfiks': ['back', 'biceps'],
    'sırt': ['back'],

    // Shoulders
    overhead: ['shoulders', 'triceps'],
    military: ['shoulders', 'triceps'],
    lateral: ['shoulders'],
    front: ['shoulders'],
    'omuz': ['shoulders'],

    // Arms
    armcurl: ['biceps'],
    tricep_extension: ['triceps'],
    dip: ['triceps', 'chest', 'shoulders'],
    'arka kol': ['triceps'],
    'ön kol': ['biceps'],

    // Core
    crunch: ['abs'],
    plank: ['abs', 'shoulders'],
    situp: ['abs'],
    'sit up': ['abs'],
    legraise: ['abs'],
    'leg raise': ['abs'],
    twist: ['obliques', 'abs'],
    'mekik': ['abs'],
    'karın': ['abs'],

    // Legs
    squat: ['quads', 'glutes', 'hamstrings'],
    lunge: ['quads', 'glutes', 'hamstrings'],
    legpress: ['quads', 'glutes', 'hamstrings'],
    'leg press': ['quads', 'glutes', 'hamstrings'],
    leg_extension: ['quads'],
    leg_curl: ['hamstrings'], // Overlaps with bicep curl, but usually context is clear, simplified here
    calf: ['calves'],
    'bacak': ['quads', 'hamstrings', 'glutes'],
    'kalf': ['calves']
};

export interface HeatmapData {
    scores: Record<MuscleGroup, number>; // 0 to 100
    totalWorkouts: number;
}

/**
 * Calculates a "heat" score (0-100) for each muscle group based on the user's workout history
 * within a given time frame.
 */
export const calculateMuscleHeat = (
    history: HistoryItem[],
    range: TimeRange
): HeatmapData => {
    const now = new Date();
    const startTime = new Date();

    // Determine the start time based on the selected range
    switch (range) {
        case 'day':
            startTime.setHours(0, 0, 0, 0); // Start of today
            break;
        case 'week':
            startTime.setDate(now.getDate() - 7);
            break;
        case 'month':
            startTime.setMonth(now.getMonth() - 1);
            break;
        case 'year':
            startTime.setFullYear(now.getFullYear() - 1);
            break;
    }

    // Filter history items within the time range
    const relevantHistory = history.filter((item) => {
        const itemDate = new Date(item.date);
        return itemDate >= startTime && itemDate <= now;
    });

    // Calculate raw hits per muscle group
    const rawScores: Record<string, number> = {};
    relevantHistory.forEach((item) => {
        item.plan.workoutPlan.forEach((workout) => {
            const exerciseName = workout.exercise.toLowerCase();
            let matched = false;

            // Check keywords in the exercise name
            Object.entries(EXERCISE_MUSCLE_MAP).forEach(([keyword, groups]) => {
                if (exerciseName.includes(keyword)) {
                    matched = true;
                    groups.forEach((group) => {
                        rawScores[group] = (rawScores[group] || 0) + 1;
                    });
                }
            });

            // If no keyword matches, assign to a generic 'fullbody' or distribute lightly
            // For this simple version, we'll just ignore unrecognized exercises.
        });
    });

    // Normalize scores to 0-100 relative to the maximum raw score
    const maxRawScore = Math.max(0, ...Object.values(rawScores));
    const normalizedScores: Record<MuscleGroup, number> = {
        chest: 0, back: 0, shoulders: 0, biceps: 0, triceps: 0,
        abs: 0, quads: 0, hamstrings: 0, calves: 0, glutes: 0,
        forearms: 0, neck: 0, obliques: 0
    };

    if (maxRawScore > 0) {
        Object.entries(rawScores).forEach(([group, score]) => {
            // Small curve: even 1 exercise gives 20%, max gives 100%
            const basePercentage = (score / maxRawScore) * 80;
            normalizedScores[group as MuscleGroup] = Math.min(100, Math.round(20 + basePercentage));
        });
    }

    return {
        scores: normalizedScores,
        totalWorkouts: relevantHistory.length,
    };
};
