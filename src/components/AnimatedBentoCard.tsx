import React, { useRef } from 'react';
import { Animated, Pressable, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, RADIUS, SPACING } from '../utils/theme';

interface Props {
    children: React.ReactNode;
    style?: ViewStyle | ViewStyle[];
    onPress?: () => void;
    disabled?: boolean;
}

export const AnimatedBentoCard: React.FC<Props> = ({ children, style, onPress, disabled }) => {
    const scale = useRef(new Animated.Value(1)).current;
    const borderProgress = useRef(new Animated.Value(0)).current;

    // Create an animated value for the background color overlay to make it look active
    const bgOverlayOpacity = useRef(new Animated.Value(0)).current;

    const handlePressIn = () => {
        Animated.parallel([
            Animated.spring(scale, {
                toValue: 1.05, // Brings it closer to the screen
                useNativeDriver: false,
                speed: 20,
                bounciness: 10,
            }),
            Animated.timing(borderProgress, {
                toValue: 1,
                duration: 150,
                useNativeDriver: false, // Border color requires JS driver
            }),
            Animated.timing(bgOverlayOpacity, {
                toValue: 1,
                duration: 150,
                useNativeDriver: true, // Opacity uses native driver
            })
        ]).start();
    };

    const handlePressOut = () => {
        Animated.parallel([
            Animated.spring(scale, {
                toValue: 1,
                useNativeDriver: false,
                speed: 20,
                bounciness: 10,
            }),
            Animated.timing(borderProgress, {
                toValue: 0,
                duration: 300,
                useNativeDriver: false,
            }),
            Animated.timing(bgOverlayOpacity, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            })
        ]).start();
    };

    const borderColor = borderProgress.interpolate({
        inputRange: [0, 1],
        outputRange: [COLORS.border, COLORS.cyan], // From dull border to vivid cyan
    });

    // Increased strength of dropshadow over original design
    const glowOpacity = borderProgress.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 0.7] // Neon glow strength increases to 70% opacity
    });

    const glowElevation = borderProgress.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 15] // High elevation for big bloom on Android
    });

    return (
        <Pressable
            onPress={onPress}
            disabled={disabled}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            //@ts-ignore - React Native Web hovering
            onHoverIn={handlePressIn}
            //@ts-ignore
            onHoverOut={handlePressOut}
            style={[{ flex: Array.isArray(style) ? style.find(s => s?.flex)?.flex : style?.flex }]}
        >
            <Animated.View
                style={[
                    styles.container,
                    style,
                    {
                        transform: [{ scale }],
                        borderColor: borderColor,
                        shadowColor: COLORS.cyan,
                        shadowOffset: { width: 0, height: 0 },
                        shadowOpacity: glowOpacity,
                        shadowRadius: 15,
                        elevation: glowElevation,
                    }
                ]}
            >
                {/* Glowing Overlay Background Effect */}
                <Animated.View style={[
                    StyleSheet.absoluteFillObject,
                    {
                        backgroundColor: COLORS.cyan,
                        opacity: Animated.multiply(bgOverlayOpacity, 0.08), // Slightly tinting the background
                        borderRadius: RADIUS.xl,
                        zIndex: -1
                    }
                ]} />
                {children}
            </Animated.View>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: COLORS.bgCard,
        borderWidth: 2, // Thicker border for more visual pop
        borderRadius: RADIUS.xl,
        padding: SPACING.xl,
        overflow: 'hidden', // Make sure overlay doesn't leak out of border radius
    }
});
