// Copy fidelity: every sentence in the approved planning drafts should appear,
// word for word, in the rendered page it belongs to. Lists the sentences that
// do not, for human review (some differences are intentional layout adaptations).
// Usage: node scripts/check-copy.mjs        (run after npm run build)
// Reads ../planning (outside this repo); skips gracefully if it is not present.
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const dist = join(process.cwd(), 'dist');
const planning = join(process.cwd(), '..', 'planning');
if (!existsSync(planning)) {
  console.log('../planning not found — copy check skipped.');
  process.exit(0);
}

const norm = (s) =>
  s
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/\s+/g, ' ')
    .replace(/\s+([,.;:!?)])/g, '$1') // tags leave spaces before punctuation
    .replace(/\(\s+/g, '(')
    .trim();

function pageText(rel) {
  const file = join(dist, rel);
  if (!existsSync(file)) return null;
  const html = readFileSync(file, 'utf8');
  return norm(
    html
      .replace(/<head[\s\S]*?<\/head>/i, ' ')
      .replace(/<(style|script)[\s\S]*?<\/\1>/gi, ' ')
      // Inline tags vanish without adding a space, so a missing space in the
      // rendered page ("tagline,Responsible", "toolsand") is detected.
      .replace(/<\/?(a|strong|em|b|i|span|code|abbr|small)\b[^>]*>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&#39;/g, "'")
      .replace(/&quot;/g, '"')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>'),
  );
}

// Strip markdown, internal citations and review markers; split into sentences.
// Each line is handled separately so sentences never merge across sections.
function sentences(md) {
  return md
    .split('\n')
    .filter((l) => !/^\s*(---|\*\(|\(|\*\*\[|→)/.test(l)) // dividers, layout notes, button labels, link lines
    .flatMap((line) => lineSentences(line));
}

function lineSentences(md) {
  const clean = md
    .replace(/`\[REVIEW:[^\]]*\]`/g, ' ')
    .replace(/\*\((?:deck|decks|Brand Guide|closing slides)[^)]*\)\*/g, ' ')
    .replace(/\((?:deck|decks) [^)]*\)/g, ' ')
    .replace(/\(p\d+(?:[–-]\d+)?(?:, p\d+(?:[–-]\d+)?)*\)/g, ' ')
    .replace(/\{#[a-z-]+\}/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\*\*|__|`/g, '')
    .replace(/(^|\s)\*([^*\n]+)\*/g, '$1$2')
    .replace(/^\s*[-*]\s+/gm, '')
    .replace(/^\s*\d+\.\s+/gm, '')
    .replace(/^#+\s.*$/gm, ' ');
  return norm(clean)
    .split(/(?<=[.?!])\s+(?=[A-Z“"])/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 25 && /[a-z]/.test(s) && !/^(slug|order|audience|formats|source|tools mentioned|relatedProjects|relatedResources|status):/i.test(s));
}

const checks = []; // { page, source, sentence }
const add = (page, source, md) => sentences(md).forEach((s) => checks.push({ page, source, sentence: s }));

// 1. Home / About / Footer from homepage-about-draft.md
const draft = readFileSync(join(planning, 'homepage-about-draft.md'), 'utf8');
const home = draft.split('## HOME')[1]?.split('## ABOUT RAISE')[0] ?? '';
const about = draft.split('## ABOUT RAISE')[1]?.split('## FOOTER')[0] ?? '';
const footer = draft.split('## FOOTER')[1] ?? '';
add('/index.html', 'draft HOME', home);
add('/about/index.html', 'draft ABOUT', about);
add('/index.html', 'draft FOOTER', footer.split('**Banner while in review:**')[0].replace(/Contact:.*$/m, ''));

// 2. Workshops and projects from content-inventory.md (field values only)
const inv = readFileSync(join(planning, 'content-inventory.md'), 'utf8');
const FIELD = /^\s*-\s+\*\*(summary|keyIdeas|practise|leaveWith|series purpose|need|intendedUsers|whatWasBuilt|howTested|limitations):\*\*\s*(.*)$/;
for (const [section, prefix] of [['## A. Workshops', 'workshops'], ['## B. Projects', 'projects']]) {
  const body = inv.split(section)[1]?.split(/\n## [A-Z]\. /)[0] ?? '';
  for (const block of body.split(/\n### /).slice(1)) {
    const slug = block.match(/\*\*slug:\*\*\s*`([^`]+)`/)?.[1];
    if (!slug) continue;
    const lines = block.split('\n');
    let md = '';
    let inKeyIdeas = false;
    for (const line of lines) {
      const m = line.match(FIELD);
      if (m) {
        inKeyIdeas = m[1] === 'keyIdeas';
        md += '\n' + m[2];
      } else if (inKeyIdeas && /^\s{2,}-\s/.test(line)) {
        md += '\n' + line.replace(/^\s+-\s/, '');
      } else if (/^\s*-\s+\*\*/.test(line) || /^####/.test(line)) {
        inKeyIdeas = false;
        if (/^####/.test(line)) md += '\n';
      }
    }
    add(`/${prefix}/${slug}/index.html`, `inventory ${prefix}/${slug}`, md);
  }
}

// 3. Resources from the §C table (content column). The page lays these out as
// cards, flows and lists, so compare by fragment (case-insensitive) instead of sentence.
const resBody = inv.split('## C. Resources')[1]?.split(/\n## [A-Z]\. /)[0] ?? '';
const fragments = []; // { page, source, sentence, fragment: true }
for (const row of resBody.split('\n').filter((l) => /^\|\s*`#/.test(l))) {
  const cells = row.split('|').map((c) => c.trim());
  if (cells[1] === '`#five-dimensions`' || cells[1] === '`#links`') continue;
  const text = cells[3]
    .replace(/Mapping \(deck 07 p9\):[^|]*?(?=The test:)/, '')
    .replace(/\*\*|\*|`/g, '');
  for (const f of text.split(/\s·\s|→|\(|\)|:|;|\s\d\.\s|^\d\.\s|\.\s|\?\s/)) {
    const frag = norm(f).replace(/[.?]$/, '');
    if (frag.length >= 12) fragments.push({ page: '/resources/index.html', source: `inventory resources ${cells[1]}`, sentence: frag, fragment: true });
  }
}
checks.push(...fragments);

// ---- Compare ----
const texts = new Map();
const misses = [];
for (const c of checks) {
  if (!texts.has(c.page)) texts.set(c.page, pageText(c.page));
  const t = texts.get(c.page);
  if (t === null) { misses.push({ ...c, why: 'page missing' }); continue; }
  const found = c.fragment ? t.toLowerCase().includes(c.sentence.toLowerCase()) : t.includes(norm(c.sentence));
  if (!found) misses.push(c);
}

const byPage = {};
for (const c of checks) byPage[c.page] = (byPage[c.page] ?? 0) + 1;
console.log(`Forward: ${checks.length - misses.length}/${checks.length} draft sentences found verbatim across ${Object.keys(byPage).length} pages.`);
if (misses.length) {
  console.log(`\nNot found verbatim (${misses.length}) — review each: intentional adaptation or error?`);
  for (const m of misses) console.log(`- ${m.page} [${m.source}]${m.why ? ' ' + m.why : ''}\n    "${m.sentence}"`);
}

// ---- Reverse: is every sentence on the page traceable to the planning docs? ----
// Catches text added in the site that no approved draft contains.
const corpusFiles = ['homepage-about-draft.md', 'content-inventory.md', 'sitemap.md'];
const corpus = norm(
  corpusFiles
    .map((f) => readFileSync(join(planning, f), 'utf8'))
    .join('\n')
    .replace(/\*\*|__|`/g, '')
    .replace(/(^|\s)\*([^*\n]+)\*/g, '$1$2')
    .replace(/\((?:deck|decks) [^)]*\)|\(p\d+(?:[–-]\d+)?(?:, p\d+(?:[–-]\d+)?)*\)/g, ' ')
    .replace(/^\s*[-*|]\s*/gm, ' ')
    .replace(/\s*\|\s*/g, ' '),
).toLowerCase();

// UI microcopy and computed labels that are interface text, not content claims.
// Each entry is justified; anything else must be traceable to planning/.
// Keep this list short: page copy belongs in planning/sitemap.md, not here.
const UI_ALLOWED = [
  /^\d+ sessions in \d+ workshops, including the three-session series for teaching assistants\.$/, // computed from content (START_HERE)
  /^From (the workshops?|RAISE Hub's evaluation guidance)/, // source attribution label
  /^TSA Workshop Series · Session \d: [A-Z][\w ]+$/, // link label assembled from series + session titles (content inventory §A)
];

const unsourced = [];
for (const page of Object.keys(byPage).concat(['/workshops/index.html', '/projects/index.html', '/404.html'])) {
  const file = join(dist, page);
  if (!existsSync(file)) continue;
  const html = readFileSync(file, 'utf8');
  const main = (html.match(/<main[\s\S]*?<\/main>/) ?? [''])[0]
    .replace(/<aside class="review-pending[\s\S]*?<\/aside>/g, ' ') // review notes come from the checklist
    .replace(/<(style|script)[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<(span|div)[^>]*aria-hidden="true"[^>]*>[\s\S]*?<\/\1>/gi, ' ') // decorative numbers/arrows
    .replace(/<span class="visually-hidden[^"]*"[^>]*>[\s\S]*?<\/span>/gi, ' ')
    // Labels, badges, pills, buttons and links are separate segments, not parts of a sentence
    .replace(/<\/(p|li|h[1-6]|dt|dd|figcaption|div|section|header|ol|ul|dl|article|nav|strong|span|em|a|button)>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"');
  const seen = new Set();
  for (const line of main.split('\n')) {
    for (const s of norm(line).split(/(?<=[.?!])\s+(?=[A-Z"])/)) {
      const t = s.replace(/^(Need|Status):\s*/, '').trim();
      if (t.split(' ').length < 6 || seen.has(t)) continue; // headings, labels, chips
      seen.add(t);
      if (corpus.includes(t.toLowerCase().replace(/[.?!:]$/, ''))) continue;
      if (UI_ALLOWED.some((re) => re.test(t))) continue;
      unsourced.push({ page, sentence: t });
    }
  }
}
console.log(`Reverse: ${unsourced.length} sentence(s) on the site not traceable to planning/ (excluding justified UI text).`);
for (const u of unsourced) console.log(`- ${u.page}\n    "${u.sentence}"`);

if (misses.length || unsourced.length) process.exit(1);
console.log('Copy fidelity OK in both directions.');
