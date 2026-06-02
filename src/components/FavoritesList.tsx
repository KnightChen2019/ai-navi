"use client";

import Link from "next/link";
import { useFavorites } from "@/lib/useFavorites";
import { getAllCards } from "@/lib/data";
import ToolCard from "./ToolCard";

export default function FavoritesList() {
  const { ids } = useFavorites();
  const all = getAllCards();
  const cards = ids
    .map((id) => all.find((c) => c.id === id))
    .filter((c): c is NonNullable<typeof c> => c != null);

  if (cards.length === 0) {
    return (
      <div className="glass-subtle rounded-2xl px-6 py-16 text-center">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          还没有收藏。浏览工具时点卡片右上角的 ♥ 即可收藏。
        </p>
        <Link
          href="/"
          className="mt-4 inline-flex rounded-xl bg-brand px-4 py-2 text-sm font-medium text-white"
        >
          去逛逛
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {cards.map((c) => (
        <ToolCard key={c.id} card={c} />
      ))}
    </div>
  );
}
