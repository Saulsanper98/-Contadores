import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { ManaIdentityPicker } from '@/components/setup/ManaIdentityPicker';
import { CommanderArtBackground } from '@/components/board/CommanderArtBackground';
import { TextField } from '@/components/ui/TextField';
import { getManaPanelTheme } from '@/theme/manaTheme';
import { palette, radius, spacing, typography } from '@/theme';
import type { PlayerSetup } from '@/engine/types';

type PlayerConfigCardProps = {
  index: number;
  player: PlayerSetup;
  onChange: (
    patch: Partial<Pick<PlayerSetup, 'name' | 'manaIdentity' | 'isGuest' | 'commanderName' | 'deckTheme'>>,
  ) => void;
};

export function PlayerConfigCard({ index, player, onChange }: PlayerConfigCardProps) {
  const theme = getManaPanelTheme(player.manaIdentity);

  return (
    <View style={styles.card}>
      <LinearGradient
        colors={[theme.gradient[0], 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradientAccent}
      />
      <View style={styles.inner}>
        <View style={styles.header}>
          <Text style={styles.seat}>Jugador {index + 1}</Text>
          <View style={styles.headerRight}>
            {player.isGuest ? <Text style={styles.guestBadge}>INVITADO</Text> : null}
            <View style={[styles.dot, { backgroundColor: theme.accent }]} />
          </View>
        </View>

        <TextField
          label="Nombre en la mesa"
          value={player.name}
          onChangeText={(name) => onChange({ name })}
          placeholder={`Jugador ${index + 1}`}
        />

        <TextField
          label="Comandante (opcional)"
          value={player.commanderName ?? ''}
          onChangeText={(commanderName) => onChange({ commanderName })}
          placeholder="Nombre del comandante"
        />

        {player.commanderName?.trim() ? (
          <View style={styles.preview}>
            <CommanderArtBackground
              commanderName={player.commanderName}
              manaIdentity={player.manaIdentity}
            />
            <Text style={styles.previewLabel}>{player.commanderName}</Text>
          </View>
        ) : null}

        <View style={styles.guestRow}>
          <Text style={styles.guestLabel}>Jugador invitado (sin cuenta)</Text>
          <Switch
            value={player.isGuest ?? false}
            onValueChange={(isGuest) => onChange({ isGuest })}
          />
        </View>

        <View style={styles.identityBlock}>
          <Text style={styles.identityLabel}>Color del mazo</Text>
          <ManaIdentityPicker
            value={player.manaIdentity}
            onChange={(manaIdentity) => onChange({ manaIdentity })}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.surface,
    overflow: 'hidden',
  },
  gradientAccent: { height: 4, width: '100%' },
  inner: { padding: spacing.lg, gap: spacing.md },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  seat: {
    fontFamily: typography.fontFamily.sansSemiBold,
    fontSize: typography.fontSize.md,
    color: palette.textPrimary,
  },
  guestBadge: {
    fontFamily: typography.fontFamily.sansSemiBold,
    fontSize: 9,
    letterSpacing: 1,
    color: palette.warning,
  },
  dot: { width: 10, height: 10, borderRadius: 5 },
  preview: {
    height: 96,
    borderRadius: radius.lg,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    padding: spacing.md,
    borderWidth: 1,
    borderColor: palette.border,
  },
  previewLabel: {
    fontFamily: typography.fontFamily.sansSemiBold,
    fontSize: typography.fontSize.sm,
    color: palette.textPrimary,
    zIndex: 1,
  },
  guestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  guestLabel: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.sm,
    color: palette.textSecondary,
  },
  identityBlock: { gap: spacing.sm },
  identityLabel: {
    fontFamily: typography.fontFamily.sansMedium,
    fontSize: typography.fontSize.xs,
    color: palette.textMuted,
    letterSpacing: 0.5,
  },
});
