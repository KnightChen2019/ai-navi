"use client";

import { useState } from "react";
import {
  beautify,
  minify,
  escapeStr,
  unescapeStr,
} from "@/lib/tools/json-format";
import CopyButton from "./CopyButton";

type Action = "beautify" | "minify" | "escape" | "unescape";

const BTN =
  "rounded-lg border border-brand-soft bg-brand-soft px-3 py-1.5 text-xs font-semibold text-brand transition-colors hover:bg-brand hover:text-white";

export default function JsonTool() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);

  function run(action: Action) {
    if (input.trim() === "") {
      setError("请输入 JSON");
      setOutput("");
      return;
    }
    const res =
      action === "beautify"
        ? beautify(input)
        : action === "minify"
          ? minify(input)
          : action === "escape"
            ? ({ ok: true as const, value: escapeStr(input) })
            : unescapeStr(input);

    if (res.ok) {
      setOutput(res.value);
      setError(null);
    } else {
      setOutput("");
      const pos =
        "line" in res && res.line
          ? `（第 ${res.line} 行第 ${res.column} 列）`
          : "";
      setError(res.error + pos);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <button className={BTN} onClick={() => run("beautify")}>美化</button>
        <button className={BTN} onClick={() => run("minify")}>压缩</button>
        <button className={BTN} onClick={() => run("escape")}>转义</button>
        <button className={BTN} onClick={() => run("unescape")}>反转义</button>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="在此粘贴 JSON…"
          spellCheck={false}
          className="glass-subtle h-72 w-full resize-y rounded-xl p-3 font-mono text-[13px] outline-none"
        />
        <div className="relative">
          {error ? (
            <div className="glass-subtle h-72 w-full overflow-auto rounded-xl p-3 font-mono text-[13px] text-red-600 dark:text-red-400">
              {error}
            </div>
          ) : (
            <>
              <pre className="glass-subtle h-72 w-full overflow-auto whitespace-pre-wrap rounded-xl p-3 font-mono text-[13px]">
                {output}
              </pre>
              {output && (
                <CopyButton text={output} className="absolute right-2 top-2" />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
