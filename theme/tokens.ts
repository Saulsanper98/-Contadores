/**
 * Design tokens — single source of truth for spacing, typography, motion, elevation.
 * No magic numbers in components; import from here.
 */

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const typography = {
  fontFamily: {
    sans: 'Inter_400Regular',
    sansMedium: 'Inter_500Medium',
    sansSemiBold: 'Inter_600SemiBold',
    sansBold: 'Inter_700Bold',
    mono: 'SpaceMono_400Regular',
    monoBold: 'SpaceMono_700Bold',
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 20,
    xl: 28,
    xxl: 40,
    lifeCounter: 72,
    lifeCounterLarge: 96,
  },
  lineHeight: {
    tight: 1.1,
    normal: 1.4,
    relaxed: 1.6,
  },
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 1,
    counter: 2,
  },
} as const;

export const elevation = {
  none: 0,
  sm: 2,
  md: 6,
  lg: 12,
  xl: 24,
} as const;

export const opacity = {
  disabled: 0.4,
  muted: 0.6,
  overlay: 0.85,
  glass: 0.12,
} as const;

export const duration = {
  instant: 100,
  fast: 200,
  normal: 300,
  slow: 500,
  dramatic: 800,
} as const;

export const spring = {
  gentle: { damping: 20, stiffness: 180, mass: 1 },
  snappy: { damping: 18, stiffness: 280, mass: 0.8 },
  bouncy: { damping: 12, stiffness: 200, mass: 1 },
  stiff: { damping: 28, stiffness: 400, mass: 1 },
} as const;

export const zIndex = {
  base: 0,
  panel: 10,
  overlay: 100,
  modal: 200,
  toast: 300,
} as const;

export const hitSlop = {
  sm: { top: 8, bottom: 8, left: 8, right: 8 },
  md: { top: 12, bottom: 12, left: 12, right: 12 },
  lg: { top: 20, bottom: 20, left: 20, right: 20 },
} as const;

export const layout = {
  minPlayerCount: 2,
  maxPlayerCount: 6,
  defaultStartingLife: 40,
  commanderDamageLethal: 21,
  poisonLethal: 10,
  swipeDeltaSmall: 5,
  swipeDeltaLarge: 10,
  longPressIntervalMs: 150,
} as const;
