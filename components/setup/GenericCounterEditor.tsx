import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { TextField } from '@/components/ui/TextField';
import { palette, radius, spacing, typography } from '@/theme';
import type { GenericCounterDef } from '@/engine/types';

type GenericCounterEditorProps = {
  counters: GenericCounterDef[];
  onAdd: (name: string, icon: string) => void;
  onRemove: (counterId: string) => void;
};

export function GenericCounterEditor({ counters, onAdd, onRemove }: GenericCounterEditorProps) {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('★');

  const handleAdd = () => {
    onAdd(name, icon);
    setName('');
    setIcon('★');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Contadores genéricos</Text>
      <Text style={styles.hint}>Experiencia, energía, +1/+1, etc.</Text>

      {counters.length > 0 && (
        <View style={styles.list}>
          {counters.map((counter) => (
            <View key={counter.id} style={styles.item}>
              <Text style={styles.itemIcon}>{counter.icon}</Text>
              <Text style={styles.itemName}>{counter.name}</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Eliminar ${counter.name}`}
                onPress={() => onRemove(counter.id)}
                style={styles.remove}>
                <Text style={styles.removeText}>✕</Text>
              </Pressable>
            </View>
          ))}
        </View>
      )}

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
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  title: {
    fontFamily: typography.fontFamily.sansSemiBold,
    fontSize: typography.fontSize.md,
    color: palette.textPrimary,
  },
  hint: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.sm,
    color: palette.textMuted,
  },
  list: {
    gap: spacing.sm,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: palette.backgroundElevated,
    borderRadius: radius.md,
    padding: spacing.sm,
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
    borderRadius: radius.md,
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
