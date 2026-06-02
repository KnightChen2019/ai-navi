import { describe, it, expect } from "vitest";
import { promises as fs } from "fs";
import path from "path";
import os from "os";
import { withLock, readJson, atomicWriteJson } from "./file-store";

describe("withLock", () => {
  it("serializes read-modify-write so no update is lost", async () => {
    const shared = { n: 0 };
    const bump = () =>
      withLock(async () => {
        const cur = shared.n;
        await Promise.resolve(); // yield: would interleave without the lock
        shared.n = cur + 1;
      });
    await Promise.all([bump(), bump(), bump()]);
    expect(shared.n).toBe(3);
  });
});

describe("readJson / atomicWriteJson", () => {
  it("returns the fallback when the file is missing", async () => {
    const missing = path.join(os.tmpdir(), `nope-${process.pid}-${Date.now()}.json`);
    expect(await readJson(missing, { a: 1 })).toEqual({ a: 1 });
  });

  it("round-trips written JSON", async () => {
    const file = path.join(os.tmpdir(), `fs-${process.pid}-${Date.now()}.json`);
    await atomicWriteJson(file, { hello: "world", n: 2 });
    expect(await readJson(file, null)).toEqual({ hello: "world", n: 2 });
    await fs.rm(file, { force: true });
  });
});
