import type { Metadata } from "next";
import ToolPageHeader from "@/components/tools/ToolPageHeader";
import DiffTool from "@/components/tools/DiffTool";

export const metadata: Metadata = {
  title: "文本比较",
  description: "在线对比两段文本的行级差异，并排高亮新增与删除。",
};

export default function DiffToolPage() {
  return (
    <div className="mx-auto w-full max-w-[1100px] px-2">
      <ToolPageHeader
        title="文本比较"
        description="并排查看两段文本的行级差异。处理只在你的浏览器本地进行。"
      />
      <DiffTool />
    </div>
  );
}
