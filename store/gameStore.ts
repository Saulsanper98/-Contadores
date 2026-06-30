import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import {
  addGenericCounterDef,
  adjustGenericCounter,
  adjustLife,
  adjustPoison,
  applyCommanderDamage,
  clampPlayerCount,
  createDefaultSetup,
  createGameFromSetup,
  damageAll,
  eliminatePlayer,
  healAll,
  removeGenericCounterDef,
  resizePlayers,
  revivePlayer,
  setAllLife,
  setMonarch,
} from '@/engine/gameEngine';
import type { GameSetup, GameState, GenericCounterDef, ManaIdentity, PlayerSetup } from '@/engine/types';

export type GameToast = {
  id: number;
  title: string;
  subtitle?: string;
};

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
  toast: GameToast | null;
  startGame: (setup: GameSetup) => GameState;
  clearGame: () => void;
  showToast: (title: string, subtitle?: string) => void;
  clearToast: () => void;
  adjustPlayerLife: (playerId: string, delta: number) => void;
  dealCommanderDamage: (targetId: string, sourceId: string, amount: number) => void;
  adjustPlayerPoison: (playerId: string, delta: number) => void;
  adjustPlayerCounter: (playerId: string, counterId: string, delta: number) => void;
  setPlayerMonarch: (playerId: string) => void;
  clearMonarch: () => void;
  markEliminated: (playerId: string) => void;
  markRevived: (playerId: string) => void;
  applyDamageAll: (amount: number) => void;
  applyHealAll: (amount: number) => void;
  applySetAllLife: (life: number) => void;
}

let toastCounter = 0;

export const useGameStore = create<GameStore>((set, get) => ({
  game: null,
  toast: null,

  startGame: (setup) => {
    const game = createGameFromSetup(setup);
    set({ game });
    return game;
  },

  clearGame: () => set({ game: null, toast: null }),

  showToast: (title, subtitle) => {
    toastCounter += 1;
    set({ toast: { id: toastCounter, title, subtitle } });
  },

  clearToast: () => set({ toast: null }),

  adjustPlayerLife: (playerId, delta) => {
    const { game } = get();
    if (!game || delta === 0) return;
    set({ game: adjustLife(game, playerId, delta) });
  },

  dealCommanderDamage: (targetId, sourceId, amount) => {
    const { game } = get();
    if (!game || amount === 0) return;
    set({ game: applyCommanderDamage(game, targetId, sourceId, amount) });
  },

  adjustPlayerPoison: (playerId, delta) => {
    const { game } = get();
    if (!game || delta === 0) return;
    set({ game: adjustPoison(game, playerId, delta) });
  },

  adjustPlayerCounter: (playerId, counterId, delta) => {
    const { game } = get();
    if (!game || delta === 0) return;
    set({ game: adjustGenericCounter(game, playerId, counterId, delta) });
  },

  setPlayerMonarch: (playerId) => {
    const { game } = get();
    if (!game) return;
    set({ game: setMonarch(game, playerId) });
  },

  clearMonarch: () => {
    const { game } = get();
    if (!game) return;
    set({ game: setMonarch(game, null) });
  },

  markEliminated: (playerId) => {
    const { game } = get();
    if (!game) return;
    set({ game: eliminatePlayer(game, playerId) });
  },

  markRevived: (playerId) => {
    const { game } = get();
    if (!game) return;
    set({ game: revivePlayer(game, playerId) });
  },

  applyDamageAll: (amount) => {
    const { game } = get();
    if (!game || amount === 0) return;
    set({ game: damageAll(game, amount) });
  },

  applyHealAll: (amount) => {
    const { game } = get();
    if (!game || amount === 0) return;
    set({ game: healAll(game, amount) });
  },

  applySetAllLife: (life) => {
    const { game } = get();
    if (!game) return;
    set({ game: setAllLife(game, life) });
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
