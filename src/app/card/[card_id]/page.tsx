import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import OutboundVisitButton from "@/components/OutboundVisitButton";
import FavoriteButton from "@/components/FavoriteButton";
import ToolCard from "@/components/ToolCard";
import { siteConfig } from "@/lib/site";
import { getAllCards, getCardById, getRelatedCards } from "@/lib/data";

interface PageProps {
  params: Promise<{ card_id: string }>;
}

// Pre-render every tool page at build time (better SEO + instant loads).
export function generateStaticParams() {
  return getAllCards().map((c) => ({ card_id: c.id }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { card_id } = await params;
  const card = getCardById(card_id);
  if (!card) return { title: "未找到工具" };
  const path = `/card/${card.id}`;
  return {
    title: `${card.name} — ${card.section}`,
    description: card.description,
    alternates: { canonical: path },
    openGraph: {
      type: "article",
      title: `${card.name} · ${siteConfig.name}`,
      description: card.description,
      url: `${siteConfig.url.replace(/\/$/, "")}${path}`,
      images: [{ url: `/img/${card.img}` }],
    },
  };
}

export default async function CardDetail({ params }: PageProps) {
  const { card_id } = await params;
  const card = getCardById(card_id);
  if (!card) notFound();

  const related = getRelatedCards(card_id, 4);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: card.name,
    description: card.description,
    applicationCategory: card.section,
    url: card.link,
    image: `${siteConfig.url.replace(/\/$/, "")}/img/${card.img}`,
    offers: { "@type": "Offer", price: "0", priceCurrency: "CNY" },
  };

  return (
    <div className="mx-auto max-w-4xl px-2">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Link
        href="/"
        className="glass-subtle mb-5 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300 hover:text-brand transition-colors"
      >
        <ArrowLeft size={14} /> 返回
      </Link>

      {/* Main card */}
      <div className="glass-medium relative overflow-hidden rounded-3xl p-5 sm:p-8">
        <div className="relative flex flex-wrap items-start gap-4 sm:gap-6">
          <Image
            src={`/img/${card.img}`}
            alt={card.name}
            width={80}
            height={80}
            className="rounded-2xl ring-1 ring-white/70 dark:ring-white/10 shrink-0"
          />
          <div className="flex-1 min-w-0">
            <span className="inline-flex items-center rounded-full bg-brand-soft px-2.5 py-0.5 text-[11px] font-semibold text-brand">
              {card.section}
            </span>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              {card.name}
            </h1>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <FavoriteButton
              toolId={card.id}
              alwaysVisible
              className="h-10 w-10 glass-subtle rounded-xl"
            />
            <OutboundVisitButton toolId={card.id} href={card.link} />
          </div>
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
              <ToolCard key={c.id} card={c} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
