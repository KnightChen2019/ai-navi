"use client";

import React from "react";
import {
  filterCards,
  type Origin,
  type Pricing,
  type Section,
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

export default function FilterableSections({ sections }: { sections: Section[] }) {
  const [pricing, setPricing] = React.useState<Pricing | "all">("all");
  const [origin, setOrigin] = React.useState<Origin | "all">("all");
  const filtering = pricing !== "all" || origin !== "all";

  const visible = filtering
    ? sections
        .map((s) => ({ ...s, cards: filterCards(s.cards, { pricing, origin }) }))
        .filter((s) => s.cards.length > 0)
    : sections;
  const matchCount = visible.reduce((n, s) => n + s.cards.length, 0);

  return (
    <>
      {/* Filter bar */}
      <div className="glass-subtle mb-6 flex flex-wrap items-center gap-x-5 gap-y-2 rounded-2xl px-4 py-3">
        <ChipGroup label="费用" options={PRICING_OPTIONS} value={pricing} onChange={setPricing} />
        <ChipGroup label="地区" options={ORIGIN_OPTIONS} value={origin} onChange={setOrigin} />
        {filtering && (
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            共 {matchCount} 款
          </span>
        )}
      </div>

      {/* Sections */}
      {matchCount === 0 ? (
        <p className="py-16 text-center text-sm text-slate-400 dark:text-slate-500">
          没有匹配的工具
        </p>
      ) : (
        <div className="space-y-10">
          {visible.map((section) => (
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
                  <ToolCard key={c.id} card={c} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </>
  );
}
