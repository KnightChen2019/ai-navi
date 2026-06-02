"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Flame,
  MessageCircle,
  FileText,
  Code,
  Brush,
  Megaphone,
  Share2,
  Bot,
  type LucideIcon,
} from "lucide-react";
import VisitorCounter from "./VisitorCounter";

const items: { id: string; label: string; Icon: LucideIcon }[] = [
  { id: "AI热门工具", label: "AI 热门工具", Icon: Flame },
  { id: "AI对话聊天", label: "AI 对话聊天", Icon: MessageCircle },
  { id: "AI文本工具", label: "AI 文本工具", Icon: FileText },
  { id: "AI编程工具", label: "AI 编程工具", Icon: Code },
  { id: "AI绘画", label: "AI 绘画", Icon: Brush },
  { id: "AI新闻", label: "AI 新闻", Icon: Megaphone },
  { id: "大模型API", label: "大模型 API", Icon: Share2 },
  { id: "Agent工具", label: "Agent 工具", Icon: Bot },
];

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [active, setActive] = React.useState<string>(items[0].id);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  // Toggle the mobile drawer from the Topbar hamburger; Esc closes it.
  React.useEffect(() => {
    const toggle = () => setMobileOpen((v) => !v);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("ai-navi:toggle-sidebar", toggle);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("ai-navi:toggle-sidebar", toggle);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  // Scroll-spy: highlight the section currently in view (homepage only).
  React.useEffect(() => {
    if (pathname !== "/") return;
    const els = items
      .map((i) => document.getElementById(i.id))
      .filter((el): el is HTMLElement => el !== null);
    if (els.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-100px 0px -65% 0px", threshold: 0 }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [pathname]);

  const handleClick = (anchor: string) => {
    setActive(anchor);
    setMobileOpen(false);
    if (window.location.pathname === "/") {
      document.getElementById(anchor)?.scrollIntoView({ behavior: "smooth" });
    } else {
      router.push("/");
      setTimeout(() => {
        document.getElementById(anchor)?.scrollIntoView({ behavior: "smooth" });
      }, 300);
    }
  };

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/30 backdrop-blur-sm md:hidden"
          aria-hidden
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={[
          "glass-medium fixed top-[78px] bottom-3 left-3 z-40 flex w-[200px] flex-col rounded-2xl p-3 transition-transform duration-300",
          "md:top-[86px] md:bottom-4 md:left-4 md:z-20 md:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-[120%]",
        ].join(" ")}
      >
        <div className="px-3 pt-1 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          分类
        </div>

        <nav className="flex flex-col gap-0.5">
          {items.map(({ id, label, Icon }) => {
            const isActive = id === active;
            return (
              <button
                key={id}
                onClick={() => handleClick(id)}
                aria-current={isActive ? "page" : undefined}
                className={[
                  "relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors cursor-pointer",
                  isActive
                    ? "bg-brand-soft text-brand border border-brand-soft"
                    : "text-slate-600 hover:bg-black/[0.04] dark:text-slate-300 dark:hover:bg-white/5",
                ].join(" ")}
              >
                {isActive && (
                  <span className="absolute -left-3 top-1/2 h-1/2 w-[3px] -translate-y-1/2 rounded-r bg-brand" />
                )}
                <span
                  className={[
                    "flex h-[18px] w-[18px] items-center justify-center rounded-md",
                    isActive
                      ? "bg-brand text-white shadow-sm"
                      : "bg-slate-900/5 text-slate-500 dark:bg-white/5 dark:text-slate-400",
                  ].join(" ")}
                >
                  <Icon size={12} />
                </span>
                {label}
              </button>
            );
          })}
        </nav>

        <div className="mt-auto">
          <VisitorCounter />
        </div>
      </aside>
    </>
  );
}
