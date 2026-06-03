export type DiffRow = {
  type: "eq" | "add" | "del";
  left?: string;
  right?: string;
  leftNo?: number;
  rightNo?: number;
};

export interface DiffResult {
  rows: DiffRow[];
  added: number;
  removed: number;
}

/** 行级差异：标准 LCS（最长公共子序列）回溯，空串视为 0 行。 */
export function diffLines(a: string, b: string): DiffResult {
  const aLines = a === "" ? [] : a.split("\n");
  const bLines = b === "" ? [] : b.split("\n");
  const n = aLines.length;
  const m = bLines.length;

  // lcs[i][j] = aLines[i:] 与 bLines[j:] 的最长公共子序列长度
  const lcs: number[][] = Array.from({ length: n + 1 }, () =>
    new Array<number>(m + 1).fill(0)
  );
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      lcs[i][j] =
        aLines[i] === bLines[j]
          ? lcs[i + 1][j + 1] + 1
          : Math.max(lcs[i + 1][j], lcs[i][j + 1]);
    }
  }

  const rows: DiffRow[] = [];
  let added = 0;
  let removed = 0;
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (aLines[i] === bLines[j]) {
      rows.push({ type: "eq", left: aLines[i], right: bLines[j], leftNo: i + 1, rightNo: j + 1 });
      i++;
      j++;
    } else if (lcs[i + 1][j] >= lcs[i][j + 1]) {
      rows.push({ type: "del", left: aLines[i], leftNo: i + 1 });
      removed++;
      i++;
    } else {
      rows.push({ type: "add", right: bLines[j], rightNo: j + 1 });
      added++;
      j++;
    }
  }
  while (i < n) {
    rows.push({ type: "del", left: aLines[i], leftNo: i + 1 });
    removed++;
    i++;
  }
  while (j < m) {
    rows.push({ type: "add", right: bLines[j], rightNo: j + 1 });
    added++;
    j++;
  }

  return { rows, added, removed };
}
