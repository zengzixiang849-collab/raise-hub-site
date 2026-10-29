// Tests the site's only interactive script — the workshop audience filter —
// against a minimal simulated DOM (no browser needed), plus its no-JS fallback.
// Usage: node scripts/test-interactive.mjs   (run after npm run build)
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const file = join(process.cwd(), 'dist', 'workshops', 'index.html');
if (!existsSync(file)) {
  console.error('dist/workshops/index.html not found — run npm run build first.');
  process.exit(1);
}
const html = readFileSync(file, 'utf8');
const failures = [];
const expect = (ok, msg) => { if (!ok) failures.push(msg); };

// ---- No-JS fallback (static HTML) ----
const filterTag = html.match(/<div[^>]*data-filter[^>]*>/)?.[0] ?? '';
expect(/\shidden(\s|>|=)/.test(filterTag), 'filter must be hidden in the static HTML (no-JS fallback)');
const audiences = [...html.matchAll(/<article[^>]*data-audience="([^"]+)"/g)].map((m) => m[1]);
expect(audiences.length > 0, 'cards must carry data-audience');
const cardsHiddenStatically = [...html.matchAll(/<li[^>]*\shidden[\s>][^]*?data-audience/g)].length;
expect(cardsHiddenStatically === 0, 'no card may be hidden in the static HTML');
const values = [...filterTag.length ? html.matchAll(/data-value="([^"]+)"/g) : []].map((m) => m[1]);
expect(values[0] === 'all', 'first filter button must be "all"');

// ---- With JS (simulated DOM) ----
const src = [...html.matchAll(/<script type="module">([\s\S]*?)<\/script>/g)].map((m) => m[1]).find((s) => s.includes('data-filter'));
expect(Boolean(src), 'filter script not found in page');

if (src) {
  const el = (props = {}) => ({
    hidden: false, dataset: {}, attrs: {}, listeners: {}, textContent: '',
    setAttribute(k, v) { this.attrs[k] = String(v); },
    addEventListener(t, f) { this.listeners[t] = f; },
    closest() { return this.li ?? null; },
    ...props,
  });
  const cards = audiences.map((a) => { const li = el(); return el({ dataset: { audience: a }, li }); });
  const buttons = values.map((v) => el({ dataset: { value: v } }));
  const status = el();
  const filter = el({
    hidden: true, dataset: { target: 'delivered-list', noun: 'workshops' },
    querySelectorAll: (s) => (s.startsWith('button') ? buttons : []),
    querySelector: () => status,
  });
  const container = { querySelectorAll: () => cards };
  globalThis.document = {
    querySelectorAll: () => [filter],
    getElementById: (id) => (id === 'delivered-list' ? container : null),
  };
  new Function(src)();

  expect(filter.hidden === false, 'filter must become visible when JS runs');
  for (const b of buttons) {
    b.listeners.click();
    const v = b.dataset.value;
    const shown = cards.filter((c) => !c.li.hidden).map((c) => c.dataset.audience);
    const wanted = v === 'all' ? audiences : audiences.filter((a) => a === v);
    expect(shown.length === wanted.length && shown.every((a) => wanted.includes(a)), `"${v}": wrong cards shown`);
    const pressed = buttons.filter((x) => x.attrs['aria-pressed'] === 'true').map((x) => x.dataset.value);
    expect(pressed.length === 1 && pressed[0] === v, `"${v}": aria-pressed not exclusive`);
    const n = wanted.length;
    const word = n === 1 ? 'workshop' : 'workshops';
    const msg = v === 'all' ? `Showing all ${n} ${word}.` : `Showing ${n} ${word} for ${v}.`;
    expect(status.textContent === msg, `"${v}": live region says "${status.textContent}", expected "${msg}"`);
  }
  console.log(`Audience filter: ${buttons.length} buttons × ${cards.length} cards tested in a simulated DOM.`);
}

if (failures.length) {
  console.error(`\n${failures.length} problem(s):\n- ` + failures.join('\n- '));
  process.exit(1);
}
console.log('Interactive tests passed (no-JS fallback + filter behaviour).');
