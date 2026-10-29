// Checks that every internal href/src in dist/ points to a file that exists,
// and that the page id for every #fragment exists on the target page.
// Usage: node scripts/check-links.mjs [basePath]   e.g. node scripts/check-links.mjs /raise-hub/
// No dependencies. Exit code 1 if anything is broken.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const dist = join(process.cwd(), 'dist');
let base = process.argv[2] || process.env.BASE_PATH || '/';
if (!base.endsWith('/')) base += '/';

if (!existsSync(dist)) {
  console.error('dist/ not found — run npm run build first.');
  process.exit(1);
}

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

const htmlFiles = walk(dist).filter((f) => f.endsWith('.html'));
const idsCache = new Map();

function idsOf(file) {
  if (!idsCache.has(file)) {
    const html = readFileSync(file, 'utf8');
    idsCache.set(file, new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1])));
  }
  return idsCache.get(file);
}

/** Map a URL path (with base) to a file in dist, or null. */
function resolve(urlPath) {
  if (!urlPath.startsWith(base)) return null;
  const rel = decodeURIComponent(urlPath.slice(base.length));
  const candidates = [join(dist, rel), join(dist, rel, 'index.html')];
  return candidates.find((c) => existsSync(c) && statSync(c).isFile()) ?? null;
}

const problems = [];
let checked = 0;

for (const file of htmlFiles) {
  const html = readFileSync(file, 'utf8');
  const page = '/' + relative(dist, file).split(sep).join('/');
  for (const [, attr, value] of html.matchAll(/\s(href|src)="([^"]*)"/g)) {
    if (/^(https?:|mailto:|tel:|data:|javascript:)/i.test(value)) continue;
    checked++;
    if (value.startsWith('#')) {
      const id = value.slice(1);
      if (id && !idsOf(file).has(id)) problems.push(`${page}: ${attr}="${value}" — no element with that id on this page`);
      continue;
    }
    if (!value.startsWith('/')) {
      problems.push(`${page}: ${attr}="${value}" — relative link (use url() so it works under ${base})`);
      continue;
    }
    const [pathPart, hash] = value.split('#');
    const target = resolve(pathPart);
    if (!target) {
      problems.push(`${page}: ${attr}="${value}" — target not found${value.startsWith(base) ? '' : ` (missing base ${base})`}`);
      continue;
    }
    if (hash && target.endsWith('.html') && !idsOf(target).has(hash)) {
      problems.push(`${page}: ${attr}="${value}" — #${hash} not found on target page`);
    }
  }
}

console.log(`Checked ${checked} internal links in ${htmlFiles.length} pages (base ${base}).`);
if (problems.length) {
  console.error(`\n${problems.length} problem(s):\n- ` + problems.join('\n- '));
  process.exit(1);
}
console.log('All internal links OK.');
