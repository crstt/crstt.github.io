import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;

/* ------------------------------------------------------------------ */
/* Smooth scroll (Lenis) ↔ GSAP ScrollTrigger sync                     */
/* ------------------------------------------------------------------ */
function initSmoothScroll() {
  if (prefersReduced) return;

  const lenis = new Lenis({
    duration: 1.1,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
  });

  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  // Anchor links → smooth scroll via Lenis
  document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target as HTMLElement, { offset: 0, duration: 1.3 });
    });
  });
}

/* ------------------------------------------------------------------ */
/* Hero entrance                                                       */
/* ------------------------------------------------------------------ */
function initHero() {
  const words = gsap.utils.toArray<HTMLElement>('.hero__word');
  const fades = gsap.utils.toArray<HTMLElement>('[data-hero-fade]');

  if (prefersReduced) {
    gsap.set([...words, ...fades], { y: 0, opacity: 1 });
    return;
  }

  const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
  tl.from(words, { yPercent: 118, duration: 1.2, stagger: 0.1 })
    .from(fades, { y: 24, opacity: 0, duration: 0.9, stagger: 0.12 }, '-=0.6');
}

/* ------------------------------------------------------------------ */
/* Scroll reveals (generic) + intro word-by-word                      */
/* ------------------------------------------------------------------ */
function initReveals() {
  if (prefersReduced) return;

  gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => {
    gsap.from(el, {
      y: 40,
      opacity: 0,
      duration: 1,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%' },
    });
  });

  const words = gsap.utils.toArray<HTMLElement>('[data-word]');
  if (words.length) {
    gsap.from(words, {
      yPercent: 110,
      duration: 0.9,
      ease: 'expo.out',
      stagger: 0.025,
      scrollTrigger: { trigger: words[0].closest('.intro'), start: 'top 70%' },
    });
  }
}

/* ------------------------------------------------------------------ */
/* Animated count-up stats                                             */
/* ------------------------------------------------------------------ */
function initCounters() {
  gsap.utils.toArray<HTMLElement>('[data-count]').forEach((el) => {
    const end = parseFloat(el.dataset.count || '0');
    const suffix = el.dataset.suffix || '';
    const decimals = parseInt(el.dataset.decimals || '0', 10);
    const obj = { v: 0 };

    const render = () => {
      el.textContent = obj.v.toFixed(decimals) + suffix;
    };

    if (prefersReduced) {
      obj.v = end;
      render();
      return;
    }

    gsap.to(obj, {
      v: end,
      duration: 1.8,
      ease: 'power2.out',
      onUpdate: render,
      scrollTrigger: { trigger: el, start: 'top 90%', once: true },
    });
  });
}

/* ------------------------------------------------------------------ */
/* Infinite marquee                                                    */
/* ------------------------------------------------------------------ */
function initMarquee() {
  const track = document.querySelector<HTMLElement>('[data-marquee]');
  if (!track || prefersReduced) return;

  // Track holds the chip list duplicated; scroll one half-width and loop.
  gsap.to(track, {
    xPercent: -50,
    ease: 'none',
    duration: 28,
    repeat: -1,
  });
}

/* ------------------------------------------------------------------ */
/* Nav: hide on scroll-down, show on scroll-up, blur after hero        */
/* ------------------------------------------------------------------ */
function initNav() {
  const nav = document.querySelector<HTMLElement>('[data-nav]');
  if (!nav) return;
  let last = window.scrollY;

  const onScroll = () => {
    const y = window.scrollY;
    nav.classList.toggle('is-scrolled', y > 40);
    if (y > last && y > 400) nav.classList.add('is-hidden');
    else nav.classList.remove('is-hidden');
    last = y;
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ------------------------------------------------------------------ */
/* Card sheen (mouse-follow) + subtle tilt                             */
/* ------------------------------------------------------------------ */
function initCards() {
  if (isTouch) return;
  document.querySelectorAll<HTMLElement>('[data-tilt]').forEach((card) => {
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      const mx = ((e.clientX - r.left) / r.width) * 100;
      const my = ((e.clientY - r.top) / r.height) * 100;
      card.style.setProperty('--mx', `${mx}%`);
      card.style.setProperty('--my', `${my}%`);
    });
  });
}

/* ------------------------------------------------------------------ */
/* Custom cursor                                                       */
/* ------------------------------------------------------------------ */
function initCursor() {
  if (isTouch || prefersReduced) return;
  const cursor = document.querySelector<HTMLElement>('[data-cursor]');
  if (!cursor) return;
  const dot = cursor.querySelector<HTMLElement>('.cursor__dot')!;
  const ring = cursor.querySelector<HTMLElement>('.cursor__ring')!;

  const dx = gsap.quickTo(dot, 'x', { duration: 0.15, ease: 'power3' });
  const dy = gsap.quickTo(dot, 'y', { duration: 0.15, ease: 'power3' });
  const rx = gsap.quickTo(ring, 'x', { duration: 0.45, ease: 'power3' });
  const ry = gsap.quickTo(ring, 'y', { duration: 0.45, ease: 'power3' });

  window.addEventListener('pointermove', (e) => {
    cursor.classList.add('is-active');
    dx(e.clientX); dy(e.clientY);
    rx(e.clientX); ry(e.clientY);
  });
  window.addEventListener('pointerleave', () => cursor.classList.remove('is-active'));

  document.querySelectorAll('a, button, [data-tilt]').forEach((el) => {
    el.addEventListener('pointerenter', () => cursor.classList.add('is-hover'));
    el.addEventListener('pointerleave', () => cursor.classList.remove('is-hover'));
  });
}

/* ------------------------------------------------------------------ */
/* Hero ember particle field (canvas)                                  */
/* ------------------------------------------------------------------ */
function initEmbers() {
  const canvas = document.querySelector<HTMLCanvasElement>('[data-embers]');
  if (!canvas || prefersReduced) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let w = 0, h = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
  let raf = 0;
  const COUNT = isTouch ? 36 : 80;

  interface Ember { x: number; y: number; vy: number; vx: number; r: number; a: number; hue: number; }
  let embers: Ember[] = [];

  // Orange band normally; green phosphor band in SCADA mode.
  const hueBase = () =>
    document.documentElement.classList.contains('scada') ? 125 : 14;

  const reset = (e: Ember, seed = false) => {
    e.x = Math.random() * w;
    e.y = seed ? Math.random() * h : h + 20;
    e.vy = -(0.2 + Math.random() * 0.7);
    e.vx = (Math.random() - 0.5) * 0.3;
    e.r = 0.6 + Math.random() * 2.2;
    e.a = 0.1 + Math.random() * 0.6;
    e.hue = hueBase() + Math.random() * 20;
    return e;
  };

  // Re-tint live embers immediately when SCADA mode toggles.
  document.addEventListener('forge:scada', () => {
    for (const e of embers) e.hue = hueBase() + Math.random() * 20;
  });

  const resize = () => {
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const build = () => {
    embers = Array.from({ length: COUNT }, () => reset({} as Ember, true));
  };

  const tick = () => {
    ctx.clearRect(0, 0, w, h);
    for (const e of embers) {
      e.y += e.vy;
      e.x += e.vx;
      e.vx += (Math.random() - 0.5) * 0.02;
      if (e.y < -20) reset(e);
      const flick = e.a * (0.6 + Math.random() * 0.4);
      ctx.beginPath();
      ctx.fillStyle = `hsla(${e.hue}, 100%, 55%, ${flick})`;
      ctx.shadowBlur = 8;
      ctx.shadowColor = `hsla(${e.hue}, 100%, 50%, ${flick})`;
      ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
      ctx.fill();
    }
    raf = requestAnimationFrame(tick);
  };

  resize();
  build();
  tick();
  window.addEventListener('resize', () => { resize(); });

  // Pause when hero scrolls out of view
  const hero = canvas.closest('section');
  if (hero && 'IntersectionObserver' in window) {
    new IntersectionObserver((entries) => {
      for (const ent of entries) {
        if (ent.isIntersecting && !raf) tick();
        else if (!ent.isIntersecting) { cancelAnimationFrame(raf); raf = 0; }
      }
    }, { threshold: 0 }).observe(hero);
  }
}

/* ------------------------------------------------------------------ */
/* Per-job theme shift: re-tint the page to each industry on scroll    */
/* ------------------------------------------------------------------ */
interface JobThemeVars {
  ember: string;
  emberHot: string;
  emberDeep: string;
  ink: string;
  inkSoft: string;
  inkCard: string;
  steel: string;
}

// Mirrors :root in global.css — the page reverts to this above/below the list.
const DEFAULT_THEME: JobThemeVars = {
  ember: '#ff4d00',
  emberHot: '#ff7a1a',
  emberDeep: '#c81e00',
  ink: '#0a0a0b',
  inkSoft: '#131316',
  inkCard: '#161618',
  steel: '#8a98a8',
};

function applyTheme(t: JobThemeVars) {
  const root = document.documentElement.style;
  root.setProperty('--ember', t.ember);
  root.setProperty('--ember-hot', t.emberHot);
  root.setProperty('--ember-deep', t.emberDeep);
  root.setProperty('--ink', t.ink);
  root.setProperty('--ink-soft', t.inkSoft);
  root.setProperty('--ink-card', t.inkCard);
  root.setProperty('--steel', t.steel);
  // Anything color-reactive (the morph cloud) listens for this.
  document.dispatchEvent(new CustomEvent('forge:theme', { detail: t }));
}

/** Set by initScada — while HMI mode is on, the scroll theming yields. */
let scadaOn = false;
/** Re-applies the scroll-picked theme; assigned inside initThemeShift. */
let repickTheme: () => void = () => applyTheme(DEFAULT_THEME);

function initThemeShift() {
  const jobs = gsap.utils
    .toArray<HTMLElement>('.exp__job[data-theme]')
    .map((el) => {
      try {
        return { el, theme: JSON.parse(el.dataset.theme || '') as JobThemeVars };
      } catch {
        return null;
      }
    })
    .filter((j): j is { el: HTMLElement; theme: JobThemeVars } => j !== null);

  if (!jobs.length) return;

  // Apply whichever job is closest to the vertical center of the viewport.
  // Above the first / below the last job (none in view) we fall back to the
  // steel-forge default, so the rest of the page keeps the brand color.
  let active: JobThemeVars | null = null;
  let activeIndex: number | null = null;
  const pick = () => {
    if (scadaOn) return;
    const vh = window.innerHeight;
    const mid = vh / 2;
    let best: JobThemeVars | null = null;
    let bestIndex: number | null = null;
    let bestDist = Infinity;

    for (let i = 0; i < jobs.length; i++) {
      const { el, theme } = jobs[i];
      const r = el.getBoundingClientRect();
      if (r.bottom <= 0 || r.top >= vh) continue; // not in view
      const dist = Math.abs(r.top + r.height / 2 - mid);
      if (dist < bestDist) {
        bestDist = dist;
        best = theme;
        bestIndex = i;
      }
    }

    const next = best ?? DEFAULT_THEME;
    if (next !== active) {
      active = next;
      applyTheme(next);
    }
    if (bestIndex !== activeIndex) {
      activeIndex = bestIndex;
      // The morph cloud reads this on lazy-init and listens for changes.
      document.documentElement.dataset.forgeJob = bestIndex === null ? '' : String(bestIndex);
      document.dispatchEvent(new CustomEvent('forge:job', { detail: { index: bestIndex } }));
    }
  };
  repickTheme = () => {
    active = null; // force re-apply even if the picked theme didn't change
    pick();
  };

  // A trigger-less ScrollTrigger gives us a throttled scroll/resize callback
  // already synced with Lenis via ScrollTrigger.update.
  ScrollTrigger.create({ onUpdate: pick, onRefresh: pick });
  pick();
}

/* ------------------------------------------------------------------ */
/* Morphing job point-cloud (three.js) — lazy-loaded near the section  */
/* ------------------------------------------------------------------ */
function initMorphCloudLazy() {
  const host = document.querySelector<HTMLElement>('[data-cloud]');
  if (!host || prefersReduced) return;
  if (!window.matchMedia('(min-width: 1100px)').matches) return;

  const io = new IntersectionObserver(
    (entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        io.disconnect();
        import('./morph-cloud').then((m) => m.initMorphCloud(host));
      }
    },
    { rootMargin: '900px 0px' },
  );
  io.observe(host);
}

/* ------------------------------------------------------------------ */
/* SCADA easter egg — CRT click flips the whole page into HMI mode     */
/* ------------------------------------------------------------------ */
const SCADA_THEME: JobThemeVars = {
  ember: '#36ff6e',
  emberHot: '#8cffae',
  emberDeep: '#0fa84a',
  ink: '#020805',
  inkSoft: '#06140c',
  inkCard: '#08170e',
  steel: '#69a583',
};

function initScada() {
  const toggles = document.querySelectorAll<HTMLElement>('[data-scada-toggle]');
  if (!toggles.length) return;

  const crtText = document.querySelector<HTMLElement>('[data-crt-text]');
  const clock = document.querySelector<HTMLElement>('[data-scada-clock]');
  const baseTitle = document.title;
  let clockTimer = 0;

  const IDLE_TEXT = [
    '> SCADA-9000 SELF-TEST .... OK',
    '> LINK: PLANT BUS ......... UP',
    '> TAGS: 4096 GOOD / 0 BAD',
    '> ALARMS: 0 ACTIVE',
    '',
    '> AWAITING OPERATOR_',
  ].join('\n');
  const ACTIVE_TEXT = [
    '> OPERATOR: M.CATALANO',
    '> HMI MODE ........... ENGAGED',
    '> PALETTE: PHOSPHOR P1 GREEN',
    '> ALL SYSTEMS NOMINAL',
    '',
    '> CLICK TO DISENGAGE_',
  ].join('\n');
  if (crtText) crtText.textContent = IDLE_TEXT;

  const tickClock = () => {
    if (clock) clock.textContent = new Date().toLocaleTimeString('en-US', { hour12: false });
  };

  const setMode = (on: boolean) => {
    scadaOn = on;
    document.documentElement.classList.toggle('scada', on);
    toggles.forEach((t) => t.setAttribute('aria-pressed', String(on)));
    if (crtText) crtText.textContent = on ? ACTIVE_TEXT : IDLE_TEXT;
    document.dispatchEvent(new CustomEvent('forge:scada', { detail: { on } }));

    if (on) {
      applyTheme(SCADA_THEME);
      document.title = 'SCADA-9000 :: CATALANO CONTROL';
      tickClock();
      clockTimer = window.setInterval(tickClock, 1000);
    } else {
      document.title = baseTitle;
      window.clearInterval(clockTimer);
      repickTheme();
    }
  };

  toggles.forEach((el) => {
    el.addEventListener('click', () => setMode(!scadaOn));
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setMode(!scadaOn);
      }
    });
  });
}

/* ------------------------------------------------------------------ */
function boot() {
  initSmoothScroll();
  initHero();
  initReveals();
  initCounters();
  initMarquee();
  initNav();
  initCards();
  initCursor();
  initEmbers();
  initThemeShift();
  initMorphCloudLazy();
  initScada();
  ScrollTrigger.refresh();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
