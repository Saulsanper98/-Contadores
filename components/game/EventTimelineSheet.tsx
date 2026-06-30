import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { TextField } from '@/components/ui/TextField';
import { Button } from '@/components/ui/Button';
import { Sheet } from '@/components/ui/Sheet';
import { formatEventTime } from '@/engine/events';
import type { GameEvent, GameState } from '@/engine/types';
import { formatClock } from '@/hooks/useLiveClock';
import { getPlayerTurnTotalMs } from '@/engine/turns';
import { palette, radius, spacing, typography } from '@/theme';

type EventTimelineSheetProps = {
  visible: boolean;
  game: GameState;
  onClose: () => void;
  onAddNote: (text: string) => void;
};

const EVENT_ICONS: Record<string, string> = {
  game_start: '▶',
  turn_pass: '↻',
  life_change: '♥',
  commander_damage: '⚔',
  poison_change: '☠',
  counter_change: '◆',
  combat_resolved: '💥',
  elimination: '✕',
  revive: '↺',
  monarch: '👑',
  group_damage: '☄',
  group_heal: '💚',
  note: '📝',
  dice_roll: '🎲',
  knockout: '💀',
  first_blood: '🩸',
  mulligan: '🃏',
  win_condition: '🏆',
  game_end: '🏆',
  action: '⚡',
};

function EventRow({
  event,
  gameStartedAt,
}: {
  event: GameEvent;
  gameStartedAt: number;
}) {
  const icon = EVENT_ICONS[event.kind] ?? '•';
  return (
    <View style={styles.eventRow}>
      <Text style={styles.eventIcon}>{icon}</Text>
      <View style={styles.eventBody}>
        <Text style={styles.eventMessage}>{event.message}</Text>
        <Text style={styles.eventTime}>{formatEventTime(event.at, gameStartedAt)}</Text>
      </View>
    </View>
  );
}

export function EventTimelineSheet({
  visible,
  game,
  onClose,
  onAddNote,
}: EventTimelineSheetProps) {
  const [note, setNote] = useState('');

  const events = useMemo(
    () => [...game.events].reverse(),
    [game.events],
  );

  const handleAddNote = () => {
    const trimmed = note.trim();
    if (!trimmed) return;
    onAddNote(trimmed);
    setNote('');
  };

  return (
    <Sheet
      visible={visible}
      title="Timeline"
      subtitle={`${events.length} eventos · turno ${game.turn.turnNumber}`}
      onClose={onClose}>
      <View style={styles.statsRow}>
        {game.players.map((player) => (
          <View key={player.id} style={styles.statChip}>
            <Text style={styles.statName} numberOfLines={1}>
              {player.name}
            </Text>
            <Text style={styles.statValue}>
              {formatClock(getPlayerTurnTotalMs(game, player.id))}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.noteBox}>
        <TextField
          label="Añadir nota"
          value={note}
          onChangeText={setNote}
          placeholder="Ej: Jugador 2 jugó Sol Ring T1"
        />
        <Button label="Guardar nota" onPress={handleAddNote} />
      </View>

      <View style={styles.list}>
        {events.map((event) => (
          <EventRow
            key={event.id}
            event={event}
            gameStartedAt={game.turn.gameStartedAt}
          />
        ))}
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  statChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.md,
    backgroundColor: palette.backgroundElevated,
    borderWidth: 1,
    borderColor: palette.border,
    minWidth: '30%',
    flexGrow: 1,
  },
  statName: {
    fontFamily: typography.fontFamily.sansMedium,
    fontSize: typography.fontSize.xs,
    color: palette.textMuted,
  },
  statValue: {
    fontFamily: typography.fontFamily.monoBold,
    fontSize: typography.fontSize.sm,
    color: palette.textPrimary,
  },
  noteBox: {
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
  },
  list: {
    gap: spacing.sm,
  },
  eventRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
  },
  eventIcon: {
    width: 28,
    textAlign: 'center',
    fontSize: typography.fontSize.md,
  },
  eventBody: {
    flex: 1,
    gap: 2,
  },
  eventMessage: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.sm,
    color: palette.textPrimary,
  },
  eventTime: {
    fontFamily: typography.fontFamily.mono,
    fontSize: typography.fontSize.xs,
    color: palette.textMuted,
  },
});
