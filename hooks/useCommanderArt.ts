import { useEffect, useState } from 'react';

import { fetchCommanderArtUrl } from '@/data/scryfall';

export function useCommanderArt(commanderName?: string): string | null {
  const [uri, setUri] = useState<string | null>(null);

  useEffect(() => {
    const name = commanderName?.trim();
    if (!name) {
      setUri(null);
      return;
    }

    let cancelled = false;
    void fetchCommanderArtUrl(name).then((url) => {
      if (!cancelled) setUri(url);
    });

    return () => {
      cancelled = true;
    };
  }, [commanderName]);

  return uri;
}
