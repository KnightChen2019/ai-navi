import rawData from "../../data.json";

export interface Card {
  id: string;
  name: string;
  img: string;
  link: string;
  description: string;
}

export interface Section {
  title: string;
  cards: Card[];
}

export interface CardWithSection extends Card {
  section: string;
}

const sections = rawData as Section[];

const allCards: CardWithSection[] = sections.flatMap((s) =>
  s.cards.map((c) => ({ ...c, section: s.title }))
);

export function getSections(): Section[] {
  return sections;
}

export function getAllCards(): CardWithSection[] {
  return allCards;
}

export function getCardById(id: string): CardWithSection | undefined {
  return getAllCards().find((c) => c.id === id);
}

export function getRelatedCards(id: string, limit = 4): CardWithSection[] {
  const card = getCardById(id);
  if (!card) return [];
  return getAllCards()
    .filter((c) => c.section === card.section && c.id !== id)
    .slice(0, limit);
}
