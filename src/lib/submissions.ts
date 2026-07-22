/** A visitor-submitted tool recommendation, pending manual review. */
export interface Submission {
  name: string;
  link: string;
  reason: string;
  section: string; // "" = 不确定
  submittedAt: string; // ISO timestamp
}

export type ValidateResult =
  | { ok: true; value: Omit<Submission, "submittedAt"> }
  | { ok: false; error: string };

/** Normalized hostname for dedupe (lowercase, no leading www.). */
export function linkKey(raw: string): string {
  try {
    return new URL(raw).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return "";
  }
}

export function validateSubmission(
  input: { name?: unknown; link?: unknown; reason?: unknown; section?: unknown },
  knownSections: string[]
): ValidateResult {
  const name = typeof input.name === "string" ? input.name.trim() : "";
  if (name.length < 1 || name.length > 50)
    return { ok: false, error: "请填写 1–50 字的工具名称" };

  const link = typeof input.link === "string" ? input.link.trim() : "";
  if (!/^https?:\/\//i.test(link) || !linkKey(link))
    return { ok: false, error: "请填写合法的 http(s) 链接" };

  const reason = typeof input.reason === "string" ? input.reason.trim() : "";
  if (reason.length > 200) return { ok: false, error: "推荐理由不超过 200 字" };

  const section = typeof input.section === "string" ? input.section.trim() : "";
  if (section && !knownSections.includes(section))
    return { ok: false, error: "未知的分类" };

  return { ok: true, value: { name, link, reason, section } };
}
