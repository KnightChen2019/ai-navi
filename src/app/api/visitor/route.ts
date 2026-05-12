import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const dataDir = path.join(process.cwd(), "data");
const counterFile = path.join(dataDir, "visitor-count.json");

async function readCount(): Promise<number> {
  try {
    const text = await fs.readFile(counterFile, "utf-8");
    const parsed = JSON.parse(text);
    return typeof parsed.count === "number" ? parsed.count : 0;
  } catch {
    return 0;
  }
}

async function writeCount(count: number): Promise<void> {
  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(counterFile, JSON.stringify({ count }), "utf-8");
}

export async function GET() {
  const count = await readCount();
  return NextResponse.json({ count });
}

export async function POST() {
  const current = await readCount();
  const next = current + 1;
  await writeCount(next);
  return NextResponse.json({ count: next, position: next });
}
