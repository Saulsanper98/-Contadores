import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { CounterRow } from '@/components/ui/CounterRow';
import { Section } from '@/components/ui/Section';
import { Sheet } from '@/components/ui/Sheet';
import { Button } from '@/components/ui/Button';
import { flipCoin, pickRandomIndex, rollD6, rollD20 } from '@/engine/tools';
import type { GameState } from '@/engine/types';
import { palette, spacing, typography } from '@/theme';

type GroupToolsSheetProps = {
  visible: boolean;
  game: GameState;
  onClose: () => void;
  onDamageAll: (amount: number) => void;
  onHealAll: (amount: number) => void;
  onSetAllLife: (life: number) => void;
  onToast: (title: string, subtitle?: string) => void;
};

export function GroupToolsSheet({
  visible,
  game,
  onClose,
  onDamageAll,
  onHealAll,
  onSetAllLife,
  onToast,
}: GroupToolsSheetProps) {
  const [groupAmount, setGroupAmount] = useState(1);
  const [setLifeValue, setSetLifeValue] = useState(game.setup.startingLife);

  const bump = (setter: (n: number) => void, current: number, delta: number, min = 0, max = 99) => {
    setter(Math.min(max, Math.max(min, current + delta)));
  };

  const rollAndToast = (label: string, value: string | number) => {
    onToast(String(value), label);
    onClose();
  };

  const randomStarter = () => {
    const index = pickRandomIndex(game.players.length);
    const player = game.players[index];
    onToast(player.name, 'Empieza la partida');
    onClose();
  };

  return (
    <Sheet visible={visible} title="Mesa" subtitle="Acciones globales y herramientas" onClose={onClose}>
      <Section title="Vida de todos">
        <CounterRow
          label="Cantidad"
          value={groupAmount}
          onDecrement={() => bump(setGroupAmount, groupAmount, -1, 1)}
          onIncrement={() => bump(setGroupAmount, groupAmount, 1, 1)}
        />
        <View style={styles.row}>
          <Button
            label={`−${groupAmount} a todos`}
            variant="secondary"
            style={styles.flex}
            onPress={() => { onDamageAll(groupAmount); onClose(); }}
          />
          <Button
            label={`+${groupAmount} a todos`}
            style={styles.flex}
            onPress={() => { onHealAll(groupAmount); onClose(); }}
          />
        </View>
        <CounterRow
          label="Fijar vida a"
          value={setLifeValue}
          onDecrement={() => bump(setSetLifeValue, setLifeValue, -1, 0)}
          onIncrement={() => bump(setSetLifeValue, setLifeValue, 1, 0)}
        />
        <Button
          label={`Fijar todos a ${setLifeValue}`}
          variant="secondary"
          onPress={() => { onSetAllLife(setLifeValue); onClose(); }}
        />
      </Section>

      <Section title="Herramientas">
        <View style={styles.toolsGrid}>
          <Button label="🎲 D6" variant="secondary" onPress={() => rollAndToast('Dado d6', rollD6())} />
          <Button label="🎲 D20" variant="secondary" onPress={() => rollAndToast('Dado d20', rollD20())} />
          <Button label="🪙 Moneda" variant="secondary" onPress={() => rollAndToast('Moneda', flipCoin())} />
          <Button label="🎯 Quién empieza" variant="secondary" onPress={randomStarter} />
        </View>
      </Section>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  flex: {
    flex: 1,
  },
  toolsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
});
