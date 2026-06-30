export type ArchidektDeck = {
  name: string;
  commanderName?: string;
  colorIdentity: string[];
};

export async function fetchArchidektDeck(deckUrl: string): Promise<ArchidektDeck | null> {
  try {
    const match = deckUrl.match(/archidekt\.com\/decks\/(\d+)/);
    if (!match) return null;
    const id = match[1];
    const res = await fetch(`https://archidekt.com/api/decks/${id}/`);
    if (!res.ok) return null;
    const data = (await res.json()) as {
      name?: string;
      categories?: { name?: string }[];
      cards?: { card?: { oracleCard?: { colorIdentity?: string[]; name?: string } } }[];
    };

    const commander = data.cards?.find(() =>
      data.categories?.some((cat) => cat.name?.toLowerCase().includes('commander')),
    );

    const colors = new Set<string>();
    for (const entry of data.cards ?? []) {
      for (const c of entry.card?.oracleCard?.colorIdentity ?? []) colors.add(c);
    }

    return {
      name: data.name ?? 'Imported Deck',
      commanderName: commander?.card?.oracleCard?.name,
      colorIdentity: [...colors],
    };
  } catch {
    return null;
  }
}
