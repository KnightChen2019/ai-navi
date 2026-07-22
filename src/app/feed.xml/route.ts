import { siteConfig } from "@/lib/site";
import { getLatestCards } from "@/lib/data";

// Static at build time: data.json is the single source of truth and only
// changes on deploy, so the feed is prerendered like the other pages.

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function GET() {
  const base = siteConfig.url.replace(/\/$/, "");
  const items = getLatestCards(30)
    .map(
      (c) => `    <item>
      <title>${escapeXml(c.name)}</title>
      <link>${base}/card/${c.id}</link>
      <guid isPermaLink="true">${base}/card/${c.id}</guid>
      <description>${escapeXml(c.description)}</description>
      <pubDate>${new Date(`${c.addedAt}T00:00:00Z`).toUTCString()}</pubDate>
    </item>`
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(siteConfig.title)}</title>
    <link>${base}</link>
    <description>${escapeXml(siteConfig.description)}</description>
    <language>zh-cn</language>
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
