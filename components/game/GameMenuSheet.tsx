import { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Section } from '@/components/ui/Section';
import { Sheet } from '@/components/ui/Sheet';
import { palette, spacing, typography } from '@/theme';

function formatElapsed(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${m}:${String(s).padStart(2, '0')}`;
}

type GameMenuSheetProps = {
  visible: boolean;
  onClose: () => void;
  gameStartedAt: number | null;
  canUndo: boolean;
  onUndo: () => void;
  onRestart: () => void;
  onNewGame: () => void;
  onExit: () => void;
};

export function GameMenuSheet({
  visible,
  onClose,
  gameStartedAt,
  canUndo,
  onUndo,
  onRestart,
  onNewGame,
  onExit,
}: GameMenuSheetProps) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!visible || !gameStartedAt) return;
    const tick = () => setElapsed(Date.now() - gameStartedAt);
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [visible, gameStartedAt]);

  const confirmRestart = () => {
    Alert.alert('Reiniciar partida', '¿Volver a la vida inicial con la misma configuración?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Reiniciar',
        onPress: () => {
          onRestart();
          onClose();
        },
      },
    ]);
  };

  const confirmExit = () => {
    Alert.alert('Salir', 'La partida se guarda automáticamente. ¿Salir al inicio?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Salir', style: 'destructive', onPress: onExit },
    ]);
  };

  return (
    <Sheet visible={visible} title="Partida" subtitle="Opciones de mesa" onClose={onClose}>
      {gameStartedAt ? (
        <Section title="Tiempo de partida">
          <Text style={styles.timer}>{formatElapsed(elapsed)}</Text>
        </Section>
      ) : null}

      <Section title="Acciones">
        <Button label="↩ Deshacer último cambio" variant="secondary" disabled={!canUndo} onPress={onUndo} />
        <Button label="↻ Reiniciar (misma config)" variant="secondary" onPress={confirmRestart} />
        <Button label="＋ Nueva partida" variant="secondary" onPress={onNewGame} />
        <Button label="Salir al inicio" variant="ghost" onPress={confirmExit} />
      </Section>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  timer: {
    fontFamily: typography.fontFamily.monoBold,
    fontSize: typography.fontSize.xxl,
    color: palette.textPrimary,
    textAlign: 'center',
    paddingVertical: spacing.sm,
  },
});
