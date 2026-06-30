const artCache = new Map<string, string | null>();

type ScryfallCard = {
  image_uris?: { art_crop?: string; large?: string };
  card_faces?: { image_uris?: { art_crop?: string; large?: string } }[];
};

export async function fetchCommanderArtUrl(commanderName: string): Promise<string | null> {
  const key = commanderName.trim().toLowerCase();
  if (!key) return null;
  if (artCache.has(key)) return artCache.get(key) ?? null;

  try {
    const res = await fetch(
      `https://api.scryfall.com/cards/named?fuzzy=${encodeURIComponent(commanderName.trim())}`,
      {
        headers: {
          Accept: 'application/json',
          'User-Agent': 'CommanderCounter/1.0',
        },
      },
    );
    if (!res.ok) {
      artCache.set(key, null);
      return null;
    }

    const card = (await res.json()) as ScryfallCard;
    const uris = card.image_uris ?? card.card_faces?.[0]?.image_uris;
    const url = uris?.art_crop ?? uris?.large ?? null;
    artCache.set(key, url);
    return url;
  } catch {
    artCache.set(key, null);
    return null;
  }
}
