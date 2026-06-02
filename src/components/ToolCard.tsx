import Image from "next/image";
import Link from "next/link";
import { type Card } from "@/lib/data";
import FavoriteButton from "./FavoriteButton";

export default function ToolCard({ card, rank }: { card: Card; rank?: number }) {
  return (
    <div className="card-hover-ring group glass-subtle relative rounded-2xl transition-all hover:-translate-y-0.5">
      <Link href={`/card/${card.id}`} className="block rounded-2xl p-4">
        <div className="flex items-start gap-3">
          <div className="relative shrink-0">
            <Image
              src={`/img/${card.img}`}
              alt={card.name}
              width={40}
              height={40}
              className="rounded-xl ring-1 ring-white/60 dark:ring-white/10"
            />
            {rank != null && (
              <span className="absolute -left-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand text-[9px] font-bold text-white">
                {rank}
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1 pr-6">
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate group-hover:text-brand-gradient transition-colors">
              {card.name}
            </p>
            <p className="mt-1 text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2">
              {card.description}
            </p>
          </div>
        </div>
      </Link>
      <FavoriteButton toolId={card.id} className="absolute right-2 top-2" />
    </div>
  );
}
