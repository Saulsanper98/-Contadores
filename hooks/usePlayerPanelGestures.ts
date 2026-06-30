import { useCallback, useRef, useState } from 'react';
import { Gesture } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';

import { getPanelTouchZone } from '@/engine/panelTouchZones';
import { layout } from '@/theme/tokens';

const COMBAT_DRAG_THRESHOLD = 8;

type UsePlayerPanelGesturesOptions = {
  panelWidth: number;
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
  onOpenMenu?: () => void;
};

export function usePlayerPanelGestures({
  panelWidth,
  disabled = false,
  onCommitDelta,
  onTryCombatStart,
  onAttackDragMove,
  onAttackDragEnd,
  onOpenMenu,
}: UsePlayerPanelGesturesOptions) {
  const [leftFloatingDelta, setLeftFloatingDelta] = useState<number | null>(null);
  const [rightFloatingDelta, setRightFloatingDelta] = useState<number | null>(null);

  const pendingRef = useRef(0);
  const repeatTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalMsRef = useRef<number>(layout.longPressIntervalMs);
  const combatActiveRef = useRef(false);
  const repeatZoneRef = useRef<'left' | 'right' | null>(null);

  const clearRepeat = useCallback(() => {
    if (repeatTimerRef.current) {
      clearTimeout(repeatTimerRef.current);
      repeatTimerRef.current = null;
    }
    intervalMsRef.current = layout.longPressIntervalMs;
    repeatZoneRef.current = null;
  }, []);

  const setZoneDelta = useCallback((zone: 'left' | 'right', delta: number | null) => {
    if (zone === 'left') setLeftFloatingDelta(delta);
    else setRightFloatingDelta(delta);
  }, []);

  const flashDelta = useCallback(
    (zone: 'left' | 'right', delta: number) => {
      setZoneDelta(zone, delta);
      setTimeout(() => setZoneDelta(zone, null), 350);
    },
    [setZoneDelta],
  );

  const commitPending = useCallback(() => {
    if (pendingRef.current !== 0) {
      onCommitDelta(pendingRef.current);
      pendingRef.current = 0;
    }
    setLeftFloatingDelta(null);
    setRightFloatingDelta(null);
    clearRepeat();
  }, [clearRepeat, onCommitDelta]);

  const addPending = useCallback(
    (zone: 'left' | 'right', amount: number) => {
      pendingRef.current += amount;
      setZoneDelta(zone, pendingRef.current);
    },
    [setZoneDelta],
  );

  const handleTap = useCallback(
    (localX: number) => {
      if (disabled) return;
      const zone = getPanelTouchZone(localX, panelWidth);
      if (zone === 'left') {
        onCommitDelta(-1);
        flashDelta('left', -1);
      } else if (zone === 'right') {
        onCommitDelta(1);
        flashDelta('right', 1);
      }
    },
    [disabled, flashDelta, onCommitDelta, panelWidth],
  );

  const scheduleRepeatTick = useCallback(() => {
    const zone = repeatZoneRef.current;
    if (!zone) return;
    const sign = zone === 'left' ? -1 : 1;
    addPending(zone, sign);
    intervalMsRef.current = Math.max(60, intervalMsRef.current * 0.88);
    repeatTimerRef.current = setTimeout(scheduleRepeatTick, intervalMsRef.current);
  }, [addPending]);

  const startRepeat = useCallback(
    (localX: number) => {
      if (disabled) return;
      const zone = getPanelTouchZone(localX, panelWidth);
      if (zone !== 'left' && zone !== 'right') return;
      repeatZoneRef.current = zone;
      clearRepeat();
      repeatZoneRef.current = zone;
      const sign = zone === 'left' ? -1 : 1;
      addPending(zone, sign);
      repeatTimerRef.current = setTimeout(scheduleRepeatTick, intervalMsRef.current);
    },
    [addPending, clearRepeat, disabled, panelWidth, scheduleRepeatTick],
  );

  const handlePanStart = useCallback(() => {
    combatActiveRef.current = false;
    pendingRef.current = 0;
    setLeftFloatingDelta(null);
    setRightFloatingDelta(null);
  }, []);

  const handlePanUpdate = useCallback(
    (
      absoluteX: number,
      absoluteY: number,
      translationX: number,
      translationY: number,
    ) => {
      if (disabled) return;

      const distance = Math.hypot(translationX, translationY);

      if (!combatActiveRef.current && distance >= COMBAT_DRAG_THRESHOLD && onTryCombatStart) {
        const started = onTryCombatStart(absoluteX, absoluteY, translationX, translationY);
        if (started) {
          combatActiveRef.current = true;
          clearRepeat();
        }
      }

      if (combatActiveRef.current) {
        onAttackDragMove?.(absoluteX, absoluteY);
      }
    },
    [clearRepeat, disabled, onAttackDragMove, onTryCombatStart],
  );

  const handlePanEnd = useCallback(
    (
      absoluteX: number,
      absoluteY: number,
      translationX: number,
      translationY: number,
    ) => {
      if (disabled) return;

      const distance = Math.hypot(translationX, translationY);

      if (!combatActiveRef.current && distance >= COMBAT_DRAG_THRESHOLD && onTryCombatStart) {
        const started = onTryCombatStart(absoluteX, absoluteY, translationX, translationY);
        if (started) combatActiveRef.current = true;
      }

      if (combatActiveRef.current) {
        onAttackDragMove?.(absoluteX, absoluteY);
        onAttackDragEnd?.(absoluteX, absoluteY);
        combatActiveRef.current = false;
        return;
      }

      commitPending();
    },
    [commitPending, disabled, onAttackDragEnd, onAttackDragMove, onTryCombatStart],
  );

  const handleDoubleTap = useCallback(
    (localX: number) => {
      if (disabled) return;
      const zone = getPanelTouchZone(localX, panelWidth);
      if (zone === 'center') onOpenMenu?.();
    },
    [disabled, onOpenMenu, panelWidth],
  );

  const taps = Gesture.Exclusive(
    Gesture.Tap()
      .numberOfTaps(2)
      .maxDuration(320)
      .enabled(!disabled)
      .onEnd((event) => {
        runOnJS(handleDoubleTap)(event.x);
      }),
    Gesture.Tap()
      .enabled(!disabled)
      .onEnd((event) => {
        runOnJS(handleTap)(event.x);
      }),
  );

  const gesture = Gesture.Exclusive(
    Gesture.LongPress()
      .minDuration(260)
      .enabled(!disabled)
      .onStart((event) => {
        runOnJS(startRepeat)(event.x);
      })
      .onFinalize(() => {
        runOnJS(commitPending)();
      }),
    Gesture.Pan()
      .minDistance(2)
      .enabled(!disabled)
      .onStart(() => {
        runOnJS(handlePanStart)();
      })
      .onUpdate((event) => {
        runOnJS(handlePanUpdate)(
          event.absoluteX,
          event.absoluteY,
          event.translationX,
          event.translationY,
        );
      })
      .onEnd((event) => {
        runOnJS(handlePanEnd)(
          event.absoluteX,
          event.absoluteY,
          event.translationX,
          event.translationY,
        );
      }),
    taps,
  );

  return { gesture, leftFloatingDelta, rightFloatingDelta };
}
