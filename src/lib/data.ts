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
  detail?: string; // 详情页「详细介绍」，Markdown 子集
  sections: string[];
}

export const PRICING_LABELS: Record<Pricing, string> = {
  free: "免费",
  freemium: "部分免费",
  paid: "付费",
};

export const ORIGIN_LABELS: Record<Origin, string> = {
  cn: "国产",
  global: "海外",
};

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

/** A named block grouping related sections (AI, Finance, News, …). */
export interface Block {
  id: string;
  title: string;
  sections: Section[];
}

const BLOCK_DEFS: { id: string; title: string; sectionTitles: string[] }[] = [
  {
    id: "ai-tools",
    title: "AI 工具",
    sectionTitles: ["AI热门工具", "AI对话聊天", "AI文本工具", "AI编程工具", "AI绘画", "AI视频", "AI音频", "AI办公", "AI搜索", "大模型API", "Agent工具"],
  },
  { id: "finance", title: "金融", sectionTitles: ["金融"] },
  { id: "news", title: "新闻", sectionTitles: ["新闻"] },
  { id: "ai-edu", title: "AI 教育", sectionTitles: ["AI教育"] },
  { id: "ai-design", title: "AI 设计", sectionTitles: ["AI设计"] },
  { id: "ai-marketing", title: "AI 营销", sectionTitles: ["AI营销"] },
  { id: "ai-medical", title: "AI 医疗", sectionTitles: ["AI医疗"] },
];

/** Blocks in display order, each populated with its sections and cards. */
export function getBlocks(): Block[] {
  const all = getSections();
  const lookup = new Map(all.map((s) => [s.title, s]));
  return BLOCK_DEFS.map((b) => ({
    id: b.id,
    title: b.title,
    sections: b.sectionTitles.map((t) => lookup.get(t)!).filter(Boolean),
  }));
}

/** A card flattened with a single representative section (its first). */
export interface CardWithSection extends Card {
  section: string;
  sections: string[];
  addedAt: string;
  pricing: Pricing;
  origin: Origin;
  detail?: string;
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
