import { useEffect, useMemo, useState } from 'react';
import { StyleSheet } from 'react-native';
import { Canvas, Circle, Group, vec } from '@shopify/react-native-skia';

import { panelEffectDuration } from '@/animations/lifeFeedback';
import type { EffectKind } from '@/animations/effects';
import { palette } from '@/theme';

type ParticleBurstProps = {
  triggerId: number;
  kind: EffectKind;
  width: number;
  height: number;
  magnitude?: number;
  reducedMotion?: boolean;
};

const COLORS: Record<string, string> = {
  damage: palette.damage,
  heal: palette.heal,
  commander: palette.commander,
  poison: palette.poison,
  elimination: palette.danger,
  revive: palette.heal,
  monarch: palette.monarch,
  groupDamage: palette.damage,
  groupHeal: palette.heal,
};

export function ParticleBurst({
  triggerId,
  kind,
  width,
  height,
  magnitude = 1,
  reducedMotion,
}: ParticleBurstProps) {
  const [visible, setVisible] = useState(false);

  const particles = useMemo(
    () =>
      Array.from({ length: reducedMotion ? 4 : 12 }, (_, i) => ({
        angle: (i / 12) * Math.PI * 2,
        distance: 24 + (i % 4) * 16,
        size: 2 + (i % 3) * 1.5,
      })),
    [reducedMotion],
  );

  useEffect(() => {
    setVisible(true);
    const duration = panelEffectDuration(magnitude) * (reducedMotion ? 0.5 : 0.85);
    const timer = setTimeout(() => setVisible(false), duration);
    return () => clearTimeout(timer);
  }, [triggerId, magnitude, reducedMotion]);

  if (!visible || width <= 0 || height <= 0) return null;

  const color = COLORS[kind] ?? palette.accent;
  const cx = width / 2;
  const cy = height / 2;

  return (
    <Canvas style={StyleSheet.absoluteFill} pointerEvents="none">
      <Group opacity={0.85}>
        {particles.map((p, index) => {
          const dist = p.distance * (0.35 + 0.65 * (index / particles.length));
          const x = cx + Math.cos(p.angle) * dist;
          const y = cy + Math.sin(p.angle) * dist;
          return <Circle key={index} c={vec(x, y)} r={p.size} color={color} />;
        })}
      </Group>
    </Canvas>
  );
}
