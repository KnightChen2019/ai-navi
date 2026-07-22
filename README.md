# AI Navi · 精选 AI 工具导航站

一个轻量的 AI 工具导航站，按场景（对话、写作、绘画、编程、Agent、大模型 API 等）收录并直达优质 AI 应用。基于 **Next.js App Router** 构建，玻璃拟态 UI、暗色模式、⌘K 命令面板、访客计数。

## 技术栈

- **Next.js 16**（App Router，`output: "standalone"`）+ **React 19**
- **Tailwind CSS 4**（设计 token 与玻璃拟态工具类见 `src/app/globals.css`）
- **lucide-react** 图标
- **TypeScript**

## 本地开发

```bash
npm install
npm run dev
```

打开 http://localhost:4000 （开发与生产端口均为 **4000**）。

## 常用脚本

| 命令 | 说明 |
| --- | --- |
| `npm run dev` | 启动开发服务器（:4000） |
| `npm run build` | 先校验 `data.json`，再构建生产版本 |
| `npm run start` | 运行生产构建（:4000） |
| `npm run lint` | ESLint 检查 |
| `npm run validate` | 校验 `data.json`（id 唯一、分类合法、图片存在等） |
| `npm run fetch-icons` | 为缺失 logo 的工具自动抓取站点图标（`-- --all` 全量重抓） |
| `npm run check-links` | 巡检 `data.json` 全部出站链接，报死链（403 视为存活仅告警） |

## 环境变量

| 变量 | 说明 |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | 站点生产域名（如 `https://your-domain.com`）。用于 canonical、Open Graph、`sitemap.xml`、`robots.txt`。未设置时回退到 `http://localhost:4000`。 |

## 数据维护

所有工具数据集中在根目录 **`data.json`**，采用「唯一工具 + 多分类标签」结构：

```jsonc
{
  "sections": ["AI热门工具", "AI对话聊天", "..."],   // 分类及展示顺序
  "tools": [
    {
      "id": "doubao",                 // url-safe slug，作为 /card/<id> 路由与去重键
      "name": "豆包",
      "description": "抖音旗下AI助手",
      "img": "doubao.jpg",            // 对应 public/img/doubao.jpg
      "link": "https://doubao.com",
      "addedAt": "2025-12-03",        // 收录日期（YYYY-MM-DD），首页「最新收录」按此排序
      "pricing": "freemium",          // free 免费 | freemium 部分免费 | paid 付费
      "origin": "cn",                 // cn 国产 | global 海外
      "sections": ["AI热门工具", "AI对话聊天"]   // 一个工具可属于多个分类
    }
  ]
}
```

- 新增工具：在 `tools` 里加一项（`img` 先写 `<id>.png`），再运行 `npm run fetch-icons` 自动抓图标到 `public/img/`；抓不到时手动放图。
- 访客投稿：站点 `/submit` 页的推荐会写入 `data/submissions.json`，人工审核后合并进 `data.json` 并删除对应条目。
- 调整分类顺序：改 `sections` 数组顺序即可（侧边栏图标映射在 `src/components/Sidebar.tsx`）。
- 提交前可运行 `npm run validate` 自检；`npm run build` 也会自动校验。

## 部署（Docker）

```bash
docker build -t ai-navi .
docker run -p 4000:3000 -e NEXT_PUBLIC_SITE_URL=https://your-domain.com ai-navi
```

> 访客计数写入容器内 `data/visitor-count.json`，依赖持久化文件系统；如部署到 Serverless 平台需改用外部存储（KV/数据库）。
