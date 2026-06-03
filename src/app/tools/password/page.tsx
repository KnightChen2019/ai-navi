import type { Metadata } from "next";
import ToolPageHeader from "@/components/tools/ToolPageHeader";
import PasswordTool from "@/components/tools/PasswordTool";

export const metadata: Metadata = {
  title: "随机密码生成器",
  description: "可定制长度与字符集、批量生成强随机密码，纯浏览器本地生成。",
};

export default function PasswordToolPage() {
  return (
    <div className="mx-auto w-full max-w-[760px] px-2">
      <ToolPageHeader
        title="随机密码生成器"
        description="可定制长度与字符集，一次生成多条。密码在你的浏览器本地生成，不会上传。"
      />
      <PasswordTool />
    </div>
  );
}
