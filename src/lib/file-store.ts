import { promises as fs } from "fs";
import path from "path";

// 进程内串行锁：保证 read-modify-write 不被并发打断。
let chain: Promise<unknown> = Promise.resolve();
export function withLock<T>(fn: () => Promise<T>): Promise<T> {
  const run = chain.then(fn);
  chain = run.then(
    () => undefined,
    () => undefined
  );
  return run;
}

export async function readJson<T>(file: string, fallback: T): Promise<T> {
  try {
    const text = await fs.readFile(file, "utf-8");
    return JSON.parse(text) as T;
  } catch {
    return fallback;
  }
}

// 原子写：先写临时文件再 rename，避免崩溃留下半截 JSON。
export async function atomicWriteJson(file: string, data: unknown): Promise<void> {
  await fs.mkdir(path.dirname(file), { recursive: true });
  const tmp = `${file}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(data), "utf-8");
  await fs.rename(tmp, file);
}
