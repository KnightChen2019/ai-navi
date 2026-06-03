export interface PwOptions {
  length: number;
  upper: boolean;
  lower: boolean;
  digits: boolean;
  symbols: boolean;
  excludeAmbiguous: boolean;
  count: number;
}

/** 返回 n 个随机字节；默认走 Web Crypto，可注入用于测试。 */
export type RandomBytes = (n: number) => Uint8Array;

const SETS = {
  upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lower: "abcdefghijklmnopqrstuvwxyz",
  digits: "0123456789",
  symbols: "!@#$%^&*()-_=+[]{};:,.<>?",
};

// 易混淆字符：去掉后视觉更清晰
const AMBIGUOUS = new Set("O0oIl1|`'\"".split(""));

const defaultRandom: RandomBytes = (n) => {
  const a = new Uint8Array(n);
  crypto.getRandomValues(a);
  return a;
};

function clamp(n: number, lo: number, hi: number): number {
  if (Number.isNaN(n)) return lo;
  return Math.max(lo, Math.min(hi, Math.floor(n)));
}

/** [0, max) 内的无模偏随机整数（拒绝采样）。max 较小，循环极快终止。 */
function randIndex(max: number, rng: RandomBytes): number {
  const limit = 256 - (256 % max);
  let b = rng(1)[0];
  while (b >= limit) b = rng(1)[0];
  return b % max;
}

export function generatePasswords(
  opts: PwOptions,
  rng: RandomBytes = defaultRandom
): string[] {
  const length = clamp(opts.length, 4, 64);
  const count = clamp(opts.count, 1, 50);

  let pools: string[] = [];
  if (opts.upper) pools.push(SETS.upper);
  if (opts.lower) pools.push(SETS.lower);
  if (opts.digits) pools.push(SETS.digits);
  if (opts.symbols) pools.push(SETS.symbols);

  if (opts.excludeAmbiguous) {
    pools = pools.map((p) =>
      p
        .split("")
        .filter((c) => !AMBIGUOUS.has(c))
        .join("")
    );
  }
  pools = pools.filter((p) => p.length > 0);
  if (pools.length === 0) return [];

  const all = pools.join("");

  const out: string[] = [];
  for (let k = 0; k < count; k++) {
    const chars: string[] = [];
    // 先保证每个被勾选的字符集至少出现一次（长度允许时）
    for (const pool of pools) {
      if (chars.length < length) chars.push(pool[randIndex(pool.length, rng)]);
    }
    while (chars.length < length) chars.push(all[randIndex(all.length, rng)]);

    // Fisher–Yates 打散，避免"保证位"固定在开头
    for (let x = chars.length - 1; x > 0; x--) {
      const y = randIndex(x + 1, rng);
      [chars[x], chars[y]] = [chars[y], chars[x]];
    }
    out.push(chars.join(""));
  }
  return out;
}
