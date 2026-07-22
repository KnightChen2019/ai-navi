"use client";

import React from "react";

type State =
  | { phase: "idle" }
  | { phase: "submitting" }
  | { phase: "success" }
  | { phase: "error"; message: string };

const inputClass =
  "w-full rounded-xl border border-[var(--border)] bg-black/[0.03] dark:bg-white/5 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:border-brand transition-colors";

export default function SubmitForm({ sections }: { sections: string[] }) {
  const [state, setState] = React.useState<State>({ phase: "idle" });
  const formRef = React.useRef<HTMLFormElement>(null);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setState({ phase: "submitting" });
    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fd.get("name"),
          link: fd.get("link"),
          reason: fd.get("reason"),
          section: fd.get("section"),
        }),
      });
      const data = (await res.json()) as { ok: boolean; error?: string };
      if (res.ok && data.ok) {
        setState({ phase: "success" });
        formRef.current?.reset();
      } else {
        setState({ phase: "error", message: data.error ?? "提交失败，请稍后再试" });
      }
    } catch {
      setState({ phase: "error", message: "网络异常，请稍后再试" });
    }
  };

  if (state.phase === "success") {
    return (
      <div className="glass-medium rounded-3xl p-8 text-center">
        <p className="text-2xl">🎉</p>
        <h2 className="mt-2 text-lg font-bold text-slate-900 dark:text-slate-100">提交成功</h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          感谢推荐！人工审核通过后会收录进站点。
        </p>
        <button
          type="button"
          onClick={() => setState({ phase: "idle" })}
          className="mt-5 rounded-full bg-brand px-4 py-2 text-sm font-medium text-white shadow-sm cursor-pointer"
        >
          再推荐一款
        </button>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} className="glass-medium rounded-3xl p-5 sm:p-8 space-y-4">
      <div>
        <label htmlFor="name" className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
          工具名称 <span className="text-brand">*</span>
        </label>
        <input id="name" name="name" required maxLength={50} placeholder="例如：豆包" className={inputClass} />
      </div>

      <div>
        <label htmlFor="link" className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
          官网链接 <span className="text-brand">*</span>
        </label>
        <input
          id="link"
          name="link"
          type="url"
          required
          placeholder="https://…"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="section" className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
          建议分类
        </label>
        <select id="section" name="section" className={inputClass} defaultValue="">
          <option value="">不确定</option>
          {sections.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="reason" className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
          推荐理由
        </label>
        <textarea
          id="reason"
          name="reason"
          rows={3}
          maxLength={200}
          placeholder="一句话说说它好在哪里（可选，200 字内）"
          className={inputClass}
        />
      </div>

      {state.phase === "error" && (
        <p className="rounded-xl bg-red-500/10 px-3.5 py-2.5 text-xs text-red-600 dark:text-red-400">
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={state.phase === "submitting"}
        className="w-full rounded-xl bg-brand py-2.5 text-sm font-semibold text-white shadow-sm transition-opacity disabled:opacity-60 cursor-pointer"
      >
        {state.phase === "submitting" ? "提交中…" : "提交推荐"}
      </button>
    </form>
  );
}
