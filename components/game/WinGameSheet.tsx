import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Sheet } from '@/components/ui/Sheet';
import type { GameState, WinCondition } from '@/engine/types';
import { palette, radius, spacing, typography } from '@/theme';

const WIN_OPTIONS: { id: WinCondition; label: string }[] = [
  { id: 'combat', label: 'Combate' },
  { id: 'commander', label: 'Daño de comandante' },
  { id: 'poison', label: 'Veneno' },
  { id: 'mill', label: 'Mill' },
  { id: 'other', label: 'Otra' },
];

type WinGameSheetProps = {
  visible: boolean;
  game: GameState;
  onClose: () => void;
  onDeclare: (winnerId: string, condition: WinCondition) => void;
};

export function WinGameSheet({ visible, game, onClose, onDeclare }: WinGameSheetProps) {
  const [winnerId, setWinnerId] = useState<string | null>(null);
  const [condition, setCondition] = useState<WinCondition>('combat');

  const alive = game.players.filter((p) => !p.isEliminated);

  const handleDeclare = () => {
    if (!winnerId) return;
    onDeclare(winnerId, condition);
    onClose();
  };

  return (
    <Sheet visible={visible} title="Declarar ganador" subtitle="Fin de partida" onClose={onClose}>
      <Text style={styles.label}>Ganador</Text>
      <View style={styles.row}>
        {alive.map((player) => (
          <Pressable
            key={player.id}
            onPress={() => setWinnerId(player.id)}
            style={[styles.chip, winnerId === player.id && styles.chipOn]}>
            <Text style={styles.chipText}>{player.name}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>Condición de victoria</Text>
      <View style={styles.row}>
        {WIN_OPTIONS.map((opt) => (
          <Pressable
            key={opt.id}
            onPress={() => setCondition(opt.id)}
            style={[styles.chip, condition === opt.id && styles.chipOn]}>
            <Text style={styles.chipText}>{opt.label}</Text>
          </Pressable>
        ))}
      </View>

      {game.meta.knockouts.length > 0 ? (
        <View style={styles.koBox}>
          <Text style={styles.koTitle}>Knockouts</Text>
          {game.meta.knockouts.map((ko) => {
            const victim = game.players.find((p) => p.id === ko.victimId);
            const killer = ko.killerId ? game.players.find((p) => p.id === ko.killerId) : null;
            return (
              <Text key={ko.id} style={styles.koLine}>
                {victim?.name} ({ko.reason}){killer ? ` ← ${killer.name}` : ''}
              </Text>
            );
          })}
        </View>
      ) : null}

      <Button label="Confirmar victoria" onPress={handleDeclare} />
    </Sheet>
  );
}

const styles = StyleSheet.create({
  label: {
    fontFamily: typography.fontFamily.sansSemiBold,
    fontSize: typography.fontSize.sm,
    color: palette.textSecondary,
    marginBottom: spacing.xs,
  },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.backgroundElevated,
  },
  chipOn: {
    borderColor: palette.accent,
    backgroundColor: palette.accentMuted,
  },
  chipText: {
    fontFamily: typography.fontFamily.sansMedium,
    fontSize: typography.fontSize.sm,
    color: palette.textPrimary,
  },
  koBox: {
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  koTitle: {
    fontFamily: typography.fontFamily.sansSemiBold,
    fontSize: typography.fontSize.sm,
    color: palette.textMuted,
  },
  koLine: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.sm,
    color: palette.textPrimary,
  },
});
