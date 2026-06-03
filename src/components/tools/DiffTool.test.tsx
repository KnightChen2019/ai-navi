import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import DiffTool from "./DiffTool";

describe("DiffTool", () => {
  it("对比后渲染出新增的行", () => {
    render(<DiffTool />);
    const areas = screen.getAllByRole("textbox");
    fireEvent.change(areas[0], { target: { value: "a\nb" } });
    fireEvent.change(areas[1], { target: { value: "a\nc" } });
    fireEvent.click(screen.getByRole("button", { name: "对比" }));
    // "c" 仅出现在右栏（新增行），唯一可定位
    expect(screen.getByText("c")).toBeTruthy();
  });
});
