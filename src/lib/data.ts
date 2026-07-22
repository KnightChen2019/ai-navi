import rawData from "../../data.json";

/** A unique tool. The same tool can belong to several sections. */
export interface Tool {
  id: string;
  name: string;
  img: string;
  link: string;
  description: string;
  addedAt: string; // YYYY-MM-DD
  sections: string[];
}

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

/** A card flattened with a single representative section (its first). */
export interface CardWithSection extends Card {
  section: string;
  sections: string[];
  addedAt: string;
}

interface RawData {
  sections: string[];
  tools: Tool[];
}

const data = rawData as RawData;

function toCardWithSection(t: Tool): CardWithSection {
  return { ...t, section: t.sections[0] };
}

/** Section titles in display order. */
export function getSectionTitles(): string[] {
  return data.sections;
}

/** Sections in display order, each populated with the tools that belong to it. */
export function getSections(): Section[] {
  return data.sections.map((title) => ({
    title,
    cards: data.tools.filter((t) => t.sections.includes(title)),
  }));
}

/** Every unique tool exactly once. */
export function getAllCards(): CardWithSection[] {
  return data.tools.map(toCardWithSection);
}

export function getCardById(id: string): CardWithSection | undefined {
  const t = data.tools.find((tool) => tool.id === id);
  return t ? toCardWithSection(t) : undefined;
}

/** Tools sharing at least one section with the given tool. */
export function getRelatedCards(id: string, limit = 4): CardWithSection[] {
  const tool = data.tools.find((t) => t.id === id);
  if (!tool) return [];
  return data.tools
    .filter((t) => t.id !== id && t.sections.some((s) => tool.sections.includes(s)))
    .slice(0, limit)
    .map(toCardWithSection);
}

/** Most recently added tools first (ties broken by id for stability). */
export function getLatestCards(limit = 8): CardWithSection[] {
  return [...data.tools]
    .sort((a, b) => b.addedAt.localeCompare(a.addedAt) || a.id.localeCompare(b.id))
    .slice(0, limit)
    .map(toCardWithSection);
}
