import { Audio } from 'expo-av';
import { Platform } from 'react-native';

import { useSettingsStore } from '@/store/settingsStore';

type SoundKind = 'damage' | 'heal' | 'elimination' | 'turn';

const SOUND_URIS: Record<SoundKind, string> = {
  damage: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
  heal: 'https://assets.mixkit.co/active_storage/sfx/2578/2578-preview.mp3',
  elimination: 'https://assets.mixkit.co/active_storage/sfx/2570/2570-preview.mp3',
  turn: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
};

const cache = new Map<SoundKind, Audio.Sound>();

export async function playGameSound(kind: SoundKind): Promise<void> {
  if (Platform.OS === 'web') return;
  if (!useSettingsStore.getState().soundsEnabled) return;

  try {
    let sound = cache.get(kind);
    if (!sound) {
      const { sound: loaded } = await Audio.Sound.createAsync({ uri: SOUND_URIS[kind] });
      cache.set(kind, loaded);
      sound = loaded;
    }
    await sound.replayAsync();
  } catch {
    // Audio optional — fail silently
  }
}

export function soundForEffect(kind: string | null | undefined): SoundKind | null {
  if (kind === 'heal' || kind === 'groupHeal') return 'heal';
  if (kind === 'damage' || kind === 'groupDamage' || kind === 'commander') return 'damage';
  if (kind === 'elimination') return 'elimination';
  return null;
}
