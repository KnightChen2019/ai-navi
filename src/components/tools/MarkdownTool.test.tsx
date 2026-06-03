import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import MarkdownTool from "./MarkdownTool";

describe("MarkdownTool", () => {
  it("输入后实时渲染预览", () => {
    render(<MarkdownTool />);
    const area = screen.getByRole("textbox");
    fireEvent.change(area, { target: { value: "# Hi" } });
    const heading = screen.getByText("Hi");
    expect(heading.tagName).toBe("H1");
  });
});
