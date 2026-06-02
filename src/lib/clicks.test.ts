import { describe, it, expect } from "vitest";
import {
  weekStartOf,
  emptyState,
  applyClick,
  rankCounts,
  type ClickState,
} from "./clicks";

describe("weekStartOf", () => {
  it("returns the Monday of the week for any day in it", () => {
    // 2026-06-01 is a Monday; 06-07 is the Sunday of the same week
    expect(weekStartOf(new Date(2026, 5, 1))).toBe("2026-06-01");
    expect(weekStartOf(new Date(2026, 5, 3))).toBe("2026-06-01");
    expect(weekStartOf(new Date(2026, 5, 7))).toBe("2026-06-01");
    expect(weekStartOf(new Date(2026, 5, 8))).toBe("2026-06-08");
    // cross-month: Sun 2026-03-01 -> Mon 2026-02-23 (rolls into previous month)
    expect(weekStartOf(new Date(2026, 2, 1))).toBe("2026-02-23");
  });
});

describe("applyClick", () => {
  it("increments a tool's count within the same week", () => {
    let s = emptyState("2026-06-01");
    s = applyClick(s, "doubao", "2026-06-01");
    s = applyClick(s, "doubao", "2026-06-01");
    expect(s.counts.doubao).toBe(2);
    expect(s.weekStart).toBe("2026-06-01");
  });

  it("resets all counts when the week changes", () => {
    let s: ClickState = { weekStart: "2026-06-01", counts: { doubao: 5 } };
    s = applyClick(s, "claude", "2026-06-08");
    expect(s.weekStart).toBe("2026-06-08");
    expect(s.counts).toEqual({ claude: 1 });
  });
});

describe("rankCounts", () => {
  const state: ClickState = {
    weekStart: "2026-06-01",
    counts: { doubao: 3, claude: 5, cursor: 5 },
  };

  it("sorts by count desc, ties broken by id, respects limit", () => {
    expect(rankCounts(state, "2026-06-01", 2)).toEqual([
      { id: "claude", count: 5 },
      { id: "cursor", count: 5 },
    ]);
  });

  it("returns [] when the stored week is stale", () => {
    expect(rankCounts(state, "2026-06-08", 8)).toEqual([]);
  });
});
