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
