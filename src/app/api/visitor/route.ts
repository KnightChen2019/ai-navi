import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const dataDir = path.join(process.cwd(), "data");
const counterFile = path.join(dataDir, "visitor-count.json");

interface CounterState {
  total: number;
  today: { date: string; count: number };
}

function todayString(): string {
  // Server-local YYYY-MM-DD; consistent across the file's reads/writes in a request.
  return new Date().toISOString().slice(0, 10);
}

async function readState(): Promise<CounterState> {
  const today = todayString();
  try {
    const text = await fs.readFile(counterFile, "utf-8");
    const parsed: unknown = JSON.parse(text);
    if (parsed && typeof parsed === "object") {
      const p = parsed as {
        total?: unknown;
        count?: unknown;
        today?: { date?: unknown; count?: unknown };
      };
      // New format
      if (typeof p.total === "number" && p.today && typeof p.today.date === "string" && typeof p.today.count === "number") {
        return { total: p.total, today: { date: p.today.date, count: p.today.count } };
      }
      // Legacy format: { count: N }
      if (typeof p.count === "number") {
        return { total: p.count, today: { date: today, count: 0 } };
      }
    }
  } catch {
    // file missing or invalid — fall through
  }
  return { total: 0, today: { date: today, count: 0 } };
}

async function writeState(state: CounterState): Promise<void> {
  await fs.mkdir(dataDir, { recursive: true });
  // Atomic write: stage to a temp file then rename so a crash mid-write can't
  // leave a truncated/corrupt JSON file behind.
  const tmp = `${counterFile}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(state), "utf-8");
  await fs.rename(tmp, counterFile);
}

// Serialize read-modify-write so concurrent POSTs in this process don't clobber
// each other's increments. (Single-process standalone server assumed.)
let chain: Promise<unknown> = Promise.resolve();
function withLock<T>(fn: () => Promise<T>): Promise<T> {
  const run = chain.then(fn, fn);
  chain = run.then(
    () => undefined,
    () => undefined
  );
  return run;
}

export async function GET() {
  const state = await readState();
  return NextResponse.json({
    todayDate: todayString(),
    totalCount: state.total,
  });
}

export async function POST() {
  const today = todayString();
  const result = await withLock(async () => {
    const state = await readState();
    if (state.today.date !== today) {
      state.today = { date: today, count: 0 };
    }
    state.today.count += 1;
    state.total += 1;
    await writeState(state);
    return state;
  });
  return NextResponse.json({
    todayDate: today,
    todayPosition: result.today.count,
    totalCount: result.total,
  });
}
