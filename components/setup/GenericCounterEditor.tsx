import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { TextField } from '@/components/ui/TextField';
import { PRESET_COUNTERS, presetToCounter } from '@/data/presetCounters';
import { palette, radius, spacing, typography } from '@/theme';
import type { GenericCounterDef } from '@/engine/types';

type GenericCounterEditorProps = {
  counters: GenericCounterDef[];
  onAdd: (name: string, icon: string) => void;
  onRemove: (counterId: string) => void;
  onTogglePreset: (presetId: string, enabled: boolean) => void;
};

export function GenericCounterEditor({
  counters,
  onAdd,
  onRemove,
  onTogglePreset,
}: GenericCounterEditorProps) {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('★');
  const [editMode, setEditMode] = useState(false);

  const enabledPresetIds = new Set(
    counters.filter((c) => c.presetId).map((c) => c.presetId as string),
  );

  const customCounters = counters.filter((c) => !c.presetId);

  const handleAdd = () => {
    onAdd(name, icon);
    setName('');
    setIcon('★');
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>Contadores personalizados</Text>
          <Text style={styles.hint}>
            Activa los que uses en tu mesa. Toca ✎ para editar.
          </Text>
        </View>
        <Pressable
          onPress={() => setEditMode((v) => !v)}
          style={[styles.editBtn, editMode && styles.editBtnActive]}>
          <Text style={styles.editBtnText}>{editMode ? '✓' : '✎'}</Text>
        </Pressable>
      </View>

      <View style={styles.presetGrid}>
        {PRESET_COUNTERS.map((preset) => {
          const enabled = enabledPresetIds.has(preset.presetId);
          return (
            <Pressable
              key={preset.presetId}
              onPress={() => {
                if (!editMode) return;
                onTogglePreset(preset.presetId, !enabled);
              }}
              style={[
                styles.presetChip,
                enabled && styles.presetChipEnabled,
                !editMode && !enabled && styles.presetChipDisabled,
              ]}>
              <Text style={styles.presetIcon}>{preset.icon}</Text>
              <Text
                style={[
                  styles.presetLabel,
                  enabled && styles.presetLabelEnabled,
                ]}
                numberOfLines={1}>
                {preset.name}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {customCounters.length > 0 ? (
        <View style={styles.list}>
          <Text style={styles.subtitle}>Personalizados</Text>
          {customCounters.map((counter) => (
            <View key={counter.id} style={styles.item}>
              <Text style={styles.itemIcon}>{counter.icon}</Text>
              <Text style={styles.itemName}>{counter.name}</Text>
              {editMode ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Eliminar ${counter.name}`}
                  onPress={() => onRemove(counter.id)}
                  style={styles.remove}>
                  <Text style={styles.removeText}>✕</Text>
                </Pressable>
              ) : null}
            </View>
          ))}
        </View>
      ) : null}

      {editMode ? (
        <View style={styles.customForm}>
          <Text style={styles.subtitle}>Añadir personalizado</Text>
          <View style={styles.formRow}>
            <TextField
              label="Icono"
              value={icon}
              onChangeText={setIcon}
              style={styles.iconInput}
              maxLength={2}
            />
            <TextField
              label="Nombre"
              value={name}
              onChangeText={setName}
              style={styles.nameInput}
              placeholder="Experiencia"
            />
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={handleAdd}
            style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}>
            <Text style={styles.addLabel}>+ Añadir contador</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

// Export helper for store
export { presetToCounter };

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  title: {
    fontFamily: typography.fontFamily.sansSemiBold,
    fontSize: typography.fontSize.lg,
    color: palette.textPrimary,
  },
  hint: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.sm,
    color: palette.textMuted,
    marginTop: 2,
  },
  editBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editBtnActive: {
    borderColor: palette.success,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  editBtnText: {
    fontSize: typography.fontSize.md,
    color: palette.textPrimary,
  },
  presetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  presetChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: palette.border,
    backgroundColor: palette.backgroundElevated,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    maxWidth: '48%',
  },
  presetChipEnabled: {
    borderColor: palette.success,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
  },
  presetChipDisabled: {
    opacity: 0.45,
  },
  presetIcon: {
    fontSize: typography.fontSize.md,
  },
  presetLabel: {
    fontFamily: typography.fontFamily.sansMedium,
    fontSize: typography.fontSize.xs,
    color: palette.textMuted,
    flexShrink: 1,
  },
  presetLabelEnabled: {
    color: palette.textPrimary,
  },
  subtitle: {
    fontFamily: typography.fontFamily.sansSemiBold,
    fontSize: typography.fontSize.sm,
    color: palette.textSecondary,
  },
  list: {
    gap: spacing.sm,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: palette.backgroundElevated,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  itemIcon: {
    fontSize: typography.fontSize.lg,
  },
  itemName: {
    flex: 1,
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.md,
    color: palette.textPrimary,
  },
  remove: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeText: {
    color: palette.danger,
    fontSize: typography.fontSize.md,
  },
  customForm: {
    gap: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: palette.border,
  },
  formRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  iconInput: {
    width: 72,
    textAlign: 'center',
  },
  nameInput: {
    flex: 1,
  },
  addButton: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: palette.accentMuted,
    borderWidth: 1,
    borderColor: palette.border,
  },
  pressed: {
    opacity: 0.85,
  },
  addLabel: {
    fontFamily: typography.fontFamily.sansMedium,
    fontSize: typography.fontSize.sm,
    color: palette.accent,
  },
});
