import type { Metadata } from "next";
import Link from "next/link";
import { getAllCards, getSections } from "@/lib/data";
import ToolCard from "@/components/ToolCard";

export const metadata: Metadata = {
  title: "搜索",
  description: "搜索 AI 导航收录的 AI 工具、金融与新闻站点。",
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q ?? "").trim().toLowerCase();
  const allCards = getAllCards();
  const sections = getSections();

  const filtered = query
    ? allCards.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.description.toLowerCase().includes(query) ||
          c.section.toLowerCase().includes(query) ||
          c.sections?.some((s) => s.toLowerCase().includes(query))
      )
    : [];

  const grouped = sections
    .map((s) => ({
      title: s.title,
      cards: filtered.filter((c) => c.sections?.includes(s.title) ?? c.section === s.title),
    }))
    .filter((g) => g.cards.length > 0);

  const totalCount = allCards.length;

  return (
    <div className="mx-auto max-w-[1000px] px-2">
      {/* Search form */}
      <form action="/search" method="GET" className="mb-6">
        <div className="glass-subtle relative flex items-center gap-2 rounded-2xl px-4 py-3">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-slate-400"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input
            name="q"
            defaultValue={q ?? ""}
            placeholder={`搜索 ${totalCount} 款工具、金融与新闻站点…`}
            autoFocus
            className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 outline-none dark:text-slate-100"
          />
          {query && (
            <Link
              href="/"
              className="shrink-0 rounded-full bg-slate-900/5 px-3 py-1 text-xs font-medium text-slate-500 hover:bg-slate-900/10 dark:bg-white/5 dark:text-slate-400 dark:hover:bg-white/10 transition-colors"
            >
              返回首页
            </Link>
          )}
        </div>
      </form>

      {!query ? (
        <div className="py-16 text-center">
          <p className="text-sm text-slate-400 dark:text-slate-500">输入关键词搜索工具、站点或分类</p>
        </div>
      ) : grouped.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">未找到与「{q}」相关的工具</p>
          <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
            试试其他关键词，或
            <Link href="/submit" className="mx-1 text-brand hover:underline">
              推荐新工具
            </Link>
          </p>
        </div>
      ) : (
        <>
          <p className="mb-4 text-xs text-slate-500 dark:text-slate-400">
            搜索「{q}」共找到 {filtered.length} 个结果
          </p>
          <div className="space-y-8">
            {grouped.map((g) => (
              <section key={g.title}>
                <div className="mb-2.5 flex items-baseline gap-2 px-1">
                  <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {g.title}
                  </h2>
                  <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[10px] font-semibold text-brand">
                    {g.cards.length} 个
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {g.cards.map((c) => (
                    <ToolCard key={c.id} card={c} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
