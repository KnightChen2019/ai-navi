"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "ai-navi-visitor";

interface Stored {
  day: string;     // 'YYYY-MM-DD'
  position: number;
}

function readStored(): Stored | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const v = JSON.parse(raw) as Partial<Stored>;
    if (typeof v.day === "string" && typeof v.position === "number") {
      return { day: v.day, position: v.position };
    }
  } catch {
    /* ignore */
  }
  return null;
}

export default function VisitorCounter() {
  const [position, setPosition] = useState<number | null>(null);
  const [total, setTotal] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const getRes = await fetch("/api/visitor", { cache: "no-store" });
        const getData = (await getRes.json()) as { todayDate: string; totalCount: number };
        if (cancelled) return;

        const stored = readStored();
        if (stored && stored.day === getData.todayDate) {
          setPosition(stored.position);
          setTotal(getData.totalCount);
          return;
        }

        const postRes = await fetch("/api/visitor", { method: "POST", cache: "no-store" });
        const postData = (await postRes.json()) as {
          todayDate: string;
          todayPosition: number;
          totalCount: number;
        };
        if (cancelled) return;

        window.localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ day: postData.todayDate, position: postData.todayPosition })
        );
        setPosition(postData.todayPosition);
        setTotal(postData.totalCount);
      } catch {
        /* ignore network errors */
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (position === null || total === null) {
    return (
      <div className="rounded-xl bg-slate-900/[.03] dark:bg-white/5 px-3 py-2.5 text-[10px] text-slate-400 dark:text-slate-500">
        加载访客信息中…
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-slate-900/[.03] dark:bg-white/5 px-3 py-2.5 text-[10px] leading-relaxed text-slate-500 dark:text-slate-400">
      您是今天第{" "}
      <span className="font-bold text-[11px] text-brand-gradient">
        {position.toLocaleString()}
      </span>{" "}
      位访客
      <br />
      累计访客{" "}
      <span className="font-medium text-slate-600 dark:text-slate-300">
        {total.toLocaleString()}
      </span>
    </div>
  );
}
