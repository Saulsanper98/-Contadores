import { Image, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { useCommanderArt } from '@/hooks/useCommanderArt';
import type { ManaIdentity } from '@/engine/types';
import { getManaPanelTheme } from '@/theme/manaTheme';

type CommanderArtBackgroundProps = {
  commanderName?: string;
  manaIdentity: ManaIdentity;
};

export function CommanderArtBackground({
  commanderName,
  manaIdentity,
}: CommanderArtBackgroundProps) {
  const artUri = useCommanderArt(commanderName);
  const theme = getManaPanelTheme(manaIdentity);

  return (
    <View style={StyleSheet.absoluteFill}>
      {artUri ? (
        <Image source={{ uri: artUri }} style={styles.art} resizeMode="cover" />
      ) : (
        <LinearGradient
          colors={theme.gradient}
          locations={[0, 0.45, 1]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      )}

      <LinearGradient
        colors={[
          'rgba(0, 0, 0, 0.1)',
          'rgba(0, 0, 0, 0.45)',
          'rgba(6, 9, 15, 0.88)',
        ]}
        locations={[0, 0.55, 1]}
        style={StyleSheet.absoluteFill}
      />

      {!artUri ? (
        <View style={[styles.glowOrb, { backgroundColor: theme.glow }]} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  art: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.95,
    transform: [{ scale: 1.08 }],
  },
  glowOrb: {
    position: 'absolute',
    top: '18%',
    alignSelf: 'center',
    width: '70%',
    height: '35%',
    borderRadius: 999,
    opacity: 0.18,
  },
});
