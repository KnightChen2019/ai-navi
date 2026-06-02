import type { Metadata } from "next";
import FavoritesList from "@/components/FavoritesList";

export const metadata: Metadata = {
  title: "我的收藏",
  description: "你收藏的 AI 工具。",
  robots: { index: false, follow: true },
};

export default function FavoritesPage() {
  return (
    <div className="mx-auto w-full max-w-[1400px] px-2">
      <h1 className="mb-4 px-1 text-[22px] font-bold tracking-tight text-slate-900 dark:text-slate-100">
        我的收藏
      </h1>
      <FavoritesList />
    </div>
  );
}
