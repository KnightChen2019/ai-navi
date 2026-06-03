import type { Metadata } from "next";
import ToolPageHeader from "@/components/tools/ToolPageHeader";
import MarkdownTool from "@/components/tools/MarkdownTool";

export const metadata: Metadata = {
  title: "Markdown 预览",
  description: "在线 Markdown 实时预览，支持表格与任务列表，纯浏览器本地渲染。",
};

export default function MarkdownToolPage() {
  return (
    <div className="mx-auto w-full max-w-[1100px] px-2">
      <ToolPageHeader
        title="Markdown 预览"
        description="左侧编辑，右侧实时预览。支持表格、任务列表等常用语法，处理只在你的浏览器本地进行。"
      />
      <MarkdownTool />
    </div>
  );
}
