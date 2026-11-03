// Tests the site's only interactive script — the workshop audience filter —
// against a minimal simulated DOM (no browser needed), plus its no-JS fallback.
// Usage: node scripts/test-interactive.mjs   (run after npm run build)
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

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

// ---- Poster carousel: logic (unit tests) and the no-JS markup ----
const math = await import(pathToFileURL(join(process.cwd(), 'src', 'lib', 'carousel-math.js')).href);
const eq = (actual, expected, label) => expect(Object.is(actual, expected) || actual === expected, `carousel-math ${label}: got ${actual}, expected ${expected}`);
eq(math.nearestIndex(1.4, 4), 1, 'nearestIndex(1.4)');
eq(math.nearestIndex(1.6, 4), 2, 'nearestIndex(1.6)');
eq(math.nearestIndex(-0.2, 4), 0, 'nearestIndex(-0.2) clamps to the first poster');
eq(math.nearestIndex(9, 4), 3, 'nearestIndex(9) clamps to the last poster');
eq(math.dialRotation(2), -2 * math.STEP_DEG, 'dialRotation(2)');
eq(math.dragToPos(1, -100, 100, 4), 2, 'dragToPos moving left goes forward');
eq(math.dragToPos(1, 100, 100, 4), 0, 'dragToPos moving right goes back');
eq(math.dragToPos(3, -900, 100, 4), 3.25, 'dragToPos clamps past the end');
eq(math.dragToPos(0, 900, 100, 4), -0.25, 'dragToPos clamps before the start');
eq(math.keyToIndex('ArrowRight', 3, 4), 3, 'ArrowRight stops at the last poster');
eq(math.keyToIndex('ArrowLeft', 0, 4), 0, 'ArrowLeft stops at the first poster');
eq(math.keyToIndex('ArrowRight', 1, 4), 2, 'ArrowRight');
eq(math.keyToIndex('Home', 2, 4), 0, 'Home');
eq(math.keyToIndex('End', 1, 4), 3, 'End');
eq(math.keyToIndex('a', 1, 4), null, 'other keys are ignored');
eq(math.wheelToIndex(1, 120, 4), 2, 'wheel down moves forward');
eq(math.wheelToIndex(1, -120, 4), 0, 'wheel up moves backward');
eq(math.wheelToIndex(1, 2, 4), 1, 'tiny wheel noise is ignored');
eq(math.wheelToIndex(3, 120, 4), 3, 'wheel releases at the final poster');
eq(math.indexFromScreenAngle(0, 1, 4), 1, 'click at the pointer keeps the poster');
eq(math.indexFromScreenAngle(math.STEP_DEG, 1, 4), 2, 'click one step right');
eq(math.indexFromScreenAngle(-math.STEP_DEG, 1, 4), 0, 'click one step left');
eq(math.indexFromScreenAngle(90, 0, 4), 3, 'click far right clamps');
const L0 = math.slideLayout(0), L1 = math.slideLayout(1), Lm1 = math.slideLayout(-1), L2 = math.slideLayout(2);
eq(L0.scale, 1, 'centre poster is full size');
eq(L0.opacity, 1, 'centre poster is opaque');
eq(L0.x, 0, 'centre poster is not shifted');
expect(L1.opacity > 0 && L1.opacity < 1, 'neighbouring poster is dimmed but visible');
eq(L2.opacity, 0, 'poster two places away is hidden');
eq(L1.x, -Lm1.x, 'layout is symmetric (x)');
eq(L1.rotateY, -Lm1.rotateY, 'layout is symmetric (tilt)');
expect(L0.z > L1.z, 'centre poster is on top');

{
  const items = [...html.matchAll(/<li[^>]*data-slide[^>]*>[\s\S]*?<\/li>/g)].map((m) => m[0]);
  expect(items.length >= 2, `carousel needs at least 2 slides in the static HTML, found ${items.length}`);
  items.forEach((li, i) => {
    const alt = li.match(/<img[^>]*\salt="([^"]*)"/)?.[1] ?? '';
    expect(alt.trim().length > 40, `slide ${i + 1}: poster alt text is missing or too short`);
    expect(/srcset="[^"]*480w[^"]*800w[^"]*1200w/.test(li), `slide ${i + 1}: srcset must list 480w, 800w, 1200w`);
    expect(/<a[^>]*class="slide__poster-link"[^>]*href="[^"]*\/workshops\/[^"]+\/"[^>]*>[\s\S]*?<img/.test(li), `slide ${i + 1}: poster itself must link to the workshop page`);
    expect(!/<figcaption/.test(li), `slide ${i + 1}: redundant linked caption should not be rendered`);
    expect(!/\saria-hidden="true"/.test(li), `slide ${i + 1}: must not be aria-hidden before JavaScript runs`);
  });
  const controlsTag = html.match(/<div[^>]*data-controls[^>]*>/)?.[0] ?? '';
  expect(/\shidden(\s|>|=)/.test(controlsTag), 'carousel controls must be hidden in the static HTML (no-JS fallback)');
  expect(/role="slider"/.test(html) && /aria-valuenow="\d+"/.test(html) && /aria-valuetext="Poster \d of \d/.test(html), 'dial must expose slider semantics');
  expect(/aria-roledescription="carousel"/.test(html) && /aria-roledescription="slide"/.test(html), 'carousel/slide roles missing');
  console.log(`Poster carousel: ${items.length} slides, math unit tests and no-JS markup checked.`);
}

if (failures.length) {
  console.error(`\n${failures.length} problem(s):\n- ` + failures.join('\n- '));
  process.exit(1);
}
console.log('Interactive tests passed (no-JS fallback, filter behaviour, carousel logic).');
