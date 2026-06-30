import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

import { useSettingsStore } from '@/store/settingsStore';

export function useReducedMotion(): boolean {
  const override = useSettingsStore((s) => s.reducedMotionOverride);
  const [systemReduced, setSystemReduced] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setSystemReduced);
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setSystemReduced);
    return () => sub.remove();
  }, []);

  if (override !== null) return override;
  return systemReduced;
}
