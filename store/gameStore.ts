import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import {
  type EffectKind,
  type GlobalEffect,
  type PanelEffect,
  effectKindForLifeDelta,
  nextEffectId,
} from '@/animations/effects';
import { triggerHaptic } from '@/animations/haptics';
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
  popSnapshot,
  pushSnapshot,
  removeGenericCounterDef,
  resizePlayers,
  revivePlayer,
  setAllLife,
  setMonarch,
} from '@/engine';
import type { GameSetup, GameState, GenericCounterDef, ManaIdentity, PlayerSetup } from '@/engine/types';

export type GameToast = {
  id: number;
  title: string;
  subtitle?: string;
};

type MutateOptions = {
  panelEffect?: { playerId: string; kind: EffectKind } | null;
  globalEffect?: GlobalEffect['kind'] | null;
  skipHistory?: boolean;
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
          setup: { ...state.setup, startingLife: Math.max(1, life) },
        }));
      },
      updatePlayer: (playerId, patch) => {
        set((state) => ({
          setup: {
            ...state.setup,
            players: state.setup.players.map((p) =>
              p.id === playerId ? { ...p, ...patch } : p,
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
        set((state) => ({ setup: addGenericCounterDef(state.setup, counter) }));
      },
      removeGenericCounter: (counterId) => {
        set((state) => ({ setup: removeGenericCounterDef(state.setup, counterId) }));
      },
      resetToDefaults: () => set({ setup: createDefaultSetup(4) }),
      loadLastSetup: () => set({ setup: get().setup }),
    }),
    {
      name: 'commander-setup',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ setup: s.setup }),
    },
  ),
);

interface GameStore {
  game: GameState | null;
  past: GameState[];
  toast: GameToast | null;
  panelEffect: PanelEffect | null;
  globalEffect: GlobalEffect | null;
  gameStartedAt: number | null;
  startGame: (setup: GameSetup) => GameState;
  clearGame: () => void;
  restartGame: () => void;
  showToast: (title: string, subtitle?: string) => void;
  clearToast: () => void;
  clearPanelEffect: () => void;
  clearGlobalEffect: () => void;
  undo: () => boolean;
  canUndo: () => boolean;
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

function findNewEliminations(before: GameState, after: GameState): string[] {
  return after.players
    .filter((p) => p.isEliminated && !before.players.find((o) => o.id === p.id)?.isEliminated)
    .map((p) => p.id);
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => {
      const mutate = (updater: (g: GameState) => GameState, options: MutateOptions = {}) => {
        const { game, past } = get();
        if (!game) return;

        const next = updater(game);
        const newPast = options.skipHistory ? past : pushSnapshot(past, game);

        let panelEffect = options.panelEffect
          ? { ...options.panelEffect, id: nextEffectId() }
          : null;

        const eliminations = findNewEliminations(game, next);
        if (eliminations.length > 0 && eliminations[0]) {
          panelEffect = { playerId: eliminations[0], kind: 'elimination', id: nextEffectId() };
        }

        const globalEffect = options.globalEffect
          ? { kind: options.globalEffect, id: nextEffectId() }
          : null;

        if (panelEffect) void triggerHaptic(panelEffect.kind);
        if (globalEffect) {
          void triggerHaptic(globalEffect.kind === 'groupHeal' ? 'groupHeal' : 'groupDamage');
        }

        set({ game: next, past: newPast, panelEffect, globalEffect });
      };

      return {
        game: null,
        past: [],
        toast: null,
        panelEffect: null,
        globalEffect: null,
        gameStartedAt: null,

        startGame: (setup) => {
          const game = createGameFromSetup(setup);
          set({
            game,
            past: [],
            panelEffect: null,
            globalEffect: null,
            gameStartedAt: Date.now(),
          });
          return game;
        },

        clearGame: () =>
          set({
            game: null,
            past: [],
            toast: null,
            panelEffect: null,
            globalEffect: null,
            gameStartedAt: null,
          }),

        restartGame: () => {
          const { game } = get();
          if (!game) return;
          const fresh = createGameFromSetup(game.setup);
          set({
            game: fresh,
            past: [],
            panelEffect: null,
            globalEffect: null,
            gameStartedAt: Date.now(),
          });
        },

        showToast: (title, subtitle) => {
          toastCounter += 1;
          set({ toast: { id: toastCounter, title, subtitle } });
        },

        clearToast: () => set({ toast: null }),
        clearPanelEffect: () => set({ panelEffect: null }),
        clearGlobalEffect: () => set({ globalEffect: null }),

        undo: () => {
          const { past } = get();
          const { state, stack } = popSnapshot(past);
          if (!state) return false;
          set({ game: state, past: stack, panelEffect: null, globalEffect: null });
          return true;
        },

        canUndo: () => get().past.length > 0,

        adjustPlayerLife: (playerId, delta) => {
          const kind = effectKindForLifeDelta(delta);
          mutate((g) => adjustLife(g, playerId, delta), {
            panelEffect: kind ? { playerId, kind } : null,
          });
        },

        dealCommanderDamage: (targetId, sourceId, amount) => {
          mutate((g) => applyCommanderDamage(g, targetId, sourceId, amount), {
            panelEffect: { playerId: targetId, kind: 'commander' },
          });
        },

        adjustPlayerPoison: (playerId, delta) => {
          mutate((g) => adjustPoison(g, playerId, delta), {
            panelEffect: { playerId, kind: 'poison' },
          });
        },

        adjustPlayerCounter: (playerId, counterId, delta) => {
          mutate((g) => adjustGenericCounter(g, playerId, counterId, delta), { skipHistory: false });
        },

        setPlayerMonarch: (playerId) => {
          mutate((g) => setMonarch(g, playerId), {
            panelEffect: { playerId, kind: 'monarch' },
          });
        },

        clearMonarch: () => {
          mutate((g) => setMonarch(g, null));
        },

        markEliminated: (playerId) => {
          mutate((g) => eliminatePlayer(g, playerId), {
            panelEffect: { playerId, kind: 'elimination' },
          });
        },

        markRevived: (playerId) => {
          mutate((g) => revivePlayer(g, playerId), {
            panelEffect: { playerId, kind: 'revive' },
          });
        },

        applyDamageAll: (amount) => {
          mutate((g) => damageAll(g, amount), { globalEffect: 'groupDamage' });
        },

        applyHealAll: (amount) => {
          mutate((g) => healAll(g, amount), { globalEffect: 'groupHeal' });
        },

        applySetAllLife: (life) => {
          mutate((g) => setAllLife(g, life), { globalEffect: 'groupSet' });
        },
      };
    },
    {
      name: 'commander-game',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        game: s.game,
        past: s.past,
        gameStartedAt: s.gameStartedAt,
      }),
    },
  ),
);

export const MANA_OPTIONS: { id: ManaIdentity; label: string; symbol: string }[] = [
  { id: 'white', label: 'Blanco', symbol: 'W' },
  { id: 'blue', label: 'Azul', symbol: 'U' },
  { id: 'black', label: 'Negro', symbol: 'B' },
  { id: 'red', label: 'Rojo', symbol: 'R' },
  { id: 'green', label: 'Verde', symbol: 'G' },
  { id: 'colorless', label: 'Incoloro', symbol: 'C' },
  { id: 'multicolor', label: 'Multicolor', symbol: 'M' },
];
