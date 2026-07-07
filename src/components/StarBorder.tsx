import React, { useEffect, useRef, useMemo } from 'react';
import { View, Animated, StyleSheet, ViewStyle } from 'react-native';
import Svg, { Defs, LinearGradient as SvgLinearGradient, Stop, Rect } from 'react-native-svg';

let instanceCounter = 0;

interface StarBorderProps {
    children: React.ReactNode;
    color?: string;
    speed?: number;
    radius?: number;
    style?: ViewStyle;
}

export const StarBorder: React.FC<StarBorderProps> = ({
    children,
    color = '#FF7F50',
    speed = 3000,
    radius = 50,
    style,
}) => {
    const rotation = useRef(new Animated.Value(0)).current;
    const gradId = useMemo(() => `starGrad_${++instanceCounter}`, []);

    useEffect(() => {
        const anim = Animated.loop(
            Animated.timing(rotation, {
                toValue: 1,
                duration: speed,
                useNativeDriver: true,
            })
        );
        anim.start();
        return () => anim.stop();
    }, [speed]);

    const spin = rotation.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    // Outer glow size — the rotating gradient is larger than the container
    // so that the bright edge sweeps around all 4 sides.
    const OVERFLOW = 80;

    return (
        <View style={[styles.container, { borderRadius: radius }, style]}>
            {/* Rotating gradient layer (clipped by the container's borderRadius) */}
            <View style={[StyleSheet.absoluteFill, { borderRadius: radius, overflow: 'hidden' }]}>
                <Animated.View
                    style={[
                        styles.gradientWrapper,
                        {
                            transform: [{ rotate: spin }],
                            top: -OVERFLOW,
                            left: -OVERFLOW,
                            right: -OVERFLOW,
                            bottom: -OVERFLOW,
                        },
                    ]}
                >
                    <Svg width="100%" height="100%" viewBox="0 0 200 200" preserveAspectRatio="none">
                        <Defs>
                            <SvgLinearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
                                <Stop offset="0" stopColor="transparent" stopOpacity="0" />
                                <Stop offset="0.35" stopColor="transparent" stopOpacity="0" />
                                <Stop offset="0.45" stopColor={color} stopOpacity="0.7" />
                                <Stop offset="0.5" stopColor={color} stopOpacity="1" />
                                <Stop offset="0.55" stopColor={color} stopOpacity="0.7" />
                                <Stop offset="0.65" stopColor="transparent" stopOpacity="0" />
                                <Stop offset="1" stopColor="transparent" stopOpacity="0" />
                            </SvgLinearGradient>
                        </Defs>
                        <Rect x="0" y="0" width="200" height="200" fill={`url(#${gradId})`} />
                    </Svg>
                </Animated.View>
            </View>

            {/* Inner content area (slightly inset to reveal the border) */}
            <View style={[styles.inner, { borderRadius: radius - 1.5, backgroundColor: 'rgba(10,12,18,0.95)' }]}>
                {children}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'relative',
        overflow: 'hidden',
    },
    gradientWrapper: {
        position: 'absolute',
    },
    inner: {
        margin: 1.5,
        overflow: 'hidden',
    },
});
