"use client";

import { ExternalLink } from "lucide-react";

export default function OutboundVisitButton({
  toolId,
  href,
}: {
  toolId: string;
  href: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      onClick={() => {
        // 记一次「访问官网」；不 await、不阻塞跳转（新标签打开，原页不卸载）。
        try {
          fetch("/api/clicks", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ id: toolId }),
            keepalive: true,
          }).catch(() => {});
        } catch {
          /* 静默 */
        }
      }}
      className="inline-flex items-center gap-1.5 rounded-xl bg-brand px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-shadow hover:shadow-md shrink-0"
    >
      <ExternalLink size={16} /> 访问官网
    </a>
  );
}
