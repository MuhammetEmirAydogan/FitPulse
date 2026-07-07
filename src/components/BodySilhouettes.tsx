import React from 'react';
import Svg, { Path, Circle, Ellipse, G } from 'react-native-svg';

interface SilhouetteProps {
    width?: number;
    height?: number;
    color?: string;
    opacity?: number;
}

/**
 * Male body silhouette - standing figure with broader shoulders
 */
export const MaleSilhouette: React.FC<SilhouetteProps> = ({
    width = 120,
    height = 200,
    color = '#40E0D0',
    opacity = 1,
}) => (
    <Svg width={width} height={height} viewBox="0 0 120 200" fill="none">
        <G opacity={opacity}>
            {/* Head */}
            <Circle cx="60" cy="22" r="14" fill={color} />

            {/* Neck */}
            <Path
                d="M54 36 L54 44 L66 44 L66 36"
                fill={color}
            />

            {/* Torso - broader shoulders for male */}
            <Path
                d="M30 48 L54 44 L66 44 L90 48 L88 52 L84 56 L80 100 L76 120 L44 120 L40 100 L36 56 L32 52 Z"
                fill={color}
            />

            {/* Left arm */}
            <Path
                d="M30 48 L22 58 L18 78 L14 100 L12 108 L18 110 L24 108 L26 98 L30 78 L36 56"
                fill={color}
            />

            {/* Right arm */}
            <Path
                d="M90 48 L98 58 L102 78 L106 100 L108 108 L102 110 L96 108 L94 98 L90 78 L84 56"
                fill={color}
            />

            {/* Left leg */}
            <Path
                d="M44 120 L42 140 L40 160 L38 178 L36 192 L34 198 L48 198 L50 192 L52 178 L54 160 L56 140 L56 120"
                fill={color}
            />

            {/* Right leg */}
            <Path
                d="M64 120 L66 140 L66 160 L68 178 L70 192 L72 198 L86 198 L84 192 L82 178 L80 160 L78 140 L76 120"
                fill={color}
            />
        </G>
    </Svg>
);

/**
 * Female body silhouette - standing figure with curves, narrower shoulders, wider hips
 */
export const FemaleSilhouette: React.FC<SilhouetteProps> = ({
    width = 120,
    height = 200,
    color = '#40E0D0',
    opacity = 1,
}) => (
    <Svg width={width} height={height} viewBox="0 0 120 200" fill="none">
        <G opacity={opacity}>
            {/* Head */}
            <Circle cx="60" cy="20" r="13" fill={color} />

            {/* Neck */}
            <Path
                d="M55 33 L55 40 L65 40 L65 33"
                fill={color}
            />

            {/* Hair hint */}
            <Path
                d="M47 14 Q47 6 60 6 Q73 6 73 14"
                fill={color}
                opacity={0.6}
            />

            {/* Torso - narrower shoulders, waist, wider hips */}
            <Path
                d="M38 44 L55 40 L65 40 L82 44 L80 48 L78 56 L76 68 L72 76 L68 80 L68 84 L72 92 L78 102 L80 112 L78 120 L42 120 L40 112 L42 102 L48 92 L52 84 L52 80 L48 76 L44 68 L42 56 L40 48 Z"
                fill={color}
            />

            {/* Left arm - slimmer */}
            <Path
                d="M38 44 L32 54 L28 70 L26 86 L24 100 L22 108 L28 110 L32 106 L34 96 L36 80 L38 64 L40 48"
                fill={color}
            />

            {/* Right arm - slimmer */}
            <Path
                d="M82 44 L88 54 L92 70 L94 86 L96 100 L98 108 L92 110 L88 106 L86 96 L84 80 L82 64 L80 48"
                fill={color}
            />

            {/* Left leg */}
            <Path
                d="M42 120 L40 140 L39 160 L38 178 L36 192 L35 198 L49 198 L50 192 L52 178 L54 160 L55 140 L56 120"
                fill={color}
            />

            {/* Right leg */}
            <Path
                d="M64 120 L65 140 L66 160 L68 178 L70 192 L71 198 L85 198 L84 192 L82 178 L81 160 L80 140 L78 120"
                fill={color}
            />
        </G>
    </Svg>
);
