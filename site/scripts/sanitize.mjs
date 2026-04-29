// Rename source files in /Selects/, /video/, /stills/, /ai/ to clean kebab-case
// Strips: redundant project prefixes, "(original)", "_v01", "-copy-N", "_finalfinal", date prefixes, etc.
import { readdir, rename, stat } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..', '..');
const TARGET_DIRS = ['Selects', 'video', 'stills', 'ai'];

function slugify(s) {
  return s.toLowerCase()
    .replace(/[^a-z0-9.]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function cleanStem(stem, projectSlug) {
  let s = stem;
  // Lowercase + strip
  s = s.toLowerCase();
  // Strip leading date YYMMDD or YYYYMMDD or YYYY-MM-DD
  s = s.replace(/^(?:20)?\d{2}[-_]?\d{2}[-_]?\d{2}[-_]/, '');
  // Strip 220125-final, 220125-final-copy etc (date version markers anywhere)
  s = s.replace(/[-_](?:20)?\d{2}\d{2}\d{2}[-_]?(?:final|copy|wip|test|edit)?-?\d*/g, '');
  // Strip "(original)" "(2)" "(1)" parens
  s = s.replace(/\(\s*original\s*\)/g, '');
  s = s.replace(/\(\s*\d+\s*\)/g, '');
  // Strip vN, vNN with optional surrounding marks
  s = s.replace(/[-_]v\d{1,3}([-_]?[a-z]+)?/gi, '');
  // Strip -copy-N / -copy
  s = s.replace(/[-_]copy(-\d+)?/gi, '');
  // Strip -final / -finalfinal / -therealfinal
  s = s.replace(/[-_]?(?:the)?(?:real)?final(?:final)?/gi, '');
  // Strip -wip / -test / -comp / -edit (only as full token, with required separator)
  s = s.replace(/[-_](?:wip|comp|edit)(\d*)(?=$|[-_.])/gi, (m, d) => d ? `-${d}` : '');
  s = s.replace(/[-_]test(?=$|[-_.])/gi, '');
  // Strip "Original" suffix from rsync-flatten artifacts
  s = s.replace(/-original-?\d*$/i, '');
  // Slugify final
  s = slugify(s);
  // Drop redundant project prefix
  if (projectSlug) {
    const p = slugify(projectSlug);
    while (s.startsWith(p + '-')) s = s.slice(p.length + 1);
    if (s === p) s = '';
  }
  return s;
}

async function processDir(dir, projectSlug = '') {
  const entries = await readdir(dir, { withFileTypes: true });
  // First collect files to rename, with conflict resolution
  const renames = [];
  const usedNames = new Set();
  for (const e of entries) {
    if (e.name.startsWith('.')) continue;
    if (e.isDirectory()) {
      // Recurse with this folder name as project hint
      await processDir(path.join(dir, e.name), e.name);
      continue;
    }
    const ext = path.extname(e.name).toLowerCase();
    const stem = path.basename(e.name, ext);
    let cleaned = cleanStem(stem, projectSlug);
    if (!cleaned) cleaned = 'asset';
    let target = `${cleaned}${ext}`;
    let n = 2;
    while (usedNames.has(target)) {
      target = `${cleaned}-${n++}${ext}`;
    }
    if (target !== e.name) {
      renames.push([e.name, target]);
    }
    usedNames.add(target);
  }
  for (const [from, to] of renames) {
    const src = path.join(dir, from);
    const dst = path.join(dir, to);
    try { await rename(src, dst); console.log(`  ${path.basename(dir)}/${from}  →  ${to}`); }
    catch(e) { console.warn(`FAIL ${from} → ${to}: ${e.message}`); }
  }
}

async function main() {
  for (const d of TARGET_DIRS) {
    const full = path.join(ROOT, d);
    try { await stat(full); } catch { console.log(`(skip ${d} — not present)`); continue; }
    console.log(`\n▶ ${d}`);
    await processDir(full);
  }
  console.log('\n✓ Sanitized.');
}

main().catch(e => { console.error(e); process.exit(1); });
