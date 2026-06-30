import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

import type { EffectKind } from '@/animations/effects';

export async function triggerHaptic(kind: EffectKind): Promise<void> {
  if (Platform.OS === 'web') return;

  switch (kind) {
    case 'damage':
    case 'commander':
    case 'groupDamage':
    case 'elimination':
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      break;
    case 'heal':
    case 'revive':
    case 'groupHeal':
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      break;
    case 'poison':
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      break;
    case 'monarch':
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      break;
    default:
      await Haptics.selectionAsync();
  }
}
