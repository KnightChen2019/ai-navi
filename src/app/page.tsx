import Image from "next/image";
import Link from "next/link";
import ArrowOutwardIcon from "@mui/icons-material/ArrowOutward";
import { getSections, getAllCards, type Card } from "@/lib/data";

const FEATURED_PER_SECTION = 2;

function CardItem({ card, featured }: { card: Card; featured: boolean }) {
  const sizeLogo = featured ? 48 : 40;
  return (
    <Link
      href={`/card/${card.id}`}
      className={[
        "card-hover-ring group block rounded-2xl p-4 transition-all hover:-translate-y-0.5",
        featured
          ? "glass-medium sm:col-span-2 bg-gradient-to-br from-cyan-500/12 to-indigo-500/12 dark:from-cyan-500/10 dark:to-indigo-500/10"
          : "glass-subtle",
      ].join(" ")}
    >
      <div className="flex items-start gap-3">
        <Image
          src={`/img/${card.img}`}
          alt={card.name}
          width={sizeLogo}
          height={sizeLogo}
          className="rounded-xl shrink-0 ring-1 ring-white/60 dark:ring-white/10"
        />
        <div className="min-w-0 flex-1">
          <p
            className={[
              "font-semibold text-slate-900 dark:text-slate-100 truncate group-hover:text-brand-gradient transition-colors",
              featured ? "text-[15px]" : "text-sm",
            ].join(" ")}
          >
            {card.name}
          </p>
          <p
            className={[
              "mt-1 text-slate-600 dark:text-slate-400 leading-relaxed",
              featured ? "text-xs line-clamp-3" : "text-[11px] line-clamp-2",
            ].join(" ")}
          >
            {card.description}
          </p>
        </div>
        {featured && (
          <span className="self-center flex h-6 w-6 items-center justify-center rounded-md bg-indigo-500/10 text-indigo-500">
            <ArrowOutwardIcon style={{ fontSize: 14 }} />
          </span>
        )}
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
        <span
          aria-hidden
          className="pointer-events-none absolute -top-12 -right-12 h-48 w-48 rounded-full bg-gradient-to-br from-cyan-400/30 to-indigo-500/30 blur-2xl"
        />
        <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-2.5 py-1 text-[11px] font-semibold text-indigo-700 dark:text-cyan-300">
          <span className="h-1 w-1 rounded-full bg-indigo-500 dark:bg-cyan-400" />
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
        {sections.map((section) => {
          const featured = section.cards.slice(0, FEATURED_PER_SECTION);
          const rest = section.cards.slice(FEATURED_PER_SECTION);
          return (
            <section key={section.title} id={section.title} className="scroll-mt-[100px]">
              <div className="mb-3 flex items-baseline gap-2.5 px-1">
                <h2 className="text-[15px] font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                  {section.title}
                </h2>
                <span className="rounded-full bg-indigo-500/10 px-2 py-0.5 text-[10px] font-semibold text-indigo-700 dark:text-cyan-300">
                  {section.cards.length} 个
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {featured.map((c) => (
                  <CardItem key={c.id} card={c} featured />
                ))}
                {rest.map((c) => (
                  <CardItem key={c.id} card={c} featured={false} />
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <footer className="mt-12 border-t border-slate-200/60 dark:border-white/10 pt-6 pb-4 text-xs text-slate-400 dark:text-slate-500">
        <div className="flex flex-col md:flex-row items-center md:justify-between gap-2 px-1">
          <div>Copyright © 2025 AI Navi. All rights reserved.</div>
          <a
            href="https://beian.miit.gov.cn/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            鄂ICP备2026023010号-1
          </a>
        </div>
      </footer>
    </div>
  );
}
