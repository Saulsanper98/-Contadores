import { useCallback, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { COMBAT_DAMAGE_TYPES, type CombatDamageType } from '@/data/combatTypes';
import { getManaPanelTheme } from '@/theme/manaTheme';
import type { PlayerGameState } from '@/engine/types';
import { MANA_OPTIONS } from '@/store/gameStore';
import { palette, radius, spacing, typography } from '@/theme';

type CombatActionSheetProps = {
  visible: boolean;
  source: PlayerGameState;
  target: PlayerGameState;
  sourceRotation: number;
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
  sourceRotation,
  onClose,
  onResolve,
}: CombatActionSheetProps) {
  const insets = useSafeAreaInsets();
  const [amount, setAmount] = useState(0);
  const [damageType, setDamageType] = useState<CombatDamageType>('normal');

  const theme = getManaPanelTheme(target.manaIdentity);
  const targetSymbol =
    MANA_OPTIONS.find((m) => m.id === target.manaIdentity)?.symbol ?? '?';

  const reset = useCallback(() => {
    setAmount(0);
    setDamageType('normal');
  }, []);

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleResolve = () => {
    if (amount <= 0) return;
    onResolve({
      amount,
      type: damageType,
      sourceId: source.id,
      targetId: target.id,
    });
    reset();
    onClose();
  };

  const isHeal = damageType === 'heal';

  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <LinearGradient
          colors={['rgba(6, 9, 15, 0.92)', theme.gradient[0], 'rgba(6, 9, 15, 0.95)']}
          locations={[0, 0.5, 1]}
          style={StyleSheet.absoluteFill}
        />

        <View
          style={[
            styles.content,
            {
              paddingTop: insets.top + spacing.lg,
              paddingBottom: insets.bottom + spacing.lg,
              transform: [{ rotate: `${sourceRotation}deg` }],
            },
          ]}>
          <View style={styles.topBar}>
            <Pressable onPress={handleResolve} style={styles.resolveBtn}>
              <Text style={styles.resolveText}>Resolver</Text>
            </Pressable>
            <Pressable onPress={handleClose} style={styles.cancelBtn}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </Pressable>
          </View>

          <View style={styles.counterArea}>
            <Pressable
              onPress={() => setAmount((v) => Math.max(0, v - 1))}
              style={styles.sideBtn}
              hitSlop={24}>
              <Text style={styles.sideBtnText}>−</Text>
            </Pressable>

            <View style={styles.centerBlock}>
              <Text style={styles.amount}>{amount}</Text>
              <Text style={styles.amountLabel}>{isHeal ? 'curación' : 'daño'}</Text>
              <View style={styles.targetRow}>
                <View style={[styles.targetPip, { backgroundColor: theme.accent }]}>
                  <Text style={styles.targetSymbol}>{targetSymbol}</Text>
                </View>
                <Text style={styles.targetMeta}>
                  {target.name} · {target.life} vidas
                </Text>
              </View>
            </View>

            <Pressable
              onPress={() => setAmount((v) => v + 1)}
              style={styles.sideBtn}
              hitSlop={24}>
              <Text style={styles.sideBtnText}>+</Text>
            </Pressable>
          </View>

          <View style={styles.quickRow}>
            {[1, 5, 10, 21].map((n) => (
              <Pressable
                key={n}
                onPress={() => setAmount(n)}
                style={[styles.quickChip, amount === n && styles.quickChipActive]}>
                <Text style={[styles.quickText, amount === n && styles.quickTextActive]}>
                  {n}
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.typeRow}>
            {COMBAT_DAMAGE_TYPES.map((type) => {
              const selected = damageType === type.id;
              return (
                <Pressable
                  key={type.id}
                  onPress={() => setDamageType(type.id)}
                  style={[styles.typeChip, selected && styles.typeChipActive]}>
                  {selected ? <Text style={styles.check}>✓</Text> : null}
                  <Text style={[styles.typeText, selected && styles.typeTextActive]}>
                    {type.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.hint}>
            Desde {source.name} → {target.name}
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: palette.background,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
  },
  topBar: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  resolveBtn: {
    flex: 1,
    minHeight: 52,
    borderRadius: radius.full,
    backgroundColor: palette.accentSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resolveText: {
    fontFamily: typography.fontFamily.sansBold,
    fontSize: typography.fontSize.md,
    color: palette.textInverse,
  },
  cancelBtn: {
    flex: 1,
    minHeight: 52,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    fontFamily: typography.fontFamily.sansSemiBold,
    fontSize: typography.fontSize.md,
    color: palette.textPrimary,
  },
  counterArea: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xl,
  },
  sideBtn: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sideBtnText: {
    fontFamily: typography.fontFamily.monoBold,
    fontSize: 48,
    color: 'rgba(255, 255, 255, 0.5)',
    lineHeight: 52,
  },
  centerBlock: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  amount: {
    fontFamily: typography.fontFamily.monoBold,
    fontSize: 96,
    color: palette.textPrimary,
    letterSpacing: 2,
    lineHeight: 100,
  },
  amountLabel: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.lg,
    color: palette.textSecondary,
    textTransform: 'lowercase',
  },
  targetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  targetPip: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  targetSymbol: {
    fontFamily: typography.fontFamily.sansBold,
    fontSize: typography.fontSize.sm,
    color: palette.textPrimary,
  },
  targetMeta: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.sm,
    color: palette.textMuted,
  },
  quickRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  quickChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  quickChipActive: {
    borderColor: palette.accentSecondary,
    backgroundColor: 'rgba(34, 211, 238, 0.15)',
  },
  quickText: {
    fontFamily: typography.fontFamily.monoBold,
    fontSize: typography.fontSize.md,
    color: palette.textSecondary,
  },
  quickTextActive: {
    color: palette.accentSecondary,
  },
  typeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: palette.borderStrong,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
  },
  typeChipActive: {
    borderColor: palette.success,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  check: {
    fontSize: typography.fontSize.sm,
    color: palette.success,
  },
  typeText: {
    fontFamily: typography.fontFamily.sansMedium,
    fontSize: typography.fontSize.sm,
    color: palette.textSecondary,
  },
  typeTextActive: {
    color: palette.textPrimary,
  },
  hint: {
    textAlign: 'center',
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.xs,
    color: palette.textMuted,
  },
});
