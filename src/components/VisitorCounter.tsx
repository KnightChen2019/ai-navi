"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "ai-navi-visitor-position";

export default function VisitorCounter() {
  const [position, setPosition] = useState<number | null>(null);
  const [total, setTotal] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    const stored = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;

    async function load() {
      try {
        if (stored) {
          const res = await fetch("/api/visitor", { cache: "no-store" });
          const data = await res.json();
          if (cancelled) return;
          setPosition(Number(stored));
          setTotal(data.count);
        } else {
          const res = await fetch("/api/visitor", { method: "POST", cache: "no-store" });
          const data = await res.json();
          if (cancelled) return;
          localStorage.setItem(STORAGE_KEY, String(data.position));
          setPosition(data.position);
          setTotal(data.count);
        }
      } catch {
        // ignore
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (position === null || total === null) {
    return (
      <div className="text-xs text-slate-400">加载访客信息中…</div>
    );
  }

  return (
    <div className="text-xs text-slate-500 leading-relaxed">
      <span>
        您是第 <span className="font-semibold text-indigo-600">{position.toLocaleString()}</span> 位访客
      </span>
      <span className="mx-2 text-slate-300">|</span>
      <span>
        累计访客 <span className="font-medium text-slate-600">{total.toLocaleString()}</span>
      </span>
    </div>
  );
}
