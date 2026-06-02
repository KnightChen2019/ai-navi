"use client";

import { Heart } from "lucide-react";
import { useFavorites } from "@/lib/useFavorites";

export default function FavoriteButton({
  toolId,
  className = "",
  alwaysVisible = false,
}: {
  toolId: string;
  className?: string;
  alwaysVisible?: boolean;
}) {
  const { isFavorite, toggle } = useFavorites();
  const fav = isFavorite(toolId);
  // 卡片内（alwaysVisible=false）：未收藏时 hover 才显现；详情页（true）：常显。
  const idle = alwaysVisible
    ? "text-slate-400 hover:text-brand"
    : "text-slate-400 opacity-0 group-hover:opacity-100 hover:text-brand";
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(toolId);
      }}
      aria-pressed={fav}
      aria-label={fav ? "取消收藏" : "收藏"}
      className={[
        "inline-flex h-7 w-7 items-center justify-center rounded-lg transition-colors",
        fav ? "text-brand" : idle,
        className,
      ].join(" ")}
    >
      <Heart size={15} className={fav ? "fill-current" : ""} />
    </button>
  );
}
