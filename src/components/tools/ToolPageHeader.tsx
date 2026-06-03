import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function ToolPageHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mb-5">
      <Link
        href="/tools"
        className="inline-flex items-center gap-1 text-xs text-slate-500 transition-colors hover:text-brand"
      >
        <ChevronLeft size={13} /> 返回工具箱
      </Link>
      <h1 className="mt-2 text-[22px] font-bold tracking-tight text-slate-900 dark:text-slate-100">
        {title}
      </h1>
      <p className="mt-1 text-[13px] text-slate-600 dark:text-slate-400">
        {description}
      </p>
    </div>
  );
}
