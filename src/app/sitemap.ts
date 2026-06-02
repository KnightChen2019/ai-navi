import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";
import { getAllCards } from "@/lib/data";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.url.replace(/\/$/, "");
  return [
    { url: `${base}/`, changeFrequency: "daily", priority: 1 },
    ...getAllCards().map((c) => ({
      url: `${base}/card/${c.id}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
