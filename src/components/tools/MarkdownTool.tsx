"use client";

import { useMemo, useState } from "react";
import { mdToHtml } from "@/lib/tools/markdown";
import CopyButton from "./CopyButton";

const SAMPLE = `# 标题

**粗体**、*斜体*、~~删除线~~、\`代码\`

- [x] 已完成
- [ ] 待办

| 列 A | 列 B |
| :-- | --: |
| 1 | 2 |

> 引用

\`\`\`
code block
\`\`\`
`;

export default function MarkdownTool() {
  const [src, setSrc] = useState("");
  const html = useMemo(() => mdToHtml(src), [src]);
  const empty = src.trim() === "";

  return (
    <div className="space-y-3">
      <div className="grid gap-3 md:grid-cols-2">
        <textarea
          value={src}
          onChange={(e) => setSrc(e.target.value)}
          placeholder={SAMPLE}
          spellCheck={false}
          className="glass-subtle h-[28rem] w-full resize-y rounded-xl p-3 font-mono text-[13px] outline-none"
        />
        <div className="relative">
          {empty ? (
            <div className="glass-subtle flex h-[28rem] w-full items-center justify-center rounded-xl p-3 text-sm text-slate-400">
              预览将显示在这里
            </div>
          ) : (
            <>
              <div
                className="md-preview glass-subtle h-[28rem] w-full overflow-auto rounded-xl p-4"
                dangerouslySetInnerHTML={{ __html: html }}
              />
              <CopyButton
                text={html}
                label="复制 HTML"
                className="absolute right-2 top-2"
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
