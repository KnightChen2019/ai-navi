"use client";

import { useCallback, useSyncExternalStore } from "react";

const KEY = "ai-navi:favorites";
const EVENT = "ai-navi:favorites-change";
const EMPTY: string[] = [];

// 缓存：让 getSnapshot 在 localStorage 未变时返回稳定引用，避免 re-render 死循环。
let cacheRaw: string | null = null;
let cacheVal: string[] = EMPTY;

function read(): string[] {
  if (typeof window === "undefined") return EMPTY;
  const raw = window.localStorage.getItem(KEY);
  if (raw === cacheRaw) return cacheVal;
  cacheRaw = raw;
  try {
    const parsed = raw ? JSON.parse(raw) : null;
    cacheVal = Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : EMPTY;
  } catch {
    cacheVal = EMPTY;
  }
  return cacheVal;
}

function write(ids: string[]): void {
  window.localStorage.setItem(KEY, JSON.stringify(ids));
  window.dispatchEvent(new Event(EVENT)); // 同标签页同步
}

function subscribe(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb); // 跨标签页同步
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

export function useFavorites() {
  const ids = useSyncExternalStore(subscribe, read, () => EMPTY);
  const isFavorite = useCallback((id: string) => ids.includes(id), [ids]);
  const toggle = useCallback((id: string) => {
    const cur = read();
    write(cur.includes(id) ? cur.filter((x) => x !== id) : [id, ...cur]);
  }, []);
  return { ids, count: ids.length, isFavorite, toggle };
}
