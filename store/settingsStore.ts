import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type AppSettings = {
  soundsEnabled: boolean;
  hapticsEnabled: boolean;
  effectsEnabled: boolean;
  reducedMotionOverride: boolean | null;
  syncApiUrl: string;
  syncEnabled: boolean;
};

interface SettingsStore extends AppSettings {
  setSoundsEnabled: (v: boolean) => void;
  setHapticsEnabled: (v: boolean) => void;
  setEffectsEnabled: (v: boolean) => void;
  setReducedMotionOverride: (v: boolean | null) => void;
  setSyncApiUrl: (url: string) => void;
  setSyncEnabled: (v: boolean) => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      soundsEnabled: true,
      hapticsEnabled: true,
      effectsEnabled: true,
      reducedMotionOverride: null,
      syncApiUrl: 'http://localhost:3000',
      syncEnabled: false,

      setSoundsEnabled: (soundsEnabled) => set({ soundsEnabled }),
      setHapticsEnabled: (hapticsEnabled) => set({ hapticsEnabled }),
      setEffectsEnabled: (effectsEnabled) => set({ effectsEnabled }),
      setReducedMotionOverride: (reducedMotionOverride) => set({ reducedMotionOverride }),
      setSyncApiUrl: (syncApiUrl) => set({ syncApiUrl }),
      setSyncEnabled: (syncEnabled) => set({ syncEnabled }),
    }),
    {
      name: 'commander-settings',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
