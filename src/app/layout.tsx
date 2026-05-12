import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI 导航站 · 精选 AI 工具集合",
  description: "精选优质 AI 工具，覆盖对话、写作、绘画、编程、Agent 等场景。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen w-full flex bg-slate-50 text-slate-900`}
      >
        <Navbar />
        <main className="flex-1 ml-16">{children}</main>
      </body>
    </html>
  );
}
