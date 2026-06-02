import { describe, it, expect } from "vitest";
import { buildTrending } from "./trending";

describe("buildTrending", () => {
  it("puts ranked ids first, then fills, deduped, to the limit", () => {
    const out = buildTrending(["claude", "doubao"], 8);
    expect(out.slice(0, 2).map((c) => c.id)).toEqual(["claude", "doubao"]);
    expect(out).toHaveLength(8);
    const ids = out.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length); // 无重复
  });

  it("skips unknown ranked ids and still fills", () => {
    const out = buildTrending(["___nope___"], 8);
    expect(out.map((c) => c.id)).not.toContain("___nope___");
    expect(out).toHaveLength(8);
  });

  it("never exceeds the number of unique tools", () => {
    const out = buildTrending([], 999);
    const ids = out.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(out.length).toBeGreaterThan(0);
  });
});
