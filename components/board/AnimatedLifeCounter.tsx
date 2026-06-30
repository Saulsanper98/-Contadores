import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, type TextStyle } from 'react-native';

import { lifeStepInterval } from '@/animations/lifeFeedback';
import { typography } from '@/theme';

type AnimatedLifeCounterProps = {
  life: number;
  fontSize: number;
  style?: TextStyle | TextStyle[];
  lowLifeStyle?: TextStyle;
  eliminatedStyle?: TextStyle;
  isEliminated?: boolean;
};

export function AnimatedLifeCounter({
  life,
  fontSize,
  style,
  lowLifeStyle,
  eliminatedStyle,
  isEliminated,
}: AnimatedLifeCounterProps) {
  const [displayed, setDisplayed] = useState(life);
  const displayedRef = useRef(life);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    displayedRef.current = displayed;
  }, [displayed]);

  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    const from = displayedRef.current;
    const to = life;
    if (from === to) return;

    const delta = to - from;
    const steps = Math.abs(delta);
    const intervalMs = lifeStepInterval(delta);
    let step = 0;
    let current = from;

    timerRef.current = setInterval(() => {
      step += 1;
      current += delta > 0 ? 1 : -1;
      setDisplayed(current);
      displayedRef.current = current;
      if (step >= steps && timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }, intervalMs);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [life]);

  return (
    <Text
      style={[
        styles.life,
        { fontSize },
        style,
        displayed <= 10 && !isEliminated ? lowLifeStyle : null,
        isEliminated ? eliminatedStyle : null,
      ]}>
      {displayed}
    </Text>
  );
}

const styles = StyleSheet.create({
  life: {
    fontFamily: typography.fontFamily.monoBold,
    letterSpacing: typography.letterSpacing.counter,
    marginVertical: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.65)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 10,
  },
});
