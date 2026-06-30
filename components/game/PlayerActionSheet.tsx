import { useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { CounterRow } from '@/components/ui/CounterRow';
import { ManaPip } from '@/components/ui/ManaPip';
import { Section } from '@/components/ui/Section';
import { Sheet } from '@/components/ui/Sheet';
import { Button } from '@/components/ui/Button';
import { getCommanderDamage, isCommanderDanger, isPoisonDanger } from '@/engine';
import type { GameState, PlayerGameState } from '@/engine/types';
import { MANA_OPTIONS } from '@/store/gameStore';
import { layout, manaColors, palette, radius, spacing, typography } from '@/theme';

type PlayerActionSheetProps = {
  visible: boolean;
  game: GameState;
  player: PlayerGameState | null;
  onClose: () => void;
  onCommanderDamage: (targetId: string, sourceId: string, amount: number) => void;
  onPoison: (playerId: string, delta: number) => void;
  onCounter: (playerId: string, counterId: string, delta: number) => void;
  onMonarch: (playerId: string) => void;
  onClearMonarch: () => void;
  onEliminate: (playerId: string) => void;
  onRevive: (playerId: string) => void;
};

export function PlayerActionSheet({
  visible,
  game,
  player,
  onClose,
  onCommanderDamage,
  onPoison,
  onCounter,
  onMonarch,
  onClearMonarch,
  onEliminate,
  onRevive,
}: PlayerActionSheetProps) {
  const [commanderSourceId, setCommanderSourceId] = useState<string | null>(null);

  const opponents = useMemo(() => {
    if (!player) return [];
    return game.players.filter((p) => p.id !== player.id);
  }, [game.players, player]);

  if (!player) return null;

  const isMonarch = game.monarchPlayerId === player.id;
  const poisonDanger = isPoisonDanger(player.poison);
  const commanderDanger = isCommanderDanger(player);

  const confirmEliminate = () => {
    Alert.alert(
      'Eliminar jugador',
      `¿Marcar a ${player.name} como eliminado?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            onEliminate(player.id);
            onClose();
          },
        },
      ],
    );
  };

  return (
    <Sheet
      visible={visible}
      title={player.name}
      subtitle={`${player.life} vidas · Asiento ${game.players.findIndex((p) => p.id === player.id) + 1}`}
      onClose={onClose}>
      <Section title="Daño de comandante">
        <Text style={styles.hint}>Selecciona el oponente atacante</Text>
        <View style={styles.opponentRow}>
          {opponents.map((opponent) => {
            const dmg = getCommanderDamage(player, opponent.id);
            const selected = commanderSourceId === opponent.id;
            const symbol = MANA_OPTIONS.find((m) => m.id === opponent.manaIdentity)?.symbol ?? '?';

            return (
              <Pressable
                key={opponent.id}
                onPress={() => setCommanderSourceId(opponent.id)}
                style={[styles.opponentChip, selected && styles.opponentSelected]}>
                <ManaPip identity={opponent.manaIdentity} label={symbol} selected={selected} />
                <Text style={styles.opponentName} numberOfLines={1}>
                  {opponent.name}
                </Text>
                <Text
                  style={[
                    styles.opponentDmg,
                    dmg >= layout.commanderDamageLethal - 3 && styles.dangerText,
                  ]}>
                  {dmg}
                </Text>
              </Pressable>
            );
          })}
        </View>
        {commanderSourceId ? (
          <CounterRow
            label="Daño de este comandante"
            icon="⚔"
            value={getCommanderDamage(player, commanderSourceId)}
            danger={commanderDanger}
            warning={getCommanderDamage(player, commanderSourceId) >= 18}
            onDecrement={() => onCommanderDamage(player.id, commanderSourceId, -1)}
            onIncrement={() => onCommanderDamage(player.id, commanderSourceId, 1)}
          />
        ) : null}
        {commanderDanger ? (
          <Text style={styles.alert}>⚠ Cerca del límite de 21 de daño de comandante</Text>
        ) : null}
      </Section>

      <Section title="Veneno">
        <CounterRow
          label="Contadores de veneno"
          icon="☠"
          value={player.poison}
          danger={player.poison >= layout.poisonLethal}
          warning={poisonDanger}
          onDecrement={() => onPoison(player.id, -1)}
          onIncrement={() => onPoison(player.id, 1)}
        />
        {poisonDanger ? (
          <Text style={styles.alert}>⚠ Cerca del límite de 10 veneno</Text>
        ) : null}
      </Section>

      {game.setup.genericCounters.length > 0 ? (
        <Section title="Contadores">
          {game.setup.genericCounters.map((def) => {
            const state = player.counters.find((c) => c.defId === def.id);
            return (
              <CounterRow
                key={def.id}
                label={def.name}
                icon={def.icon}
                value={state?.value ?? 0}
                onDecrement={() => onCounter(player.id, def.id, -1)}
                onIncrement={() => onCounter(player.id, def.id, 1)}
              />
            );
          })}
        </Section>
      ) : null}

      <Section title="Monarca">
        <View style={styles.monarchRow}>
          <Text style={styles.monarchLabel}>{isMonarch ? '👑 Es el monarca' : 'Sin monarca'}</Text>
          <Button
            label={isMonarch ? 'Quitar corona' : 'Hacer monarca'}
            variant={isMonarch ? 'secondary' : 'primary'}
            onPress={() => (isMonarch ? onClearMonarch() : onMonarch(player.id))}
          />
        </View>
      </Section>

      <Section title="Estado">
        {player.isEliminated ? (
          <Button label="Revivir jugador" onPress={() => { onRevive(player.id); onClose(); }} />
        ) : (
          <Button label="Eliminar jugador" variant="secondary" onPress={confirmEliminate} />
        )}
      </Section>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  hint: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.sm,
    color: palette.textMuted,
  },
  opponentRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  opponentChip: {
    width: '47%',
    backgroundColor: palette.backgroundElevated,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: palette.border,
    padding: spacing.sm,
    alignItems: 'center',
    gap: 4,
  },
  opponentSelected: {
    borderColor: palette.commander,
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
  },
  opponentName: {
    fontFamily: typography.fontFamily.sansMedium,
    fontSize: typography.fontSize.xs,
    color: palette.textSecondary,
    maxWidth: '100%',
  },
  opponentDmg: {
    fontFamily: typography.fontFamily.monoBold,
    fontSize: typography.fontSize.md,
    color: palette.commander,
  },
  dangerText: {
    color: palette.danger,
  },
  alert: {
    fontFamily: typography.fontFamily.sansMedium,
    fontSize: typography.fontSize.sm,
    color: palette.warning,
  },
  monarchRow: {
    gap: spacing.md,
  },
  monarchLabel: {
    fontFamily: typography.fontFamily.sansSemiBold,
    fontSize: typography.fontSize.md,
    color: palette.monarch,
  },
});
