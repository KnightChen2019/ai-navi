import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useFavorites } from "./useFavorites";

beforeEach(() => {
  window.localStorage.clear();
});

describe("useFavorites", () => {
  it("starts empty", () => {
    const { result } = renderHook(() => useFavorites());
    expect(result.current.ids).toEqual([]);
    expect(result.current.count).toBe(0);
  });

  it("toggles a tool on and off", () => {
    const { result } = renderHook(() => useFavorites());
    act(() => result.current.toggle("doubao"));
    expect(result.current.isFavorite("doubao")).toBe(true);
    expect(result.current.count).toBe(1);
    act(() => result.current.toggle("doubao"));
    expect(result.current.isFavorite("doubao")).toBe(false);
    expect(result.current.count).toBe(0);
  });

  it("persists to localStorage and is shared across hook instances", () => {
    const a = renderHook(() => useFavorites());
    act(() => a.result.current.toggle("claude"));
    expect(JSON.parse(window.localStorage.getItem("ai-navi:favorites")!)).toEqual([
      "claude",
    ]);
    const b = renderHook(() => useFavorites());
    expect(b.result.current.isFavorite("claude")).toBe(true);
  });
});
