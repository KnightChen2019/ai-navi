'use client'

import React from 'react'
import WhatshotIcon from '@mui/icons-material/Whatshot';
import ChatIcon from '@mui/icons-material/Chat';
import EditNoteIcon from '@mui/icons-material/EditNote';
import CodeIcon from '@mui/icons-material/Code';
import BrushIcon from '@mui/icons-material/Brush';
import AnnouncementIcon from '@mui/icons-material/Announcement';
import DeviceHubIcon from '@mui/icons-material/DeviceHub';
import PsychologyAltIcon from '@mui/icons-material/PsychologyAlt';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { useRouter } from 'next/navigation';

const items = [
  { id: 'AI热门工具', label: 'AI热门工具', Icon: WhatshotIcon },
  { id: 'AI对话聊天', label: 'AI对话聊天', Icon: ChatIcon },
  { id: 'AI文本工具', label: 'AI文本工具', Icon: EditNoteIcon },
  { id: 'AI编程工具', label: 'AI编程工具', Icon: CodeIcon },
  { id: 'AI绘画', label: 'AI绘画', Icon: BrushIcon },
  { id: 'AI新闻', label: 'AI新闻', Icon: AnnouncementIcon },
  { id: '大模型API', label: '大模型API', Icon: DeviceHubIcon },
  { id: 'Agent工具', label: 'Agent工具', Icon: PsychologyAltIcon },
];

const Navbar = () => {
  const router = useRouter();

  const handleClick = (anchor: string) => {
    if (window.location.pathname === '/') {
      document.getElementById(anchor)?.scrollIntoView({ behavior: 'smooth' });
    } else {
      router.push('/');
      setTimeout(() => {
        document.getElementById(anchor)?.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    }
  };

  return (
    <aside className="group fixed left-0 top-0 z-30 h-screen w-16 hover:w-56 transition-all duration-200 bg-white/80 backdrop-blur border-r border-slate-200 flex flex-col overflow-hidden">
      <button
        onClick={() => handleClick('hero')}
        className="flex items-center gap-3 h-16 px-4 border-b border-slate-100 cursor-pointer"
      >
        <div className="h-9 w-9 shrink-0 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 text-white flex items-center justify-center shadow-sm">
          <AutoAwesomeIcon fontSize="small" />
        </div>
        <span className="whitespace-nowrap font-semibold text-slate-800 opacity-0 group-hover:opacity-100 transition-opacity">
          AI 导航站
        </span>
      </button>

      <nav className="flex-1 py-3 flex flex-col gap-1">
        {items.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => handleClick(id)}
            className="mx-2 flex items-center gap-3 h-10 px-3 rounded-lg text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors cursor-pointer"
          >
            <Icon fontSize="small" className="shrink-0" />
            <span className="whitespace-nowrap text-sm opacity-0 group-hover:opacity-100 transition-opacity">
              {label}
            </span>
          </button>
        ))}
      </nav>

      <div className="px-4 py-3 text-[11px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
        © 2025 AI Navi
      </div>
    </aside>
  );
};

export default Navbar;
