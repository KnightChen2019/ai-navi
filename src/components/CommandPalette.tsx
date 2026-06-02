"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Search } from "lucide-react";
import { getAllCards, type CardWithSection } from "@/lib/data";

export default function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const allCards = useMemo(() => getAllCards(), []);

  const filtered: CardWithSection[] = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allCards.slice(0, 50);
    return allCards.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.section.toLowerCase().includes(q)
    );
  }, [query, allCards]);

  // Group by section preserving order
  const grouped = useMemo(() => {
    const map = new Map<string, CardWithSection[]>();
    for (const c of filtered) {
      if (!map.has(c.section)) map.set(c.section, []);
      map.get(c.section)!.push(c);
    }
    return Array.from(map.entries());
  }, [filtered]);

  // Open via custom event or ⌘K / Ctrl+K
  useEffect(() => {
    const openHandler = () => setOpen(true);
    window.addEventListener("ai-navi:open-palette", openHandler);

    const keyHandler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k" && !e.isComposing) {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", keyHandler);

    return () => {
      window.removeEventListener("ai-navi:open-palette", openHandler);
      window.removeEventListener("keydown", keyHandler);
    };
  }, [open]);

  // Reset state and focus input on open
  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIdx(0);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  // Keep active index in range
  useEffect(() => {
    if (activeIdx >= filtered.length) setActiveIdx(Math.max(0, filtered.length - 1));
  }, [filtered.length, activeIdx]);

  const navigateTo = useCallback(
    (card: CardWithSection) => {
      setOpen(false);
      router.push(`/card/${card.id}`);
    },
    [router]
  );

  const onInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(filtered.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const c = filtered[activeIdx];
      if (c) navigateTo(c);
    }
  };

  // Scroll active item into view
  useEffect(() => {
    if (!open) return;
    const el = listRef.current?.querySelector<HTMLElement>(
      `[data-cmd-idx="${activeIdx}"]`
    );
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIdx, open]);

  if (!open) return null;

  let flatIdx = -1;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4"
      onClick={() => setOpen(false)}
    >
      <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm dark:bg-slate-950/60" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="搜索 AI 工具"
        className="glass-strong relative w-full max-w-[600px] overflow-hidden rounded-2xl"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          // Trap focus inside the palette: arrow keys drive the list, so Tab
          // simply keeps focus on the input rather than escaping the dialog.
          if (e.key === "Tab") {
            e.preventDefault();
            inputRef.current?.focus();
          }
        }}
      >
        <div className="flex items-center gap-3 border-b border-[var(--border)] px-4 py-3">
          <Search size={18} className="text-slate-400" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIdx(0);
            }}
            onKeyDown={onInputKeyDown}
            placeholder="搜索工具名称、描述或分类…"
            className="flex-1 bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none"
          />
          <kbd className="rounded bg-slate-900/5 dark:bg-white/10 px-1.5 py-0.5 text-[10px] font-mono text-slate-500 dark:text-slate-400">
            Esc
          </kbd>
        </div>

        <div ref={listRef} className="max-h-[60vh] overflow-y-auto py-2">
          {grouped.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-slate-400">
              没有找到匹配的工具
            </div>
          )}
          {grouped.map(([sectionTitle, cards]) => (
            <div key={sectionTitle} className="mb-2">
              <div className="px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {sectionTitle}
              </div>
              {cards.map((c) => {
                flatIdx++;
                const isActive = flatIdx === activeIdx;
                const myIdx = flatIdx;
                return (
                  <button
                    key={c.id}
                    data-cmd-idx={myIdx}
                    onMouseEnter={() => setActiveIdx(myIdx)}
                    onClick={() => navigateTo(c)}
                    className={[
                      "flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors",
                      isActive
                        ? "bg-brand-soft"
                        : "hover:bg-black/[0.04] dark:hover:bg-white/5",
                    ].join(" ")}
                  >
                    <Image
                      src={`/img/${c.img}`}
                      alt={c.name}
                      width={28}
                      height={28}
                      className="rounded-md ring-1 ring-white/60 dark:ring-white/10 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                        {c.name}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {c.description}
                      </div>
                    </div>
                    {isActive && (
                      <kbd className="rounded bg-slate-900/10 dark:bg-white/10 px-1.5 py-0.5 text-[10px] font-mono text-slate-500 dark:text-slate-400">
                        ↵
                      </kbd>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
