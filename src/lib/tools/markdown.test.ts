import { describe, it, expect } from "vitest";
import { mdToHtml } from "./markdown";

describe("mdToHtml", () => {
  it("标题各级", () => {
    expect(mdToHtml("# H1")).toContain("<h1>H1</h1>");
    expect(mdToHtml("###### H6")).toContain("<h6>H6</h6>");
  });

  it("粗体/斜体/删除线/行内代码", () => {
    expect(mdToHtml("**b**")).toContain("<strong>b</strong>");
    expect(mdToHtml("*i*")).toContain("<em>i</em>");
    expect(mdToHtml("~~s~~")).toContain("<del>s</del>");
    expect(mdToHtml("`c`")).toContain("<code>c</code>");
  });

  it("行内代码内部 markdown 保持字面（不被加粗）", () => {
    expect(mdToHtml("`**x**`")).toContain("<code>**x**</code>");
    expect(mdToHtml("`**x**`")).not.toContain("<strong>");
  });

  it("普通文本里的『空格数字空格』不被误判为代码", () => {
    expect(mdToHtml("step 0 done")).toContain("step 0 done");
    expect(mdToHtml("step 0 done")).not.toContain("<code>");
  });

  it("代码围栏：内部 markdown 保持字面、不被解析", () => {
    const html = mdToHtml("```\n**x**\n```");
    expect(html).toContain("<pre><code>**x**</code></pre>");
    expect(html).not.toContain("<strong>");
  });

  it("无序与有序列表", () => {
    expect(mdToHtml("- a\n- b")).toContain("<ul><li>a</li><li>b</li></ul>");
    expect(mdToHtml("1. a\n2. b")).toContain("<ol><li>a</li><li>b</li></ol>");
  });

  it("任务列表渲染只读 checkbox", () => {
    const html = mdToHtml("- [ ] todo\n- [x] done");
    expect(html).toContain('<input type="checkbox" disabled> todo');
    expect(html).toContain('<input type="checkbox" disabled checked> done');
  });

  it("表格含对齐", () => {
    const html = mdToHtml("| a | b |\n| :-- | --: |\n| 1 | 2 |");
    expect(html).toContain("<table>");
    expect(html).toContain('<th style="text-align:left">a</th>');
    expect(html).toContain('<th style="text-align:right">b</th>');
    expect(html).toContain('<td style="text-align:left">1</td>');
  });

  it("引用与分割线", () => {
    expect(mdToHtml("> quote")).toContain("<blockquote>quote</blockquote>");
    expect(mdToHtml("---")).toContain("<hr>");
  });

  it("链接与图片", () => {
    expect(mdToHtml("[t](https://a.com)")).toContain('<a href="https://a.com">t</a>');
    expect(mdToHtml("![alt](https://a.com/i.png)")).toContain(
      '<img src="https://a.com/i.png" alt="alt">'
    );
  });

  it("sanitizeUrl 拦截危险协议", () => {
    const html = mdToHtml("[x](javascript:alert)");
    expect(html).toContain('<a href="#">x</a>');
    expect(html).not.toContain("javascript:");
  });

  it("XSS：原始 HTML 被转义为纯文本", () => {
    const html = mdToHtml("<script>alert(1)</script>");
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });

  it("转义 & < >", () => {
    expect(mdToHtml("a & b < c > d")).toContain("a &amp; b &lt; c &gt; d");
  });

  it("空输入返回空串", () => {
    expect(mdToHtml("")).toBe("");
    expect(mdToHtml("   ")).toBe("");
  });
});
