import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { getCardById, getRelatedCards } from "@/lib/data";

interface PageProps {
  params: Promise<{ card_id: string }>;
}

export default async function CardDetail({ params }: PageProps) {
  const { card_id } = await params;
  const card = getCardById(card_id);
  if (!card) notFound();

  const related = getRelatedCards(card_id, 4);

  return (
    <div className="mx-auto max-w-4xl px-2">
      <Link
        href="/"
        className="glass-subtle mb-5 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-cyan-300 transition-colors"
      >
        <ArrowBackIcon style={{ fontSize: 14 }} /> 返回
      </Link>

      {/* Main card */}
      <div className="glass-medium relative overflow-hidden rounded-3xl p-8">
        <span
          aria-hidden
          className="pointer-events-none absolute -top-16 -right-16 h-60 w-60 rounded-full bg-gradient-to-br from-cyan-400/30 to-indigo-500/30 blur-3xl"
        />
        <div className="flex items-start gap-6 relative">
          <Image
            src={`/img/${card.img}`}
            alt={card.name}
            width={80}
            height={80}
            className="rounded-2xl ring-1 ring-white/70 dark:ring-white/10 shrink-0"
          />
          <div className="flex-1 min-w-0">
            <span className="inline-flex items-center rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-700 dark:text-cyan-300">
              {card.section}
            </span>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              {card.name}
            </h1>
          </div>
          <Link
            href={card.link}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-500 px-4 py-2.5 text-sm font-medium text-white shadow-md shadow-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/40 transition-shadow shrink-0"
          >
            <OpenInNewIcon style={{ fontSize: 16 }} /> 访问官网
          </Link>
        </div>

        <p className="mt-6 text-[15px] leading-relaxed text-slate-700 dark:text-slate-300">
          {card.description}
        </p>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-3 px-1 text-[14px] font-bold text-slate-900 dark:text-slate-100">
            同类推荐
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {related.map((c) => (
              <Link
                key={c.id}
                href={`/card/${c.id}`}
                className="glass-subtle card-hover-ring group block rounded-2xl p-3.5 transition-all hover:-translate-y-0.5"
              >
                <div className="flex items-center gap-3">
                  <Image
                    src={`/img/${c.img}`}
                    alt={c.name}
                    width={40}
                    height={40}
                    className="rounded-xl ring-1 ring-white/60 dark:ring-white/10 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate group-hover:text-brand-gradient transition-colors">
                      {c.name}
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                      {c.description}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
