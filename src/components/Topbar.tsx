"use client";

import Link from "next/link";
import SearchIcon from "@mui/icons-material/Search";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import ThemeToggle from "./ThemeToggle";

export default function Topbar() {
  const openPalette = () => {
    window.dispatchEvent(new CustomEvent("ai-navi:open-palette"));
  };

  return (
    <header className="glass-strong fixed left-4 right-4 top-4 z-30 flex h-[54px] items-center gap-4 rounded-2xl px-5">
      <Link href="/" className="flex items-center gap-2.5 shrink-0">
        <span className="flex h-[34px] w-[34px] items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-500 text-white shadow-md shadow-indigo-500/30">
          <AutoAwesomeIcon style={{ fontSize: 18 }} />
        </span>
        <span className="text-[15px] font-bold tracking-tight text-slate-900 dark:text-slate-100">
          AI Navi
          <span className="ml-1.5 text-[10px] font-medium text-slate-500 dark:text-slate-400">
            / 精选 AI 工具
          </span>
        </span>
      </Link>

      <button
        onClick={openPalette}
        className="ml-6 flex h-[38px] flex-1 max-w-[480px] items-center gap-2.5 rounded-full bg-white/60 dark:bg-slate-900/40 border border-white/80 dark:border-white/10 px-4 text-sm text-slate-400 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
        aria-label="打开搜索 (⌘K)"
      >
        <SearchIcon style={{ fontSize: 16 }} />
        <span className="flex-1 text-left">搜索 AI 工具…</span>
        <span className="rounded bg-slate-900/5 dark:bg-white/10 px-1.5 py-0.5 font-mono text-[10px] text-slate-500 dark:text-slate-400">
          ⌘ K
        </span>
      </button>

      <div className="ml-auto">
        <ThemeToggle />
      </div>
    </header>
  );
}
