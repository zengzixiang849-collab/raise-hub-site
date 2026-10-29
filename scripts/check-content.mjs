// Content & accessibility self-check over the built site (dist/).
// Encodes the project rules in ../CLAUDE.md so every build step is checked the same way.
// Usage: node scripts/check-content.mjs        (run after npm run build)
// No dependencies. Exit code 1 if any check fails.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const dist = join(process.cwd(), 'dist');
if (!existsSync(dist)) {
  console.error('dist/ not found — run npm run build first.');
  process.exit(1);
}

// ---- Rules -----------------------------------------------------------------
// Five dimensions, exact wording (RAISE_Five_Dimensions_Evaluation.docx).
const DIMENSIONS = [
  'Accuracy — did you test outputs for errors? Where did it get things wrong?',
  'Bias & fairness — who does it work well for, and who might it fail or disadvantage?',
  'Limits & uncertainty — what can this tool not do? When should it not be used?',
  'Power & public value — who benefits, who bears the cost? Governance implication if a community/public body used it?',
  'Responsible-use decision — given all the above, should it be used, by whom, under what conditions, or not deployed at all?',
];
// Pages that must show all five dimensions word for word (skipped while a page is still a placeholder).
const PAGES_WITH_DIMENSIONS = ['/index.html', '/about/index.html', '/resources/index.html'];
// Fictional course materials: if a page mentions any of these, it must say "fictional".
const FICTIONAL_MARKERS = /\b(PUB 120|PUB 121|Riverford|Riverton|Dr\. Lin|Unit 4)\b/;
const PEOPLE_NUMBER = /\b\d[\d,]*\s+(participants|attendees|students|faculty|teachers|people|TSAs)\b/i;

// ---- Helpers ---------------------------------------------------------------
function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

const ENTITIES = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'", '&nbsp;': ' ' };
function visibleText(html) {
  return html
    .replace(/<head[\s\S]*?<\/head>/i, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z#0-9]+;/gi, (e) => ENTITIES[e] ?? ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Text as the reader sees it: inline tags removed WITHOUT adding a space, so a
// space lost between text and a link/bold/italic shows up ("workshops:Using").
function renderedText(html) {
  return visibleText(
    html
      .replace(/<(style|script)[\s\S]*?<\/\1>/gi, ' ')
      .replace(/<\/?(a|strong|em|b|i|span|code|abbr|small)\b[^>]*>/gi, ''),
  );
}

// ---- Run -------------------------------------------------------------------
const pages = walk(dist).filter((f) => f.endsWith('.html'));
const failures = [];
const warnings = [];
const titles = new Map();
const fail = (page, msg) => failures.push(`${page}: ${msg}`);

for (const file of pages) {
  const page = '/' + relative(dist, file).split(sep).join('/');
  const html = readFileSync(file, 'utf8');
  const text = visibleText(html);
  const isPlaceholder = /class="placeholder"/.test(html);

  // Structure
  const h1 = (html.match(/<h1[\s>]/g) || []).length;
  if (h1 !== 1) fail(page, `expected exactly one <h1>, found ${h1}`);
  const levels = [...html.matchAll(/<h([1-6])[\s>]/g)].map((m) => Number(m[1]));
  levels.forEach((lvl, i) => {
    if (i > 0 && lvl > levels[i - 1] + 1) fail(page, `heading level skips from h${levels[i - 1]} to h${lvl}`);
  });

  // Head
  const title = html.match(/<title>([^<]*)<\/title>/)?.[1];
  if (!title) fail(page, 'missing <title>');
  else titles.set(title, [...(titles.get(title) || []), page]);
  if (!/<meta name="description" content="[^"]+"/.test(html)) fail(page, 'missing meta description');
  if (!/<html lang="en"/.test(html)) fail(page, 'missing <html lang="en">');

  // Images: every <img> needs an alt attribute
  for (const [tag] of html.matchAll(/<img\b[^>]*>/g)) {
    if (!/\salt="/.test(tag)) fail(page, `image without alt: ${tag.slice(0, 80)}`);
  }

  // No external runtime requests (canonical/og:url meta are not requests)
  for (const [tag] of html.matchAll(/<(script|img|iframe|source|video|audio)\b[^>]*\ssrc="https?:\/\/[^"]*"[^>]*>/g)) {
    fail(page, `external resource: ${tag.slice(0, 90)}`);
  }
  for (const [tag] of html.matchAll(/<link\b[^>]*>/g)) {
    if (/href="https?:\/\//.test(tag) && !/rel="canonical"/.test(tag)) fail(page, `external <link>: ${tag.slice(0, 90)}`);
  }
  if (/@import\s+url\(|fonts\.googleapis|fonts\.gstatic|cdn\.jsdelivr|unpkg\.com/.test(html)) {
    fail(page, 'external font/CDN reference');
  }

  // Missing space after punctuation (e.g. lost between text and an inline tag)
  const glued = renderedText(html).match(/\b[A-Za-z]{2,}[,;:][A-Za-z]{2,}\b/g);
  if (glued) fail(page, `missing space after punctuation: ${[...new Set(glued)].slice(0, 5).join(', ')}`);

  // Content rules
  if (/Student Education/i.test(text)) fail(page, 'deprecated "Student Education"');
  const pct = text.match(/\d+(\.\d+)?\s*%/g);
  if (pct) fail(page, `percentage in visible text: ${pct.join(', ')}`);
  const ppl = text.match(PEOPLE_NUMBER);
  if (ppl) fail(page, `attendance-style number: "${ppl[0]}"`);
  const deployed = text.match(/.{0,12}\bdeployed\b/gi) || [];
  for (const d of deployed) if (!/not deployed/i.test(d)) fail(page, `possible deployment claim: "…${d}"`);
  if (FICTIONAL_MARKERS.test(text) && !/fictional/i.test(text)) {
    fail(page, 'mentions fictional course material without saying "fictional"');
  }

  // Five dimensions (exact wording)
  if (PAGES_WITH_DIMENSIONS.includes(page) && !isPlaceholder) {
    DIMENSIONS.forEach((d) => {
      if (!text.includes(d)) fail(page, `five-dimension wording missing or changed: "${d.slice(0, 40)}…"`);
    });
  }
  // Anywhere a dimension is shown as "Name — question", the question must be exact
  for (const d of DIMENSIONS) {
    const name = d.split(' — ')[0];
    if (text.includes(`${name} — `) && !text.includes(d)) fail(page, `"${name}" shown with different wording`);
  }

  // Draft mode safety
  const draft = /Draft for review — not published/.test(text);
  if (draft && !/<meta name="robots" content="noindex, nofollow"/.test(html)) {
    fail(page, 'draft page without noindex');
  }
  if (isPlaceholder) warnings.push(`${page}: still a placeholder page`);
}

for (const [title, list] of titles) {
  if (list.length > 1) failures.push(`duplicate <title> "${title}": ${list.join(', ')}`);
}

console.log(`Checked ${pages.length} pages against the content and accessibility rules.`);
if (warnings.length) console.log(`\nNotes (${warnings.length}):\n- ` + warnings.join('\n- '));
if (failures.length) {
  console.error(`\n${failures.length} problem(s):\n- ` + failures.join('\n- '));
  process.exit(1);
}
console.log('All content checks passed.');
