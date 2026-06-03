import { describe, it, expect } from "vitest";
import {
  beautify,
  minify,
  escapeStr,
  unescapeStr,
  parseErrorPosition,
} from "./json-format";

describe("json-format", () => {
  it("beautify 合法 JSON：2 空格缩进", () => {
    const r = beautify('{"a":1}');
    expect(r).toEqual({ ok: true, value: '{\n  "a": 1\n}' });
  });

  it("minify 合法 JSON：去空白", () => {
    expect(minify('{ "a": 1 }')).toEqual({ ok: true, value: '{"a":1}' });
  });

  it("beautify 非法 JSON：ok=false 且带错误信息", () => {
    const r = beautify("{a:1}");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(typeof r.error).toBe("string");
  });

  it("escape / unescape 往返", () => {
    const raw = 'he said "hi"\ntab\there';
    const escaped = escapeStr(raw);
    expect(escaped).not.toContain("\n"); // 真实换行被转义成 \n 两个字符
    const back = unescapeStr(escaped);
    expect(back).toEqual({ ok: true, value: raw });
  });

  it("unescape 非法转义序列：ok=false", () => {
    const r = unescapeStr("\\x"); // 不是合法 JSON 转义
    expect(r.ok).toBe(false);
  });

  it("parseErrorPosition：position 形式 → 行列", () => {
    expect(parseErrorPosition("abc\ndefg", "... at position 5")).toEqual({
      line: 2,
      column: 2,
    });
  });

  it("parseErrorPosition：line/column 形式", () => {
    expect(parseErrorPosition("", "Bad at line 3 column 7")).toEqual({
      line: 3,
      column: 7,
    });
  });

  it("parseErrorPosition：无位置信息 → 空对象", () => {
    expect(parseErrorPosition("x", "no position here")).toEqual({});
  });
});
