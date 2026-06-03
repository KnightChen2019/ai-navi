"use client";

import { useState } from "react";
import { generatePasswords, type PwOptions } from "@/lib/tools/password";
import CopyButton from "./CopyButton";

const CHARSETS: { key: keyof Pick<PwOptions, "upper" | "lower" | "digits" | "symbols">; label: string }[] = [
  { key: "upper", label: "大写 A-Z" },
  { key: "lower", label: "小写 a-z" },
  { key: "digits", label: "数字 0-9" },
  { key: "symbols", label: "符号 !@#" },
];

export default function PasswordTool() {
  const [length, setLength] = useState(16);
  const [sets, setSets] = useState({
    upper: true,
    lower: true,
    digits: true,
    symbols: false,
  });
  const [excludeAmbiguous, setExcludeAmbiguous] = useState(true);
  const [count, setCount] = useState(5);
  const [results, setResults] = useState<string[]>([]);

  const noneSelected = !sets.upper && !sets.lower && !sets.digits && !sets.symbols;

  function generate() {
    const opts: PwOptions = { length, ...sets, excludeAmbiguous, count };
    setResults(generatePasswords(opts));
  }

  return (
    <div className="space-y-4">
      <div className="glass-subtle space-y-4 rounded-xl p-4">
        <label className="block">
          <div className="mb-1 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
            <span>长度</span>
            <span className="font-mono text-brand">{length}</span>
          </div>
          <input
            type="range"
            min={4}
            max={64}
            value={length}
            onChange={(e) => setLength(Number(e.target.value))}
            className="w-full accent-[var(--brand)]"
          />
        </label>

        <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
          {CHARSETS.map(({ key, label }) => (
            <label key={key} className="inline-flex items-center gap-1.5">
              <input
                type="checkbox"
                checked={sets[key]}
                onChange={(e) => setSets((s) => ({ ...s, [key]: e.target.checked }))}
                className="accent-[var(--brand)]"
              />
              {label}
            </label>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
          <label className="inline-flex items-center gap-1.5">
            <input
              type="checkbox"
              checked={excludeAmbiguous}
              onChange={(e) => setExcludeAmbiguous(e.target.checked)}
              className="accent-[var(--brand)]"
            />
            排除易混淆字符（0 O 1 l I…）
          </label>
          <label className="inline-flex items-center gap-1.5">
            数量
            <input
              type="number"
              min={1}
              max={50}
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="glass-subtle w-16 rounded-lg px-2 py-1 text-sm"
            />
          </label>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={generate}
            disabled={noneSelected}
            className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            生成
          </button>
          {noneSelected && (
            <span className="text-xs text-red-600 dark:text-red-400">
              至少选择一类字符
            </span>
          )}
        </div>
      </div>

      {results.length > 0 && (
        <div className="glass-subtle rounded-xl p-2">
          <div className="flex justify-end px-1 pb-1">
            <CopyButton text={results.join("\n")} label="全部复制" />
          </div>
          <ul className="divide-y divide-slate-200/60 dark:divide-white/10">
            {results.map((pw, idx) => (
              <li key={idx} className="flex items-center justify-between gap-2 px-2 py-2">
                <code className="break-all font-mono text-[13px]">{pw}</code>
                <CopyButton text={pw} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
