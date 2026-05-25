"use client";

import React from "react";
import { useRouter } from "next/navigation";
import WhatshotIcon from "@mui/icons-material/Whatshot";
import ChatIcon from "@mui/icons-material/Chat";
import EditNoteIcon from "@mui/icons-material/EditNote";
import CodeIcon from "@mui/icons-material/Code";
import BrushIcon from "@mui/icons-material/Brush";
import AnnouncementIcon from "@mui/icons-material/Announcement";
import DeviceHubIcon from "@mui/icons-material/DeviceHub";
import PsychologyAltIcon from "@mui/icons-material/PsychologyAlt";
import VisitorCounter from "./VisitorCounter";

const items = [
  { id: "AI热门工具",   label: "AI 热门工具", Icon: WhatshotIcon },
  { id: "AI对话聊天",   label: "AI 对话聊天", Icon: ChatIcon },
  { id: "AI文本工具",   label: "AI 文本工具", Icon: EditNoteIcon },
  { id: "AI编程工具",   label: "AI 编程工具", Icon: CodeIcon },
  { id: "AI绘画",       label: "AI 绘画",     Icon: BrushIcon },
  { id: "AI新闻",       label: "AI 新闻",     Icon: AnnouncementIcon },
  { id: "大模型API",    label: "大模型 API",  Icon: DeviceHubIcon },
  { id: "Agent工具",    label: "Agent 工具",  Icon: PsychologyAltIcon },
];

export default function Sidebar() {
  const router = useRouter();
  const [active, setActive] = React.useState<string>(items[0].id);

  const handleClick = (anchor: string) => {
    setActive(anchor);
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
    <aside
      className="glass-medium fixed left-4 top-[86px] bottom-4 z-20 flex w-[200px] flex-col rounded-2xl p-3"
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
                  ? "bg-gradient-to-r from-cyan-500/15 to-indigo-500/15 text-indigo-700 dark:text-cyan-300 border border-indigo-500/20"
                  : "text-slate-600 hover:bg-white/40 dark:text-slate-300 dark:hover:bg-white/5",
              ].join(" ")}
            >
              {isActive && (
                <span className="absolute -left-3 top-1/2 h-1/2 w-[3px] -translate-y-1/2 rounded-r bg-gradient-to-b from-cyan-500 to-indigo-500" />
              )}
              <span
                className={[
                  "flex h-[18px] w-[18px] items-center justify-center rounded-md text-[10px]",
                  isActive
                    ? "bg-gradient-to-br from-cyan-500 to-indigo-500 text-white shadow-sm shadow-indigo-500/40"
                    : "bg-slate-900/5 text-slate-500 dark:bg-white/5 dark:text-slate-400",
                ].join(" ")}
              >
                <Icon style={{ fontSize: 12 }} />
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
  );
}
