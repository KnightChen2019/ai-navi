"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export default function CopyButton({
  text,
  label = "复制",
  className = "",
}: {
  text: string;
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function onCopy() {
    try {
      await navigator.clipboard?.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // 剪贴板不可用时静默失败
    }
  }

  return (
    <button
      type="button"
      onClick={onCopy}
      className={[
        "inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium transition-colors",
        copied ? "text-brand" : "text-slate-500 hover:text-brand",
        className,
      ].join(" ")}
    >
      {copied ? <Check size={13} /> : <Copy size={13} />}
      {copied ? "已复制" : label}
    </button>
  );
}
