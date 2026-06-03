import { describe, it, expect } from "vitest";
import { diffLines } from "./text-diff";

describe("diffLines", () => {
  it("两侧相同：全 eq，无增删", () => {
    const r = diffLines("a\nb\nc", "a\nb\nc");
    expect(r.added).toBe(0);
    expect(r.removed).toBe(0);
    expect(r.rows.every((row) => row.type === "eq")).toBe(true);
  });

  it("纯新增", () => {
    const r = diffLines("a\nb", "a\nb\nc");
    expect(r.added).toBe(1);
    expect(r.removed).toBe(0);
    expect(r.rows.at(-1)).toMatchObject({ type: "add", right: "c", rightNo: 3 });
  });

  it("纯删除", () => {
    const r = diffLines("a\nb\nc", "a\nb");
    expect(r.added).toBe(0);
    expect(r.removed).toBe(1);
    expect(r.rows.at(-1)).toMatchObject({ type: "del", left: "c", leftNo: 3 });
  });

  it("替换一行 = 一删一增", () => {
    const r = diffLines("a\nb\nc", "a\nx\nc");
    expect(r.added).toBe(1);
    expect(r.removed).toBe(1);
    const types = r.rows.map((row) => row.type);
    expect(types).toContain("del");
    expect(types).toContain("add");
  });

  it("一侧为空：全增 / 全删", () => {
    expect(diffLines("", "x\ny")).toMatchObject({ added: 2, removed: 0 });
    expect(diffLines("x\ny", "")).toMatchObject({ added: 0, removed: 2 });
    expect(diffLines("", "")).toMatchObject({ added: 0, removed: 0, rows: [] });
  });
});
