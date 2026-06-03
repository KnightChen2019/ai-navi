export type JsonResult =
  | { ok: true; value: string }
  | { ok: false; error: string; line?: number; column?: number };

/** 从 JSON.parse 报错信息里解析出 1-based 行列（兼容两种 V8 文案）。 */
export function parseErrorPosition(
  input: string,
  message: string
): { line?: number; column?: number } {
  const lc = message.match(/at line (\d+) column (\d+)/);
  if (lc) return { line: Number(lc[1]), column: Number(lc[2]) };

  const pos = message.match(/at position (\d+)/);
  if (pos) {
    const p = Number(pos[1]);
    const before = input.slice(0, p);
    const line = before.split("\n").length;
    const column = p - before.lastIndexOf("\n");
    return { line, column };
  }
  return {};
}

function reformat(input: string, indent: number | undefined): JsonResult {
  try {
    const parsed = JSON.parse(input);
    return { ok: true, value: JSON.stringify(parsed, null, indent) };
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e);
    return { ok: false, error, ...parseErrorPosition(input, error) };
  }
}

/** 美化：默认 2 空格缩进。 */
export function beautify(input: string, indent = 2): JsonResult {
  return reformat(input, indent);
}

/** 压缩：去除所有非必要空白。 */
export function minify(input: string): JsonResult {
  return reformat(input, undefined);
}

/** 把任意文本转义成 JSON 字符串字面量的内容（不含外层引号）。 */
export function escapeStr(input: string): string {
  const s = JSON.stringify(input);
  return s.slice(1, -1);
}

/** 反转义：把 JSON 字符串字面量内容还原为原文。 */
export function unescapeStr(input: string): JsonResult {
  try {
    const value = JSON.parse(`"${input}"`) as string;
    return { ok: true, value };
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e);
    return { ok: false, error };
  }
}
