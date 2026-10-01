// All motion lives here. If GSAP is unavailable the page simply stays static and fully visible.

const root = document.documentElement;
// Respect the OS "reduce motion" setting. Adding ?motion=on to the URL previews the full animation anyway.
const forceMotion = new URLSearchParams(window.location.search).get('motion') === 'on';
if (forceMotion) root.classList.add('force-motion');
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches && !forceMotion;

const hasGsap = () => typeof window.gsap !== 'undefined';
const hasScrollTrigger = () => hasGsap() && typeof window.ScrollTrigger !== 'undefined';

function finishLoader() {
  root.classList.add('loaded');
}

/* ---------- Intro: counter 0 -> 100, then the loader slides away ---------- */
function runIntro(onReveal) {
  const countEl = document.getElementById('loader-count');
  const loader = document.getElementById('loader');
  const counter = { v: 0 };
  gsap.to(counter, {
    v: 100,
    duration: 1.5,
    ease: 'power2.inOut',
    onUpdate: () => { countEl.textContent = Math.round(counter.v); },
    onComplete: () => {
      onReveal();
      gsap.to(loader, { yPercent: -100, duration: 0.9, ease: 'power4.inOut', onComplete: finishLoader });
    },
  });
}

function heroIn() {
  gsap.from('.hero .marquee', { yPercent: 70, opacity: 0, duration: 1.1, ease: 'power4.out', stagger: 0.12 });
  gsap.from('.hero-foot', { opacity: 0, y: 20, duration: 0.8, delay: 0.5, ease: 'power2.out', clearProps: 'transform,opacity' });
  // clearProps matters here: a leftover transform on .nav would trap its fixed-position mobile menu.
  gsap.from('.nav', { opacity: 0, y: -20, duration: 0.8, delay: 0.4, ease: 'power2.out', clearProps: 'transform,opacity' });
}

/* ---------- Marquees: constant drift, boosted by scroll speed ---------- */
function initMarquees() {
  const tweens = [];
  document.querySelectorAll('.marquee').forEach((el) => {
    const track = el.querySelector('.marquee-track');
    if (!track) return;
    const rev = el.classList.contains('rev');
    const duration = parseFloat(el.dataset.speed) || 28;
    tweens.push(gsap.fromTo(track,
      { xPercent: rev ? -50 : 0 },
      { xPercent: rev ? 0 : -50, duration, ease: 'none', repeat: -1 }));
  });

  if (!hasScrollTrigger()) return;
  let boost = 1;
  ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate: (self) => {
      const v = Math.abs(gsap.utils.clamp(-3000, 3000, self.getVelocity()));
      boost = Math.max(boost, 1 + v / 350);
    },
  });
  gsap.ticker.add(() => {
    boost += (1 - boost) * 0.06; // ease back to normal speed
    for (const t of tweens) t.timeScale(boost);
  });
}

/* ---------- Scroll reveals ---------- */
function initReveals() {
  if (!hasScrollTrigger()) return;
  const items = gsap.utils.toArray('.reveal');
  gsap.set(items, reduced ? { opacity: 0 } : { opacity: 0, y: 50 });
  ScrollTrigger.batch(items, {
    start: 'top 90%',
    once: true,
    onEnter: (batch) => gsap.to(batch, {
      opacity: 1,
      y: 0,
      duration: reduced ? 0.4 : 0.9,
      stagger: reduced ? 0 : 0.08,
      ease: 'power3.out',
      overwrite: true,
      clearProps: 'transform,opacity', // hand control back to the CSS hover transforms
    }),
  });
}

function initCountUp() {
  if (!hasScrollTrigger() || reduced) return;
  document.querySelectorAll('[data-count]').forEach((el) => {
    const target = Number(el.dataset.count) || 0;
    const state = { v: 0 };
    el.textContent = '0';
    ScrollTrigger.create({
      trigger: el,
      start: 'top 92%',
      once: true,
      onEnter: () => gsap.to(state, {
        v: target, duration: 1.4, ease: 'power2.out',
        onUpdate: () => { el.textContent = Math.round(state.v); },
      }),
    });
  });
}

/* ---------- Custom cursor (mouse only) ---------- */
function initCursor() {
  if (!window.matchMedia('(pointer: fine)').matches) return;
  const ring = document.querySelector('.cursor');
  if (!ring) return;
  const xTo = gsap.quickTo(ring, 'x', { duration: 0.35, ease: 'power3' });
  const yTo = gsap.quickTo(ring, 'y', { duration: 0.35, ease: 'power3' });
  window.addEventListener('pointermove', (e) => {
    ring.classList.add('on');
    xTo(e.clientX);
    yTo(e.clientY);
  });
  document.addEventListener('pointerover', (e) => {
    ring.classList.toggle('big', Boolean(e.target.closest('a, button')));
  });
  root.addEventListener('mouseleave', () => ring.classList.remove('on'));
}

/* ---------- Filter: fade out, swap, fade in (one timeline, nothing created in callbacks) ---------- */
let filterTl = null;

export function filterTiles(container, shouldShow) {
  const tiles = [...container.querySelectorAll('.project')];
  const apply = () => tiles.forEach((t) => { t.hidden = !shouldShow(t); });
  if (!hasGsap() || reduced) { apply(); return; }

  // A click during an earlier filter must not drop its work: play that timeline to its end
  // (its swap step runs), then start again from a clean state.
  if (filterTl) {
    filterTl.progress(1, false).kill();
    filterTl = null;
  }
  gsap.set(tiles, { clearProps: 'opacity,transform' });

  const out = tiles.filter((t) => !t.hidden);
  const next = tiles.filter(shouldShow);

  const tl = gsap.timeline({ onComplete: () => { if (filterTl === tl) filterTl = null; } });
  filterTl = tl;
  if (out.length) tl.to(out, { opacity: 0, scale: 0.92, duration: 0.28, stagger: 0.03, ease: 'power2.in' });
  tl.add(apply);
  tl.set(next, { opacity: 0, y: 36, scale: 0.94 });
  tl.to(next, { opacity: 1, y: 0, scale: 1, duration: 0.55, stagger: 0.07, ease: 'power3.out' });
  tl.set(tiles, { clearProps: 'opacity,transform' }); // hand hover transforms back to CSS
}

/* ---------- Entry point ---------- */
export function start() {
  if (!hasGsap()) {
    finishLoader();
    return;
  }
  gsap.registerPlugin(...[window.ScrollTrigger].filter(Boolean));

  if (!reduced) {
    root.classList.add('gsap-on'); // switches the CSS marquee fallback off
    initMarquees();
  }
  initCursor();

  const reveal = () => {
    initReveals();
    initCountUp();
    if (!reduced) heroIn();
  };

  if (reduced) {
    finishLoader();
    reveal();
  } else {
    runIntro(reveal);
  }

  if (document.fonts && hasScrollTrigger()) {
    document.fonts.ready.then(() => ScrollTrigger.refresh());
  }
}
