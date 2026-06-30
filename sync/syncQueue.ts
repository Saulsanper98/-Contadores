import AsyncStorage from '@react-native-async-storage/async-storage';

import type { GameEvent } from '@/engine/types';

const QUEUE_KEY = 'commander-sync-queue';

export type PendingSyncEvent = {
  localId: string;
  gameId: string;
  claimCode: string;
  event: GameEvent;
  createdAt: number;
  retries: number;
};

export async function loadSyncQueue(): Promise<PendingSyncEvent[]> {
  const raw = await AsyncStorage.getItem(QUEUE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as PendingSyncEvent[];
  } catch {
    return [];
  }
}

export async function saveSyncQueue(queue: PendingSyncEvent[]): Promise<void> {
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

export async function enqueueSyncEvent(item: PendingSyncEvent): Promise<void> {
  const queue = await loadSyncQueue();
  queue.push(item);
  await saveSyncQueue(queue);
}

export async function flushSyncQueue(
  apiUrl: string,
  gameId: string,
): Promise<{ sent: number; failed: number }> {
  const queue = await loadSyncQueue();
  const pending = queue.filter((q) => q.gameId === gameId);
  const other = queue.filter((q) => q.gameId !== gameId);
  let sent = 0;
  let failed = 0;
  const stillPending: PendingSyncEvent[] = [];

  for (const item of pending) {
    try {
      const res = await fetch(`${apiUrl}/api/games/${gameId}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: item.event, claimCode: item.claimCode }),
      });
      if (res.ok) sent += 1;
      else {
        failed += 1;
        stillPending.push({ ...item, retries: item.retries + 1 });
      }
    } catch {
      failed += 1;
      stillPending.push({ ...item, retries: item.retries + 1 });
    }
  }

  await saveSyncQueue([...other, ...stillPending]);
  return { sent, failed };
}

export async function registerRemoteGame(
  apiUrl: string,
  payload: {
    claimCode: string;
    playerCount: number;
    players: { name: string; seatIndex: number; isGuest: boolean }[];
  },
): Promise<string | null> {
  try {
    const res = await fetch(`${apiUrl}/api/games`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { id: string };
    return data.id;
  } catch {
    return null;
  }
}
