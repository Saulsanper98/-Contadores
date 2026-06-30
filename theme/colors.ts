/**
 * Playgroup-inspired palette — deep navy surfaces, vivid mana panels, minimal chrome.
 */

export const manaColors = {
  white: { primary: '#F3F0E0', accent: '#E8E4C9', glow: 'rgba(243, 240, 224, 0.4)' },
  blue: { primary: '#1D6FD8', accent: '#4DA3FF', glow: 'rgba(77, 163, 255, 0.45)' },
  black: { primary: '#2B2118', accent: '#5C534A', glow: 'rgba(92, 83, 74, 0.45)' },
  red: { primary: '#D63A32', accent: '#FF6B5E', glow: 'rgba(255, 107, 94, 0.45)' },
  green: { primary: '#1F8A4C', accent: '#3FD47A', glow: 'rgba(63, 212, 122, 0.42)' },
  colorless: { primary: '#B8BCC4', accent: '#D7DBE0', glow: 'rgba(184, 188, 196, 0.35)' },
  multicolor: { primary: '#C9A227', accent: '#F0C75E', glow: 'rgba(201, 162, 39, 0.42)' },
} as const;

export type ManaIdentity = keyof typeof manaColors;

export const palette = {
  background: '#06090f',
  backgroundElevated: '#0d1219',
  surface: '#121820',
  surfaceHover: '#18202b',
  surfaceGlass: 'rgba(13, 18, 25, 0.88)',
  border: 'rgba(255, 255, 255, 0.06)',
  borderStrong: 'rgba(255, 255, 255, 0.12)',

  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  textInverse: '#0F172A',

  life: '#FFFFFF',
  damage: '#FF5A52',
  damageGlow: 'rgba(255, 90, 82, 0.35)',
  heal: '#34D399',
  healGlow: 'rgba(52, 211, 153, 0.3)',
  poison: '#A3E635',
  poisonGlow: 'rgba(163, 230, 53, 0.32)',
  commander: '#FBBF24',
  commanderGlow: 'rgba(251, 191, 36, 0.35)',
  monarch: '#FCD34D',
  monarchGlow: 'rgba(252, 211, 77, 0.45)',
  eliminated: '#64748B',

  accent: '#6366F1',
  accentSecondary: '#22D3EE',
  accentMuted: 'rgba(99, 102, 241, 0.16)',
  warning: '#F59E0B',
  danger: '#EF4444',
  success: '#10B981',
} as const;
