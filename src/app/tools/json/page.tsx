import type { Metadata } from "next";
import ToolPageHeader from "@/components/tools/ToolPageHeader";
import JsonTool from "@/components/tools/JsonTool";

export const metadata: Metadata = {
  title: "JSON 工具",
  description: "在线 JSON 美化、压缩、校验与转义，纯浏览器本地处理。",
};

export default function JsonToolPage() {
  return (
    <div className="mx-auto w-full max-w-[1100px] px-2">
      <ToolPageHeader
        title="JSON 工具"
        description="美化、压缩、校验、转义 / 反转义。数据只在你的浏览器本地处理。"
      />
      <JsonTool />
    </div>
  );
}
