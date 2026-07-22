import { describe, it, expect } from "vitest";
import { linkKey, validateSubmission } from "./submissions";

const SECTIONS = ["AI对话聊天", "AI视频"];

describe("linkKey", () => {
  it("lowercases and strips leading www", () => {
    expect(linkKey("https://WWW.Doubao.com/chat")).toBe("doubao.com");
    expect(linkKey("https://doubao.com")).toBe("doubao.com");
  });

  it("returns empty string for invalid URLs", () => {
    expect(linkKey("not a url")).toBe("");
  });
});

describe("validateSubmission", () => {
  const ok = { name: " 豆包 ", link: " https://doubao.com ", reason: "", section: "" };

  it("accepts and trims a valid submission", () => {
    const r = validateSubmission(ok, SECTIONS);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value).toEqual({ name: "豆包", link: "https://doubao.com", reason: "", section: "" });
    }
  });

  it("rejects missing or over-long names", () => {
    expect(validateSubmission({ ...ok, name: "" }, SECTIONS).ok).toBe(false);
    expect(validateSubmission({ ...ok, name: "x".repeat(51) }, SECTIONS).ok).toBe(false);
  });

  it("rejects non-http(s) or invalid links", () => {
    expect(validateSubmission({ ...ok, link: "ftp://x.com" }, SECTIONS).ok).toBe(false);
    expect(validateSubmission({ ...ok, link: "doubao.com" }, SECTIONS).ok).toBe(false);
  });

  it("rejects over-long reason", () => {
    expect(validateSubmission({ ...ok, reason: "x".repeat(201) }, SECTIONS).ok).toBe(false);
  });

  it("rejects unknown sections but allows empty", () => {
    expect(validateSubmission({ ...ok, section: "不存在的分类" }, SECTIONS).ok).toBe(false);
    expect(validateSubmission({ ...ok, section: "AI对话聊天" }, SECTIONS).ok).toBe(true);
  });
});
