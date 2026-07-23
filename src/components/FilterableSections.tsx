"use client";

import React from "react";
import {
  filterCards,
  type Origin,
  type Pricing,
  type Block,
} from "@/lib/data";
import ToolCard from "./ToolCard";

const PRICING_OPTIONS: { value: Pricing | "all"; label: string }[] = [
  { value: "all", label: "全部" },
  { value: "free", label: "免费" },
  { value: "freemium", label: "部分免费" },
  { value: "paid", label: "付费" },
];
const ORIGIN_OPTIONS: { value: Origin | "all"; label: string }[] = [
  { value: "all", label: "全部" },
  { value: "cn", label: "国产" },
  { value: "global", label: "海外" },
];

function ChipGroup<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="mr-0.5 text-[11px] font-medium text-slate-500 dark:text-slate-400">
        {label}
      </span>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          aria-pressed={value === o.value}
          className={[
            "rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors cursor-pointer",
            value === o.value
              ? "bg-brand text-white shadow-sm"
              : "bg-slate-900/5 text-slate-600 hover:bg-slate-900/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10",
          ].join(" ")}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

const BLOCK_COLORS: Record<string, string> = {
  "ai-tools": "border-l-brand",
  finance: "border-l-emerald-500",
  news: "border-l-sky-500",
  "ai-edu": "border-l-violet-500",
  "ai-design": "border-l-pink-500",
  "ai-marketing": "border-l-amber-500",
  "ai-medical": "border-l-red-500",
};
const BLOCK_BG: Record<string, string> = {
  "ai-tools": "from-brand-soft/20",
  finance: "from-emerald-50/60 dark:from-emerald-950/20",
  news: "from-sky-50/60 dark:from-sky-950/20",
  "ai-edu": "from-violet-50/60 dark:from-violet-950/20",
  "ai-design": "from-pink-50/60 dark:from-pink-950/20",
  "ai-marketing": "from-amber-50/60 dark:from-amber-950/20",
  "ai-medical": "from-red-50/60 dark:from-red-950/20",
};
const BLOCK_BADGE: Record<string, string> = {
  "ai-tools": "bg-brand-soft text-brand",
  finance: "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300",
  news: "bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300",
  "ai-edu": "bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300",
  "ai-design": "bg-pink-100 dark:bg-pink-900/40 text-pink-700 dark:text-pink-300",
  "ai-marketing": "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300",
  "ai-medical": "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300",
};

export default function FilterableSections({ blocks }: { blocks: Block[] }) {
  const [pricing, setPricing] = React.useState<Pricing | "all">("all");
  const [origin, setOrigin] = React.useState<Origin | "all">("all");
  const filtering = pricing !== "all" || origin !== "all";

  const visible = React.useMemo(() => {
    if (!filtering) return blocks;
    return blocks
      .map((b) => ({
        ...b,
        sections: b.sections
          .map((s) => ({ ...s, cards: filterCards(s.cards, { pricing, origin }) }))
          .filter((s) => s.cards.length > 0),
      }))
      .filter((b) => b.sections.length > 0);
  }, [blocks, pricing, origin, filtering]);

  const matchCount = visible.reduce(
    (n, b) => n + b.sections.reduce((m, s) => m + s.cards.length, 0),
    0
  );

  return (
    <>
      <div className="glass-subtle mb-6 flex flex-wrap items-center gap-x-5 gap-y-2 rounded-2xl px-4 py-3">
        <ChipGroup label="费用" options={PRICING_OPTIONS} value={pricing} onChange={setPricing} />
        <ChipGroup label="地区" options={ORIGIN_OPTIONS} value={origin} onChange={setOrigin} />
        {filtering && (
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            共 {matchCount} 款
          </span>
        )}
      </div>

      {matchCount === 0 ? (
        <p className="py-16 text-center text-sm text-slate-400 dark:text-slate-500">
          没有匹配的工具
        </p>
      ) : (
        <div className="space-y-10">
          {visible.map((block) => (
            <section
              key={block.id}
              id={block.id}
              className={[
                "scroll-mt-[100px] rounded-2xl border-l-[3px] border border-slate-200/60 dark:border-white/10 bg-gradient-to-r p-5 dark:from-transparent",
                BLOCK_COLORS[block.id] || "border-l-brand",
                BLOCK_BG[block.id] || "from-brand-soft/20",
              ].join(" ")}
            >
              <div className="mb-4 flex items-baseline gap-3">
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                  {block.title}
                </h2>
                <span
                  className={[
                    "rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
                    BLOCK_BADGE[block.id] || "bg-brand-soft text-brand",
                  ].join(" ")}
                >
                  {block.sections.reduce((n, s) => n + s.cards.length, 0)} 个
                </span>
              </div>

              {/* Multi-section blocks show sub-headers; single-section blocks show cards directly */}
              {block.sections.map((section) => (
                <div key={section.title} className={block.sections.length > 1 ? "mb-6" : ""}>
                  {block.sections.length > 1 && (
                    <div className="mb-2.5 flex items-baseline gap-2 px-1">
                      <h3 className="text-[14px] font-semibold text-slate-800 dark:text-slate-200">
                        {section.title}
                      </h3>
                      <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[10px] font-semibold text-brand">
                        {section.cards.length} 个
                      </span>
                    </div>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {section.cards.map((c) => (
                      <ToolCard key={c.id} card={c} />
                    ))}
                  </div>
                </div>
              ))}
            </section>
          ))}
        </div>
      )}
    </>
  );
}
