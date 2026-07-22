// Regenerates the site icons from the brand mark (vermilion tile + white
// sparkles, same as the Topbar logo). Writes:
//   src/app/favicon.ico   multi-res ICO (16/32/48, PNG frames)
//   src/app/icon.png      512px modern icon
//   src/app/apple-icon.png 180px iOS touch icon
// Run: node scripts/generate-icon.mjs  (uses sharp, bundled with Next)
import { writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#e2624a"/>
      <stop offset="1" stop-color="#c8442b"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="112" fill="url(#g)"/>
  <g transform="translate(76 76) scale(15)" stroke="#ffffff" stroke-width="2.2"
     fill="none" stroke-linecap="round" stroke-linejoin="round">
    <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/>
    <path d="M20 3v4"/>
    <path d="M22 5h-4"/>
    <path d="M4 17v2"/>
    <path d="M5 18H3"/>
  </g>
</svg>`;

const appDir = path.join(process.cwd(), "src", "app");

/** Pack PNG buffers into an .ico container. */
function toIco(frames) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(frames.length, 4);
  const entries = Buffer.alloc(16 * frames.length);
  let offset = 6 + entries.length;
  frames.forEach((f, i) => {
    entries[i * 16] = f.size >= 256 ? 0 : f.size;
    entries[i * 16 + 1] = f.size >= 256 ? 0 : f.size;
    entries.writeUInt16LE(1, i * 16 + 4);
    entries.writeUInt16LE(32, i * 16 + 6);
    entries.writeUInt32LE(f.png.length, i * 16 + 8);
    entries.writeUInt32LE(offset, i * 16 + 12);
    offset += f.png.length;
  });
  return Buffer.concat([header, entries, ...frames.map((f) => f.png)]);
}

const render = (size) =>
  sharp(Buffer.from(SVG), { density: 512 }).resize(size).png().toBuffer();

const [png512, png180, png48, png32, png16] = await Promise.all(
  [512, 180, 48, 32, 16].map(render)
);

await writeFile(path.join(appDir, "icon.png"), png512);
await writeFile(path.join(appDir, "apple-icon.png"), png180);
await writeFile(
  path.join(appDir, "favicon.ico"),
  toIco([
    { size: 16, png: png16 },
    { size: 32, png: png32 },
    { size: 48, png: png48 },
  ])
);
console.log("✓ wrote src/app/favicon.ico, icon.png (512), apple-icon.png (180)");
