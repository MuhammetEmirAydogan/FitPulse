import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalization } from '../context/LocalizationContext';
import { FONTS, SPACING } from '../utils/theme';

interface Props {
  streak: number;
}

// Tek bir kıvılcım parçacığı
const Spark: React.FC<{ delay: number; angle: number }> = ({ delay, angle }) => {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const run = () => {
      anim.setValue(0);
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]).start(() => run());
    };
    run();
    return () => anim.stopAnimation();
  }, []);

  const rad = (angle * Math.PI) / 180;
  const dist = 14; // kaç px uzağa fırlasın

  const translateX = anim.interpolate({ inputRange: [0, 1], outputRange: [0, Math.cos(rad) * dist] });
  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [0, Math.sin(rad) * dist] });
  const opacity = anim.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0, 1, 0] });
  const scale = anim.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0.4, 1, 0.2] });

  return (
    <Animated.View
      style={[
        styles.spark,
        { opacity, transform: [{ translateX }, { translateY }, { scale }] },
      ]}
    />
  );
};

export const AppHeader: React.FC<Props> = ({ streak }) => {
  const { t } = useLocalization();

  // 4 kıvılcım: sağ üst, sol üst, sağ, sol
  const sparks: { angle: number; delay: number }[] = [
    { angle: -60, delay: 0 },
    { angle: -120, delay: 200 },
    { angle: -30, delay: 400 },
    { angle: -150, delay: 300 },
  ];

  return (
    <View style={styles.header}>
      <View style={styles.logoRow}>
        <Image
          source={require('../../assets/logo.jpg')}
          style={styles.logoImg}
          resizeMode="contain"
        />
        <Text style={styles.logoText}>
          <Text style={styles.logoFit}>Fit</Text>
          <Text style={styles.logoPulse}>Pulse</Text>
        </Text>
      </View>

      {streak > 0 && (
        <View style={styles.streakWrapper}>
          {/* Kıvılcımlar badge'in üstünden fışkırıyor */}
          {sparks.map((s, i) => (
            <Spark key={i} angle={s.angle} delay={s.delay} />
          ))}
          {/* Badge — statik */}
          <View style={styles.streakBadge}>
            <Ionicons name="flame" size={14} color="#FF7F50" />
            <Text style={styles.streakText}>{streak}</Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    backgroundColor: '#0d1117',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  logoImg: { width: 34, height: 34, borderRadius: 10 },
  logoText: { fontSize: FONTS.sizes.xl, fontWeight: '800' },
  logoFit: { color: '#FFFFFF' },
  logoPulse: { color: '#40E0D0' },
  streakWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Küçük turuncu/sarı kıvılcım noktası
  spark: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FFA040',
    shadowColor: '#FF7F50',
    shadowOpacity: 1,
    shadowRadius: 3,
    elevation: 4,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,127,80,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,127,80,0.3)',
    borderRadius: 50,
    paddingHorizontal: SPACING.md,
    paddingVertical: 5,
  },
  streakText: {
    color: '#FF7F50',
    fontWeight: '700',
    fontSize: FONTS.sizes.sm,
  },
});
