import { StyleSheet, Text, View } from 'react-native';

import { ManaIdentityPicker } from '@/components/setup/ManaIdentityPicker';
import { TextField } from '@/components/ui/TextField';
import { manaColors, palette, radius, spacing, typography } from '@/theme';
import type { PlayerSetup } from '@/engine/types';

type PlayerConfigCardProps = {
  index: number;
  player: PlayerSetup;
  onChange: (patch: Partial<Pick<PlayerSetup, 'name' | 'manaIdentity'>>) => void;
};

export function PlayerConfigCard({ index, player, onChange }: PlayerConfigCardProps) {
  const accent = manaColors[player.manaIdentity].glow;

  return (
    <View style={[styles.card, { borderColor: accent }]}>
      <View style={styles.header}>
        <Text style={styles.seat}>Asiento {index + 1}</Text>
        <View style={[styles.dot, { backgroundColor: manaColors[player.manaIdentity].primary }]} />
      </View>

      <TextField
        label="Nombre"
        value={player.name}
        onChangeText={(name) => onChange({ name })}
        placeholder={`Jugador ${index + 1}`}
      />

      <View style={styles.identityBlock}>
        <Text style={styles.identityLabel}>Identidad de color</Text>
        <ManaIdentityPicker
          value={player.manaIdentity}
          onChange={(manaIdentity) => onChange({ manaIdentity })}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.md,
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  seat: {
    fontFamily: typography.fontFamily.sansSemiBold,
    fontSize: typography.fontSize.md,
    color: palette.textPrimary,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: palette.borderStrong,
  },
  identityBlock: {
    gap: spacing.xs,
  },
  identityLabel: {
    fontFamily: typography.fontFamily.sansMedium,
    fontSize: typography.fontSize.xs,
    color: palette.textSecondary,
  },
});
