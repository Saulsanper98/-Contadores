import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { COMBAT_DAMAGE_TYPES, type CombatDamageType } from '@/data/combatTypes';
import { Sheet } from '@/components/ui/Sheet';
import { ManaPip } from '@/components/ui/ManaPip';
import type { PlayerGameState } from '@/engine/types';
import { palette, radius, spacing, typography } from '@/theme';

type CombatActionSheetProps = {
  visible: boolean;
  source: PlayerGameState;
  target: PlayerGameState;
  onClose: () => void;
  onResolve: (params: {
    amount: number;
    type: CombatDamageType;
    sourceId: string;
    targetId: string;
  }) => void;
};

export function CombatActionSheet({
  visible,
  source,
  target,
  onClose,
  onResolve,
}: CombatActionSheetProps) {
  const [amount, setAmount] = useState(1);
  const [damageType, setDamageType] = useState<CombatDamageType>('normal');

  useEffect(() => {
    if (visible) {
      setAmount(1);
      setDamageType('normal');
    }
  }, [visible, source.id, target.id]);

  const applyAndClose = useCallback(
    (nextAmount: number, type: CombatDamageType) => {
      if (nextAmount <= 0) {
        onClose();
        return;
      }
      onResolve({
        amount: nextAmount,
        type,
        sourceId: source.id,
        targetId: target.id,
      });
      onClose();
    },
    [onClose, onResolve, source.id, target.id],
  );

  const handleQuick = (value: number) => {
    applyAndClose(value, damageType);
  };

  const handleType = (type: CombatDamageType) => {
    applyAndClose(amount, type);
  };

  const isHeal = damageType === 'heal';

  return (
    <Sheet
      visible={visible}
      title={`${source.name} → ${target.name}`}
      subtitle={`${isHeal ? 'Curación' : 'Daño'} a ${target.name} · ${target.life} vidas`}
      onClose={onClose}>
      <View style={styles.targetRow}>
        <ManaPip identity={target.manaIdentity} size="md" />
        <View style={styles.targetMeta}>
          <Text style={styles.targetName}>{target.name}</Text>
          {target.commanderName ? (
            <Text style={styles.commanderName}>{target.commanderName}</Text>
          ) : null}
        </View>
      </View>

      <View style={styles.typeRow}>
        {COMBAT_DAMAGE_TYPES.map((type) => {
          const selected = damageType === type.id;
          return (
            <Pressable
              key={type.id}
              onPress={() => handleType(type.id)}
              style={[styles.typeChip, selected && styles.typeChipActive]}>
              <Text style={[styles.typeText, selected && styles.typeTextActive]}>
                {type.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.counterRow}>
        <Pressable
          onPress={() => setAmount((v) => Math.max(1, v - 1))}
          style={styles.stepBtn}>
          <Text style={styles.stepText}>−</Text>
        </Pressable>
        <View style={styles.amountBlock}>
          <Text style={styles.amount}>{amount}</Text>
          <Text style={styles.amountLabel}>{isHeal ? 'curación' : 'daño'}</Text>
        </View>
        <Pressable onPress={() => setAmount((v) => v + 1)} style={styles.stepBtn}>
          <Text style={styles.stepText}>+</Text>
        </Pressable>
      </View>

      <View style={styles.quickRow}>
        {[1, 5, 10, 21].map((n) => (
          <Pressable key={n} onPress={() => handleQuick(n)} style={styles.quickChip}>
            <Text style={styles.quickText}>{n}</Text>
          </Pressable>
        ))}
      </View>

      <Pressable
        onPress={() => applyAndClose(amount, damageType)}
        style={styles.applyBtn}>
        <Text style={styles.applyText}>Aplicar {amount}</Text>
      </Pressable>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  targetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: palette.backgroundElevated,
    borderWidth: 1,
    borderColor: palette.border,
  },
  targetMeta: {
    flex: 1,
    gap: 2,
  },
  targetName: {
    fontFamily: typography.fontFamily.sansSemiBold,
    fontSize: typography.fontSize.md,
    color: palette.textPrimary,
  },
  commanderName: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.sm,
    color: palette.textMuted,
  },
  typeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  typeChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: palette.borderStrong,
    backgroundColor: palette.backgroundElevated,
  },
  typeChipActive: {
    borderColor: palette.accentSecondary,
    backgroundColor: 'rgba(34, 211, 238, 0.12)',
  },
  typeText: {
    fontFamily: typography.fontFamily.sansMedium,
    fontSize: typography.fontSize.sm,
    color: palette.textSecondary,
  },
  typeTextActive: {
    color: palette.accentSecondary,
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xl,
    paddingVertical: spacing.sm,
  },
  stepBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: palette.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.backgroundElevated,
  },
  stepText: {
    fontFamily: typography.fontFamily.monoBold,
    fontSize: 32,
    color: palette.textPrimary,
    lineHeight: 36,
  },
  amountBlock: {
    alignItems: 'center',
    minWidth: 120,
  },
  amount: {
    fontFamily: typography.fontFamily.monoBold,
    fontSize: 64,
    color: palette.textPrimary,
    lineHeight: 68,
  },
  amountLabel: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.sm,
    color: palette.textMuted,
    textTransform: 'lowercase',
  },
  quickRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  quickChip: {
    minWidth: 56,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: palette.borderStrong,
    backgroundColor: palette.surface,
    alignItems: 'center',
  },
  quickText: {
    fontFamily: typography.fontFamily.monoBold,
    fontSize: typography.fontSize.md,
    color: palette.textPrimary,
  },
  applyBtn: {
    marginTop: spacing.sm,
    minHeight: 52,
    borderRadius: radius.full,
    backgroundColor: palette.accentSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyText: {
    fontFamily: typography.fontFamily.sansBold,
    fontSize: typography.fontSize.md,
    color: palette.textInverse,
  },
});
