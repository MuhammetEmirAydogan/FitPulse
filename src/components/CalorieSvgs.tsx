import React from 'react';
import Svg, { Path, Circle, Line, G, Rect, Text as SvgText } from 'react-native-svg';

interface Props {
    width?: number;
    height?: number;
}

/**
 * A weight scale SVG illustration for the weight input step.
 */
export const WeightScaleSvg: React.FC<Props> = ({
    width = 180,
    height = 180,
}) => {
    const scaleColor = '#3A4050';
    const accentColor = '#40E0D0';

    return (
        <Svg width={width} height={height} viewBox="0 0 180 180" fill="none">
            {/* Scale base - rounded rectangle */}
            <Rect x="25" y="100" width="130" height="55" rx="16" fill={scaleColor} />

            {/* Scale display area */}
            <Rect x="50" y="112" width="80" height="30" rx="8" fill="#2A2E3A" stroke={accentColor} strokeWidth={1.5} />

            {/* Display text: "kg" */}
            <SvgText
                x="90"
                y="133"
                textAnchor="middle"
                fill={accentColor}
                fontSize="14"
                fontWeight="600"
            >
                kg
            </SvgText>

            {/* Scale platform top */}
            <Rect x="35" y="90" width="110" height="14" rx="7" fill={scaleColor} />

            {/* Person on scale silhouette - small figure */}
            <G transform="translate(60, 10)">
                {/* Head */}
                <Circle cx="30" cy="12" r="9" fill={scaleColor} />
                {/* Body */}
                <Path
                    d="M22 22 L22 50 L18 70 L24 72 L28 55 L30 55 L32 55 L36 72 L42 70 L38 50 L38 22 Z"
                    fill={scaleColor}
                />
                {/* Arms */}
                <Path d="M22 26 L12 42 L16 44 L24 32" fill={scaleColor} />
                <Path d="M38 26 L48 42 L44 44 L36 32" fill={scaleColor} />
            </G>

            {/* Measurement lines on sides */}
            <Line x1="15" y1="85" x2="15" y2="160" stroke={accentColor} strokeWidth={1} strokeDasharray="3,3" opacity={0.4} />
            <Line x1="165" y1="85" x2="165" y2="160" stroke={accentColor} strokeWidth={1} strokeDasharray="3,3" opacity={0.4} />
        </Svg>
    );
};

/**
 * An age/calendar SVG illustration for the age input step.
 */
export const AgeSvg: React.FC<Props> = ({
    width = 180,
    height = 180,
}) => {
    const cardColor = '#3A4050';
    const accentColor = '#40E0D0';

    return (
        <Svg width={width} height={height} viewBox="0 0 180 180" fill="none">
            {/* Calendar body */}
            <Rect x="30" y="40" width="120" height="110" rx="14" fill={cardColor} />

            {/* Calendar top bar */}
            <Rect x="30" y="40" width="120" height="32" rx="14" fill="#2A2E3A" />
            <Rect x="30" y="58" width="120" height="14" fill="#2A2E3A" />

            {/* Calendar hooks */}
            <Rect x="60" y="30" width="8" height="20" rx="4" fill={accentColor} />
            <Rect x="112" y="30" width="8" height="20" rx="4" fill={accentColor} />

            {/* Calendar grid dots */}
            {[0, 1, 2, 3].map(row =>
                [0, 1, 2, 3, 4].map(col => (
                    <Circle
                        key={`${row}-${col}`}
                        cx={52 + col * 20}
                        cy={88 + row * 16}
                        r={3}
                        fill={row === 1 && col === 2 ? accentColor : '#4A5060'}
                    />
                ))
            )}

            {/* Highlight circle around selected date */}
            <Circle cx={92} cy={104} r={8} stroke={accentColor} strokeWidth={1.5} fill="none" />

            {/* Small person icon below */}
            <G transform="translate(70, 2)">
                <Circle cx="20" cy="8" r="6" fill={cardColor} />
                <Path d="M14 15 L14 26 L26 26 L26 15 Z" fill={cardColor} />
            </G>
        </Svg>
    );
};
