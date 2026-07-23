import Image from "next/image";
import { getBlocks, getAllCards } from "@/lib/data";
import TrendingRail from "@/components/TrendingRail";
import LatestRail from "@/components/LatestRail";
import FilterableSections from "@/components/FilterableSections";

export const dynamic = "force-dynamic"; // 本周热门按请求读文件

export default function Home() {
  const blocks = getBlocks();
  const totalCount = getAllCards().length;

  return (
    <div className="w-full max-w-[1400px] mx-auto px-2">
      {/* Hero info-card */}
      <section id="hero" className="glass-medium relative overflow-hidden rounded-2xl p-7 mb-6">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-soft bg-brand-soft px-2.5 py-1 text-[11px] font-semibold text-brand">
          <span className="h-1 w-1 rounded-full bg-brand" />
          每日精选 · 已收录 {totalCount} 款工具
        </span>
        <h1 className="mt-2.5 text-[28px] font-bold tracking-tight text-brand-gradient">
          发现优质 AI 工具
        </h1>
        <p className="mt-1.5 text-[13px] text-slate-600 dark:text-slate-400">
          精选 AI 工具与金融、新闻优质站点
        </p>
      </section>

      {/* 本周热门 */}
      <TrendingRail />

      {/* 最新收录 */}
      <LatestRail />

      {/* 按块分区展示 */}
      <FilterableSections blocks={blocks} />

      <footer className="mt-12 border-t border-slate-200/60 dark:border-white/10 pt-6 pb-4 text-xs text-slate-400 dark:text-slate-500">
        <div className="flex flex-col md:flex-row items-center md:justify-between gap-2 px-1">
          <div>Copyright © 2025 AI Navi. All rights reserved.</div>
          <div className="flex flex-col items-center gap-x-4 gap-y-1 sm:flex-row">
            <a
              href="https://beian.miit.gov.cn/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              鄂ICP备2026023010号-1
            </a>
            <a
              href="https://beian.mps.gov.cn/#/query/webSearch?code=42018502008884"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              <Image src="/gongan.png" alt="公安备案" width={13} height={14} className="inline-block" />
              鄂公网安备42018502008884号
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
