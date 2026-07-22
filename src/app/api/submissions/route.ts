import { NextResponse } from "next/server";
import path from "path";
import { withLock, readJson, atomicWriteJson } from "@/lib/file-store";
import { linkKey, validateSubmission, type Submission } from "@/lib/submissions";
import { getAllCards, getSectionTitles } from "@/lib/data";

export const dynamic = "force-dynamic";

const file = path.join(process.cwd(), "data", "submissions.json");

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    body = {};
  }
  const result = validateSubmission(
    (body ?? {}) as { name?: unknown; link?: unknown; reason?: unknown; section?: unknown },
    getSectionTitles()
  );
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
  }
  const key = linkKey(result.value.link);
  if (getAllCards().some((c) => linkKey(c.link) === key)) {
    return NextResponse.json({ ok: false, error: "该工具已在站内收录" }, { status: 409 });
  }
  return withLock(async () => {
    const list = await readJson<Submission[]>(file, []);
    if (list.some((s) => linkKey(s.link) === key)) {
      return NextResponse.json({ ok: false, error: "该工具已在待审列表中" }, { status: 409 });
    }
    list.push({ ...result.value, submittedAt: new Date().toISOString() });
    await atomicWriteJson(file, list);
    return NextResponse.json({ ok: true });
  });
}
