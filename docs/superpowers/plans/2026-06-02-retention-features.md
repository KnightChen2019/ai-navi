# 用户留存功能（收藏 + 本周热门）Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 给 AI 导航站加两项留存功能——浏览器本地「收藏夹」与按周流动的「本周热门」点击榜。

**Architecture:** 收藏用 `localStorage` + `useSyncExternalStore`（跨组件/跨标签页同步），无后端。热度复用现有访客计数器的文件型模式：新增 `/api/clicks`（进程内串行锁 + 原子写）记录「访问官网」外链点击，按自然周重置；首页顶部服务端渲染「本周热门」rail，冷启动用编辑精选补齐。计数核心逻辑抽成纯函数以便 TDD。

**Tech Stack:** Next.js 16 App Router、React 19、TypeScript、Tailwind 4、lucide-react；测试用 Vitest + @testing-library/react + jsdom。

参考 spec：`docs/superpowers/specs/2026-06-02-retention-features-design.md`

---

## 文件结构

**新增**
- `vitest.config.ts` — 测试配置（jsdom 环境）
- `src/lib/clicks.ts` — 点击计数纯逻辑（周起始、增量、周重置、排名）
- `src/lib/clicks.test.ts`
- `src/lib/file-store.ts` — 共享的文件锁 + 原子写 + 读 JSON
- `src/lib/file-store.test.ts`
- `src/lib/trending.ts` — 服务端热度数据（读文件 + 冷启动补齐），含纯函数 `buildTrending`
- `src/lib/trending.test.ts`
- `src/lib/useFavorites.ts` — 收藏 hook（客户端）
- `src/lib/useFavorites.test.ts`
- `src/components/FavoriteButton.tsx` — 卡片/详情页 ♥ 按钮（客户端）
- `src/components/ToolCard.tsx` — 共享工具卡（首页/收藏/热门/同类，含 ♥ 与可选排名）
- `src/components/TrendingRail.tsx` — 首页「本周热门」rail（服务端 async）
- `src/components/OutboundVisitButton.tsx` — 详情页「访问官网」按钮（客户端，埋点）
- `src/components/FavoritesList.tsx` — 收藏页列表（客户端）
- `src/app/api/clicks/route.ts` — 点击计数 API
- `src/app/favorites/page.tsx` — 收藏页（服务端壳，导出 metadata）
- `data/tool-clicks.json` — 运行时点击数据（初始空）

**修改**
- `package.json` — 加测试依赖与脚本
- `src/app/page.tsx` — 用 `ToolCard` 替换内联卡片 + 插入 `TrendingRail` + 改为动态渲染
- `src/app/card/[card_id]/page.tsx` — 用 `OutboundVisitButton` + 加 ♥ + 同类推荐改用 `ToolCard`
- `src/components/Topbar.tsx` — 加收藏入口（♥ + 数字徽章）
- `src/app/api/visitor/route.ts` — 复用 `file-store`（DRY，去重锁/写逻辑）

---

## Task 1: 搭建测试框架（Vitest + Testing Library）

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`
- Create: `src/lib/smoke.test.ts`（临时，验证后删除）

- [ ] **Step 1: 安装测试依赖**

Run:
```bash
npm install -D vitest@^3 jsdom@^25 @testing-library/react@^16 @testing-library/dom@^10
```
Expected: 安装成功，`package.json` devDependencies 出现这 4 个包。

- [ ] **Step 2: 加测试脚本**

修改 `package.json` 的 `scripts`，加入：
```json
    "test": "vitest run",
    "test:watch": "vitest"
```

- [ ] **Step 3: 写 vitest 配置**

Create `vitest.config.ts`（用 `fileURLToPath` 以兼容 Windows 路径）:
```ts
import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  test: {
    environment: "jsdom",
    include: ["src/**/*.test.{ts,tsx}"],
    globals: false,
  },
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
});
```

- [ ] **Step 4: 写冒烟测试**

Create `src/lib/smoke.test.ts`:
```ts
import { describe, it, expect } from "vitest";

describe("smoke", () => {
  it("runs", () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 5: 运行测试确认通过**

Run: `npm test`
Expected: PASS，1 个测试通过。

- [ ] **Step 6: 删除冒烟测试并提交**

```bash
rm src/lib/smoke.test.ts
git add package.json package-lock.json vitest.config.ts
git commit -m "test: set up vitest + testing-library harness"
```

---

## Task 2: 点击计数纯逻辑 `clicks.ts`

**Files:**
- Create: `src/lib/clicks.ts`
- Test: `src/lib/clicks.test.ts`

- [ ] **Step 1: 写失败测试**

Create `src/lib/clicks.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import {
  weekStartOf,
  emptyState,
  applyClick,
  rankCounts,
  type ClickState,
} from "./clicks";

describe("weekStartOf", () => {
  it("returns the Monday of the week for any day in it", () => {
    // 2026-06-01 is a Monday; 06-07 is the Sunday of the same week
    expect(weekStartOf(new Date(2026, 5, 1))).toBe("2026-06-01");
    expect(weekStartOf(new Date(2026, 5, 3))).toBe("2026-06-01");
    expect(weekStartOf(new Date(2026, 5, 7))).toBe("2026-06-01");
    expect(weekStartOf(new Date(2026, 5, 8))).toBe("2026-06-08");
  });
});

describe("applyClick", () => {
  it("increments a tool's count within the same week", () => {
    let s = emptyState("2026-06-01");
    s = applyClick(s, "doubao", "2026-06-01");
    s = applyClick(s, "doubao", "2026-06-01");
    expect(s.counts.doubao).toBe(2);
    expect(s.weekStart).toBe("2026-06-01");
  });

  it("resets all counts when the week changes", () => {
    let s: ClickState = { weekStart: "2026-06-01", counts: { doubao: 5 } };
    s = applyClick(s, "claude", "2026-06-08");
    expect(s.weekStart).toBe("2026-06-08");
    expect(s.counts).toEqual({ claude: 1 });
  });
});

describe("rankCounts", () => {
  const state: ClickState = {
    weekStart: "2026-06-01",
    counts: { doubao: 3, claude: 5, cursor: 5 },
  };

  it("sorts by count desc, ties broken by id, respects limit", () => {
    expect(rankCounts(state, "2026-06-01", 2)).toEqual([
      { id: "claude", count: 5 },
      { id: "cursor", count: 5 },
    ]);
  });

  it("returns [] when the stored week is stale", () => {
    expect(rankCounts(state, "2026-06-08", 8)).toEqual([]);
  });
});
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npm test src/lib/clicks.test.ts`
Expected: FAIL（`clicks.ts` 不存在 / 函数未定义）

- [ ] **Step 3: 实现 `clicks.ts`**

Create `src/lib/clicks.ts`:
```ts
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
```

- [ ] **Step 4: 运行测试确认通过**

Run: `npm test src/lib/clicks.test.ts`
Expected: PASS（全部用例通过）

- [ ] **Step 5: 提交**

```bash
git add src/lib/clicks.ts src/lib/clicks.test.ts
git commit -m "feat(clicks): pure weekly click-count logic with tests"
```

---

## Task 3: 共享文件存储 `file-store.ts`

**Files:**
- Create: `src/lib/file-store.ts`
- Test: `src/lib/file-store.test.ts`

- [ ] **Step 1: 写失败测试**

Create `src/lib/file-store.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { promises as fs } from "fs";
import path from "path";
import os from "os";
import { withLock, readJson, atomicWriteJson } from "./file-store";

describe("withLock", () => {
  it("serializes read-modify-write so no update is lost", async () => {
    const shared = { n: 0 };
    const bump = () =>
      withLock(async () => {
        const cur = shared.n;
        await Promise.resolve(); // yield: would interleave without the lock
        shared.n = cur + 1;
      });
    await Promise.all([bump(), bump(), bump()]);
    expect(shared.n).toBe(3);
  });
});

describe("readJson / atomicWriteJson", () => {
  it("returns the fallback when the file is missing", async () => {
    const missing = path.join(os.tmpdir(), `nope-${process.pid}-${Date.now()}.json`);
    expect(await readJson(missing, { a: 1 })).toEqual({ a: 1 });
  });

  it("round-trips written JSON", async () => {
    const file = path.join(os.tmpdir(), `fs-${process.pid}-${Date.now()}.json`);
    await atomicWriteJson(file, { hello: "world", n: 2 });
    expect(await readJson(file, null)).toEqual({ hello: "world", n: 2 });
    await fs.rm(file, { force: true });
  });
});
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npm test src/lib/file-store.test.ts`
Expected: FAIL（模块不存在）

- [ ] **Step 3: 实现 `file-store.ts`**

Create `src/lib/file-store.ts`:
```ts
import { promises as fs } from "fs";
import path from "path";

// 进程内串行锁：保证 read-modify-write 不被并发打断。
let chain: Promise<unknown> = Promise.resolve();
export function withLock<T>(fn: () => Promise<T>): Promise<T> {
  const run = chain.then(fn, fn);
  chain = run.then(
    () => undefined,
    () => undefined
  );
  return run;
}

export async function readJson<T>(file: string, fallback: T): Promise<T> {
  try {
    const text = await fs.readFile(file, "utf-8");
    return JSON.parse(text) as T;
  } catch {
    return fallback;
  }
}

// 原子写：先写临时文件再 rename，避免崩溃留下半截 JSON。
export async function atomicWriteJson(file: string, data: unknown): Promise<void> {
  await fs.mkdir(path.dirname(file), { recursive: true });
  const tmp = `${file}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(data), "utf-8");
  await fs.rename(tmp, file);
}
```

- [ ] **Step 4: 运行测试确认通过**

Run: `npm test src/lib/file-store.test.ts`
Expected: PASS

- [ ] **Step 5: 提交**

```bash
git add src/lib/file-store.ts src/lib/file-store.test.ts
git commit -m "feat(file-store): shared lock + atomic JSON read/write with tests"
```

---

## Task 4: 点击计数 API `/api/clicks`

**Files:**
- Create: `src/app/api/clicks/route.ts`
- Create: `data/tool-clicks.json`

- [ ] **Step 1: 建初始数据文件**

Create `data/tool-clicks.json`:
```json
{ "weekStart": "", "counts": {} }
```

- [ ] **Step 2: 实现 route**

Create `src/app/api/clicks/route.ts`:
```ts
import { NextResponse } from "next/server";
import path from "path";
import { withLock, readJson, atomicWriteJson } from "@/lib/file-store";
import {
  currentWeekStart,
  emptyState,
  applyClick,
  rankCounts,
  type ClickState,
} from "@/lib/clicks";
import { getCardById } from "@/lib/data";

export const dynamic = "force-dynamic";

const file = path.join(process.cwd(), "data", "tool-clicks.json");
const LIMIT = 8;

export async function GET() {
  const weekStart = currentWeekStart();
  const state = await readJson<ClickState>(file, emptyState(weekStart));
  return NextResponse.json({ weekStart, ranking: rankCounts(state, weekStart, LIMIT) });
}

export async function POST(req: Request) {
  let id: unknown;
  try {
    ({ id } = await req.json());
  } catch {
    id = undefined;
  }
  if (typeof id !== "string" || !getCardById(id)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const weekStart = currentWeekStart();
  await withLock(async () => {
    const state = await readJson<ClickState>(file, emptyState(weekStart));
    await atomicWriteJson(file, applyClick(state, id as string, weekStart));
  });
  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 3: 手动验证 API**

Run（开发服务器已在 :4000 跑；若没有则 `npm run dev`）:
```bash
curl -s -X POST http://localhost:4000/api/clicks -H "content-type: application/json" -d '{"id":"doubao"}'
curl -s -X POST http://localhost:4000/api/clicks -H "content-type: application/json" -d '{"id":"doubao"}'
curl -s http://localhost:4000/api/clicks
```
Expected: 前两条返回 `{"ok":true}`；第三条 `ranking` 中含 `{"id":"doubao","count":2}`。再测非法 id：
```bash
curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:4000/api/clicks -H "content-type: application/json" -d '{"id":"___nope___"}'
```
Expected: `400`

- [ ] **Step 4: 还原测试写入的数据并提交**

```bash
git checkout -- data/tool-clicks.json 2>/dev/null || printf '{ "weekStart": "", "counts": {} }\n' > data/tool-clicks.json
git add src/app/api/clicks/route.ts data/tool-clicks.json
git commit -m "feat(api): weekly tool-click counter endpoint"
```

---

## Task 5: 热门数据 `trending.ts`

**Files:**
- Create: `src/lib/trending.ts`
- Test: `src/lib/trending.test.ts`

- [ ] **Step 1: 写失败测试**（`buildTrending` 是纯函数，依赖静态 data.json）

Create `src/lib/trending.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { buildTrending } from "./trending";

describe("buildTrending", () => {
  it("puts ranked ids first, then fills, deduped, to the limit", () => {
    const out = buildTrending(["claude", "doubao"], 8);
    expect(out.slice(0, 2).map((c) => c.id)).toEqual(["claude", "doubao"]);
    expect(out).toHaveLength(8);
    const ids = out.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length); // 无重复
  });

  it("skips unknown ranked ids and still fills", () => {
    const out = buildTrending(["___nope___"], 8);
    expect(out.map((c) => c.id)).not.toContain("___nope___");
    expect(out).toHaveLength(8);
  });

  it("never exceeds the number of unique tools", () => {
    const out = buildTrending([], 999);
    const ids = out.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(out.length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npm test src/lib/trending.test.ts`
Expected: FAIL（模块不存在）

- [ ] **Step 3: 实现 `trending.ts`**

Create `src/lib/trending.ts`:
```ts
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
```

- [ ] **Step 4: 运行测试确认通过**

Run: `npm test src/lib/trending.test.ts`
Expected: PASS

- [ ] **Step 5: 提交**

```bash
git add src/lib/trending.ts src/lib/trending.test.ts
git commit -m "feat(trending): weekly trending data with cold-start fill"
```

---

## Task 6: 收藏 hook `useFavorites`

**Files:**
- Create: `src/lib/useFavorites.ts`
- Test: `src/lib/useFavorites.test.ts`

- [ ] **Step 1: 写失败测试**

Create `src/lib/useFavorites.test.ts`:
```ts
import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useFavorites } from "./useFavorites";

beforeEach(() => {
  window.localStorage.clear();
});

describe("useFavorites", () => {
  it("starts empty", () => {
    const { result } = renderHook(() => useFavorites());
    expect(result.current.ids).toEqual([]);
    expect(result.current.count).toBe(0);
  });

  it("toggles a tool on and off", () => {
    const { result } = renderHook(() => useFavorites());
    act(() => result.current.toggle("doubao"));
    expect(result.current.isFavorite("doubao")).toBe(true);
    expect(result.current.count).toBe(1);
    act(() => result.current.toggle("doubao"));
    expect(result.current.isFavorite("doubao")).toBe(false);
    expect(result.current.count).toBe(0);
  });

  it("persists to localStorage and is shared across hook instances", () => {
    const a = renderHook(() => useFavorites());
    act(() => a.result.current.toggle("claude"));
    expect(JSON.parse(window.localStorage.getItem("ai-navi:favorites")!)).toEqual([
      "claude",
    ]);
    const b = renderHook(() => useFavorites());
    expect(b.result.current.isFavorite("claude")).toBe(true);
  });
});
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npm test src/lib/useFavorites.test.ts`
Expected: FAIL（模块不存在）

- [ ] **Step 3: 实现 `useFavorites.ts`**

Create `src/lib/useFavorites.ts`:
```ts
"use client";

import { useCallback, useSyncExternalStore } from "react";

const KEY = "ai-navi:favorites";
const EVENT = "ai-navi:favorites-change";
const EMPTY: string[] = [];

// 缓存：让 getSnapshot 在 localStorage 未变时返回稳定引用，避免 re-render 死循环。
let cacheRaw: string | null = null;
let cacheVal: string[] = EMPTY;

function read(): string[] {
  if (typeof window === "undefined") return EMPTY;
  const raw = window.localStorage.getItem(KEY);
  if (raw === cacheRaw) return cacheVal;
  cacheRaw = raw;
  try {
    const parsed = raw ? JSON.parse(raw) : [];
    cacheVal = Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : EMPTY;
  } catch {
    cacheVal = EMPTY;
  }
  return cacheVal;
}

function write(ids: string[]): void {
  window.localStorage.setItem(KEY, JSON.stringify(ids));
  window.dispatchEvent(new Event(EVENT)); // 同标签页同步
}

function subscribe(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb); // 跨标签页同步
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

export function useFavorites() {
  const ids = useSyncExternalStore(subscribe, read, () => EMPTY);
  const isFavorite = useCallback((id: string) => ids.includes(id), [ids]);
  const toggle = useCallback((id: string) => {
    const cur = read();
    write(cur.includes(id) ? cur.filter((x) => x !== id) : [id, ...cur]);
  }, []);
  return { ids, count: ids.length, isFavorite, toggle };
}
```

- [ ] **Step 4: 运行测试确认通过**

Run: `npm test src/lib/useFavorites.test.ts`
Expected: PASS

- [ ] **Step 5: 跑全量测试 + 提交**

```bash
npm test
git add src/lib/useFavorites.ts src/lib/useFavorites.test.ts
git commit -m "feat(favorites): localStorage-backed useFavorites hook with tests"
```
Expected: 全部测试通过。

---

## Task 7: `FavoriteButton` 组件

**Files:**
- Create: `src/components/FavoriteButton.tsx`

- [ ] **Step 1: 实现组件**

Create `src/components/FavoriteButton.tsx`:
```tsx
"use client";

import { Heart } from "lucide-react";
import { useFavorites } from "@/lib/useFavorites";

export default function FavoriteButton({
  toolId,
  className = "",
  alwaysVisible = false,
}: {
  toolId: string;
  className?: string;
  alwaysVisible?: boolean;
}) {
  const { isFavorite, toggle } = useFavorites();
  const fav = isFavorite(toolId);
  // 卡片内（alwaysVisible=false）：未收藏时 hover 才显现；详情页（true）：常显。
  const idle = alwaysVisible
    ? "text-slate-400 hover:text-brand"
    : "text-slate-400 opacity-0 group-hover:opacity-100 hover:text-brand";
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(toolId);
      }}
      aria-pressed={fav}
      aria-label={fav ? "取消收藏" : "收藏"}
      className={[
        "inline-flex h-7 w-7 items-center justify-center rounded-lg transition-colors",
        fav ? "text-brand" : idle,
        className,
      ].join(" ")}
    >
      <Heart size={15} className={fav ? "fill-current" : ""} />
    </button>
  );
}
```

- [ ] **Step 2: 构建确认无类型/编译错误**

Run: `npm run build`
Expected: ✓ Compiled successfully（未使用组件不报错；仅确认能编译）

- [ ] **Step 3: 提交**

```bash
git add src/components/FavoriteButton.tsx
git commit -m "feat(favorites): FavoriteButton toggle component"
```

---

## Task 8: 共享 `ToolCard` 组件

**Files:**
- Create: `src/components/ToolCard.tsx`

- [ ] **Step 1: 实现组件**（♥ 作为 Link 的同级兄弟覆盖在右上角，避免 `<button>` 嵌套在 `<a>` 内的非法结构）

Create `src/components/ToolCard.tsx`:
```tsx
import Image from "next/image";
import Link from "next/link";
import { type Card } from "@/lib/data";
import FavoriteButton from "./FavoriteButton";

export default function ToolCard({ card, rank }: { card: Card; rank?: number }) {
  return (
    <div className="card-hover-ring group glass-subtle relative rounded-2xl transition-all hover:-translate-y-0.5">
      <Link href={`/card/${card.id}`} className="block rounded-2xl p-4">
        <div className="flex items-start gap-3">
          <div className="relative shrink-0">
            <Image
              src={`/img/${card.img}`}
              alt={card.name}
              width={40}
              height={40}
              className="rounded-xl ring-1 ring-white/60 dark:ring-white/10"
            />
            {rank != null && (
              <span className="absolute -left-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand text-[9px] font-bold text-white">
                {rank}
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1 pr-6">
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate group-hover:text-brand-gradient transition-colors">
              {card.name}
            </p>
            <p className="mt-1 text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2">
              {card.description}
            </p>
          </div>
        </div>
      </Link>
      <FavoriteButton toolId={card.id} className="absolute right-2 top-2" />
    </div>
  );
}
```

- [ ] **Step 2: 构建确认**

Run: `npm run build`
Expected: ✓ Compiled successfully

- [ ] **Step 3: 提交**

```bash
git add src/components/ToolCard.tsx
git commit -m "feat(ui): shared ToolCard with favorite + optional rank"
```

---

## Task 9: 首页接入 `ToolCard` + 「本周热门」rail

**Files:**
- Create: `src/components/TrendingRail.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: 实现 TrendingRail（服务端 async 组件）**

Create `src/components/TrendingRail.tsx`:
```tsx
import { getWeeklyTrending } from "@/lib/trending";
import ToolCard from "./ToolCard";

export default async function TrendingRail() {
  const tools = await getWeeklyTrending(8);
  if (tools.length === 0) return null;
  return (
    <section className="mb-10">
      <div className="mb-3 flex items-baseline gap-2.5 px-1">
        <h2 className="text-[15px] font-bold tracking-tight text-slate-900 dark:text-slate-100">
          🔥 本周热门
        </h2>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {tools.map((c, i) => (
          <ToolCard key={c.id} card={c} rank={i + 1} />
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: 改 `page.tsx`**——加动态渲染、删内联 `CardItem`、用 `ToolCard`、插入 rail。

操作：删除 `import Link` 行、`type Card`、以及**整个 `function CardItem(...) { … }` 函数体**；新增 ToolCard / TrendingRail 的 import 与 `dynamic` 导出；**保留 `import Image`**（页脚警徽 `gongan.png` 仍在用）。

把文件最开头（从第一行 import 到 `CardItem` 函数结束）整体替换为：
```tsx
import Image from "next/image";
import { getSections, getAllCards } from "@/lib/data";
import ToolCard from "@/components/ToolCard";
import TrendingRail from "@/components/TrendingRail";

export const dynamic = "force-dynamic"; // 本周热门按请求读文件
```
（`Home` 组件函数本身及其下方内容保持不变，仅在 Step 3/4 内部做两处小改。）

- [ ] **Step 3: 在 Hero 之后、分类之前插入 rail**

在 `</section>`（Hero 结束）与 `{/* Sections */}` 之间加入：
```tsx
      {/* 本周热门 */}
      <TrendingRail />

```

- [ ] **Step 4: 分类网格里把 `CardItem` 换成 `ToolCard`**

将：
```tsx
              {section.cards.map((c) => (
                <CardItem key={c.id} card={c} />
              ))}
```
改为：
```tsx
              {section.cards.map((c) => (
                <ToolCard key={c.id} card={c} />
              ))}
```

- [ ] **Step 5: 构建确认**

Run: `npm run build`
Expected: ✓ Compiled；路由表中 `/` 变为 `ƒ (Dynamic)`（因 force-dynamic）。

- [ ] **Step 6: 手动验证**

开发服务器打开 http://localhost:4000 ，确认：Hero 下方出现「🔥 本周热门」一行 8 张卡（冷启动时为编辑精选），卡片右上角 hover 出现 ♥，左上角有排名数字。

- [ ] **Step 7: 提交**

```bash
git add src/app/page.tsx src/components/TrendingRail.tsx
git commit -m "feat(home): trending rail + unify cards via ToolCard"
```

---

## Task 10: 详情页埋点按钮 + 收藏 + 同类用 ToolCard

**Files:**
- Create: `src/components/OutboundVisitButton.tsx`
- Modify: `src/app/card/[card_id]/page.tsx`

- [ ] **Step 1: 实现外链埋点按钮（客户端）**

Create `src/components/OutboundVisitButton.tsx`:
```tsx
"use client";

import { ExternalLink } from "lucide-react";

export default function OutboundVisitButton({
  toolId,
  href,
}: {
  toolId: string;
  href: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      onClick={() => {
        // 记一次「访问官网」；不 await、不阻塞跳转（新标签打开，原页不卸载）。
        try {
          fetch("/api/clicks", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ id: toolId }),
            keepalive: true,
          });
        } catch {
          /* 静默 */
        }
      }}
      className="inline-flex items-center gap-1.5 rounded-xl bg-brand px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-shadow hover:shadow-md shrink-0"
    >
      <ExternalLink size={16} /> 访问官网
    </a>
  );
}
```

- [ ] **Step 2: 改详情页**——换 import、用埋点按钮、加 ♥、同类用 ToolCard。

在 `src/app/card/[card_id]/page.tsx` 顶部 import 区，把：
```tsx
import { ArrowLeft, ExternalLink } from "lucide-react";
```
改为：
```tsx
import { ArrowLeft } from "lucide-react";
import OutboundVisitButton from "@/components/OutboundVisitButton";
import FavoriteButton from "@/components/FavoriteButton";
import ToolCard from "@/components/ToolCard";
```

- [ ] **Step 3: 替换「访问官网」按钮 + 旁加收藏**

把现有的：
```tsx
          <a
            href={card.link}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-1.5 rounded-xl bg-brand px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:shadow-md transition-shadow shrink-0"
          >
            <ExternalLink size={16} /> 访问官网
          </a>
```
替换为（详情页用 `alwaysVisible` 让 ♥ 常显）：
```tsx
          <div className="flex shrink-0 items-center gap-2">
            <FavoriteButton
              toolId={card.id}
              alwaysVisible
              className="h-10 w-10 glass-subtle rounded-xl"
            />
            <OutboundVisitButton toolId={card.id} href={card.link} />
          </div>
```

- [ ] **Step 4: 同类推荐改用 ToolCard**

把「同类推荐」里整段 `related.map(...)` 的 `<Link>…</Link>` 卡片替换为：
```tsx
            {related.map((c) => (
              <ToolCard key={c.id} card={c} />
            ))}
```
（保留外层 `<section>` 与标题、grid 容器不变。）

- [ ] **Step 5: 构建确认**

Run: `npm run build`
Expected: ✓ Compiled；`/card/[card_id]` 仍为 `●(SSG)`（客户端按钮是岛屿，不影响静态预渲染）。

- [ ] **Step 6: 手动验证埋点**

开发服务器打开任一详情页（如 /card/cursor），点「访问官网」后，运行：
```bash
curl -s http://localhost:4000/api/clicks
```
Expected: `ranking` 中出现该工具且 count ≥ 1。验证后还原：
```bash
git checkout -- data/tool-clicks.json 2>/dev/null || printf '{ "weekStart": "", "counts": {} }\n' > data/tool-clicks.json
```

- [ ] **Step 7: 提交**

```bash
git add src/components/OutboundVisitButton.tsx "src/app/card/[card_id]/page.tsx"
git commit -m "feat(detail): track outbound clicks + favorite + ToolCard related"
```

---

## Task 11: 顶栏收藏入口

**Files:**
- Modify: `src/components/Topbar.tsx`

- [ ] **Step 1: 加 import 与收藏数**

在 `Topbar.tsx` 顶部：
```tsx
import Link from "next/link";
import { Search, Sparkles, Menu, Heart } from "lucide-react";
import { useFavorites } from "@/lib/useFavorites";
import ThemeToggle from "./ThemeToggle";
```
在 `export default function Topbar() {` 之后、`openPalette` 之前加：
```tsx
  const { count } = useFavorites();
```

- [ ] **Step 2: 在主题切换前插入收藏入口**

把结尾：
```tsx
      <div className="ml-auto shrink-0">
        <ThemeToggle />
      </div>
```
替换为：
```tsx
      <div className="ml-auto flex shrink-0 items-center gap-2">
        <Link
          href="/favorites"
          aria-label={`我的收藏（${count}）`}
          className="glass-subtle relative inline-flex h-9 w-9 items-center justify-center rounded-xl text-slate-600 transition-colors hover:text-brand dark:text-slate-300"
        >
          <Heart size={18} className={count > 0 ? "fill-current text-brand" : ""} />
          {count > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[9px] font-bold text-white">
              {count}
            </span>
          )}
        </Link>
        <ThemeToggle />
      </div>
```

- [ ] **Step 3: 构建确认**

Run: `npm run build`
Expected: ✓ Compiled successfully

- [ ] **Step 4: 提交**

```bash
git add src/components/Topbar.tsx
git commit -m "feat(topbar): favorites entry with count badge"
```

---

## Task 12: 收藏页 `/favorites`

**Files:**
- Create: `src/components/FavoritesList.tsx`
- Create: `src/app/favorites/page.tsx`

- [ ] **Step 1: 实现客户端列表**

Create `src/components/FavoritesList.tsx`:
```tsx
"use client";

import Link from "next/link";
import { useFavorites } from "@/lib/useFavorites";
import { getAllCards } from "@/lib/data";
import ToolCard from "./ToolCard";

export default function FavoritesList() {
  const { ids } = useFavorites();
  const all = getAllCards();
  const cards = ids
    .map((id) => all.find((c) => c.id === id))
    .filter((c): c is NonNullable<typeof c> => c != null);

  if (cards.length === 0) {
    return (
      <div className="glass-subtle rounded-2xl px-6 py-16 text-center">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          还没有收藏。浏览工具时点卡片右上角的 ♥ 即可收藏。
        </p>
        <Link
          href="/"
          className="mt-4 inline-flex rounded-xl bg-brand px-4 py-2 text-sm font-medium text-white"
        >
          去逛逛
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {cards.map((c) => (
        <ToolCard key={c.id} card={c} />
      ))}
    </div>
  );
}
```

- [ ] **Step 2: 实现服务端壳（带 metadata）**

Create `src/app/favorites/page.tsx`:
```tsx
import type { Metadata } from "next";
import FavoritesList from "@/components/FavoritesList";

export const metadata: Metadata = {
  title: "我的收藏",
  description: "你收藏的 AI 工具。",
  robots: { index: false, follow: true },
};

export default function FavoritesPage() {
  return (
    <div className="mx-auto w-full max-w-[1400px] px-2">
      <h1 className="mb-4 px-1 text-[22px] font-bold tracking-tight text-slate-900 dark:text-slate-100">
        我的收藏
      </h1>
      <FavoritesList />
    </div>
  );
}
```

- [ ] **Step 3: 构建确认**

Run: `npm run build`
Expected: ✓ Compiled；路由表出现 `/favorites`。

- [ ] **Step 4: 手动验证完整收藏流程**

开发服务器：首页点几张卡片右上角 ♥ → 顶栏 ♥ 数字增加 → 点顶栏 ♥ 进入 /favorites 看到刚收藏的工具 → 在收藏页点 ♥ 取消 → 卡片消失。

- [ ] **Step 5: 提交**

```bash
git add src/app/favorites/page.tsx src/components/FavoritesList.tsx
git commit -m "feat(favorites): /favorites page"
```

---

## Task 13: 访客路由复用 file-store（DRY 清理）

**Files:**
- Modify: `src/app/api/visitor/route.ts`

- [ ] **Step 1: 用共享 helper 替换重复的锁/原子写**

在 `src/app/api/visitor/route.ts` 顶部 import 加：
```ts
import { withLock, atomicWriteJson } from "@/lib/file-store";
```
删除文件内本地定义的 `writeState` 中的临时文件逻辑与本地 `chain`/`withLock`，改为：
- `writeState` 改为：
```ts
async function writeState(state: CounterState): Promise<void> {
  await atomicWriteJson(counterFile, state);
}
```
- 删除本地的 `let chain` 与本地 `function withLock`（改用 import 的版本）。`readState` 保留不变（它有兼容旧格式的逻辑）。

- [ ] **Step 2: 构建 + 冒烟**

Run: `npm run build`
Expected: ✓ Compiled。开发服务器刷新首页，侧栏访客计数仍正常显示与自增。验证后：
```bash
git checkout -- data/visitor-count.json
```

- [ ] **Step 3: 提交**

```bash
git add src/app/api/visitor/route.ts
git commit -m "refactor(visitor): reuse shared file-store helpers"
```

---

## Task 14: 全量验证

**Files:** 无（验证 + 收尾）

- [ ] **Step 1: 跑测试**

Run: `npm test`
Expected: 全部测试通过（clicks / file-store / trending / useFavorites）。

- [ ] **Step 2: 跑校验 + 构建**

Run: `npm run build`
Expected: `✓ data.json OK`；`✓ Compiled successfully`；无类型错误。

- [ ] **Step 3: 端到端手动验证（生产构建）**

```bash
npm run start
```
逐项确认：
1. 首页「🔥 本周热门」rail 显示 8 张、有排名、可收藏。
2. 详情页点「访问官网」→ `curl /api/clicks` 计数 +1；多点几个不同工具后刷新首页，rail 顺序随点击变化。
3. 收藏：首页/详情/收藏页 ♥ 同步，顶栏数字实时更新；刷新后仍在（localStorage）。
4. 移动端（缩小窗口）：rail、收藏入口、收藏页正常。
5. 亮/暗主题下均正常。

- [ ] **Step 4: 还原运行时数据文件**

```bash
git checkout -- data/visitor-count.json data/tool-clicks.json 2>/dev/null || true
```

- [ ] **Step 5: 收尾**

确认 `git status` 干净（除运行时数据文件外均已提交）。本计划完成。

---

## 备注

- **部署限制（继承自访客计数器）**：点击计数写本地文件，仅适用于持久化文件系统的单进程部署（现有 Docker standalone）。若上 Serverless 需换外部存储（KV/DB）——已在 spec 注明，本期不做。
- **不做项（YAGNI）**：登录、服务端收藏同步、评分评论、总榜、热度加权、最近访问历史。
