"use client";

import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import SettingsBrightnessIcon from "@mui/icons-material/SettingsBrightness";
import { useTheme } from "./ThemeProvider";

export default function ThemeToggle() {
  const { theme, cycleTheme } = useTheme();
  const label =
    theme === "light" ? "切换到暗色" : theme === "dark" ? "切换到跟随系统" : "切换到亮色";

  const Icon =
    theme === "light" ? LightModeIcon : theme === "dark" ? DarkModeIcon : SettingsBrightnessIcon;

  return (
    <button
      onClick={cycleTheme}
      aria-label={label}
      title={label}
      className="glass-subtle inline-flex h-9 w-9 items-center justify-center rounded-xl text-slate-600 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-cyan-300 transition-colors cursor-pointer"
    >
      <Icon fontSize="small" />
    </button>
  );
}
