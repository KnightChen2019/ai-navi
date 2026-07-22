import rawData from "../../data.json";

/** A unique tool. The same tool can belong to several sections. */
export type Pricing = "free" | "freemium" | "paid";
export type Origin = "cn" | "global";

export interface Tool {
  id: string;
  name: string;
  img: string;
  link: string;
  description: string;
  addedAt: string; // YYYY-MM-DD
  pricing: Pricing;
  origin: Origin;
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
  cards: CardWithSection[];
}

/** A card flattened with a single representative section (its first). */
export interface CardWithSection extends Card {
  section: string;
  sections: string[];
  addedAt: string;
  pricing: Pricing;
  origin: Origin;
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
    cards: data.tools.filter((t) => t.sections.includes(title)).map(toCardWithSection),
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

export interface ToolFilters {
  pricing?: Pricing | "all";
  origin?: Origin | "all";
}

/** Filter cards by pricing/origin; "all" (or undefined) disables that dimension. */
export function filterCards<T extends { pricing: Pricing; origin: Origin }>(
  cards: T[],
  filters: ToolFilters
): T[] {
  return cards.filter(
    (c) =>
      (!filters.pricing || filters.pricing === "all" || c.pricing === filters.pricing) &&
      (!filters.origin || filters.origin === "all" || c.origin === filters.origin)
  );
}
