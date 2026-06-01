# 设计：用户留存功能（收藏 + 本周热门）

- 日期：2026-06-02
- 状态：已与用户确认，待实现
- 目标：为 AI 导航站增加用户**留存**能力，给回访提供两类理由——个人化（收藏）与新鲜感（本周热门榜）。

## 背景与约束

现状（本次基于的架构）：

- 数据为静态 `data.json`（「唯一工具 + 多分类标签」模型，工具有稳定 slug `id`）。
- 无登录 / 无数据库；已有的访客计数器采用**文件型存储**（`data/visitor-count.json`），并已加进程内串行锁 + 临时文件原子写，部署为单进程 Docker standalone。
- UI：Next.js 16 App Router、Tailwind 4、lucide-react、玻璃拟态卡片；组件有 `Topbar` / `Sidebar` / `CommandPalette` / `ThemeProvider`（`useSyncExternalStore` + 自定义事件实现跨组件同步）。

约束：

- 不引入登录、数据库、服务端用户态；收藏保存在浏览器。
- 复用既有视觉语言（玻璃卡片），不新增设计体系。
- 热度计数沿用文件型模式，继承其 Serverless 限制（仅适用于持久化文件系统的单进程部署）。

## 范围

包含：

1. **收藏夹**（纯前端 `localStorage`）：卡片/详情页 ♥ 收藏、顶栏带数字入口、`/favorites` 收藏页。
2. **本周热门榜**：按"访问官网"外链点击累计，按自然周重置，首页顶部 rail 展示。

明确不做（YAGNI）：

- 登录 / 账号 / 服务端收藏同步
- 评分、评论
- 总榜（all-time），只做本周榜
- 热度加权（只数"访问官网"点击，单一信号）
- 最近访问历史（本轮不做，可后续叠加）

## 关键决策（来自 brainstorming）

| 决策点 | 选择 | 理由 |
| --- | --- | --- |
| 留存方向 | 收藏 + 热度榜组合 | 同时覆盖"个人化"与"新鲜感"两类回访驱动 |
| 热度信号 | 只数"访问官网"外链点击 | 最强真实意图信号，最不易灌水 |
| 时间窗口 | 本周榜，按自然周重置 | 榜单流动 → 制造新鲜感；逻辑近似现有计数器 |
| UI 落点 | 混合：热门=首页顶部 rail；收藏=独立 `/favorites` 页 + 顶栏入口 | 热门是发现内容放首页；收藏是个人内容给专属页 + 常驻入口 |
| 冷启动 | 本周不足 8 个时用编辑精选「AI热门工具」补齐去重 | rail 永不空，真实数据攒够后自然替换 |

## 架构

### 1. 收藏（前端，localStorage）

- 存储：`localStorage` key `ai-navi:favorites`，值为工具 `id` 字符串数组（去重，保留收藏顺序，最新在前）。
- 同步层：`src/lib/useFavorites.ts` —— 仿 `ThemeProvider` 模式，`useSyncExternalStore` 订阅一个自定义事件 `ai-navi:favorites-change`，并监听 `storage` 事件实现跨标签页同步。

  对外接口：
  - `useFavorites(): { ids: string[]; count: number; isFavorite(id): boolean; toggle(id): void }`
  - SSR 快照返回空数组，避免 hydration 不一致（首屏按"未收藏"渲染，挂载后纠正）。
- `FavoriteButton`（客户端小组件）：接收 `toolId`，渲染 ♥；`onClick` 调 `preventDefault + stopPropagation`（因为它叠加在 `<Link>` 卡片内），再 `toggle`。已收藏=实心红心常显；未收藏=默认半透明、hover 显现。
- `/favorites` 页（`src/app/favorites/page.tsx`，客户端）：读 `ids`，用 `getAllCards()` 还原为卡片复用首页卡片样式；空状态提示去收藏。

### 2. 热度（后端，文件型计数 + API）

- 存储：`data/tool-clicks.json`，结构 `{ "weekStart": "YYYY-MM-DD", "counts": { "<toolId>": number } }`。
  - `weekStart` = 该周周一的本地日期（`YYYY-MM-DD`）。读取时若当前周一 ≠ 文件中的 `weekStart`，视为整表清零（返回空 counts 并在写入时落盘新 weekStart）。
- API：`src/app/api/clicks/route.ts`（`export const dynamic = "force-dynamic"`）。
  - `POST`：body `{ id: string }`。校验 `id` 为已知工具；周内 `counts[id] += 1`。沿用访客计数器的**进程内串行锁 `withLock` + 临时文件原子写**（必要时抽到 `src/lib/file-store.ts` 共享，避免与 visitor 路由重复实现）。返回 `{ ok: true }`。
  - `GET`：返回本周 `counts` 降序的 Top N（默认 8）：`{ weekStart, ranking: [{ id, count }] }`。
- 触发：详情页"访问官网"`<a target="_blank">` 的 `onClick` 中 `fetch("/api/clicks", { method: "POST", body, keepalive: true })`，不 `await`、不阻塞跳转。因开新标签原标签不卸载，普通 fetch 即可（`keepalive` 作为兜底）。

### 3. 首页"本周热门"rail（SSR）

- 数据：首页（`src/app/page.tsx`，服务端）读取 `tool-clicks.json` 当前周排名（经 `src/lib/trending.ts` 的 `getWeeklyTrending()`，内部判断周重置），映射为工具卡。
  > **服务端专属**：`trending.ts` 读 `fs`，必须独立于 `data.ts`（后者被客户端组件 `CommandPalette` 引用，不能引入 `fs`）。`trending.ts` 仅在服务端组件 / 路由中 import。
  - 冷启动补齐：取本周有点击的工具（降序），再用「AI热门工具」分区工具按编辑顺序补齐、去重，截断到 8 个。
- 渲染：Hero 下方、分类区上方，一条"🔥 本周热门"横向卡片列表，含排名标记（1/2/3 高亮）。
- 因读文件，首页改为动态渲染（`force-dynamic` 或对该 rail 做局部动态）；详情页保持 SSG 不受影响。

### 4. 顶栏收藏入口

- `Topbar` 增加一个 ♥ 链接（`/favorites`），带收藏数徽章（来自 `useFavorites().count`）。`count > 0` 时显示数字。移动端同样可见。

## 数据流

- **收藏**：点击 ♥ → `useFavorites.toggle` 写 `localStorage` + 派发 `ai-navi:favorites-change` → 同页所有订阅者（顶栏徽章、各卡片、收藏页）即时刷新；其他标签页经 `storage` 事件同步。
- **热度（写）**：详情页点"访问官网" → `POST /api/clicks` →（锁内）读文件 / 必要时按周重置 → `counts[id]++` → 原子写。
- **热度（读）**：首页 SSR → `getWeeklyTrending()` 读文件 + 周判断 + 冷启动补齐 → 渲染 rail。

## 错误处理与边界

- 计数 API 写失败/文件损坏：`GET` 读不到或解析失败时回退为空排名（→ 触发冷启动补齐）；`POST` 失败静默（前端不 await，不影响用户跳转）。
- 周初清零：`weekStart` 比对实现"按到点重置"，无需定时任务。
- 冷启动：rail 永不为空（精选补齐）。
- 收藏 SSR：快照空数组 → 首屏无收藏态，挂载后纠正，避免 hydration mismatch。
- 未知 `id`：`POST` 拒绝计数；`/favorites` 渲染时过滤掉 `getCardById` 找不到的陈旧 id。

## 测试（TDD）

- `useFavorites`：增/删/去重/顺序、`count`、同步事件触发。
- 计数逻辑（抽成可测纯函数 + 文件存储）：周内累加、跨周重置归零、并发 POST 不丢增量（串行锁）。
- `getWeeklyTrending()`：排序正确、冷启动补齐到 8 且去重、空文件回退。
- 既有 `npm run validate` / `npm run build` 保持通过。

## 受影响 / 新增文件

- 新增：`src/lib/useFavorites.ts`、`src/components/FavoriteButton.tsx`、`src/app/favorites/page.tsx`、`src/app/api/clicks/route.ts`、`src/lib/file-store.ts`（共享锁+原子写，可选）、`src/lib/trending.ts`（服务端专属热度数据）、`data/tool-clicks.json`。
- 修改：`src/app/page.tsx`（热门 rail）、`src/app/card/[card_id]/page.tsx`（"访问官网"埋点 + ♥）、`src/components/Topbar.tsx`（收藏入口）、卡片组件（叠加 ♥）。
- 可选重构：`src/app/api/visitor/route.ts` 改用共享 `file-store.ts`。
