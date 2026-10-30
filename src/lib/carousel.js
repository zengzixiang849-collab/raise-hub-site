// Poster carousel controller — progressive enhancement.
// Without this script the posters are a horizontally scrollable list (see
// PosterCarousel.astro). With it: stacked posters, a compass-style tick dial,
// prev/next buttons, keyboard, drag and click. No autoplay.
import {
  STEP_DEG,
  SLIDE_SHIFT,
  clamp,
  nearestIndex,
  dialRotation,
  indexFromScreenAngle,
  dragToPos,
  keyToIndex,
  slideLayout,
} from './carousel-math.js';

const DRAG_THRESHOLD = 5; // px before a press becomes a drag

export function initCarousel(root) {
  const slides = [...root.querySelectorAll('[data-slide]')];
  const n = slides.length;
  const controls = root.querySelector('[data-controls]');
  const slider = root.querySelector('[data-slider]');
  const svg = root.querySelector('[data-svg]');
  const dial = root.querySelector('[data-dial]');
  const stage = root.querySelector('[data-track]');
  const prev = root.querySelector('[data-prev]');
  const next = root.querySelector('[data-next]');
  const status = root.querySelector('[data-status]');
  if (n < 2 || !controls || !slider || !svg || !dial || !stage || !prev || !next) return null;

  const cx = Number(svg.dataset.cx);
  const cy = Number(svg.dataset.cy);
  const radius = Number(svg.dataset.r);
  const vbWidth = Number(svg.dataset.vbw);
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  let index = clamp(Number(root.dataset.start ?? 0), 0, n - 1);
  let pos = index;
  let raf = 0;
  let suppressClick = false;

  const titleOf = (i) => slides[i].dataset.title ?? '';

  function render() {
    slides.forEach((slide, i) => {
      const L = slideLayout(i - pos);
      slide.style.transform = `translateX(${L.x}%) rotateY(${L.rotateY}deg) scale(${L.scale})`;
      slide.style.opacity = String(L.opacity);
      slide.style.zIndex = String(L.z);
      slide.style.visibility = L.opacity === 0 ? 'hidden' : 'visible';
    });
    dial.setAttribute('transform', `rotate(${dialRotation(pos, STEP_DEG)} ${cx} ${cy})`);
  }

  function commit() {
    slides.forEach((slide, i) => {
      const current = i === index;
      slide.classList.toggle('is-current', current);
      slide.setAttribute('aria-hidden', current ? 'false' : 'true');
      slide.querySelectorAll('a').forEach((a) => {
        a.tabIndex = current ? 0 : -1;
      });
    });
    slider.setAttribute('aria-valuenow', String(index + 1));
    slider.setAttribute('aria-valuetext', `Poster ${index + 1} of ${n}: ${titleOf(index)}`);
    prev.setAttribute('aria-disabled', String(index === 0));
    next.setAttribute('aria-disabled', String(index === n - 1));
  }

  function animateTo(target) {
    cancelAnimationFrame(raf);
    if (reduce.matches || Math.abs(target - pos) < 0.001) {
      pos = target;
      render();
      return;
    }
    const from = pos;
    const start = performance.now();
    const tick = (now) => {
      const k = Math.min(1, (now - start) / 260);
      pos = from + (target - from) * (1 - Math.pow(1 - k, 3));
      render();
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
  }

  function goTo(i, announce = true) {
    const target = clamp(i, 0, n - 1);
    const changed = target !== index;
    index = target;
    commit();
    animateTo(index);
    if (announce && changed && status) status.textContent = `Poster ${index + 1} of ${n}: ${titleOf(index)}`;
  }

  // --- buttons and keyboard ---
  prev.addEventListener('click', () => goTo(index - 1));
  next.addEventListener('click', () => goTo(index + 1));
  slider.addEventListener('keydown', (e) => {
    const target = keyToIndex(e.key, index, n);
    if (target === null) return;
    e.preventDefault();
    goTo(target);
  });

  // --- drag (dial and posters) ---
  function bindDrag(el, pxPerUnit, onTap) {
    let press = null;
    // Move/up/cancel are listened for on the window while a press is active, so a drag
    // that leaves the carousel (or the browser window) still ends cleanly.
    const onMove = (e) => {
      if (!press || e.pointerId !== press.id) return;
      const dx = e.clientX - press.x;
      if (!press.dragging) {
        if (Math.abs(dx) < DRAG_THRESHOLD) return;
        press.dragging = true;
        cancelAnimationFrame(raf);
        root.classList.add('is-dragging');
      }
      pos = dragToPos(press.pos, dx, pxPerUnit(), n);
      render();
    };
    const end = (e) => {
      if (!press || e.pointerId !== press.id) return;
      const p = press;
      press = null;
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', end);
      window.removeEventListener('pointercancel', end);
      root.classList.remove('is-dragging');
      if (p.dragging) {
        suppressClick = true;
        setTimeout(() => {
          suppressClick = false;
        }, 0);
        goTo(nearestIndex(pos, n));
      } else if (e.type === 'pointerup' && onTap) {
        onTap(e);
      }
    };
    el.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      press = { x: e.clientX, pos, id: e.pointerId, dragging: false };
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', end);
      window.addEventListener('pointercancel', end);
    });
  }

  bindDrag(
    slider,
    () => ((radius * STEP_DEG * Math.PI) / 180) * (svg.getBoundingClientRect().width / vbWidth),
    (e) => {
      const rect = svg.getBoundingClientRect();
      const k = vbWidth / rect.width;
      const x = (e.clientX - rect.left) * k - cx;
      const y = cy - (e.clientY - rect.top) * k;
      goTo(indexFromScreenAngle((Math.atan2(x, y) * 180) / Math.PI, pos, n, STEP_DEG));
    },
  );
  bindDrag(stage, () => (slides[0].offsetWidth * SLIDE_SHIFT) / 100);

  // A tap on a side poster brings it to the centre; a drag never follows a link.
  stage.addEventListener(
    'click',
    (e) => {
      if (suppressClick) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      const slide = e.target.closest('[data-slide]');
      const i = slide ? slides.indexOf(slide) : -1;
      if (i >= 0 && i !== index) {
        e.preventDefault();
        goTo(i);
      }
    },
    true,
  );

  root.classList.add('is-enhanced');
  controls.hidden = false;
  commit();
  render();
  return { goTo, get index() { return index; } };
}
