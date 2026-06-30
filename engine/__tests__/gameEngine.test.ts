import {
  adjustLife,
  adjustPoison,
  applyCommanderDamage,
  createDefaultSetup,
  createGameFromSetup,
  damageOthers,
  drainOthers,
  getEliminationReason,
} from '@/engine';

describe('Commander game engine', () => {
  const setup = createDefaultSetup(4);
  const baseState = createGameFromSetup(setup);

  it('starts with default 40 life per player', () => {
    for (const player of baseState.players) {
      expect(player.life).toBe(40);
      expect(player.isEliminated).toBe(false);
    }
  });

  it('eliminates at 0 life', () => {
    const target = baseState.players[0].id;
    const next = adjustLife(baseState, target, -40);

    const player = next.players.find((p) => p.id === target)!;
    expect(player.life).toBe(0);
    expect(player.isEliminated).toBe(true);
    expect(player.eliminationReason).toBe('life');
    expect(getEliminationReason(player)).toBe('life');
  });

  it('eliminates at 10 poison counters', () => {
    const target = baseState.players[1].id;
    const next = adjustPoison(baseState, target, 10);

    const player = next.players.find((p) => p.id === target)!;
    expect(player.poison).toBe(10);
    expect(player.isEliminated).toBe(true);
    expect(player.eliminationReason).toBe('poison');
  });

  it('eliminates at 21 commander damage from the same commander', () => {
    const target = baseState.players[2].id;
    const attacker = baseState.players[3].id;

    const after10 = applyCommanderDamage(baseState, target, attacker, 10);
    let player = after10.players.find((p) => p.id === target)!;
    expect(player.isEliminated).toBe(false);
    expect(player.life).toBe(30);
    expect(player.commanderDamageFrom[attacker]).toBe(10);

    const after21 = applyCommanderDamage(after10, target, attacker, 11);
    player = after21.players.find((p) => p.id === target)!;
    expect(player.commanderDamageFrom[attacker]).toBe(21);
    expect(player.life).toBe(19);
    expect(player.isEliminated).toBe(true);
    expect(player.eliminationReason).toBe('commander');
  });

  it('does not eliminate at 20 commander damage from one commander', () => {
    const target = baseState.players[0].id;
    const attacker = baseState.players[1].id;

    const state = applyCommanderDamage(baseState, target, attacker, 20);
    const player = state.players.find((p) => p.id === target)!;

    expect(player.commanderDamageFrom[attacker]).toBe(20);
    expect(player.isEliminated).toBe(false);
  });

  it('tracks commander damage per opponent separately', () => {
    const target = baseState.players[0].id;
    const attackerA = baseState.players[1].id;
    const attackerB = baseState.players[2].id;

    let state = applyCommanderDamage(baseState, target, attackerA, 15);
    state = applyCommanderDamage(state, target, attackerB, 15);

    const player = state.players.find((p) => p.id === target)!;
    expect(player.commanderDamageFrom[attackerA]).toBe(15);
    expect(player.commanderDamageFrom[attackerB]).toBe(15);
    expect(player.isEliminated).toBe(false);
  });

  it('damages opponents but not the source player', () => {
    const source = baseState.players[0].id;
    const next = damageOthers(baseState, source, 3);

    expect(next.players.find((p) => p.id === source)!.life).toBe(40);
    for (const player of next.players.filter((p) => p.id !== source)) {
      expect(player.life).toBe(37);
    }
  });

  it('drains life from opponents to the source player', () => {
    const source = baseState.players[0].id;
    const next = drainOthers(baseState, source, 2);

    expect(next.players.find((p) => p.id === source)!.life).toBe(46);
    for (const player of next.players.filter((p) => p.id !== source)) {
      expect(player.life).toBe(38);
    }
  });
});
