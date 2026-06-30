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
  onAttackDragStart?: (absoluteX: number, absoluteY: number) => void;
  onAttackDragMove?: (absoluteX: number, absoluteY: number) => void;
  onAttackDragEnd?: (absoluteX: number, absoluteY: number) => void;
};

export function useLifeCounterGestures({
  panelHeight,
  disabled = false,
  onCommitDelta,
  onAttackDragStart,
  onAttackDragMove,
  onAttackDragEnd,
}: UseLifeCounterGesturesOptions) {
  const [floatingDelta, setFloatingDelta] = useState<number | null>(null);
  const pendingRef = useRef(0);
  const repeatTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalMsRef = useRef<number>(layout.longPressIntervalMs);
  const panBaseRef = useRef(0);
  const signRef = useRef<1 | -1>(1);

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

  const handlePanStart = useCallback(() => {
    panBaseRef.current = pendingRef.current;
  }, []);

  const handlePanEnd = useCallback(
    (translationY: number) => {
      if (disabled) return;
      handlePanUpdate(translationY);
      commitPending();
      panBaseRef.current = 0;
    },
    [commitPending, disabled, handlePanUpdate],
  );

  const lifePan = Gesture.Pan()
    .activeOffsetY([-12, 12])
    .failOffsetX([-28, 28])
    .enabled(!disabled)
    .onStart(() => {
      runOnJS(handlePanStart)();
    })
    .onUpdate((event) => {
      runOnJS(handlePanUpdate)(event.translationY);
    })
    .onEnd((event) => {
      runOnJS(handlePanEnd)(event.translationY);
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
    lifePan,
    Gesture.Tap()
      .enabled(!disabled)
      .onEnd((event) => {
        runOnJS(handleTap)(event.y);
      }),
  );

  const attackPan =
    onAttackDragStart && onAttackDragMove && onAttackDragEnd
      ? Gesture.Pan()
          .activeOffsetX([-24, 24])
          .failOffsetY([-20, 20])
          .enabled(!disabled)
          .onStart((event) => {
            runOnJS(onAttackDragStart)(event.absoluteX, event.absoluteY);
          })
          .onUpdate((event) => {
            runOnJS(onAttackDragMove)(event.absoluteX, event.absoluteY);
          })
          .onEnd((event) => {
            runOnJS(onAttackDragEnd)(event.absoluteX, event.absoluteY);
          })
      : null;

  const gesture = attackPan ? Gesture.Race(attackPan, lifeExclusive) : lifeExclusive;

  return { gesture, floatingDelta };
}
