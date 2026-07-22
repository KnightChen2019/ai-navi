import type { Metadata } from "next";
import { getSectionTitles } from "@/lib/data";
import SubmitForm from "@/components/SubmitForm";

export const metadata: Metadata = {
  title: "推荐工具",
  description: "向你推荐优质的 AI 工具，审核通过后收录进 AI 导航站。",
};

export default function SubmitPage() {
  return (
    <div className="mx-auto max-w-xl px-2">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          推荐工具
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          发现了好用的 AI 工具？告诉我们，审核通过后会收录进站点。
        </p>
      </div>
      <SubmitForm sections={getSectionTitles()} />
    </div>
  );
}
