/**
 * Central site config. Set NEXT_PUBLIC_SITE_URL in the environment to your
 * production origin (e.g. https://your-domain.com) so canonical URLs, Open
 * Graph tags, the sitemap and robots.txt all point at the right place.
 */
export const siteConfig = {
  name: "AI 导航站",
  title: "AI 导航站 · 精选 AI 工具集合",
  description:
    "精选优质 AI 工具，覆盖对话、写作、绘画、编程、Agent、大模型 API 等场景，并汇聚金融与新闻优质站点，帮你快速发现并直达好用应用与资讯。",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:4000",
} as const;
