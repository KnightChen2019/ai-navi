// Validates data.json: unique slug ids, known sections, required fields, and
// that every referenced logo actually exists under public/img.
// Run via `npm run validate` (also runs automatically before `npm run build`).
import { readFile, stat } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const dataPath = path.join(root, "data.json");
const imgDir = path.join(root, "public", "img");

const errors = [];

let raw;
try {
  raw = JSON.parse(await readFile(dataPath, "utf-8"));
} catch (e) {
  console.error(`✗ cannot read/parse data.json: ${e.message}`);
  process.exit(1);
}

const sections = raw.sections;
const tools = raw.tools;
if (!Array.isArray(sections)) errors.push("`sections` must be an array");
if (!Array.isArray(tools)) errors.push("`tools` must be an array");

const sectionSet = new Set(sections ?? []);
const seenIds = new Set();
const requiredFields = ["id", "name", "description", "img", "link", "addedAt", "sections"];

for (const t of tools ?? []) {
  const label = t?.id ?? JSON.stringify(t)?.slice(0, 40);
  for (const f of requiredFields) {
    if (t?.[f] == null) errors.push(`tool "${label}" is missing field "${f}"`);
  }
  if (t?.id != null) {
    if (seenIds.has(t.id)) errors.push(`duplicate tool id: "${t.id}"`);
    seenIds.add(t.id);
    if (!/^[a-z0-9][a-z0-9-]*$/.test(t.id))
      errors.push(`tool id is not a url-safe slug: "${t.id}"`);
  }
  if (t?.addedAt != null && !/^\d{4}-\d{2}-\d{2}$/.test(t.addedAt))
    errors.push(`tool "${label}" addedAt must be YYYY-MM-DD: "${t.addedAt}"`);
  for (const s of t?.sections ?? []) {
    if (!sectionSet.has(s))
      errors.push(`tool "${label}" references unknown section: "${s}"`);
  }
  if (t?.img) {
    try {
      await stat(path.join(imgDir, t.img));
    } catch {
      errors.push(`missing image file: public/img/${t.img} (tool "${label}")`);
    }
  }
}

if (errors.length) {
  console.error(`✗ data.json validation failed (${errors.length} issue(s)):`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}

console.log(`✓ data.json OK — ${tools.length} tools, ${sections.length} sections`);
