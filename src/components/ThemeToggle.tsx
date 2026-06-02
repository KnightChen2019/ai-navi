"use client";

import { Sun, Moon, MonitorCog } from "lucide-react";
import { useTheme } from "./ThemeProvider";

export default function ThemeToggle() {
  const { theme, cycleTheme } = useTheme();
  const label =
    theme === "light" ? "切换到暗色" : theme === "dark" ? "切换到跟随系统" : "切换到亮色";

  const Icon =
    theme === "light" ? Sun : theme === "dark" ? Moon : MonitorCog;

  return (
    <button
      onClick={cycleTheme}
      aria-label={label}
      title={label}
      className="glass-subtle inline-flex h-9 w-9 items-center justify-center rounded-xl text-slate-600 hover:text-brand dark:text-slate-300 dark:hover:text-brand transition-colors cursor-pointer"
    >
      <Icon size={18} />
    </button>
  );
}
