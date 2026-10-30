// Real-browser QA (optional, not part of `npm run verify`).
// Drives the locally installed Microsoft Edge (or Chrome) through the DevTools
// protocol — no extra packages: Node's built-in fetch + WebSocket.
// Checks, against a running preview server (npm run preview):
//   1. horizontal overflow at 320 / 375 / 768 / 1280 px, with full-page screenshots
//   2. the Workshops page with JavaScript disabled (all cards visible, filter hidden)
//   3. keyboard: Tab through the homepage, record each focused element and whether
//      a focus indicator is visible
// Usage: node scripts/qa-browser.mjs [baseUrl]   (default http://127.0.0.1:4321)
// Output: ../.qa/browser/ (screenshots + report.json). Exit 1 if a check fails.
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const BASE = (process.argv[2] || 'http://127.0.0.1:4321').replace(/\/$/, '');
const OUT = join(process.cwd(), '..', '.qa', 'browser');
const PORT = 9333;
const WIDTHS = [320, 375, 768, 1280];
const PAGES = ['/', '/about/', '/workshops/', '/workshops/tsa-series/', '/projects/', '/projects/syllabot/', '/resources/', '/404.html'];

const browserPath = [
  process.env.EDGE_PATH,
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
].find((p) => p && existsSync(p));
if (!browserPath) { console.error('Edge/Chrome not found (set EDGE_PATH).'); process.exit(1); }

mkdirSync(OUT, { recursive: true });
const profile = join(OUT, 'profile');
const proc = spawn(browserPath, [
  '--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`,
  '--no-first-run', '--no-default-browser-check', '--disable-gpu', '--hide-scrollbars', 'about:blank',
], { stdio: 'ignore' });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function json(path, method = 'GET') {
  for (let i = 0; i < 50; i++) {
    try { const r = await fetch(`http://127.0.0.1:${PORT}${path}`, { method }); if (r.ok) return r.json(); } catch {}
    await sleep(200);
  }
  throw new Error('DevTools endpoint not reachable');
}

const target = await json('/json/new?about:blank', 'PUT');
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
let seq = 0;
const pending = new Map();
const listeners = [];
ws.onmessage = (ev) => {
  const msg = JSON.parse(ev.data);
  if (msg.id && pending.has(msg.id)) { const { res, rej } = pending.get(msg.id); pending.delete(msg.id); msg.error ? rej(new Error(msg.error.message)) : res(msg.result); }
  else if (msg.method) listeners.forEach((l) => l(msg));
};
const send = (method, params = {}) => new Promise((res, rej) => { const id = ++seq; pending.set(id, { res, rej }); ws.send(JSON.stringify({ id, method, params })); });
const once = (method) => new Promise((res) => { const l = (m) => { if (m.method === method) { listeners.splice(listeners.indexOf(l), 1); res(m); } }; listeners.push(l); });
const evaluate = async (expr) => (await send('Runtime.evaluate', { expression: expr, returnByValue: true })).result.value;

await send('Page.enable');
await send('Runtime.enable');

async function open(path) {
  const loaded = once('Page.loadEventFired');
  await send('Page.navigate', { url: BASE + path });
  await loaded;
  await sleep(250);
}
async function screenshot(file, width) {
  const { cssContentSize } = await send('Page.getLayoutMetrics');
  const height = Math.min(Math.ceil(cssContentSize.height), 12000);
  const shot = await send('Page.captureScreenshot', {
    format: 'jpeg', quality: 70, captureBeyondViewport: true,
    clip: { x: 0, y: 0, width, height, scale: 1 },
  });
  writeFileSync(join(OUT, file), Buffer.from(shot.data, 'base64'));
  return height;
}

const report = { base: BASE, browser: browserPath, overflow: [], jsOff: null, keyboard: [] };
const failures = [];

// 1. Overflow at each width
for (const width of WIDTHS) {
  await send('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: width < 768 });
  for (const path of PAGES) {
    await open(path);
    const r = await evaluate(`(() => {
      const vw = document.documentElement.clientWidth;
      const offenders = [...document.querySelectorAll('body *')]
        .filter((e) => { const b = e.getBoundingClientRect(); return b.width > 0 && b.right > vw + 1; })
        .slice(0, 5).map((e) => e.tagName.toLowerCase() + (e.className && typeof e.className === 'string' ? '.' + e.className.split(' ')[0] : '') + ' (right=' + Math.round(e.getBoundingClientRect().right) + ')');
      return { scrollWidth: document.documentElement.scrollWidth, viewport: vw, offenders };
    })()`);
    const slug = path === '/' ? 'home' : path.replace(/^\/|\/$/g, '').replace(/\//g, '_').replace(/\.html$/, '');
    const name = `${width}_${slug}.jpg`;
    const height = await screenshot(name, width);
    const overflow = r.scrollWidth > r.viewport + 1;
    report.overflow.push({ width, path, ...r, overflow, height, screenshot: name });
    if (overflow) failures.push(`overflow at ${width}px on ${path}: scrollWidth ${r.scrollWidth} > ${r.viewport} — ${r.offenders.join(', ')}`);
  }
}

// 2. JavaScript disabled: Workshops page
await send('Emulation.setDeviceMetricsOverride', { width: 375, height: 900, deviceScaleFactor: 1, mobile: true });
await send('Emulation.setScriptExecutionDisabled', { value: true });
await open('/workshops/');
await screenshot('jsoff_375_workshops.jpg', 375);
const doc = await send('DOM.getDocument', { depth: -1 });
const { outerHTML } = await send('DOM.getOuterHTML', { nodeId: doc.root.nodeId });
const cards = (outerHTML.match(/<article[^>]*data-audience=/g) || []).length;
const hiddenCards = (outerHTML.match(/<li[^>]*\shidden[^>]*>\s*<article/g) || []).length;
const filterTag = outerHTML.match(/<div[^>]*data-filter[^>]*>/)?.[0] ?? '';
report.jsOff = { cards, hiddenCards, filterHidden: /\shidden/.test(filterTag) };
if (!(cards === 6 && hiddenCards === 0 && report.jsOff.filterHidden)) failures.push(`JS off: ${JSON.stringify(report.jsOff)}`);
await send('Emulation.setScriptExecutionDisabled', { value: false });

// 4. Poster carousel: buttons, keyboard, dial drag/click, side-poster click, poster drag
report.carousel = [];
async function shotViewport(file) {
  // current viewport only (no clip), so the screenshot shows what the visitor sees after scrolling
  const shot = await send('Page.captureScreenshot', { format: 'jpeg', quality: 78 });
  writeFileSync(join(OUT, file), Buffer.from(shot.data, 'base64'));
}
const mouse = (type, x, y) => send('Input.dispatchMouseEvent', { type, x, y, button: type === 'mouseMoved' ? 'none' : 'left', buttons: type === 'mouseReleased' ? 0 : 1, clickCount: 1 });
async function click(x, y) { await mouse('mousePressed', x, y); await mouse('mouseReleased', x, y); await sleep(450); }
async function drag(x1, y, x2) {
  await mouse('mousePressed', x1, y);
  for (let i = 1; i <= 12; i++) { await mouse('mouseMoved', x1 + ((x2 - x1) * i) / 12, y); await sleep(15); }
  await mouse('mouseReleased', x2, y);
  await sleep(450);
}
async function key(k, code, vk) {
  await send('Input.dispatchKeyEvent', { type: 'keyDown', key: k, code, windowsVirtualKeyCode: vk });
  await send('Input.dispatchKeyEvent', { type: 'keyUp', key: k, code, windowsVirtualKeyCode: vk });
  await sleep(450);
}
for (const width of [1280, 375]) {
  await send('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: width < 768 });
  await open('/workshops/');
  const state = () => evaluate(`(() => { const r = document.querySelector('[data-carousel]'); const s = r.querySelector('[data-slider]');
    return { enhanced: r.classList.contains('is-enhanced'), now: Number(s.getAttribute('aria-valuenow')), text: s.getAttribute('aria-valuetext'),
      current: [...r.querySelectorAll('[data-slide]')].findIndex((x) => x.classList.contains('is-current')) + 1,
      prevOff: r.querySelector('[data-prev]').getAttribute('aria-disabled'), nextOff: r.querySelector('[data-next]').getAttribute('aria-disabled'),
      status: r.querySelector('[data-status]').textContent, tabbable: [...r.querySelectorAll('[data-slide] a')].filter((a) => a.tabIndex === 0).length }; })()`);
  const center = (sel) => evaluate(`(() => { const b = document.querySelector('${sel}').getBoundingClientRect(); return { x: b.x + b.width / 2, y: b.y + b.height / 2, w: b.width }; })()`);
  const slideCenter = (i) => evaluate(`(() => { const b = document.querySelectorAll('[data-slide]')[${i}].getBoundingClientRect(); return { x: b.x + b.width / 2, y: b.y + b.height * 0.4 }; })()`);
  const log = (step, s, expect) => {
    const ok = Object.entries(expect).every(([k, v]) => s[k] === v);
    report.carousel.push({ width, step, ...s, expect, ok });
    if (!ok) failures.push(`carousel ${width}px "${step}": expected ${JSON.stringify(expect)}, got now=${s.now} current=${s.current} prevOff=${s.prevOff} nextOff=${s.nextOff} tabbable=${s.tabbable} enhanced=${s.enhanced}`);
  };
  const tag = `carousel_${width}`;
  // bring the carousel into view (below the text on a phone) so mouse coordinates are on screen
  await evaluate(`(() => { const r = document.querySelector('[data-carousel]').getBoundingClientRect(); window.scrollTo(0, Math.max(0, window.scrollY + r.top - 70)); })()`);
  await sleep(300);

  let s = await state();
  log('initial', s, { enhanced: true, now: 2, current: 2, tabbable: 1 });
  await shotViewport(`${tag}_1_initial.jpg`);

  await click(...Object.values(await center('[data-next]')).slice(0, 2));
  s = await state(); log('next button', s, { now: 3, current: 3 });
  await shotViewport(`${tag}_2_next.jpg`);

  await evaluate(`document.querySelector('[data-slider]').focus()`);
  await key('ArrowLeft', 'ArrowLeft', 37); await key('ArrowLeft', 'ArrowLeft', 37);
  s = await state(); log('ArrowLeft x2', s, { now: 1, prevOff: 'true', nextOff: 'false' });
  await key('ArrowLeft', 'ArrowLeft', 37);
  s = await state(); log('ArrowLeft at the start stays', s, { now: 1 });
  await key('End', 'End', 35);
  s = await state(); log('End', s, { now: 4, nextOff: 'true', current: 4 });
  if (!/Poster 4 of 4/.test(s.status)) failures.push(`carousel ${width}px: live region says "${s.status}"`);
  await key('Home', 'Home', 36);
  s = await state(); log('Home', s, { now: 1, current: 1 });

  const dial = await center('[data-svg]');
  // pixels the dial needs to move for one poster, at this screen width
  const stepPx = await evaluate(`(() => { const s = document.querySelector('[data-svg]'); return Number(s.dataset.r) * 8 * Math.PI / 180 * (s.getBoundingClientRect().width / Number(s.dataset.vbw)); })()`);
  await drag(dial.x + 20, dial.y, dial.x + 20 - Math.round(stepPx * 1.1));   // drag the dial left by 1.1 steps
  s = await state(); log('drag dial left (1.1 steps)', s, { now: 2 });
  await shotViewport(`${tag}_3_after_dial_drag.jpg`);

  const right = await slideCenter(2);                      // poster 3 is the right-hand neighbour
  await click(right.x, right.y);
  s = await state(); log('click right-hand poster', s, { now: 3 });

  const mid = await slideCenter(2);                        // drag the posters themselves
  const unitPx = await evaluate(`document.querySelector('[data-slide]').offsetWidth * 0.62`);   // = SLIDE_SHIFT
  await evaluate(`(() => { window.__ev = []; const t = document.querySelector('[data-track]');
    ['pointerdown', 'pointermove', 'pointerup', 'pointercancel', 'dragstart', 'click'].forEach((n) => t.addEventListener(n, (e) => { if (window.__ev.length < 40) window.__ev.push(n + ':' + e.target.tagName + ':' + Math.round(e.clientX)); }, true)); })()`);
  await drag(mid.x, mid.y, mid.x - Math.round(unitPx * 1.1));   // drag the posters left by 1.1 poster widths
  s = await state(); log('drag posters left (1.1 units)', s, { now: 4 });
  if (s.now !== 4) failures.push(`  events seen by the poster stage: ${(await evaluate('window.__ev.join(" | ")')).slice(0, 700)} (press at ${Math.round(mid.x)},${Math.round(mid.y)}, unit ${Math.round(unitPx)}px)`);
  await shotViewport(`${tag}_4_last.jpg`);

  // a drag that leaves the carousel entirely (into the text column / off the page edge) must still end cleanly
  await evaluate(`document.querySelector('[data-slider]').focus({ preventScroll: true })`);
  await key('Home', 'Home', 36);
  s = await state(); log('Home again (focus on the dial)', s, { now: 1 });
  const dragging = () => evaluate(`document.querySelector('[data-carousel]').classList.contains('is-dragging')`);

  const first = await slideCenter(0);                        // poster 1 is now the one in the middle
  await drag(first.x, first.y, Math.min(width - 2, first.x + Math.round(width * 0.45)));
  s = await state(); log('drag right past the carousel edge (stays on poster 1)', s, { now: 1 });
  if (await dragging()) failures.push(`carousel ${width}px: still dragging after releasing to the right of the carousel`);

  await drag(first.x, first.y, 2);                           // all the way to the left page edge
  const expectNow = Math.min(4, 1 + Math.round((first.x - 2) / unitPx));   // as far as that distance reaches
  s = await state(); log(`drag left to the page edge (expect poster ${expectNow})`, s, { now: expectNow });
  if (await dragging()) failures.push(`carousel ${width}px: still dragging after releasing at the page edge`);

  const tick = await evaluate(`(() => { const b = document.querySelector('[data-svg]').getBoundingClientRect(); return Math.round(b.x + b.width / 2); })()`);
  await click(tick - 40, dial.y);                           // click the dial slightly left of the pointer
  s = await state(); log('click on the dial', s, {});       // just must not throw; value reported
}

// 3. Keyboard: Tab through the homepage at desktop width
await send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
await open('/');
for (let i = 1; i <= 24; i++) {
  await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 });
  await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 });
  await sleep(60);
  const f = await evaluate(`(() => {
    const e = document.activeElement; if (!e || e === document.body) return null;
    const s = getComputedStyle(e); const b = e.getBoundingClientRect();
    return { tag: e.tagName.toLowerCase(), text: (e.innerText || e.getAttribute('alt') || e.querySelector('img')?.alt || '').trim().slice(0, 40),
      outline: s.outlineStyle + ' ' + s.outlineWidth + ' ' + s.outlineColor, visible: s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) >= 2,
      onScreen: b.width > 0 && b.height > 0 };
  })()`);
  report.keyboard.push({ tab: i, ...f });
  if (i === 1) await screenshot('kbd_tab1_skiplink.jpg', 1280);
  if (f && (!f.visible || !f.onScreen)) failures.push(`keyboard tab ${i}: focus on <${f.tag}> "${f.text}" — outline ${f.outline}, onScreen ${f.onScreen}`);
}

writeFileSync(join(OUT, 'report.json'), JSON.stringify(report, null, 1));
ws.close();
proc.kill();

const shots = report.overflow.length + 2;
console.log(`Browser: ${browserPath}`);
console.log(`Overflow: ${report.overflow.length} page×width combinations checked (${WIDTHS.join('/')} px), ${report.overflow.filter((o) => o.overflow).length} with horizontal overflow.`);
console.log(`JS off (Workshops, 375px): ${cards} cards, ${hiddenCards} hidden, filter hidden: ${report.jsOff.filterHidden}.`);
console.log(`Keyboard: ${report.keyboard.filter(Boolean).length} Tab stops; first: ${report.keyboard.slice(0, 4).map((k) => k && `<${k.tag}> "${k.text}"`).join(' → ')}`);
console.log(`${shots} screenshots in .qa/browser/`);
if (failures.length) { console.error(`\n${failures.length} problem(s):\n- ` + failures.join('\n- ')); process.exit(1); }
console.log('Browser QA passed.');
