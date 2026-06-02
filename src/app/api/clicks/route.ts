import { NextResponse } from "next/server";
import path from "path";
import { withLock, readJson, atomicWriteJson } from "@/lib/file-store";
import {
  currentWeekStart,
  emptyState,
  applyClick,
  rankCounts,
  type ClickState,
} from "@/lib/clicks";
import { getCardById } from "@/lib/data";

export const dynamic = "force-dynamic";

const file = path.join(process.cwd(), "data", "tool-clicks.json");
const LIMIT = 8;

export async function GET() {
  const weekStart = currentWeekStart();
  const state = await readJson<ClickState>(file, emptyState(weekStart));
  return NextResponse.json({ weekStart, ranking: rankCounts(state, weekStart, LIMIT) });
}

export async function POST(req: Request) {
  let id: unknown;
  try {
    ({ id } = await req.json());
  } catch {
    id = undefined;
  }
  if (typeof id !== "string" || !getCardById(id)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const weekStart = currentWeekStart();
  await withLock(async () => {
    const state = await readJson<ClickState>(file, emptyState(weekStart));
    await atomicWriteJson(file, applyClick(state, id as string, weekStart));
  });
  return NextResponse.json({ ok: true });
}
