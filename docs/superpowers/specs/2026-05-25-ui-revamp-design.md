# AI Navi · UI 改造设计文档

**日期**：2026-05-25
**目标**：把现有 AI 工具导航站升级为有"高级感"、能让人眼前一亮的视觉
**范围**：仅视觉与少量交互升级 + 访客统计语义调整。**不动数据结构、不加新业务功能。**

---

## 1. 视觉系统

### 1.1 风格基调
**玻璃极光（Glass / Aurora）** — 大色块径向渐变背景 + 半透明模糊玻璃组件，参考 macOS Big Sur / Apple Vision Pro / Linear Marketing。

### 1.2 配色（亮色）
**冷静蓝青（Cool Cyan-Indigo）**

| 用途 | 颜色 |
|------|------|
| 极光 1 | `#67e8f9` (cyan-300) |
| 极光 2 | `#818cf8` (indigo-400) |
| 极光 3 | `#a5f3fc` (cyan-200) |
| 极光 4 | `#c4b5fd` (violet-300) |
| 页面底色 | `#f0f9ff` (sky-50) |
| 品牌渐变 | `linear-gradient(135deg, #06b6d4 0%, #6366f1 100%)` |
| 文字主 | `#0f172a` (slate-900) |
| 文字次 | `#475569` (slate-600) |
| 文字弱 | `#94a3b8` (slate-400) |

### 1.3 配色（暗色）
**深空蓝青（Deep Navy + Neon Accent）**

| 用途 | 颜色 |
|------|------|
| 极光 1 | `#06b6d4` at 22% 透明度 |
| 极光 2 | `#6366f1` at 22% 透明度 |
| 极光 3 | `#0ea5e9` at 18% 透明度 |
| 页面底色 | `#020617` (slate-950) |
| 玻璃卡背景 | `rgba(15, 23, 42, 0.55)` (slate-900 + blur) |
| 文字主 | `#e2e8f0` (slate-200) |
| 文字次 | `#94a3b8` (slate-400) |
| 边框 | `rgba(255,255,255,0.08)` |

### 1.4 玻璃材质 token
在 `globals.css` 定义为 3 个 Tailwind v4 自定义工具类（`@utility`），所有玻璃组件复用：

| 工具类 | 用途 | 亮色样式 | 暗色样式 |
|--------|------|----------|----------|
| `.glass-subtle` | 卡片 | `bg-white/55 backdrop-blur-2xl saturate-150 border border-white/70 shadow-sm` | `bg-slate-900/55 border-white/[.06]` |
| `.glass-medium` | 侧栏 / Hero | `bg-white/40 backdrop-blur-3xl saturate-150 border border-white/60 shadow-md` | `bg-slate-900/45 border-white/[.06]` |
| `.glass-strong` | 顶栏 / Modal | `bg-white/55 backdrop-blur-3xl saturate-180 border border-white/70 shadow-lg` | `bg-slate-900/60 border-white/[.08]` |

### 1.5 字体与间距
- 字体保留现有 Geist Sans + Geist Mono
- 圆角层次：组件 `rounded-2xl (16px)`、按钮/小卡 `rounded-xl (12px)`、徽章/Tab `rounded-full`
- 阴影：玻璃组件用低饱和柔光阴影，避免硬阴影

---

## 2. 页面结构

### 2.1 整体骨架
```
┌──────────────────────────────────────────────────────────────┐
│  TOPBAR (浮岛, 全局)                                          │
│  [Logo] AI Navi   [ ⌘K 搜索 800+ AI 工具 ]      [主题切换]    │
├──────────┬───────────────────────────────────────────────────┤
│ SIDEBAR  │  MAIN                                              │
│ (浮岛)   │  ┌──────────────────────────────────────────────┐  │
│          │  │ HERO (信息卡片)                                │  │
│ 分类     │  │ ▸ 已收录 42 款 · 标题 · 副标题                  │  │
│ • 热门   │  └──────────────────────────────────────────────┘  │
│ • 对话   │                                                    │
│ • 文本   │  AI 热门工具 [2 个] [查看全部 →]                    │
│ • ...    │  [Featured 卡] [Featured 卡]                       │
│          │                                                    │
│ 访客信息 │  AI 对话聊天 [6 个]                                 │
│ 你是今天 │  [卡] [卡] [卡] [卡]                                │
│  第 N 位 │  ...                                               │
└──────────┴───────────────────────────────────────────────────┘
```

- 顶栏与侧栏都是"浮岛"（与视口边距 16px、独立圆角阴影、不贴边）
- 极光背景在最底层，所有内容浮于其上

### 2.2 顶栏（替换原全局元素）
- 左侧：Logo + 品牌名 "AI Navi"（小字 "/ 精选 AI 工具"）
- 中央：搜索框，placeholder `搜索 800+ AI 工具…`，右侧 `⌘K` 提示
- 右侧：主题切换按钮（亮/暗）

### 2.3 浮岛侧栏（替换原 Navbar.tsx）
- 不再 hover-expand，**默认就是 200px 宽**的展开形态
- 顶部 "分类" label，下方 8 个分类项（图标 + 文字）
- 活跃项：渐变背景 + 渐变图标 + 左侧高亮条
- 底部访客信息卡（见 §4）

### 2.4 Hero 区（简化）
- 不再占满首屏；改为约 110px 高的"信息卡"
- 包含：徽章（`● 每日精选 · 已收录 N 款工具`）+ 渐变文字标题 + 副标题
- 右上角装饰：半透明渐变光斑

### 2.5 卡片网格
- 每个分类区域有标题行：`<h2>` + 数量 chip + "查看全部 →"
- 卡片三档：
  - **Featured** (前 1-2 张)：`col-span-2`，渐变背景，48px logo，完整 description
  - **Standard**：默认尺寸，40px logo，2 行截断 description
  - 网格：`grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4`（去掉 xl:5）

---

## 3. 交互与动效

### 3.1 ⌘K 命令面板（新功能）
**触发**：点击顶栏搜索框 / 键盘 `⌘K` (`Ctrl+K` on Windows)
**形态**：屏幕中央 600px 宽的玻璃模态，遮罩使用浅色磨砂背景
**内容**：
- 顶部输入框（自动聚焦）
- 下方实时过滤的结果列表，按分类分组
- 上下方向键导航，回车跳转详情页，`Esc` 关闭
**实现**：新建 `src/components/CommandPalette.tsx`，使用 React state + `keydown` 监听，无需第三方库

> 顶栏的搜索框点击即触发，**保留**它作为"按钮+placeholder"形态而不是真的可输入。原 `page.tsx` 内嵌的搜索框删除（Hero 简化后用不上）。

### 3.2 微动画
- **极光漂移**：背景四个渐变光斑用 `@keyframes` 缓慢平移（30s 循环、ease-in-out 来回），CSS 实现，无 JS
- **卡片悬停**：`hover:-translate-y-1 hover:shadow-xl`，加上 `::before` 伪元素出现渐变描边（cyan → indigo）
- **路由切换**：使用 Next.js `loading.tsx` + CSS `@view-transition`（如浏览器支持）实现淡入淡出；不支持时退化为静态
- **侧栏分类点击**：滚动到对应锚点用 `behavior: smooth`（沿用现有）

### 3.3 暗色模式
- 入口：顶栏右侧主题按钮（图标 sun/moon），点击循环 `light → dark → system`
- 实现：在 `<html>` 上加/去 `class="dark"`（`system` 模式下根据 `prefers-color-scheme` 实时决定）。Tailwind v4 配置 `@custom-variant dark (&:where(.dark, .dark *))`，所有暗色用 `dark:` 前缀书写
- 持久化：localStorage `ai-navi-theme`，值为 `'light' | 'dark' | 'system'`
- 首屏防闪烁：`layout.tsx` 内 `<head>` 注入 `dangerouslySetInnerHTML` inline script，在 React hydration 前读 localStorage 并立即给 `<html>` 加正确 class

---

## 4. 访客统计语义变更

### 4.1 新需求
当前：`您是第 N 位访客 | 累计 M`（N = M，都是累计）
新版：**`您是今天第 N 位访客 · 累计 M`**

### 4.2 数据存储
`data/visitor-count.json`（向后兼容旧字段）：
```json
{
  "total": 8920,
  "today": { "date": "2026-05-25", "count": 47 }
}
```

### 4.3 API 改造（`src/app/api/visitor/route.ts`）
**服务端是日期权威**，客户端不自己判断"今天"。
- **GET** → `{ todayDate: 'YYYY-MM-DD', totalCount }`（读当前状态；返回服务端"今日"日期）
- **POST** → 若 `today.date !== 今日`，先把 `today` 重置为 `{ date: 今日, count: 0 }`；然后 `today.count +1`、`total +1`。返回 `{ todayDate, todayPosition: today.count, totalCount: total }`

### 4.4 客户端改造（`VisitorCounter.tsx`）
- localStorage：`{ day: 'YYYY-MM-DD', position: N }`
- 加载流程（始终先 GET 拿权威日期）：
  1. 调 GET → 拿到 `todayDate`, `totalCount`
  2. 读 localStorage `stored`
  3. 如果 `stored?.day === todayDate` → 直接展示 `stored.position` + `totalCount`
  4. 否则调 POST → 拿到 `todayPosition`，写回 localStorage `{ day: todayDate, position: todayPosition }`
- 显示文案：`您是今天第 1,247 位访客 · 累计 8,920`

### 4.5 位置变化
访客信息从 Footer **移到侧栏底部**（小尺寸文字，2 行排版）。Footer 仍保留版权 + 备案号。

---

## 5. 详情页（`/card/[card_id]`）

沿用相同视觉系统：
- 同样的极光背景 + 浮岛主卡（更大、单卡占主区）
- 顶部"← 返回"按钮（玻璃 chip）
- 主卡：80px logo + 分类胶囊 + 大标题 + 渐变主按钮（"访问官网 ↗"）+ 描述
- **新增**："相关工具"区域：从同分类挑 3-4 个其他工具，紧凑卡片

---

## 6. 文件改动清单

| 文件 | 改动 | 备注 |
|------|------|------|
| `src/app/globals.css` | 重写：暗色变量、玻璃 utility class、极光动画 keyframes | 主要工作量 |
| `src/app/layout.tsx` | 加暗色防闪烁 inline script；改 body 布局（去掉 ml-16，换成 grid/flex 适配新侧栏） | 小 |
| `src/components/Navbar.tsx` | 重写为"浮岛侧栏"+ 内嵌访客信息 | 大 |
| `src/components/VisitorCounter.tsx` | 改 localStorage 结构 + 文案 + 新 API 字段 | 中 |
| `src/components/CommandPalette.tsx` | **新建**：⌘K 命令面板 | 中 |
| `src/components/Topbar.tsx` | **新建**：顶栏（Logo + 搜索按钮 + 主题切换） | 中 |
| `src/components/ThemeToggle.tsx` | **新建**：主题切换按钮 + Context | 小 |
| `src/app/page.tsx` | 删 Hero 内搜索（搜索逻辑搬到 CommandPalette）；改 Hero 为信息卡；featured 卡片标记前 1-2 张；改网格列数 | 中 |
| `src/app/card/[card_id]/page.tsx` | 改视觉风格 + 加"相关工具"区域 | 中 |
| `src/app/api/visitor/route.ts` | 增加 today 字段处理与日重置逻辑 | 小 |
| `data/visitor-count.json` | 旧文件兼容：首次启动检测到无 `today` 字段时自动迁移 | 自动 |

---

## 7. 不动的部分

- `data.json` 数据结构（兼容）
- 8 个分类的中文标题与锚点 id
- 现有路由结构（`/`, `/card/[card_id]`, `/api/visitor`）
- 现有依赖：MUI 图标、Next.js Image、Tailwind v4

---

## 8. 风险与取舍

- **`backdrop-filter` 性能**：移动端 / 低端机大量玻璃模糊会卡，需把卡片悬停模糊降级（可选）
- **⌘K 在中文输入法激活时冲突**：标准做法是监听 `e.metaKey/e.ctrlKey + e.key === 'k'` 且 `!e.isComposing`
- **暗色模式工作量**：所有 token 翻倍维护；如果时间紧张可分阶段（先亮色，再补暗色）
- **极光动画在低端机**：检测 `prefers-reduced-motion` 时禁用漂移
- **`view-transition` 浏览器支持**：Safari < 18 不支持，退化为无过渡是可接受的

---

## 9. 验收标准

- [ ] 首屏（Hero + 第一个分类的卡片）一屏内全部可见，无需滚动
- [ ] 顶栏 / 侧栏在 1280px / 1440px / 1920px 三种宽度下不变形
- [ ] 暗色模式下所有文字对比度 ≥ 4.5:1
- [ ] ⌘K 在任意页面均可触发，键盘可完成搜索→选择→跳转
- [ ] 访客显示"今天第 N 位"语义正确（次日打开页面时数字应重置）
- [ ] `prefers-reduced-motion: reduce` 时极光动画停止
- [ ] Lighthouse Performance ≥ 85（移动端模拟）
