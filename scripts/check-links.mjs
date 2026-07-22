// Checks that every tool link in data.json is reachable.
// HEAD first, GET fallback; <400 = OK, 401/403 = WARN (alive but bot-blocked),
// 404/410/5xx/network errors = FAIL. Exit code 1 when any link FAILs.
// Run via `npm run check-links`.
import { readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const dataPath = path.join(root, "data.json");

const TIMEOUT_MS = 12_000;
const CONCURRENCY = 6;
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";
const HEADERS = {
  "user-agent": UA,
  accept: "text/html,application/xhtml+xml,*/*;q=0.8",
  "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
};

/** Resolve final status with HEAD, retrying with GET when HEAD is not allowed. */
async function probe(url) {
  for (const method of ["HEAD", "GET"]) {
    try {
      const res = await fetch(url, {
        method,
        headers: HEADERS,
        signal: AbortSignal.timeout(TIMEOUT_MS),
        redirect: "follow",
      });
      await res.body?.cancel().catch(() => {});
      if (method === "HEAD" && (res.status === 405 || res.status === 501)) continue;
      return { status: res.status, finalUrl: res.url };
    } catch (e) {
      if (method === "GET") return { error: e.cause?.code ?? e.message };
    }
  }
}

const raw = JSON.parse(await readFile(dataPath, "utf-8"));
console.log(`checking ${raw.tools.length} link(s)...`);

let cursor = 0;
const failures = [];
const warnings = [];
await Promise.all(
  Array.from({ length: CONCURRENCY }, async () => {
    while (cursor < raw.tools.length) {
      const t = raw.tools[cursor++];
      const r = await probe(t.link);
      if (r.error) {
        failures.push(`${t.id} (${t.link}): ${r.error}`);
      } else if (r.status === 401 || r.status === 403) {
        warnings.push(`${t.id} (${t.link}): HTTP ${r.status}`);
      } else if (r.status >= 400) {
        failures.push(`${t.id} (${t.link}): HTTP ${r.status}`);
      }
    }
  })
);

if (warnings.length) {
  console.log(`! ${warnings.length} link(s) blocked the probe but are likely alive:`);
  for (const w of warnings) console.log(`  - ${w}`);
}
if (failures.length) {
  console.error(`✗ ${failures.length} dead link(s):`);
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}
console.log(`✓ all ${raw.tools.length} link(s) reachable`);
