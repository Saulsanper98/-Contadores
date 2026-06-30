import { useCallback, useRef, useState } from 'react';
import { Gesture } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';

import { layout } from '@/theme/tokens';

const SWIPE_SMALL_THRESHOLD = 40;
const SWIPE_LARGE_THRESHOLD = 100;

type UseLifeStripGesturesOptions = {
  disabled?: boolean;
  deltaSign: 1 | -1;
  onCommitDelta: (delta: number) => void;
};

export function useLifeStripGestures({
  disabled = false,
  deltaSign,
  onCommitDelta,
}: UseLifeStripGesturesOptions) {
  const [floatingDelta, setFloatingDelta] = useState<number | null>(null);
  const pendingRef = useRef(0);
  const repeatTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalMsRef = useRef<number>(layout.longPressIntervalMs);
  const panBaseRef = useRef(0);

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

  const handleTap = useCallback(() => {
    if (disabled) return;
    onCommitDelta(deltaSign);
    flashDelta(deltaSign);
  }, [deltaSign, disabled, flashDelta, onCommitDelta]);

  const scheduleRepeatTick = useCallback(() => {
    addPending(deltaSign);
    intervalMsRef.current = Math.max(60, intervalMsRef.current * 0.88);
    repeatTimerRef.current = setTimeout(scheduleRepeatTick, intervalMsRef.current);
  }, [addPending, deltaSign]);

  const startRepeat = useCallback(() => {
    if (disabled) return;
    clearRepeat();
    addPending(deltaSign);
    repeatTimerRef.current = setTimeout(scheduleRepeatTick, intervalMsRef.current);
  }, [addPending, clearRepeat, disabled, deltaSign, scheduleRepeatTick]);

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
      const total = panBaseRef.current + sign * magnitude * deltaSign;
      pendingRef.current = total;
      setFloatingDelta(total);
    },
    [deltaSign, disabled, swipeMagnitude],
  );

  const gesture = Gesture.Exclusive(
    Gesture.LongPress()
      .minDuration(260)
      .enabled(!disabled)
      .onStart(() => {
        runOnJS(startRepeat)();
      })
      .onFinalize(() => {
        runOnJS(commitPending)();
      }),
    Gesture.Pan()
      .activeOffsetY([-10, 10])
      .failOffsetX([-24, 24])
      .enabled(!disabled)
      .onStart(() => {
        panBaseRef.current = pendingRef.current;
      })
      .onUpdate((event) => {
        runOnJS(handlePanUpdate)(event.translationY);
      })
      .onEnd((event) => {
        runOnJS(handlePanUpdate)(event.translationY);
        runOnJS(commitPending)();
        panBaseRef.current = 0;
      }),
    Gesture.Tap()
      .enabled(!disabled)
      .onEnd(() => {
        runOnJS(handleTap)();
      }),
  );

  return { gesture, floatingDelta };
}
