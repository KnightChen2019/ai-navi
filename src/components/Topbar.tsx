"use client";

import Link from "next/link";
import { Search, Sparkles, Menu, Heart } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { useFavorites } from "@/lib/useFavorites";

export default function Topbar() {
  const { count } = useFavorites();

  const openPalette = () => {
    window.dispatchEvent(new CustomEvent("ai-navi:open-palette"));
  };

  const toggleSidebar = () => {
    window.dispatchEvent(new CustomEvent("ai-navi:toggle-sidebar"));
  };

  return (
    <header className="glass-strong fixed left-3 right-3 top-3 z-30 flex h-[54px] items-center gap-2 rounded-2xl px-3 sm:left-4 sm:right-4 sm:top-4 sm:gap-4 sm:px-5">
      {/* Mobile: open the category drawer */}
      <button
        onClick={toggleSidebar}
        className="md:hidden glass-subtle inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-600 dark:text-slate-300 cursor-pointer"
        aria-label="打开分类菜单"
      >
        <Menu size={18} />
      </button>

      <Link href="/" className="flex items-center gap-2.5 shrink-0">
        <span className="flex h-[34px] w-[34px] items-center justify-center rounded-xl bg-brand text-white shadow-sm">
          <Sparkles size={18} />
        </span>
        <span className="text-[15px] font-bold tracking-tight text-slate-900 dark:text-slate-100">
          AI Navi
          <span className="ml-1.5 hidden text-[10px] font-medium text-slate-500 dark:text-slate-400 sm:inline">
            / 精选 AI 工具
          </span>
        </span>
      </Link>

      <button
        onClick={openPalette}
        className="ml-2 flex h-[38px] flex-1 max-w-[480px] items-center gap-2.5 rounded-full bg-black/[0.03] dark:bg-white/5 border border-[var(--border)] px-4 text-sm text-slate-400 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer sm:ml-6"
        aria-label="打开搜索 (⌘K)"
      >
        <Search size={16} />
        <span className="flex-1 text-left">搜索 AI 工具…</span>
        <span className="hidden rounded bg-slate-900/5 dark:bg-white/10 px-1.5 py-0.5 font-mono text-[10px] text-slate-500 dark:text-slate-400 sm:inline">
          ⌘ K
        </span>
      </button>

      <div className="ml-auto flex shrink-0 items-center gap-2">
        <Link
          href="/favorites"
          aria-label={`我的收藏（${count}）`}
          className="glass-subtle relative inline-flex h-9 w-9 items-center justify-center rounded-xl text-slate-600 transition-colors hover:text-brand dark:text-slate-300"
        >
          <Heart size={18} className={count > 0 ? "fill-current text-brand" : ""} />
          {count > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[9px] font-bold text-white">
              {count}
            </span>
          )}
        </Link>
        <ThemeToggle />
      </div>
    </header>
  );
}
