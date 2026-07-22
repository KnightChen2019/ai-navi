import { describe, it, expect } from "vitest";
import { getLatestCards, getAllCards } from "./data";

describe("getLatestCards", () => {
  it("returns newest first, limited, without duplicates", () => {
    const out = getLatestCards(8);
    expect(out).toHaveLength(8);
    const dates = out.map((c) => c.addedAt);
    const sorted = [...dates].sort((a, b) => b.localeCompare(a));
    expect(dates).toEqual(sorted);
    const ids = out.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("never exceeds the number of tools", () => {
    expect(getLatestCards(999).length).toBe(getAllCards().length);
  });

  it("every card carries an ISO date", () => {
    for (const c of getLatestCards(20)) {
      expect(c.addedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });
});
