export interface ClickState {
  weekStart: string; // 'YYYY-MM-DD'（本地周一）
  counts: Record<string, number>;
}

function ymd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** 给定日期所在「自然周」的周一（本地时区），返回 YYYY-MM-DD。 */
export function weekStartOf(d: Date): string {
  const offset = (d.getDay() + 6) % 7; // 距离周一的天数（周一=0）
  const monday = new Date(d.getFullYear(), d.getMonth(), d.getDate() - offset);
  return ymd(monday);
}

export function currentWeekStart(): string {
  return weekStartOf(new Date());
}

export function emptyState(weekStart: string): ClickState {
  return { weekStart, counts: {} };
}

/** 周内累加；若存储的周与当前周不同，先归零再计。返回新状态（纯函数）。 */
export function applyClick(state: ClickState, id: string, weekStart: string): ClickState {
  const base = state.weekStart === weekStart ? state : emptyState(weekStart);
  return {
    weekStart,
    counts: { ...base.counts, [id]: (base.counts[id] ?? 0) + 1 },
  };
}

/** 本周 Top N（降序，平手按 id 升序）；存储周过期则返回空。 */
export function rankCounts(
  state: ClickState,
  weekStart: string,
  limit: number
): Array<{ id: string; count: number }> {
  if (state.weekStart !== weekStart) return [];
  return Object.entries(state.counts)
    .map(([id, count]) => ({ id, count }))
    .sort((a, b) => b.count - a.count || a.id.localeCompare(b.id))
    .slice(0, limit);
}
