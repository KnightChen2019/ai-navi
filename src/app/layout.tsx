import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { siteConfig } from "@/lib/site";
import { ThemeProvider } from "@/components/ThemeProvider";
import Topbar from "@/components/Topbar";
import Sidebar from "@/components/Sidebar";
import CommandPalette from "@/components/CommandPalette";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.title,
    template: `%s · ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: ["AI 工具", "AI 导航", "人工智能", "AI 对话", "AI 绘画", "AI 编程", "大模型", "AI Agent"],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "zh_CN",
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: siteConfig.title,
    description: siteConfig.description,
  },
  twitter: {
    card: "summary",
    title: siteConfig.title,
    description: siteConfig.description,
  },
  robots: {
    index: true,
    follow: true,
  },
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
          <CommandPalette />
          <main className="relative z-10 px-3 pb-8 pt-[78px] md:ml-[232px] md:mr-4 md:px-0 md:pl-2 md:pt-[86px]">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
