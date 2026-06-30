import { useCallback, useRef } from 'react';
import { Gesture } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';

type UseCombatPanGesturesOptions = {
  disabled?: boolean;
  onTryCombatStart?: (
    absoluteX: number,
    absoluteY: number,
    translationX: number,
    translationY: number,
  ) => boolean;
  onAttackDragMove?: (absoluteX: number, absoluteY: number) => void;
  onAttackDragEnd?: (absoluteX: number, absoluteY: number) => void;
};

export function useCombatPanGestures({
  disabled = false,
  onTryCombatStart,
  onAttackDragMove,
  onAttackDragEnd,
}: UseCombatPanGesturesOptions) {
  const combatActiveRef = useRef(false);

  const handleStart = useCallback(() => {
    combatActiveRef.current = false;
  }, []);

  const handleUpdate = useCallback(
    (absoluteX: number, absoluteY: number, translationX: number, translationY: number) => {
      if (disabled) return;

      if (!combatActiveRef.current && onTryCombatStart) {
        const started = onTryCombatStart(absoluteX, absoluteY, translationX, translationY);
        if (started) combatActiveRef.current = true;
      }

      if (combatActiveRef.current) {
        onAttackDragMove?.(absoluteX, absoluteY);
      }
    },
    [disabled, onAttackDragMove, onTryCombatStart],
  );

  const handleEnd = useCallback(
    (absoluteX: number, absoluteY: number, translationX: number, translationY: number) => {
      if (disabled) return;

      if (!combatActiveRef.current && onTryCombatStart) {
        const started = onTryCombatStart(absoluteX, absoluteY, translationX, translationY);
        if (started) combatActiveRef.current = true;
      }

      if (combatActiveRef.current) {
        onAttackDragMove?.(absoluteX, absoluteY);
        onAttackDragEnd?.(absoluteX, absoluteY);
        combatActiveRef.current = false;
      }
    },
    [disabled, onAttackDragEnd, onAttackDragMove, onTryCombatStart],
  );

  const gesture = Gesture.Pan()
    .minDistance(4)
    .enabled(!disabled)
    .onStart(() => {
      runOnJS(handleStart)();
    })
    .onUpdate((event) => {
      runOnJS(handleUpdate)(
        event.absoluteX,
        event.absoluteY,
        event.translationX,
        event.translationY,
      );
    })
    .onEnd((event) => {
      runOnJS(handleEnd)(
        event.absoluteX,
        event.absoluteY,
        event.translationX,
        event.translationY,
      );
    });

  return { gesture };
}
