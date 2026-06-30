/**
 * MTG-inspired color palette — WUBRG identities + control-room dark surfaces.
 */

export const manaColors = {
  white: { primary: '#F8F6D8', accent: '#E8E4C9', glow: 'rgba(248, 246, 216, 0.35)' },
  blue: { primary: '#0E68AB', accent: '#3D9BE9', glow: 'rgba(61, 155, 233, 0.35)' },
  black: { primary: '#150B00', accent: '#4A4A4A', glow: 'rgba(100, 100, 100, 0.35)' },
  red: { primary: '#D3202A', accent: '#F55A4E', glow: 'rgba(245, 90, 78, 0.35)' },
  green: { primary: '#00733E', accent: '#3BB273', glow: 'rgba(59, 178, 115, 0.35)' },
  colorless: { primary: '#C4C4C4', accent: '#9E9E9E', glow: 'rgba(196, 196, 196, 0.25)' },
  multicolor: { primary: '#D4AF37', accent: '#F0C75E', glow: 'rgba(212, 175, 55, 0.35)' },
} as const;

export type ManaIdentity = keyof typeof manaColors;

export const palette = {
  // Surfaces — control-room dark
  background: '#0A0A0F',
  backgroundElevated: '#12121A',
  surface: '#1A1A24',
  surfaceHover: '#22222E',
  surfaceGlass: 'rgba(26, 26, 36, 0.72)',
  border: 'rgba(255, 255, 255, 0.08)',
  borderStrong: 'rgba(255, 255, 255, 0.16)',

  // Text
  textPrimary: '#F4F4F5',
  textSecondary: '#A1A1AA',
  textMuted: '#71717A',
  textInverse: '#0A0A0F',

  // Semantic
  life: '#F4F4F5',
  damage: '#EF4444',
  damageGlow: 'rgba(239, 68, 68, 0.45)',
  heal: '#22C55E',
  healGlow: 'rgba(34, 197, 94, 0.45)',
  poison: '#84CC16',
  poisonGlow: 'rgba(132, 204, 22, 0.45)',
  commander: '#F59E0B',
  commanderGlow: 'rgba(245, 158, 11, 0.45)',
  monarch: '#EAB308',
  monarchGlow: 'rgba(234, 179, 8, 0.5)',
  eliminated: '#52525B',

  // Accents
  accent: '#8B5CF6',
  accentMuted: 'rgba(139, 92, 246, 0.2)',
  warning: '#F59E0B',
  danger: '#DC2626',
  success: '#16A34A',
} as const;
