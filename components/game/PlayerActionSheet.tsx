import { useMemo, useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { CounterGrid } from '@/components/game/CounterGrid';
import { PlayerActionGrid } from '@/components/game/PlayerActionGrid';
import type { PlayerActionId } from '@/data/playerActions';
import { CounterRow } from '@/components/ui/CounterRow';
import { ManaPip } from '@/components/ui/ManaPip';
import { Sheet } from '@/components/ui/Sheet';
import { getCommanderDamage, isCommanderDanger, isPoisonDanger } from '@/engine';
import { flipCoin, rollD6, rollD20 } from '@/engine/tools';
import type { GameState, PlayerGameState } from '@/engine/types';
import { useCommanderArt } from '@/hooks/useCommanderArt';
import { MANA_OPTIONS } from '@/store/gameStore';
import { layout, palette, radius, spacing, typography } from '@/theme';

type Tab = 'actions' | 'counters';

type PlayerActionSheetProps = {
  visible: boolean;
  game: GameState;
  player: PlayerGameState | null;
  onClose: () => void;
  onAction: (playerId: string, actionId: PlayerActionId) => void;
  onCommanderDamage: (targetId: string, sourceId: string, amount: number) => void;
  onPoison: (playerId: string, delta: number) => void;
  onCounter: (playerId: string, counterId: string, delta: number) => void;
  onMulligan: (playerId: string, delta: number) => void;
  onToast: (title: string, subtitle?: string) => void;
};

export function PlayerActionSheet({
  visible,
  game,
  player,
  onClose,
  onAction,
  onCommanderDamage,
  onPoison,
  onCounter,
  onMulligan,
  onToast,
}: PlayerActionSheetProps) {
  const [tab, setTab] = useState<Tab>('actions');
  const [commanderSourceId, setCommanderSourceId] = useState<string | null>(null);
  const commanderArt = useCommanderArt(player?.commanderName);

  const opponents = useMemo(() => {
    if (!player) return [];
    return game.players.filter((p) => p.id !== player.id);
  }, [game.players, player]);

  if (!player) return null;

  const seatIndex = game.players.findIndex((p) => p.id === player.id) + 1;
  const isMonarch = game.monarchPlayerId === player.id;
  const poisonDanger = isPoisonDanger(player.poison);
  const commanderDanger = isCommanderDanger(player);

  const handleGridAction = (actionId: PlayerActionId) => {
    if (actionId === 'roll-d6') {
      onToast(String(rollD6()), 'Dado D6');
      onClose();
      return;
    }
    if (actionId === 'roll-d20') {
      onToast(String(rollD20()), 'Dado D20');
      onClose();
      return;
    }
    if (actionId === 'eliminate') {
      Alert.alert(
        'Eliminar jugador',
        `¿Marcar a ${player.name} como eliminado?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Eliminar',
            style: 'destructive',
            onPress: () => {
              onAction(player.id, actionId);
              onClose();
            },
          },
        ],
      );
      return;
    }
    onAction(player.id, actionId);
    onClose();
  };

  const adjustCounter = (counterId: string, delta: number) => {
    onCounter(player.id, counterId, delta);
    onClose();
  };

  const adjustCommanderDamage = (delta: number) => {
    if (!commanderSourceId) return;
    onCommanderDamage(player.id, commanderSourceId, delta);
    onClose();
  };

  const adjustPoison = (delta: number) => {
    onPoison(player.id, delta);
    onClose();
  };

  const adjustMulligan = (delta: number) => {
    onMulligan(player.id, delta);
    onClose();
  };

  return (
    <Sheet
      visible={visible}
      title={player.name}
      subtitle={`${player.life} vidas · Asiento ${seatIndex}`}
      onClose={onClose}>
      {commanderArt ? (
        <View style={styles.artBanner}>
          <Image source={{ uri: commanderArt }} style={styles.artImage} resizeMode="cover" />
          <View style={styles.artOverlay} />
          {player.commanderName ? (
            <Text style={styles.artLabel}>{player.commanderName}</Text>
          ) : null}
        </View>
      ) : null}

      <View style={styles.tabBar}>
        <Pressable
          onPress={() => setTab('actions')}
          style={[styles.tab, tab === 'actions' && styles.tabActive]}>
          <Text style={[styles.tabText, tab === 'actions' && styles.tabTextActive]}>
            Acciones
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setTab('counters')}
          style={[styles.tab, tab === 'counters' && styles.tabActive]}>
          <Text style={[styles.tabText, tab === 'counters' && styles.tabTextActive]}>
            Contadores
          </Text>
        </Pressable>
      </View>

      {tab === 'actions' ? (
        <View style={styles.section}>
          <PlayerActionGrid
            onAction={handleGridAction}
            isEliminated={player.isEliminated}
            isMonarch={isMonarch}
            hiddenActions={['commander-damage']}
          />
        </View>
      ) : (
        <View style={styles.section}>
          <CounterGrid
            counters={game.setup.genericCounters}
            player={player}
            onAdjust={adjustCounter}
          />
        </View>
      )}

      <View style={styles.divider} />

      <Text style={styles.sectionLabel}>Mulligans</Text>
      <CounterRow
        label="Mulligans usados"
        icon="🃏"
        value={player.mulligans}
        onDecrement={() => adjustMulligan(-1)}
        onIncrement={() => adjustMulligan(1)}
      />

      <Text style={styles.sectionLabel}>Daño de comandante</Text>
      <Text style={styles.hint}>Oponente atacante</Text>
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
          onDecrement={() => adjustCommanderDamage(-1)}
          onIncrement={() => adjustCommanderDamage(1)}
        />
      ) : null}

      <Text style={styles.sectionLabel}>Veneno</Text>
      <CounterRow
        label="Contadores de veneno"
        icon="☠"
        value={player.poison}
        danger={player.poison >= layout.poisonLethal}
        warning={poisonDanger}
        onDecrement={() => adjustPoison(-1)}
        onIncrement={() => adjustPoison(1)}
      />
    </Sheet>
  );
}

const styles = StyleSheet.create({
  artBanner: {
    height: 88,
    borderRadius: radius.lg,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    padding: spacing.md,
  },
  artImage: {
    ...StyleSheet.absoluteFillObject,
  },
  artOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  artLabel: {
    fontFamily: typography.fontFamily.sansSemiBold,
    fontSize: typography.fontSize.sm,
    color: palette.textPrimary,
    zIndex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: palette.backgroundElevated,
    borderRadius: radius.lg,
    padding: 4,
    gap: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: palette.surface,
  },
  tabText: {
    fontFamily: typography.fontFamily.sansMedium,
    fontSize: typography.fontSize.sm,
    color: palette.textMuted,
  },
  tabTextActive: {
    color: palette.textPrimary,
  },
  section: {
    gap: spacing.sm,
  },
  sectionLabel: {
    fontFamily: typography.fontFamily.sansSemiBold,
    fontSize: 10,
    letterSpacing: 2,
    color: palette.textMuted,
    textTransform: 'uppercase',
    marginTop: spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: palette.border,
    marginVertical: spacing.sm,
  },
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
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: palette.border,
    padding: spacing.md,
    alignItems: 'center',
    gap: 6,
  },
  opponentSelected: {
    borderColor: palette.commander,
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
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
});
