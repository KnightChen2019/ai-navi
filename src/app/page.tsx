'use client'
import Image from "next/image";
import { useMemo, useState } from "react";
import rawData from "../../data.json";
import Link from "next/link";
import SearchIcon from "@mui/icons-material/Search";
import VisitorCounter from "@/components/VisitorCounter";

interface Card {
  id: string;
  name: string;
  img: string;
  link: string;
  description: string;
}
interface Section {
  title: string;
  cards: Card[];
}

const sections = rawData as Section[];

export default function Home() {
  const [search, setSearch] = useState("");

  const data = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return sections;
    return sections
      .map((s) => ({
        ...s,
        cards: s.cards.filter(
          (c) =>
            c.name.toLowerCase().includes(q) ||
            c.description.toLowerCase().includes(q)
        ),
      }))
      .filter((s) => s.cards.length > 0);
  }, [search]);

  return (
    <div className="w-full">
      {/* Hero */}
      <section
        id="hero"
        className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50"
      >
        <div className="max-w-5xl mx-auto px-6 pt-20 pb-16 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            发现优质 AI 工具
          </h1>
          <p className="mt-4 text-slate-500">
            精选对话、写作、绘画、编程、Agent 等领域的 AI 应用
          </p>

          <div className="mt-8 flex justify-center">
            <div className="flex items-center w-full max-w-xl bg-white rounded-2xl shadow-md ring-1 ring-slate-200 focus-within:ring-2 focus-within:ring-indigo-400 transition">
              <SearchIcon className="ml-4 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="搜索工具名称或描述..."
                className="flex-1 h-12 px-3 bg-transparent outline-none text-slate-800 placeholder:text-slate-400"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="mr-2 px-3 py-1 text-sm text-slate-400 hover:text-slate-600"
                >
                  清除
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Sections */}
      <div className="max-w-7xl mx-auto px-6 py-10 space-y-12">
        {data.length === 0 && (
          <p className="text-center text-slate-400 py-20">
            没有找到匹配 “{search}” 的工具
          </p>
        )}

        {data.map((section) => (
          <section key={section.title} id={section.title} className="scroll-mt-6">
            <div className="flex items-baseline gap-3 mb-4">
              <h2 className="text-xl font-bold text-slate-800">{section.title}</h2>
              <span className="text-xs text-slate-400">{section.cards.length} 个工具</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {section.cards.map((card) => (
                <Link
                  href={`/card/${card.id}`}
                  key={card.id}
                  className="group bg-white rounded-2xl p-4 ring-1 ring-slate-200/70 hover:ring-indigo-300 hover:shadow-lg hover:-translate-y-0.5 transition-all"
                >
                  <div className="flex items-start gap-3">
                    <Image
                      src={`/img/${card.img}`}
                      alt={card.name}
                      width={48}
                      height={48}
                      className="rounded-xl shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-slate-800 truncate group-hover:text-indigo-600 transition-colors">
                        {card.name}
                      </p>
                      <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {card.description}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>

      <footer className="border-t border-slate-200 mt-10 py-6 text-sm text-slate-400">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center md:justify-between gap-3 text-center">
          <div>Copyright © 2025 AI Navi. All rights reserved.</div>
          <div>
            <a
              href="https://beian.miit.gov.cn/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-600 transition-colors"
            >
              鄂ICP备2026023010号-1
            </a>
          </div>
          <VisitorCounter />
        </div>
      </footer>
    </div>
  );
}
