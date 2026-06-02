import Image from "next/image";
import Link from "next/link";
import { getSections, getAllCards, type Card } from "@/lib/data";

function CardItem({ card }: { card: Card }) {
  return (
    <Link
      href={`/card/${card.id}`}
      className="card-hover-ring group glass-subtle block rounded-2xl p-4 transition-all hover:-translate-y-0.5"
    >
      <div className="flex items-start gap-3">
        <Image
          src={`/img/${card.img}`}
          alt={card.name}
          width={40}
          height={40}
          className="rounded-xl shrink-0 ring-1 ring-white/60 dark:ring-white/10"
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate group-hover:text-brand-gradient transition-colors">
            {card.name}
          </p>
          <p className="mt-1 text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2">
            {card.description}
          </p>
        </div>
      </div>
    </Link>
  );
}

export default function Home() {
  const sections = getSections();
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
          精选对话、写作、绘画、编程、Agent 等领域的 AI 应用
        </p>
      </section>

      {/* Sections */}
      <div className="space-y-10">
        {sections.map((section) => (
          <section key={section.title} id={section.title} className="scroll-mt-[100px]">
            <div className="mb-3 flex items-baseline gap-2.5 px-1">
              <h2 className="text-[15px] font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                {section.title}
              </h2>
              <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[10px] font-semibold text-brand">
                {section.cards.length} 个
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {section.cards.map((c) => (
                <CardItem key={c.id} card={c} />
              ))}
            </div>
          </section>
        ))}
      </div>

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
