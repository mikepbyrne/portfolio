// Image optimization pipeline
// Walks ../Selects/<project>/ and produces 3 sizes (400/1200/2400) as WebP+JPG
// + a poster frame for any video files
// + manifest.json mapping project → assets
import { readdir, mkdir, stat, writeFile, readFile, copyFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';
import { execSync } from 'child_process';
import crypto from 'crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const PORTFOLIO = path.resolve(ROOT, '..');
const SELECTS = path.join(PORTFOLIO, 'Selects');
const OUT = path.join(ROOT, 'public', 'media');
const CACHE_FILE = path.join(ROOT, '.opt-cache.json');

// Allow huge images (LVLWatch has 535MB TIFs)
sharp.cache(false);
sharp.concurrency(2);

const SIZES = [400, 1200, 2400];
// Web-friendly only — skip TIFs and RAW formats
const IMG_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.heic', '.gif']);
const SKIP_EXT = new Set(['.tif', '.tiff', '.raw', '.cr2', '.cr3', '.nef', '.arw', '.dng', '.orf', '.rw2']);
const VID_EXT = new Set(['.mp4', '.mov', '.m4v']);


function slugify(s) {
  return s.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Clean per-file slug: drop redundant project prefix, version cruft, "(original)", etc.
function cleanFileSlug(rawStem, projectSlug) {
  let s = slugify(rawStem);
  // Drop leading "<projectSlug>__" or "<projectSlug>-" prefix (added during the earlier flatten step)
  const prefix = projectSlug + '-';
  if (s.startsWith(projectSlug + '--')) s = s.slice(projectSlug.length + 2);
  else if (s.startsWith(prefix)) s = s.slice(prefix.length);
  // Drop double-underscore separators if any survived
  s = s.replace(/_/g, '-').replace(/-+/g, '-');
  // Drop "-original" / "-copy" tails
  s = s.replace(/-original-?\d*$/, '').replace(/-copy-?\d*$/, '');
  // Trim
  s = s.replace(/^-+|-+$/g, '');
  return s || rawStem.toLowerCase();
}

function fileHash(filePath, size, mtime) {
  return crypto.createHash('md5').update(`${filePath}|${size}|${mtime}`).digest('hex');
}

async function loadCache() {
  try { return JSON.parse(await readFile(CACHE_FILE, 'utf8')); } catch { return {}; }
}

async function saveCache(cache) {
  await writeFile(CACHE_FILE, JSON.stringify(cache, null, 2));
}

async function processGif(src, outDir, baseName, cache) {
  const st = await stat(src);
  const hash = fileHash(src, st.size, st.mtimeMs);
  const cached = cache[src];
  if (cached?.hash === hash && cached?.outputs?.every(p => existsSync(path.join(OUT, p)))) {
    return cached;
  }
  const outPath = path.join(outDir, `${baseName}.gif`);
  await copyFile(src, outPath);
  // Get dimensions for layout
  let width = 0, height = 0;
  try {
    const m = await sharp(src, { animated: false }).metadata();
    width = m.width || 0; height = m.height || 0;
  } catch {}
  const result = {
    hash,
    type: 'gif',
    width, height,
    outputs: [path.relative(OUT, outPath)],
  };
  cache[src] = result;
  return result;
}

async function processImage(src, outDir, baseName, cache) {
  const st = await stat(src);
  const hash = fileHash(src, st.size, st.mtimeMs);
  const cached = cache[src];
  if (cached?.hash === hash && cached?.outputs?.every(p => existsSync(path.join(OUT, p)))) {
    return cached;
  }

  const sharpOpts = { failOnError: false, limitInputPixels: false, unlimited: true };
  const img = sharp(src, sharpOpts);
  const meta = await img.metadata();
  const outputs = [];

  // Only generate sizes <= source width. Never upscale.
  const sourceW = meta.width || 0;
  const targets = SIZES.filter(w => sourceW >= w);
  // If source is smaller than the smallest size, emit native size only
  if (targets.length === 0 && sourceW > 0) targets.push(sourceW);

  for (const w of targets) {
    const stem = `${baseName}-${w}`;
    const webpPath = path.join(outDir, `${stem}.webp`);
    const jpgPath = path.join(outDir, `${stem}.jpg`);
    await sharp(src, sharpOpts).rotate().resize({ width: w, withoutEnlargement: true }).webp({ quality: 82 }).toFile(webpPath);
    await sharp(src, sharpOpts).rotate().resize({ width: w, withoutEnlargement: true }).jpeg({ quality: 85, mozjpeg: true }).toFile(jpgPath);
    outputs.push(path.relative(OUT, webpPath));
    outputs.push(path.relative(OUT, jpgPath));
  }

  const result = {
    hash,
    type: 'image',
    width: meta.width,
    height: meta.height,
    outputs,
  };
  cache[src] = result;
  return result;
}

async function processVideo(src, outDir, baseName, cache) {
  const st = await stat(src);
  const hash = fileHash(src, st.size, st.mtimeMs);
  const cached = cache[src];
  if (cached?.hash === hash && cached?.outputs?.every(p => existsSync(path.join(OUT, p)))) {
    return cached;
  }

  const posterPath = path.join(outDir, `${baseName}-poster.jpg`);
  try {
    execSync(`ffmpeg -y -ss 1 -i "${src}" -frames:v 1 -q:v 3 -vf "scale=1600:-2" "${posterPath}"`, { stdio: 'pipe' });
  } catch (e) {
    console.warn(`[poster fail] ${src}`);
    return null;
  }
  const result = {
    hash,
    type: 'video-poster',
    outputs: [path.relative(OUT, posterPath)],
  };
  cache[src] = result;
  return result;
}

async function processProject(projectDir) {
  const projectName = path.basename(projectDir);
  const slug = slugify(projectName);
  const outDir = path.join(OUT, slug);
  await mkdir(outDir, { recursive: true });

  const entries = await readdir(projectDir, { withFileTypes: true });
  const cache = await loadCache();
  const assets = [];

  const allFiles = entries.filter(e => e.isFile() && !e.name.startsWith('.')).map(e => e.name);

  const usedNames = new Set();
  for (const e of entries) {
    if (!e.isFile()) continue;
    if (e.name.startsWith('.')) continue;
    const ext = path.extname(e.name).toLowerCase();
    if (SKIP_EXT.has(ext)) continue;
    let baseName = cleanFileSlug(path.basename(e.name, ext), slug);
    let n = 2;
    while (usedNames.has(baseName)) { baseName = `${cleanFileSlug(path.basename(e.name, ext), slug)}-${n++}`; }
    usedNames.add(baseName);
    const src = path.join(projectDir, e.name);

    let result = null;
    if (ext === '.gif') {
      try {
        result = await processGif(src, outDir, baseName, cache);
      } catch (err) {
        console.warn(`[gif fail] ${src}: ${err.message}`);
      }
    } else if (IMG_EXT.has(ext)) {
      try {
        result = await processImage(src, outDir, baseName, cache);
      } catch (err) {
        console.warn(`[img fail] ${src}: ${err.message}`);
      }
    } else if (VID_EXT.has(ext)) {
      result = await processVideo(src, outDir, baseName, cache);
    }
    if (result) {
      assets.push({
        name: e.name,
        slug: baseName,
        ...result,
      });
    }
  }

  await saveCache(cache);
  return { projectName, slug, assets };
}

async function main() {
  if (!existsSync(SELECTS)) {
    console.error(`No Selects dir at ${SELECTS}`);
    process.exit(1);
  }
  await mkdir(OUT, { recursive: true });

  const dirs = (await readdir(SELECTS, { withFileTypes: true }))
    .filter(d => d.isDirectory() && !d.name.startsWith('.'))
    .map(d => path.join(SELECTS, d.name));

  const manifest = {};
  for (const d of dirs) {
    process.stdout.write(`▶ ${path.basename(d)}... `);
    const { projectName, slug, assets } = await processProject(d);
    manifest[slug] = { projectName, assets };
    console.log(`${assets.length} assets`);
  }

  await writeFile(path.join(ROOT, 'src', 'data', 'manifest.json'), JSON.stringify(manifest, null, 2));
  console.log(`\n✓ Manifest written. Total projects: ${Object.keys(manifest).length}`);
}

main().catch(e => { console.error(e); process.exit(1); });
