import type { Metadata } from "next";
import Link from "next/link";
import { Braces, KeyRound, GitCompare } from "lucide-react";

export const metadata: Metadata = {
  title: "实用工具",
  description: "站内实用小工具：JSON 格式化、随机密码、文本比较，全部在浏览器本地运行。",
};

const TOOLS = [
  { href: "/tools/json", Icon: Braces, name: "JSON 工具", desc: "美化、压缩、校验、转义 / 反转义" },
  { href: "/tools/password", Icon: KeyRound, name: "随机密码", desc: "可定制长度与字符集，批量生成" },
  { href: "/tools/diff", Icon: GitCompare, name: "文本比较", desc: "行级差异，并排高亮" },
];

export default function ToolsPage() {
  return (
    <div className="mx-auto w-full max-w-[1100px] px-2">
      <h1 className="mb-1 px-1 text-[22px] font-bold tracking-tight text-slate-900 dark:text-slate-100">
        实用工具
      </h1>
      <p className="mb-5 px-1 text-[13px] text-slate-600 dark:text-slate-400">
        常用小工具，数据只在你的浏览器本地处理。
      </p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {TOOLS.map(({ href, Icon, name, desc }) => (
          <Link
            key={href}
            href={href}
            className="card-hover-ring glass-subtle group rounded-2xl p-4 transition-all hover:-translate-y-0.5"
          >
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand">
                <Icon size={20} />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900 transition-colors group-hover:text-brand dark:text-slate-100">
                  {name}
                </p>
                <p className="mt-1 text-[12px] text-slate-600 dark:text-slate-400">
                  {desc}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
