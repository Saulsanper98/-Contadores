import { useEffect, useState } from 'react';

export function formatClock(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function useLiveClock(active: boolean, startedAt: number | null): number {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!active || !startedAt) {
      setElapsed(0);
      return;
    }
    const tick = () => setElapsed(Math.max(0, Date.now() - startedAt));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [active, startedAt]);

  return elapsed;
}
