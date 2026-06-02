import path from "path";
import { readJson } from "@/lib/file-store";
import {
  currentWeekStart,
  emptyState,
  rankCounts,
  type ClickState,
} from "@/lib/clicks";
import {
  getSections,
  getCardById,
  getAllCards,
  type CardWithSection,
} from "@/lib/data";

const file = path.join(process.cwd(), "data", "tool-clicks.json");
const HOT_SECTION = "AI热门工具";

/** 纯函数：排名 id 在前，去重，冷启动用「热门工具」再用全部工具补齐到 limit。 */
export function buildTrending(rankedIds: string[], limit: number): CardWithSection[] {
  const seen = new Set<string>();
  const out: CardWithSection[] = [];
  const push = (id: string) => {
    if (seen.has(id)) return;
    const card = getCardById(id);
    if (!card) return;
    seen.add(id);
    out.push(card);
  };
  rankedIds.forEach(push);
  const hot = getSections().find((s) => s.title === HOT_SECTION)?.cards ?? [];
  hot.forEach((c) => push(c.id));
  getAllCards().forEach((c) => push(c.id));
  return out.slice(0, limit);
}

/** 服务端专属：读点击文件 + 周判断 + 冷启动补齐。仅在服务端组件/路由中调用。 */
export async function getWeeklyTrending(limit = 8): Promise<CardWithSection[]> {
  const weekStart = currentWeekStart();
  const state = await readJson<ClickState>(file, emptyState(weekStart));
  const ranked = rankCounts(state, weekStart, limit).map((r) => r.id);
  return buildTrending(ranked, limit);
}
