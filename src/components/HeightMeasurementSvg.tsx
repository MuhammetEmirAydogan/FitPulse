import React from 'react';
import Svg, { Path, Circle, Line, Defs, G } from 'react-native-svg';

interface Props {
    width?: number;
    height?: number;
    gender?: 'male' | 'female';
}

/**
 * Body silhouette with a dashed height measurement line beside it.
 * Matches the reference design with arrows + horizontal markers.
 */
export const HeightMeasurementSvg: React.FC<Props> = ({
    width = 220,
    height = 260,
    gender = 'male',
}) => {
    const bodyColor = '#3A4050';
    const lineColor = '#40E0D0';

    return (
        <Svg width={width} height={height} viewBox="0 0 220 260" fill="none">
            {/* Body silhouette - centered slightly left */}
            {gender === 'male' ? (
                <G transform="translate(30, 30)">
                    {/* Head */}
                    <Circle cx="55" cy="18" r="12" fill={bodyColor} />
                    {/* Neck */}
                    <Path d="M50 30 L50 37 L60 37 L60 30" fill={bodyColor} />
                    {/* Torso */}
                    <Path
                        d="M28 40 L50 37 L60 37 L82 40 L80 44 L77 48 L74 88 L70 105 L40 105 L36 88 L33 48 L30 44 Z"
                        fill={bodyColor}
                    />
                    {/* Left arm */}
                    <Path
                        d="M28 40 L22 48 L18 64 L15 82 L13 92 L18 94 L22 90 L24 82 L28 64 L33 48"
                        fill={bodyColor}
                    />
                    {/* Right arm */}
                    <Path
                        d="M82 40 L88 48 L92 64 L95 82 L97 92 L92 94 L88 90 L86 82 L82 64 L77 48"
                        fill={bodyColor}
                    />
                    {/* Left leg */}
                    <Path
                        d="M40 105 L38 122 L36 140 L34 155 L33 168 L32 175 L44 175 L45 168 L47 155 L48 140 L50 122 L50 105"
                        fill={bodyColor}
                    />
                    {/* Right leg */}
                    <Path
                        d="M60 105 L60 122 L62 140 L63 155 L64 168 L65 175 L77 175 L76 168 L75 155 L74 140 L72 122 L70 105"
                        fill={bodyColor}
                    />
                </G>
            ) : (
                <G transform="translate(30, 30)">
                    {/* Head */}
                    <Circle cx="55" cy="16" r="11" fill={bodyColor} />
                    {/* Hair hint */}
                    <Path d="M44 10 Q44 4 55 4 Q66 4 66 10" fill={bodyColor} opacity={0.6} />
                    {/* Neck */}
                    <Path d="M51 27 L51 33 L59 33 L59 27" fill={bodyColor} />
                    {/* Torso - female shape */}
                    <Path
                        d="M34 36 L51 33 L59 33 L76 36 L74 40 L72 48 L70 58 L67 64 L63 68 L63 72 L67 78 L72 88 L74 98 L72 105 L38 105 L36 98 L38 88 L43 78 L47 72 L47 68 L43 64 L40 58 L38 48 L36 40 Z"
                        fill={bodyColor}
                    />
                    {/* Left arm */}
                    <Path
                        d="M34 36 L29 44 L26 58 L24 72 L23 84 L22 92 L27 94 L30 90 L31 82 L33 68 L34 54 L36 40"
                        fill={bodyColor}
                    />
                    {/* Right arm */}
                    <Path
                        d="M76 36 L81 44 L84 58 L86 72 L87 84 L88 92 L83 94 L80 90 L79 82 L77 68 L76 54 L74 40"
                        fill={bodyColor}
                    />
                    {/* Left leg */}
                    <Path
                        d="M38 105 L36 122 L35 140 L34 155 L33 168 L32 175 L44 175 L45 168 L47 155 L48 140 L49 122 L50 105"
                        fill={bodyColor}
                    />
                    {/* Right leg */}
                    <Path
                        d="M60 105 L61 122 L62 140 L63 155 L64 168 L65 175 L77 175 L76 168 L75 155 L74 140 L73 122 L72 105"
                        fill={bodyColor}
                    />
                </G>
            )}

            {/* Measurement line - right side of the body */}
            {/* Top horizontal mark */}
            <Line x1="140" y1="30" x2="170" y2="30" stroke={lineColor} strokeWidth={1.5} />
            {/* Bottom horizontal mark */}
            <Line x1="140" y1="205" x2="170" y2="205" stroke={lineColor} strokeWidth={1.5} />

            {/* Vertical dashed line */}
            <Line
                x1="155" y1="35" x2="155" y2="200"
                stroke={lineColor}
                strokeWidth={1.5}
                strokeDasharray="5,4"
            />

            {/* Top arrow */}
            <Path d="M150 38 L155 30 L160 38" stroke={lineColor} strokeWidth={1.5} fill="none" />
            {/* Bottom arrow */}
            <Path d="M150 197 L155 205 L160 197" stroke={lineColor} strokeWidth={1.5} fill="none" />
        </Svg>
    );
};
