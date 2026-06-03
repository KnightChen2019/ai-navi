import { describe, it, expect } from "vitest";
import { generatePasswords, type PwOptions } from "./password";

// 恒返回字节 0 的随机源：randIndex 始终取下标 0，结果确定。
const zeroRng = () => new Uint8Array([0]);

const base: PwOptions = {
  length: 16,
  upper: false,
  lower: false,
  digits: true,
  symbols: false,
  excludeAmbiguous: false,
  count: 1,
};

describe("generatePasswords", () => {
  it("长度与数量正确", () => {
    const out = generatePasswords({ ...base, length: 20, count: 5 }, zeroRng);
    expect(out).toHaveLength(5);
    expect(out.every((p) => p.length === 20)).toBe(true);
  });

  it("只包含被勾选的字符集", () => {
    const out = generatePasswords({ ...base, digits: true }, zeroRng);
    expect(/^[0-9]+$/.test(out[0])).toBe(true);
  });

  it("排除易混淆字符：无 0/1", () => {
    const out = generatePasswords({ ...base, excludeAmbiguous: true }, zeroRng);
    expect(out[0]).not.toContain("0");
    expect(out[0]).not.toContain("1");
  });

  it("每个被勾选的字符集至少出现一次", () => {
    const out = generatePasswords(
      { ...base, upper: true, lower: true, digits: true, length: 12 },
      zeroRng
    );
    expect(/[A-Z]/.test(out[0])).toBe(true);
    expect(/[a-z]/.test(out[0])).toBe(true);
    expect(/[0-9]/.test(out[0])).toBe(true);
  });

  it("一类都没选：返回空数组", () => {
    const out = generatePasswords(
      { ...base, upper: false, lower: false, digits: false, symbols: false },
      zeroRng
    );
    expect(out).toEqual([]);
  });

  it("越界长度/数量自动 clamp", () => {
    const out = generatePasswords({ ...base, length: 1, count: 999 }, zeroRng);
    expect(out).toHaveLength(50);
    expect(out[0].length).toBe(4);
  });
});
