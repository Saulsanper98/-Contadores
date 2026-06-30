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
import { playGameSound, soundForEffect } from '@/animations/sounds';
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
  damageOthers,
  drainOthers,
  eliminatePlayer,
  healAll,
  popSnapshot,
  pushSnapshot,
  removeGenericCounterDef,
  resizePlayers,
  revivePlayer,
  setAllLife,
  setMonarch,
  appendEvent,
  normalizeGameState,
  passTurn as passTurnEngine,
  playerName,
  adjustMulligans as adjustMulligansEngine,
  checkAutoWinner,
  endGame,
  markPlayerDamaged,
  recordKnockout,
} from '@/engine';
import type { TableLayoutId, WinCondition } from '@/engine/types';
import { enqueueSyncEvent, registerRemoteGame } from '@/sync/syncQueue';
import { useSettingsStore } from '@/store/settingsStore';
import type { CombatDamageType } from '@/data/combatTypes';
import type { PlayerActionId } from '@/data/playerActions';
import { PRESET_COUNTERS, presetToCounter } from '@/data/presetCounters';
import type {
  GameEventKind,
  GameSetup,
  GameState,
  GenericCounterDef,
  ManaIdentity,
  PlayerSetup,
} from '@/engine/types';

export type GameToast = {
  id: number;
  title: string;
  subtitle?: string;
};

type MutateOptions = {
  panelEffect?: { playerId: string; kind: EffectKind; magnitude?: number } | null;
  globalEffect?: GlobalEffect['kind'] | null;
  skipHistory?: boolean;
  event?: {
    kind: GameEventKind;
    playerId?: string;
    targetId?: string;
    sourceId?: string;
    amount?: number;
    message: string;
    meta?: Record<string, unknown>;
  };
};

interface SetupStore {
  setup: GameSetup;
  setPlayerCount: (count: number) => void;
  setStartingLife: (life: number) => void;
  updatePlayer: (
    playerId: string,
    patch: Partial<Pick<PlayerSetup, 'name' | 'manaIdentity' | 'isGuest' | 'commanderName' | 'deckTheme'>>,
  ) => void;
  setTableLayout: (layout: TableLayoutId) => void;
  addGenericCounter: (name: string, icon: string) => void;
  removeGenericCounter: (counterId: string) => void;
  togglePresetCounter: (presetId: string, enabled: boolean) => void;
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
      setTableLayout: (tableLayout) => {
        set((state) => ({ setup: { ...state.setup, tableLayout } }));
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
      togglePresetCounter: (presetId, enabled) => {
        const preset = PRESET_COUNTERS.find((item) => item.presetId === presetId);
        if (!preset) return;
        set((state) => {
          const counterId = `preset-${presetId}`;
          if (enabled) {
            return { setup: addGenericCounterDef(state.setup, presetToCounter(preset)) };
          }
          return { setup: removeGenericCounterDef(state.setup, counterId) };
        });
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
  damageOpponents: (sourceId: string, amount: number) => void;
  drainOpponents: (sourceId: string, amount: number) => void;
  resolveCombat: (params: {
    sourceId: string;
    targetId: string;
    amount: number;
    type: CombatDamageType;
  }) => void;
  handlePlayerAction: (playerId: string, actionId: PlayerActionId) => void;
  passTurn: () => void;
  addGameNote: (text: string) => void;
  adjustMulligans: (playerId: string, delta: number) => void;
  declareWinner: (winnerId: string, winCondition: WinCondition) => void;
  syncGameToCloud: () => Promise<void>;
}

let toastCounter = 0;

function findNewEliminations(before: GameState, after: GameState): string[] {
  return after.players
    .filter((p) => p.isEliminated && !before.players.find((o) => o.id === p.id)?.isEliminated)
    .map((p) => p.id);
}

async function maybeEnqueueSync(game: GameState, event: GameState['events'][number]) {
  const settings = useSettingsStore.getState();
  if (!settings.syncEnabled || !game.meta.remoteGameId) return;
  await enqueueSyncEvent({
    localId: event.id,
    gameId: game.meta.remoteGameId,
    claimCode: game.meta.claimCode ?? '',
    event,
    createdAt: Date.now(),
    retries: 0,
  });
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => {
      const mutate = (updater: (g: GameState) => GameState, options: MutateOptions = {}) => {
        const { game, past } = get();
        if (!game) return;

        const next = updater(game);
        let withEvents = options.event ? appendEvent(next, options.event) : next;

        if (options.event?.kind === 'life_change' && (options.event.amount ?? 0) < 0 && options.event.playerId) {
          withEvents = markPlayerDamaged(withEvents, options.event.playerId);
        }
        if (options.event?.kind === 'combat_resolved' && options.event.targetId) {
          const combatType = options.event.meta?.combatType;
          if (combatType !== 'heal') {
            withEvents = markPlayerDamaged(withEvents, options.event.targetId);
          }
        }
        if (options.event?.kind === 'commander_damage' && options.event.targetId) {
          withEvents = markPlayerDamaged(withEvents, options.event.targetId);
        }

        const eliminations = findNewEliminations(game, withEvents);
        for (const playerId of eliminations) {
          const reason = withEvents.players.find((p) => p.id === playerId)?.eliminationReason;
          if (!reason) continue;
          const killerCandidate = options.event?.sourceId;
          const killerId = killerCandidate && killerCandidate !== playerId ? killerCandidate : undefined;
          withEvents = recordKnockout(withEvents, playerId, reason, killerId);
        }
        withEvents = checkAutoWinner(withEvents);

        const newPast = options.skipHistory ? past : pushSnapshot(past, game);

        let panelEffect = options.panelEffect
          ? { ...options.panelEffect, id: nextEffectId(), magnitude: options.panelEffect.magnitude }
          : null;

        if (eliminations.length > 0 && eliminations[0]) {
          panelEffect = {
            playerId: eliminations[0],
            kind: 'elimination',
            id: nextEffectId(),
            magnitude: 1,
          };
        }

        const globalEffect = options.globalEffect
          ? { kind: options.globalEffect, id: nextEffectId() }
          : null;

        if (panelEffect) {
          if (useSettingsStore.getState().hapticsEnabled) void triggerHaptic(panelEffect.kind);
          const snd = soundForEffect(panelEffect.kind);
          if (snd) void playGameSound(snd);
        }
        if (globalEffect && useSettingsStore.getState().hapticsEnabled) {
          void triggerHaptic(globalEffect.kind === 'groupHeal' ? 'groupHeal' : 'groupDamage');
        }

        const lastEvent = withEvents.events[withEvents.events.length - 1];
        if (lastEvent) void maybeEnqueueSync(withEvents, lastEvent);

        set({ game: withEvents, past: newPast, panelEffect, globalEffect });
      };

      return {
        game: null,
        past: [],
        toast: null,
        panelEffect: null,
        globalEffect: null,
        gameStartedAt: null,

        startGame: (setup) => {
          const startedAt = Date.now();
          let game = createGameFromSetup(setup);
          game = normalizeGameState(game, startedAt);
          game = appendEvent(game, {
            kind: 'game_start',
            message: `Partida iniciada · ${game.players.length} jugadores`,
            meta: { playerCount: game.players.length },
          });
          set({
            game,
            past: [],
            panelEffect: null,
            globalEffect: null,
            gameStartedAt: startedAt,
          });
          void get().syncGameToCloud();
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
          const startedAt = Date.now();
          let fresh = createGameFromSetup(game.setup);
          fresh = normalizeGameState(fresh, startedAt);
          fresh = appendEvent(fresh, {
            kind: 'game_start',
            message: 'Partida reiniciada',
          });
          set({
            game: fresh,
            past: [],
            panelEffect: null,
            globalEffect: null,
            gameStartedAt: startedAt,
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
          const { game } = get();
          if (!game) return;
          const kind = effectKindForLifeDelta(delta);
          mutate((g) => adjustLife(g, playerId, delta), {
            panelEffect: kind
              ? { playerId, kind, magnitude: Math.abs(delta) }
              : null,
            event: {
              kind: 'life_change',
              playerId,
              amount: delta,
              message: `${playerName(game, playerId)} ${delta > 0 ? '+' : ''}${delta} vida`,
            },
          });
        },

        dealCommanderDamage: (targetId, sourceId, amount) => {
          const { game } = get();
          if (!game || amount === 0) return;
          mutate((g) => applyCommanderDamage(g, targetId, sourceId, amount), {
            panelEffect: { playerId: targetId, kind: 'commander', magnitude: Math.abs(amount) },
            event: {
              kind: 'commander_damage',
              targetId,
              sourceId,
              amount,
              message: `${playerName(game, sourceId)} → ${playerName(game, targetId)}: ${amount} daño de comandante`,
            },
          });
        },

        adjustPlayerPoison: (playerId, delta) => {
          const { game } = get();
          if (!game || delta === 0) return;
          mutate((g) => adjustPoison(g, playerId, delta), {
            panelEffect: { playerId, kind: 'poison', magnitude: Math.abs(delta) },
            event: {
              kind: 'poison_change',
              playerId,
              amount: delta,
              message: `${playerName(game, playerId)} ${delta > 0 ? '+' : ''}${delta} veneno`,
            },
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
          const { game } = get();
          if (!game) return;
          mutate((g) => revivePlayer(g, playerId), {
            panelEffect: { playerId, kind: 'revive' },
            event: {
              kind: 'revive',
              playerId,
              message: `${playerName(game, playerId)} revivido`,
            },
          });
        },

        applyDamageAll: (amount) => {
          mutate((g) => damageAll(g, amount), {
            globalEffect: 'groupDamage',
            event: {
              kind: 'group_damage',
              amount,
              message: `−${amount} vida a todos`,
            },
          });
        },

        applyHealAll: (amount) => {
          mutate((g) => healAll(g, amount), {
            globalEffect: 'groupHeal',
            event: {
              kind: 'group_heal',
              amount,
              message: `+${amount} vida a todos`,
            },
          });
        },

        applySetAllLife: (life) => {
          mutate((g) => setAllLife(g, life), { globalEffect: 'groupSet' });
        },

        damageOpponents: (sourceId, amount) => {
          mutate((g) => damageOthers(g, sourceId, amount), { globalEffect: 'groupDamage' });
        },

        drainOpponents: (sourceId, amount) => {
          mutate((g) => drainOthers(g, sourceId, amount), { globalEffect: 'groupDamage' });
        },

        resolveCombat: ({ sourceId, targetId, amount, type }) => {
          if (amount <= 0) return;
          const { game } = get();
          if (!game) return;

          const typeLabels: Record<CombatDamageType, string> = {
            normal: 'daño',
            heal: 'curación',
            commander: 'comandante',
            infect: 'infectar',
            lifelink: 'vínculo vital',
          };

          mutate(
            (g) => {
              let next = g;
              switch (type) {
                case 'heal':
                  next = adjustLife(next, targetId, amount);
                  break;
                case 'commander':
                  next = applyCommanderDamage(next, targetId, sourceId, amount);
                  break;
                case 'infect':
                  next = adjustPoison(next, targetId, amount);
                  break;
                case 'lifelink':
                  next = adjustLife(next, targetId, -amount);
                  next = adjustLife(next, sourceId, amount);
                  break;
                case 'normal':
                default:
                  next = adjustLife(next, targetId, -amount);
                  break;
              }
              return next;
            },
            {
              panelEffect: {
                playerId: targetId,
                kind: type === 'infect' ? 'poison' : type === 'commander' ? 'commander' : 'damage',
                magnitude: Math.abs(amount),
              },
              event: {
                kind: 'combat_resolved',
                sourceId,
                targetId,
                amount,
                message: `${playerName(game, sourceId)} → ${playerName(game, targetId)}: ${amount} ${typeLabels[type]}`,
                meta: { combatType: type },
              },
            },
          );
        },

        passTurn: () => {
          mutate((g) => passTurnEngine(g));
          void playGameSound('turn');
        },

        addGameNote: (text) => {
          const trimmed = text.trim();
          if (!trimmed) return;
          mutate((g) => g, {
            event: {
              kind: 'note',
              message: trimmed,
            },
          });
        },

        adjustMulligans: (playerId, delta) => {
          const { game } = get();
          if (!game || delta === 0) return;
          mutate(
            (g) => adjustMulligansEngine(g, playerId, delta),
            {
              event: {
                kind: 'mulligan',
                playerId,
                amount: delta,
                message: `${playerName(game, playerId)} ${delta > 0 ? '+' : ''}${delta} mulligan`,
              },
            },
          );
        },

        declareWinner: (winnerId, winCondition) => {
          mutate((g) => endGame(g, winnerId, winCondition), {
            event: {
              kind: 'win_condition',
              playerId: winnerId,
              message: `Victoria declarada (${winCondition})`,
              meta: { winCondition },
            },
          });
        },

        syncGameToCloud: async () => {
          const { game } = get();
          const settings = useSettingsStore.getState();
          if (!game || !settings.syncEnabled) return;

          let remoteId = game.meta.remoteGameId;
          if (!remoteId) {
            remoteId = await registerRemoteGame(settings.syncApiUrl, {
              claimCode: game.meta.claimCode ?? '',
              playerCount: game.players.length,
              players: game.players.map((p, i) => ({
                name: p.name,
                seatIndex: i,
                isGuest: p.isGuest,
              })),
            });
            if (remoteId) {
              set({
                game: {
                  ...game,
                  meta: { ...game.meta, remoteGameId: remoteId },
                },
              });
            }
          }

          if (!remoteId) return;
          for (const event of game.events.slice(-20)) {
            await maybeEnqueueSync({ ...game, meta: { ...game.meta, remoteGameId: remoteId } }, event);
          }
        },

        handlePlayerAction: (playerId, actionId) => {
          switch (actionId) {
            case 'pay-1':
              get().adjustPlayerLife(playerId, -1);
              break;
            case 'pay-2':
              get().adjustPlayerLife(playerId, -2);
              break;
            case 'heal-1':
              get().adjustPlayerLife(playerId, 1);
              break;
            case 'heal-2':
              get().adjustPlayerLife(playerId, 2);
              break;
            case 'damage-all':
              get().applyDamageAll(1);
              break;
            case 'damage-opponents':
              get().damageOpponents(playerId, 1);
              break;
            case 'drain':
              get().drainOpponents(playerId, 1);
              break;
            case 'poison-1':
              get().adjustPlayerPoison(playerId, 1);
              break;
            case 'monarch':
              get().setPlayerMonarch(playerId);
              break;
            case 'eliminate':
              get().markEliminated(playerId);
              break;
            case 'revive':
              get().markRevived(playerId);
              break;
            default:
              break;
          }
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
      onRehydrateStorage: () => (state) => {
        if (state?.game) {
          state.game = normalizeGameState(state.game, state.gameStartedAt ?? undefined);
        }
      },
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
