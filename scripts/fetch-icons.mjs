// Fetches a logo for every tool in data.json whose image is missing under
// public/img. Strategy per tool: icons declared in the site's HTML
// (apple-touch-icon etc.), then /favicon.ico (kept only if it's actually a
// raster image), then Google's favicon service as a PNG fallback.
// Run via `npm run fetch-icons` (missing only) or `npm run fetch-icons -- --all`.
import { readFile, writeFile, stat, mkdir } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const dataPath = path.join(root, "data.json");
const imgDir = path.join(root, "public", "img");

const TIMEOUT_MS = 12_000;
const CONCURRENCY = 6;
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";

/** Detect a raster format next/image can serve; returns the file extension or null. */
function sniffExt(buf) {
  if (buf.length > 8 && buf[0] === 0x89 && buf[1] === 0x50) return "png"; // \x89PNG
  if (buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8) return "jpg";
  if (buf.length > 6 && buf.toString("ascii", 0, 3) === "GIF") return "gif";
  if (
    buf.length > 12 &&
    buf.toString("ascii", 0, 4) === "RIFF" &&
    buf.toString("ascii", 8, 12) === "WEBP"
  )
    return "webp";
  return null;
}

async function fetchBuffer(url) {
  const res = await fetch(url, {
    headers: { "user-agent": UA, accept: "image/*,*/*;q=0.8" },
    signal: AbortSignal.timeout(TIMEOUT_MS),
    redirect: "follow",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

/** Icon <link> candidates declared by the page, largest first, apple-touch-icon preferred. */
function iconCandidates(html, baseUrl) {
  const out = [];
  const tagRe = /<link\b[^>]*>/gi;
  let m;
  while ((m = tagRe.exec(html))) {
    const tag = m[0];
    const attr = (name) => new RegExp(`${name}\\s*=\\s*["']([^"']+)["']`, "i").exec(tag)?.[1];
    const rel = (attr("rel") ?? "").toLowerCase();
    if (!rel.includes("icon")) continue;
    const href = attr("href");
    if (!href || href.startsWith("data:")) continue;
    if ((attr("type") ?? "").includes("svg")) continue; // next/image can't optimize svg safely
    let url;
    try {
      url = new URL(href, baseUrl).href;
    } catch {
      continue;
    }
    const apple = rel.includes("apple-touch-icon");
    const size = parseInt(attr("sizes") ?? "", 10) || (apple ? 180 : 0);
    out.push({ url, size, apple });
  }
  return out.sort((a, b) => b.size - a.size || Number(b.apple) - Number(a.apple));
}

async function fetchIcon(tool) {
  const errors = [];
  // 1. Icons declared in the tool's homepage HTML.
  try {
    const res = await fetch(tool.link, {
      headers: { "user-agent": UA },
      signal: AbortSignal.timeout(TIMEOUT_MS),
      redirect: "follow",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();
    for (const c of iconCandidates(html, res.url || tool.link).slice(0, 6)) {
      try {
        const buf = await fetchBuffer(c.url);
        const ext = sniffExt(buf);
        if (ext) return { buf, ext };
        errors.push(`${c.url}: unsupported format`);
      } catch (e) {
        errors.push(`${c.url}: ${e.message}`);
      }
    }
  } catch (e) {
    errors.push(`page: ${e.message}`);
  }
  // 2. /favicon.ico — often actually a PNG on modern sites; sniff decides.
  try {
    const buf = await fetchBuffer(new URL(tool.link).origin + "/favicon.ico");
    const ext = sniffExt(buf);
    if (ext) return { buf, ext };
    errors.push("favicon.ico: not a raster image");
  } catch (e) {
    errors.push(`favicon.ico: ${e.message}`);
  }
  // 3. Google favicon service — always returns PNG.
  try {
    const host = new URL(tool.link).hostname;
    const buf = await fetchBuffer(`https://www.google.com/s2/favicons?domain=${host}&sz=128`);
    const ext = sniffExt(buf);
    if (ext) return { buf, ext };
    errors.push("google s2: unrecognized response");
  } catch (e) {
    errors.push(`google s2: ${e.message}`);
  }
  throw new Error(errors.join("; "));
}

const raw = JSON.parse(await readFile(dataPath, "utf-8"));
await mkdir(imgDir, { recursive: true });

const refetchAll = process.argv.includes("--all");
const targets = [];
for (const t of raw.tools) {
  const exists = await stat(path.join(imgDir, t.img)).then(
    () => true,
    () => false
  );
  if (refetchAll || !exists) targets.push(t);
}

if (targets.length === 0) {
  console.log(`✓ all ${raw.tools.length} tool icons present, nothing to do`);
  process.exit(0);
}

console.log(`fetching icons for ${targets.length} tool(s)...`);
let cursor = 0;
let failures = 0;
await Promise.all(
  Array.from({ length: CONCURRENCY }, async () => {
    while (cursor < targets.length) {
      const t = targets[cursor++];
      try {
        const { buf, ext } = await fetchIcon(t);
        const file = `${t.id}.${ext}`;
        await writeFile(path.join(imgDir, file), buf);
        const note = file === t.img ? "" : `  ⚠ data.json img is "${t.img}" — update it to "${file}"`;
        console.log(`✓ ${t.id} -> ${file}${note}`);
      } catch (e) {
        failures++;
        console.log(`✗ ${t.id}: ${e.message}`);
      }
    }
  })
);

if (failures > 0) {
  console.error(`✗ ${failures}/${targets.length} icon(s) failed`);
  process.exit(1);
}
console.log(`✓ fetched ${targets.length} icon(s)`);
