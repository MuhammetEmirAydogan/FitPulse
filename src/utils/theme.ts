import { StyleSheet } from 'react-native';

export const COLORS = {
  // Backgrounds
  bg: '#1A202C',
  bgCard: 'rgba(255,255,255,0.05)',
  bgCardHover: 'rgba(255,255,255,0.1)',
  bgBlack: 'rgba(0,0,0,0.3)',
  bgBlackNav: 'rgba(0,0,0,0.8)',

  // Borders
  border: 'rgba(255,255,255,0.1)',

  // Text
  textWhite: '#FFFFFF',
  textGray: '#A0AEC0',
  textGrayDark: '#718096',

  // Brand
  cyan: '#40E0D0',
  cyanLight: '#67E8F9',
  cyanDark: '#008B8B',
  teal: '#38B2AC',

  // Accents
  orange: '#FF7F50',
  orangeLight: '#FFA500',
  yellow: '#F6C90E',
  red: '#FC4B6C',
  green: '#48BB78',
  purple: '#9B59B6',
  blue: '#4299E1',
  coral: '#FF6B6B',
  indigo: '#667EEA',
  pink: '#ED64A6',

  // Gradient stops
  gradCyan1: '#40E0D0',
  gradCyan2: '#008B8B',
  gradOrange1: '#FF7F50',
  gradOrange2: '#FFA500',
};

export const FONTS = {
  regular: 'System',
  bold: 'System',
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 22,
    xxl: 28,
    xxxl: 36,
    huge: 48,
  },
};

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 999,
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const globalStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  card: {
    backgroundColor: COLORS.bgCard,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
  },
  title: {
    fontSize: FONTS.sizes.xxxl,
    fontWeight: 'bold',
    color: COLORS.textWhite,
  },
  subtitle: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textGray,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: RADIUS.full,
    paddingVertical: 14,
    paddingHorizontal: 48,
    color: COLORS.textWhite,
    fontSize: FONTS.sizes.md,
  },
  primaryButton: {
    backgroundColor: COLORS.cyan,
    borderRadius: RADIUS.full,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: COLORS.textWhite,
    fontWeight: 'bold',
    fontSize: FONTS.sizes.lg,
  },
});
