import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { ManaIdentityPicker } from '@/components/setup/ManaIdentityPicker';
import { TextField } from '@/components/ui/TextField';
import { getManaPanelTheme, palette, radius, spacing, typography } from '@/theme';
import type { PlayerSetup } from '@/engine/types';

type PlayerConfigCardProps = {
  index: number;
  player: PlayerSetup;
  onChange: (patch: Partial<Pick<PlayerSetup, 'name' | 'manaIdentity'>>) => void;
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
          <View style={[styles.dot, { backgroundColor: theme.accent }]} />
        </View>

        <TextField
          label="Nombre en la mesa"
          value={player.name}
          onChangeText={(name) => onChange({ name })}
          placeholder={`Jugador ${index + 1}`}
        />

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
  gradientAccent: {
    height: 4,
    width: '100%',
  },
  inner: {
    padding: spacing.lg,
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
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  identityBlock: {
    gap: spacing.sm,
  },
  identityLabel: {
    fontFamily: typography.fontFamily.sansMedium,
    fontSize: typography.fontSize.xs,
    color: palette.textMuted,
    letterSpacing: 0.5,
  },
});
