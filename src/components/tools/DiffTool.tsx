"use client";

import { useState } from "react";
import { diffLines, type DiffResult } from "@/lib/tools/text-diff";

const AREA =
  "glass-subtle h-56 w-full resize-y rounded-xl p-3 font-mono text-[13px] outline-none";

function rowClass(type: "eq" | "add" | "del", side: "left" | "right") {
  if (type === "eq") return "";
  if (type === "del" && side === "left") return "bg-red-500/10 text-red-700 dark:text-red-300";
  if (type === "add" && side === "right") return "bg-green-500/10 text-green-700 dark:text-green-300";
  return "opacity-40";
}

export default function DiffTool() {
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [result, setResult] = useState<DiffResult | null>(null);

  return (
    <div className="space-y-3">
      <div className="grid gap-3 md:grid-cols-2">
        <textarea value={a} onChange={(e) => setA(e.target.value)} placeholder="旧文本…" spellCheck={false} className={AREA} />
        <textarea value={b} onChange={(e) => setB(e.target.value)} placeholder="新文本…" spellCheck={false} className={AREA} />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setResult(diffLines(a, b))}
          className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:opacity-90"
        >
          对比
        </button>
        {result && (
          <span className="text-xs text-slate-500">
            <span className="text-green-600 dark:text-green-400">+{result.added} 行</span>
            {" / "}
            <span className="text-red-600 dark:text-red-400">−{result.removed} 行</span>
          </span>
        )}
      </div>

      {result && (
        result.added === 0 && result.removed === 0 ? (
          <div className="glass-subtle rounded-xl p-4 text-sm text-slate-500">无差异</div>
        ) : (
          <div className="glass-subtle overflow-hidden rounded-xl font-mono text-[12px]">
            {result.rows.map((row, idx) => (
              <div key={idx} className="grid grid-cols-2 border-b border-slate-200/40 last:border-0 dark:border-white/5">
                <div className={`flex gap-2 px-2 py-0.5 ${rowClass(row.type, "left")}`}>
                  <span className="w-8 shrink-0 select-none text-right text-slate-400">{row.leftNo ?? ""}</span>
                  <span className="whitespace-pre-wrap break-all">{row.left ?? ""}</span>
                </div>
                <div className={`flex gap-2 border-l border-slate-200/40 px-2 py-0.5 dark:border-white/5 ${rowClass(row.type, "right")}`}>
                  <span className="w-8 shrink-0 select-none text-right text-slate-400">{row.rightNo ?? ""}</span>
                  <span className="whitespace-pre-wrap break-all">{row.right ?? ""}</span>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
