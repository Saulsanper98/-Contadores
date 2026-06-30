import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import {
  addGenericCounterDef,
  adjustLife,
  clampPlayerCount,
  createDefaultSetup,
  createGameFromSetup,
  removeGenericCounterDef,
  resizePlayers,
} from '@/engine/gameEngine';
import type { GameSetup, GameState, GenericCounterDef, ManaIdentity, PlayerSetup } from '@/engine/types';

interface SetupStore {
  setup: GameSetup;
  setPlayerCount: (count: number) => void;
  setStartingLife: (life: number) => void;
  updatePlayer: (playerId: string, patch: Partial<Pick<PlayerSetup, 'name' | 'manaIdentity'>>) => void;
  addGenericCounter: (name: string, icon: string) => void;
  removeGenericCounter: (counterId: string) => void;
  resetToDefaults: () => void;
  loadLastSetup: () => void;
}

export const useSetupStore = create<SetupStore>()(
  persist(
    (set, get) => ({
      setup: createDefaultSetup(4),

      setPlayerCount: (count) => {
        const playerCount = clampPlayerCount(count);
        set((state) => ({
          setup: {
            ...state.setup,
            playerCount,
            players: resizePlayers(state.setup.players, playerCount),
          },
        }));
      },

      setStartingLife: (life) => {
        set((state) => ({
          setup: {
            ...state.setup,
            startingLife: Math.max(1, life),
          },
        }));
      },

      updatePlayer: (playerId, patch) => {
        set((state) => ({
          setup: {
            ...state.setup,
            players: state.setup.players.map((player) =>
              player.id === playerId ? { ...player, ...patch } : player,
            ),
          },
        }));
      },

      addGenericCounter: (name, icon) => {
        const counter: GenericCounterDef = {
          id: `counter-${Date.now()}`,
          name: name.trim() || 'Contador',
          icon: icon.trim() || '◆',
        };

        set((state) => ({
          setup: addGenericCounterDef(state.setup, counter),
        }));
      },

      removeGenericCounter: (counterId) => {
        set((state) => ({
          setup: removeGenericCounterDef(state.setup, counterId),
        }));
      },

      resetToDefaults: () => {
        set({ setup: createDefaultSetup(4) });
      },

      loadLastSetup: () => {
        const current = get().setup;
        set({ setup: current });
      },
    }),
    {
      name: 'commander-setup',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ setup: state.setup }),
    },
  ),
);

interface GameStore {
  game: GameState | null;
  startGame: (setup: GameSetup) => GameState;
  clearGame: () => void;
  adjustPlayerLife: (playerId: string, delta: number) => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  game: null,

  startGame: (setup) => {
    const game = createGameFromSetup(setup);
    set({ game });
    return game;
  },

  clearGame: () => set({ game: null }),

  adjustPlayerLife: (playerId, delta) => {
    const { game } = get();
    if (!game || delta === 0) return;
    set({ game: adjustLife(game, playerId, delta) });
  },
}));

export const MANA_OPTIONS: { id: ManaIdentity; label: string; symbol: string }[] = [
  { id: 'white', label: 'Blanco', symbol: 'W' },
  { id: 'blue', label: 'Azul', symbol: 'U' },
  { id: 'black', label: 'Negro', symbol: 'B' },
  { id: 'red', label: 'Rojo', symbol: 'R' },
  { id: 'green', label: 'Verde', symbol: 'G' },
  { id: 'colorless', label: 'Incoloro', symbol: 'C' },
  { id: 'multicolor', label: 'Multicolor', symbol: 'M' },
];
