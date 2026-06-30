import type { ManaIdentity } from './colors';
import { manaColors } from './colors';

function withAlpha(hex: string, alpha: number): string {
  const normalized = hex.replace('#', '');
  const full =
    normalized.length === 3
      ? normalized
          .split('')
          .map((c) => c + c)
          .join('')
      : normalized;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function getManaPanelTheme(identity: ManaIdentity) {
  const mana = manaColors[identity];
  const lightIdentity = identity === 'white' || identity === 'colorless';

  return {
    gradient: [
      withAlpha(mana.primary, lightIdentity ? 0.72 : 0.68),
      withAlpha(mana.primary, lightIdentity ? 0.38 : 0.32),
      '#06090f',
    ] as [string, string, string],
    glow: mana.glow,
    accent: mana.accent,
    lifeColor: lightIdentity ? '#0f172a' : '#ffffff',
    nameColor: lightIdentity ? 'rgba(15, 23, 42, 0.85)' : 'rgba(255, 255, 255, 0.9)',
    mutedColor: lightIdentity ? 'rgba(15, 23, 42, 0.45)' : 'rgba(255, 255, 255, 0.45)',
    chipBg: lightIdentity ? 'rgba(15, 23, 42, 0.15)' : 'rgba(0, 0, 0, 0.3)',
    chipBorder: lightIdentity ? 'rgba(15, 23, 42, 0.2)' : 'rgba(255, 255, 255, 0.2)',
  };
}
