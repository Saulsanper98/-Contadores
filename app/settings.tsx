import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { Section } from '@/components/ui/Section';
import { TextField } from '@/components/ui/TextField';
import { useSettingsStore } from '@/store/settingsStore';
import { palette, spacing, typography } from '@/theme';

export default function SettingsScreen() {
  const settings = useSettingsStore();

  return (
    <Screen>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Ajustes</Text>

        <Section title="Experiencia">
          <Row label="Sonidos" value={settings.soundsEnabled} onChange={settings.setSoundsEnabled} />
          <Row label="Haptics" value={settings.hapticsEnabled} onChange={settings.setHapticsEnabled} />
          <Row label="Efectos on-hit" value={settings.effectsEnabled} onChange={settings.setEffectsEnabled} />
          <Row
            label="Reducir movimiento"
            value={settings.reducedMotionOverride ?? false}
            onChange={(v) => settings.setReducedMotionOverride(v)}
          />
        </Section>

        <Section title="Sincronización (beta)">
          <Row label="Sync con web" value={settings.syncEnabled} onChange={settings.setSyncEnabled} />
          <TextField
            label="URL del backend"
            value={settings.syncApiUrl}
            onChangeText={settings.setSyncApiUrl}
            autoCapitalize="none"
          />
          <Text style={styles.hint}>
            Requiere el servidor web en ejecución (carpeta /web). Las partidas se suben como eventos.
          </Text>
        </Section>

        <Button label="Volver" variant="ghost" onPress={() => router.back()} />
      </ScrollView>
    </Screen>
  );
}

function Row({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Switch value={value} onValueChange={onChange} />
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { gap: spacing.lg, paddingBottom: spacing.xxxl },
  title: {
    fontFamily: typography.fontFamily.sansBold,
    fontSize: typography.fontSize.xxl,
    color: palette.textPrimary,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowLabel: {
    fontFamily: typography.fontFamily.sansMedium,
    fontSize: typography.fontSize.md,
    color: palette.textPrimary,
  },
  hint: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.sm,
    color: palette.textMuted,
  },
});
