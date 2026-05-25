import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import Topbar from "@/components/Topbar";
import Sidebar from "@/components/Sidebar";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI 导航站 · 精选 AI 工具集合",
  description: "精选优质 AI 工具，覆盖对话、写作、绘画、编程、Agent 等场景。",
};

// Anti-flash: runs before React hydration, sets the correct theme class
// on <html> based on stored preference (or system).
const themeInitScript = `
(function(){
  try {
    var k='ai-navi-theme';
    var v=localStorage.getItem(k);
    if(v!=='light'&&v!=='dark'&&v!=='system') v='system';
    var dark = v==='dark' || (v==='system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if(dark) document.documentElement.classList.add('dark');
  } catch(e){}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen text-slate-900 dark:text-slate-100`}
      >
        <ThemeProvider>
          <div className="aurora-bg" aria-hidden />
          <Topbar />
          <Sidebar />
          <main className="relative z-10 ml-[232px] mr-4 pt-[86px] pb-8 pl-2">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
