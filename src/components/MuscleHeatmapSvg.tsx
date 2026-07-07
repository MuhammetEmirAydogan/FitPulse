import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import Svg, { Path, Defs, RadialGradient, Stop, Ellipse } from 'react-native-svg';
import { MuscleGroup } from '../utils/muscleMapping';

interface Props {
    scores: Record<MuscleGroup, number>;
    width?: number;
    height?: number;
}

const AnimatedPath = Animated.createAnimatedComponent(Path);

// Organic silhouette paths breaking down a body into core muscle regions.
// Front view facing forward with smooth curves
const PATHS: Record<MuscleGroup, string> = {
    // Head/Neck
    neck: "M 135 70 Q 150 60 165 70 L 160 85 L 140 85 Z",

    // Shoulders
    shoulders: "M 100 85 Q 150 70 200 85 Q 215 100 210 115 L 90 115 Q 85 100 100 85 Z",

    // Chest
    chest: "M 105 115 Q 150 140 195 115 L 185 155 Q 150 165 115 155 Z",

    // Abs / Core
    abs: "M 115 155 Q 150 165 185 155 L 175 220 Q 150 230 125 220 Z",
    obliques: "M 90 115 L 105 115 L 115 155 L 100 155 Z M 210 115 L 195 115 L 185 155 L 200 155 Z",
    back: "M 105 85 L 195 85 L 185 155 Q 150 170 115 155 Z", // Background layer for back heat

    // Arms Default (Biceps front)
    biceps: "M 95 115 Q 70 145 80 185 Q 95 180 100 185 Q 110 150 95 115 Z M 205 115 Q 230 145 220 185 Q 205 180 200 185 Q 190 150 205 115 Z",
    triceps: "M 90 115 Q 60 150 75 185 Q 90 180 95 185 Q 105 150 90 115 Z M 210 115 Q 240 150 225 185 Q 210 180 205 185 Q 195 150 210 115 Z",
    forearms: "M 80 185 Q 65 240 75 250 Q 90 245 95 240 Q 100 210 100 185 Z M 220 185 Q 235 240 225 250 Q 210 245 205 240 Q 200 210 200 185 Z",

    // Legs Front
    quads: "M 115 220 Q 120 220 140 220 L 135 310 Q 120 320 105 310 Z M 160 220 Q 180 220 185 220 L 195 310 Q 180 320 165 310 Z",
    hamstrings: "M 110 220 Q 130 220 145 220 L 140 310 Q 120 320 100 310 Z M 155 220 Q 170 220 190 220 L 200 310 Q 180 320 160 310 Z",
    glutes: "M 115 200 Q 150 210 185 200 L 180 230 Q 150 240 120 230 Z",
    calves: "M 105 310 L 135 310 L 130 380 Q 115 390 100 380 Z M 165 310 L 195 310 L 200 380 Q 185 390 170 380 Z",
};

// Base cold color (dark blue/gray) to Hot color (Cyan/Red)
const COLD_COLOR = '#2A344A'; // Base silhouette
const HOT_COLOR = '#FC4B6C';  // Intense heat (red) or '#40E0D0' (cyan)

const MusclePart: React.FC<{ path: string, score: number, isBase?: boolean }> = ({ path, score, isBase }) => {
    const animatedScore = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(animatedScore, {
            toValue: score,
            duration: 800,
            useNativeDriver: false // Color interpolation requires JS driver
        }).start();
    }, [score, animatedScore]);

    // Interpolate from cold to hot based on score (0-100)
    const fillStyle = isBase ? COLD_COLOR : animatedScore.interpolate({
        inputRange: [0, 50, 100],
        outputRange: [COLD_COLOR, '#8A2BE2', HOT_COLOR]
    });

    const fillOpacityStyle = isBase ? 1 : animatedScore.interpolate({
        inputRange: [0, 100],
        outputRange: [0.1, 1]
    });

    return (
        <AnimatedPath
            d={path}
            stroke="#1E293B" // Subtle separator
            strokeWidth={2}
            fill={fillStyle as any}
            fillOpacity={fillOpacityStyle as any}
        />
    );
};

export const MuscleHeatmapSvg: React.FC<Props> = ({ scores, width = 300, height = 450 }) => {
    return (
        <View style={[styles.container, { width, height }]}>
            <Svg width="100%" height="100%" viewBox="0 0 300 450">
                <Defs>
                    <RadialGradient id="glow" cx="50%" cy="30%" r="50%">
                        <Stop offset="0%" stopColor="#40E0D0" stopOpacity="0.15" />
                        <Stop offset="100%" stopColor="#40E0D0" stopOpacity="0" />
                    </RadialGradient>
                </Defs>

                {/* Ambient Glow */}
                <Ellipse cx="150" cy="200" rx="120" ry="180" fill="url(#glow)" />

                {/* Head Base */}
                <Path d="M 150 20 A 25 25 0 1 0 150 70 A 25 25 0 1 0 150 20" fill={COLD_COLOR} stroke="#1E293B" strokeWidth={2} />

                {/* We draw the parts based on our PATHS registry. 
            For overlapping parts (like biceps/triceps or quads/hamstrings) 
            we prioritize the one with the higher score or a blend.
            For this simplified 2D map, we draw them all and let opacity/score handle visual weight. */}

                {Object.keys(PATHS).map((key) => {
                    const muscle = key as MuscleGroup;
                    const score = scores[muscle] || 0;
                    return <MusclePart key={muscle} path={PATHS[muscle]} score={score} />;
                })}
            </Svg>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    }
});
