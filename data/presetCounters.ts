import type { GenericCounterDef } from '@/engine/types';

export type PresetCounter = Omit<GenericCounterDef, 'id'> & {
  presetId: string;
};

export const PRESET_COUNTERS: PresetCounter[] = [
  { presetId: 'monarch', name: 'Monarca', icon: '👑' },
  { presetId: 'citys-blessing', name: "City's Blessing", icon: '🏛' },
  { presetId: 'experience', name: 'Experiencia', icon: '✦' },
  { presetId: 'energy', name: 'Energía', icon: '⚡' },
  { presetId: 'commander-tax', name: 'Commander Tax', icon: '⬆' },
  { presetId: 'storm', name: 'Storm', icon: '🌀' },
  { presetId: 'treasures', name: 'Treasures', icon: '💎' },
  { presetId: 'rad', name: 'Rad', icon: '☢' },
  { presetId: 'extra-turns', name: 'Turnos extra', icon: '↻' },
  { presetId: 'mills', name: 'Mills', icon: '📚' },
  { presetId: 'plus-one', name: '+1/+1', icon: '＋' },
  { presetId: 'minus-one', name: '−1/−1', icon: '−' },
];

export function presetToCounter(preset: PresetCounter): GenericCounterDef {
  return {
    id: `preset-${preset.presetId}`,
    name: preset.name,
    icon: preset.icon,
    presetId: preset.presetId,
  };
}
