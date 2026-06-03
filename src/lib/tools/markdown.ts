/** 转义 HTML 特殊字符，使文本永远无法注入标记。 */
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** 只放行 http/https/mailto 与相对路径/锚点；其余协议（javascript: 等）→ "#"。 */
function sanitizeUrl(url: string): string {
  // 浏览器解析 URL 前会剥除 TAB/LF/CR（及 NUL），故先剥除再判协议，
  // 否则 "java\tscript:" 之类可绕过协议白名单造成 XSS。
  const u = url.replace(/[ \t\n\r]/g, "").trim();
  const scheme = u.match(/^([a-z][a-z0-9+.-]*):/i);
  if (scheme) {
    const s = scheme[1].toLowerCase();
    return s === "http" || s === "https" || s === "mailto" ? u : "#";
  }
  return u; // 相对路径 / #锚点 / 无协议
}

/** 行内格式（不含代码）：图片 → 链接 → 粗体 → 斜体 → 删除线。输入须已转义。 */
function formatInline(s: string): string {
  s = s.replace(
    /!\[([^\]]*)\]\(([^)]*)\)/g,
    (_m, alt, url) => `<img src="${sanitizeUrl(url)}" alt="${alt}">`
  );
  s = s.replace(
    /\[([^\]]*)\]\(([^)]*)\)/g,
    (_m, label, url) => `<a href="${sanitizeUrl(url)}">${label}</a>`
  );
  s = s
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/__([^_]+)__/g, "<strong>$1</strong>");
  s = s.replace(/\*([^*]+)\*/g, "<em>$1</em>").replace(/_([^_]+)_/g, "<em>$1</em>");
  s = s.replace(/~~([^~]+)~~/g, "<del>$1</del>");
  return s;
}

/** 行内解析：先转义，再按「代码片段 vs 普通文本」切片分别处理。 */
function parseInline(text: string): string {
  return escapeHtml(text)
    .split(/(`[^`]+`)/g)
    .map((part) =>
      /^`[^`]+`$/.test(part) ? `<code>${part.slice(1, -1)}</code>` : formatInline(part)
    )
    .join("");
}

function isTableSeparator(line: string): boolean {
  const t = line.trim();
  return t.includes("|") && t.includes("-") && /^[\s|:-]+$/.test(t);
}

function splitRow(line: string): string[] {
  let t = line.trim();
  if (t.startsWith("|")) t = t.slice(1);
  if (t.endsWith("|")) t = t.slice(0, -1);
  return t.split("|").map((c) => c.trim());
}

type Align = "left" | "center" | "right" | "";

function parseAligns(sep: string): Align[] {
  return splitRow(sep).map((cell) => {
    const c = cell.trim();
    const left = c.startsWith(":");
    const right = c.endsWith(":");
    if (left && right) return "center";
    if (right) return "right";
    if (left) return "left";
    return "";
  });
}

function renderTable(header: string[], aligns: Align[], rows: string[][]): string {
  const attr = (i: number) => (aligns[i] ? ` style="text-align:${aligns[i]}"` : "");
  const head =
    "<thead><tr>" +
    header.map((c, i) => `<th${attr(i)}>${parseInline(c)}</th>`).join("") +
    "</tr></thead>";
  const body =
    "<tbody>" +
    rows
      .map(
        (r) =>
          "<tr>" +
          header.map((_c, i) => `<td${attr(i)}>${parseInline(r[i] ?? "")}</td>`).join("") +
          "</tr>"
      )
      .join("") +
    "</tbody>";
  return `<table>${head}${body}</table>`;
}

function isParagraphBreak(lines: string[], i: number): boolean {
  const l = lines[i];
  return (
    l.trim() === "" ||
    /^```/.test(l) ||
    /^(#{1,6})\s+/.test(l) ||
    /^(---|\*\*\*|___)\s*$/.test(l) ||
    /^>\s?/.test(l) ||
    /^\s*([-*+]|\d+\.)\s+/.test(l) ||
    (l.includes("|") && i + 1 < lines.length && isTableSeparator(lines[i + 1]))
  );
}

function renderBlocks(lines: string[]): string {
  const out: string[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    if (line.trim() === "") {
      i++;
      continue;
    }

    // 代码围栏
    if (/^```/.test(line)) {
      const body: string[] = [];
      i++;
      while (i < lines.length && !/^```\s*$/.test(lines[i])) {
        body.push(lines[i]);
        i++;
      }
      i++; // 跳过闭栏
      out.push(`<pre><code>${escapeHtml(body.join("\n"))}</code></pre>`);
      continue;
    }

    // 标题
    const h = line.match(/^(#{1,6})\s+(.*)$/);
    if (h) {
      const level = h[1].length;
      out.push(`<h${level}>${parseInline(h[2])}</h${level}>`);
      i++;
      continue;
    }

    // 分割线
    if (/^(---|\*\*\*|___)\s*$/.test(line)) {
      out.push("<hr>");
      i++;
      continue;
    }

    // 表格
    if (line.includes("|") && i + 1 < lines.length && isTableSeparator(lines[i + 1])) {
      const header = splitRow(line);
      const aligns = parseAligns(lines[i + 1]);
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && lines[i].trim() !== "" && lines[i].includes("|")) {
        rows.push(splitRow(lines[i]));
        i++;
      }
      out.push(renderTable(header, aligns, rows));
      continue;
    }

    // 引用
    if (/^>\s?/.test(line)) {
      const body: string[] = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) {
        body.push(lines[i].replace(/^>\s?/, ""));
        i++;
      }
      out.push(`<blockquote>${parseInline(body.join(" "))}</blockquote>`);
      continue;
    }

    // 列表（有序/无序，单层）
    if (/^\s*([-*+]|\d+\.)\s+/.test(line)) {
      const ordered = /^\s*\d+\.\s+/.test(line);
      const items: string[] = [];
      while (i < lines.length && /^\s*([-*+]|\d+\.)\s+/.test(lines[i])) {
        const content = lines[i].replace(/^\s*([-*+]|\d+\.)\s+/, "");
        const task = content.match(/^\[([ xX])\]\s+(.*)$/);
        if (task) {
          const checked = task[1].toLowerCase() === "x" ? " checked" : "";
          items.push(
            `<li><input type="checkbox" disabled${checked}> ${parseInline(task[2])}</li>`
          );
        } else {
          items.push(`<li>${parseInline(content)}</li>`);
        }
        i++;
      }
      const tag = ordered ? "ol" : "ul";
      out.push(`<${tag}>${items.join("")}</${tag}>`);
      continue;
    }

    // 段落
    const para: string[] = [];
    while (i < lines.length && !isParagraphBreak(lines, i)) {
      para.push(lines[i]);
      i++;
    }
    if (para.length) out.push(`<p>${parseInline(para.join(" "))}</p>`);
  }
  return out.join("\n");
}

/** Markdown 子集 → 安全 HTML 字符串。渲染不抛错；空输入返回空串。 */
export function mdToHtml(src: string): string {
  if (src.trim() === "") return "";
  try {
    return renderBlocks(src.replace(/\r\n?/g, "\n").split("\n"));
  } catch {
    return `<pre>${escapeHtml(src)}</pre>`;
  }
}
