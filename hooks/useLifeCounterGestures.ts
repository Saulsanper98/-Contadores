import { useCallback, useRef, useState } from 'react';
import { Gesture } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';

import { layout } from '@/theme/tokens';

const SWIPE_SMALL_THRESHOLD = 48;
const SWIPE_LARGE_THRESHOLD = 110;

type UseLifeCounterGesturesOptions = {
  panelHeight: number;
  disabled?: boolean;
  onCommitDelta: (delta: number) => void;
  onTryCombatStart?: (
    absoluteX: number,
    absoluteY: number,
    translationX: number,
    translationY: number,
  ) => boolean;
  onAttackDragMove?: (absoluteX: number, absoluteY: number) => void;
  onAttackDragEnd?: (absoluteX: number, absoluteY: number) => void;
};

export function useLifeCounterGestures({
  panelHeight,
  disabled = false,
  onCommitDelta,
  onTryCombatStart,
  onAttackDragMove,
  onAttackDragEnd,
}: UseLifeCounterGesturesOptions) {
  const [floatingDelta, setFloatingDelta] = useState<number | null>(null);
  const pendingRef = useRef(0);
  const repeatTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalMsRef = useRef<number>(layout.longPressIntervalMs);
  const panBaseRef = useRef(0);
  const signRef = useRef<1 | -1>(1);
  const combatActiveRef = useRef(false);

  const clearRepeat = useCallback(() => {
    if (repeatTimerRef.current) {
      clearTimeout(repeatTimerRef.current);
      repeatTimerRef.current = null;
    }
    intervalMsRef.current = layout.longPressIntervalMs;
  }, []);

  const flashDelta = useCallback((delta: number) => {
    setFloatingDelta(delta);
    setTimeout(() => setFloatingDelta(null), 350);
  }, []);

  const commitPending = useCallback(() => {
    if (pendingRef.current !== 0) {
      onCommitDelta(pendingRef.current);
      pendingRef.current = 0;
    }
    setFloatingDelta(null);
    clearRepeat();
  }, [clearRepeat, onCommitDelta]);

  const addPending = useCallback((amount: number) => {
    pendingRef.current += amount;
    setFloatingDelta(pendingRef.current);
  }, []);

  const resolveSign = useCallback(
    (y: number): 1 | -1 => {
      if (panelHeight <= 0) return 1;
      return y < panelHeight / 2 ? 1 : -1;
    },
    [panelHeight],
  );

  const handleTap = useCallback(
    (y: number) => {
      if (disabled) return;
      const delta = resolveSign(y);
      onCommitDelta(delta);
      flashDelta(delta);
    },
    [disabled, flashDelta, onCommitDelta, resolveSign],
  );

  const scheduleRepeatTick = useCallback(() => {
    addPending(signRef.current);
    intervalMsRef.current = Math.max(60, intervalMsRef.current * 0.88);
    repeatTimerRef.current = setTimeout(scheduleRepeatTick, intervalMsRef.current);
  }, [addPending]);

  const startRepeat = useCallback(
    (y: number) => {
      if (disabled) return;
      signRef.current = resolveSign(y);
      clearRepeat();
      addPending(signRef.current);
      repeatTimerRef.current = setTimeout(scheduleRepeatTick, intervalMsRef.current);
    },
    [addPending, clearRepeat, disabled, resolveSign, scheduleRepeatTick],
  );

  const swipeMagnitude = useCallback((translationY: number) => {
    const abs = Math.abs(translationY);
    if (abs < SWIPE_SMALL_THRESHOLD) return 0;
    return abs >= SWIPE_LARGE_THRESHOLD ? layout.swipeDeltaLarge : layout.swipeDeltaSmall;
  }, []);

  const handlePanUpdate = useCallback(
    (translationY: number) => {
      if (disabled) return;
      const magnitude = swipeMagnitude(translationY);
      if (magnitude === 0) {
        pendingRef.current = panBaseRef.current;
        setFloatingDelta(panBaseRef.current || null);
        return;
      }
      const sign = translationY < 0 ? 1 : -1;
      const total = panBaseRef.current + sign * magnitude;
      pendingRef.current = total;
      setFloatingDelta(total);
    },
    [disabled, swipeMagnitude],
  );

  const handleGestureStart = useCallback(() => {
    panBaseRef.current = pendingRef.current;
    combatActiveRef.current = false;
  }, []);

  const handleGestureUpdate = useCallback(
    (absoluteX: number, absoluteY: number, translationX: number, translationY: number) => {
      if (disabled) return;

      if (!combatActiveRef.current && onTryCombatStart) {
        const started = onTryCombatStart(absoluteX, absoluteY, translationX, translationY);
        if (started) combatActiveRef.current = true;
      }

      if (combatActiveRef.current) {
        onAttackDragMove?.(absoluteX, absoluteY);
        return;
      }

      handlePanUpdate(translationY);
    },
    [disabled, handlePanUpdate, onAttackDragMove, onTryCombatStart],
  );

  const handleGestureEnd = useCallback(
    (
      absoluteX: number,
      absoluteY: number,
      translationX: number,
      translationY: number,
    ) => {
      if (disabled) return;

      if (!combatActiveRef.current && onTryCombatStart) {
        const started = onTryCombatStart(
          absoluteX,
          absoluteY,
          translationX,
          translationY,
        );
        if (started) combatActiveRef.current = true;
      }

      if (combatActiveRef.current) {
        onAttackDragMove?.(absoluteX, absoluteY);
        onAttackDragEnd?.(absoluteX, absoluteY);
        combatActiveRef.current = false;
        panBaseRef.current = 0;
        return;
      }

      handlePanUpdate(translationY);
      commitPending();
      panBaseRef.current = 0;
    },
    [commitPending, disabled, handlePanUpdate, onAttackDragEnd, onAttackDragMove, onTryCombatStart],
  );

  const unifiedPan = Gesture.Pan()
    .minDistance(6)
    .enabled(!disabled)
    .onStart(() => {
      runOnJS(handleGestureStart)();
    })
    .onUpdate((event) => {
      runOnJS(handleGestureUpdate)(
        event.absoluteX,
        event.absoluteY,
        event.translationX,
        event.translationY,
      );
    })
    .onEnd((event) => {
      runOnJS(handleGestureEnd)(
        event.absoluteX,
        event.absoluteY,
        event.translationX,
        event.translationY,
      );
    });

  const lifeExclusive = Gesture.Exclusive(
    Gesture.LongPress()
      .minDuration(280)
      .enabled(!disabled)
      .onStart((event) => {
        runOnJS(startRepeat)(event.y);
      })
      .onFinalize(() => {
        runOnJS(commitPending)();
      }),
    unifiedPan,
    Gesture.Tap()
      .enabled(!disabled)
      .onEnd((event) => {
        runOnJS(handleTap)(event.y);
      }),
  );

  return { gesture: lifeExclusive, floatingDelta };
}
