// Fetches a logo for every tool in data.json whose image is missing under
// public/img. Strategy per tool: icons declared in the site's HTML
// (apple-touch-icon etc.), then /favicon.ico (PNG frames are extracted from
// ICO containers), then favicon proxy services (favicon.im, icon.horse) that
// fetch server-side — useful for bot-blocked or unreachable sites.
// Run via `npm run fetch-icons` (missing only) or `npm run fetch-icons -- --all`.
import { readFile, writeFile, stat, mkdir } from "node:fs/promises";
import { deflateSync } from "node:zlib";
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

// --- Minimal PNG encoder (8-bit RGBA) + ICO BMP decoder --------------------

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});

function crc32(buf) {
  let c = 0xffffffff;
  for (const b of buf) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data) {
  const out = Buffer.alloc(12 + data.length);
  out.writeUInt32BE(data.length, 0);
  out.write(type, 4, "ascii");
  data.copy(out, 8);
  out.writeUInt32BE(crc32(out.subarray(4, 8 + data.length)), 8 + data.length);
  return out;
}

/** Encode an RGBA pixel buffer (top-down rows) as a PNG file buffer. */
function encodePng(width, height, rgba) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (width * 4 + 1)] = 0; // filter: none
    rgba.copy(raw, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4);
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    pngChunk("IHDR", ihdr),
    pngChunk("IDAT", deflateSync(raw)),
    pngChunk("IEND", Buffer.alloc(0)),
  ]);
}

/**
 * Decode one ICO BMP frame (BITMAPINFOHEADER + XOR pixels + AND mask,
 * bottom-up) to a PNG buffer. Supports 24/32bpp BI_RGB; returns null
 * otherwise.
 */
function decodeIcoBmpFrame(frame) {
  if (frame.length < 40 || frame.readUInt32LE(0) !== 40) return null;
  const width = frame.readInt32LE(4);
  const height = frame.readInt32LE(8) / 2; // XOR + AND
  const bpp = frame.readUInt16LE(14);
  if (width <= 0 || height <= 0 || (bpp !== 24 && bpp !== 32)) return null;
  const xorStride = bpp === 32 ? width * 4 : Math.ceil((width * 3) / 4) * 4;
  const andStride = Math.ceil(width / 32) * 4;
  const xorStart = 40;
  const andStart = xorStart + xorStride * height;
  if (andStart + andStride * height > frame.length) return null;

  const rgba = Buffer.alloc(width * height * 4);
  for (let y = 0; y < height; y++) {
    const srcRow = xorStart + (height - 1 - y) * xorStride;
    const andRow = andStart + (height - 1 - y) * andStride;
    for (let x = 0; x < width; x++) {
      const d = (y * width + x) * 4;
      if (bpp === 32) {
        rgba[d] = frame[srcRow + x * 4 + 2];
        rgba[d + 1] = frame[srcRow + x * 4 + 1];
        rgba[d + 2] = frame[srcRow + x * 4];
        rgba[d + 3] = frame[srcRow + x * 4 + 3];
      } else {
        rgba[d] = frame[srcRow + x * 3 + 2];
        rgba[d + 1] = frame[srcRow + x * 3 + 1];
        rgba[d + 2] = frame[srcRow + x * 3];
        rgba[d + 3] = 255;
      }
      // 32bpp frames with an all-zero alpha channel rely on the AND mask.
      if (bpp === 24 || rgba[d + 3] === 0) {
        const masked = (frame[andRow + (x >> 3)] >> (7 - (x & 7))) & 1;
        rgba[d + 3] = masked ? 0 : 255;
      }
    }
  }
  return encodePng(width, height, rgba);
}

/**
 * Convert an ICO container to a PNG buffer using its largest frame —
 * embedded PNG frames directly, BMP frames via the decoder above.
 * Returns null when the buffer isn't an ICO or no frame can be decoded.
 */
function icoToPng(buf) {
  if (buf.length < 6 || buf.readUInt16LE(0) !== 0 || buf.readUInt16LE(2) !== 1)
    return null;
  const count = buf.readUInt16LE(4);
  let best = null;
  for (let i = 0; i < count; i++) {
    const e = 6 + i * 16;
    if (e + 16 > buf.length) break;
    const width = buf[e] === 0 ? 256 : buf[e];
    const size = buf.readUInt32LE(e + 8);
    const offset = buf.readUInt32LE(e + 12);
    if (offset + size > buf.length) continue;
    const frame = buf.subarray(offset, offset + size);
    const png =
      frame.length > 8 && frame[0] === 0x89 && frame[1] === 0x50
        ? Buffer.from(frame)
        : decodeIcoBmpFrame(frame);
    if (png && (!best || width > best.width)) best = { width, png };
  }
  return best ? best.png : null;
}

async function fetchBuffer(url) {
  const res = await fetch(url, {
    headers: {
      "user-agent": UA,
      accept: "text/html,application/xhtml+xml,image/avif,image/webp,image/*,*/*;q=0.8",
      "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
    },
    signal: AbortSignal.timeout(TIMEOUT_MS),
    redirect: "follow",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

/** Sniff a downloaded icon; ICO containers get converted to PNG. */
function sniffIcon(buf) {
  const ext = sniffExt(buf);
  if (ext) return { buf, ext };
  const png = icoToPng(buf);
  return png ? { buf: png, ext: "png" } : null;
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
  const tryUrl = async (url) => {
    try {
      const buf = await fetchBuffer(url);
      const icon = sniffIcon(buf);
      if (icon) return icon;
      errors.push(`${url}: unsupported format`);
    } catch (e) {
      errors.push(`${url}: ${e.message}`);
    }
    return null;
  };

  // 1. Icons declared in the tool's homepage HTML.
  try {
    const res = await fetch(tool.link, {
      headers: {
        "user-agent": UA,
        accept: "text/html,application/xhtml+xml,*/*;q=0.8",
        "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
      },
      signal: AbortSignal.timeout(TIMEOUT_MS),
      redirect: "follow",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();
    for (const c of iconCandidates(html, res.url || tool.link).slice(0, 6)) {
      const icon = await tryUrl(c.url);
      if (icon) return icon;
    }
  } catch (e) {
    errors.push(`page: ${e.message}`);
  }
  // 2. /favicon.ico — PNG frames get extracted from ICO containers.
  const host = new URL(tool.link).hostname;
  {
    const icon = await tryUrl(new URL(tool.link).origin + "/favicon.ico");
    if (icon) return icon;
  }
  // 3. Favicon proxy services — they fetch server-side, which also bypasses
  //    bot-blocking and networks where the site itself is unreachable.
  for (const svc of [
    `https://unavatar.io/${host}`,
    `https://icon.horse/icon/${host}`,
    `https://favicon.im/${host}`,
  ]) {
    const icon = await tryUrl(svc);
    if (icon) return icon;
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
