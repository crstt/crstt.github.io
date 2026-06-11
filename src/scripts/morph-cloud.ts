/**
 * Morphing ember point-cloud for the experience section.
 *
 * One glowing point sculpture per job — gantry crane, I-beam, mortarboard,
 * wind turbine, cargo bike — procedurally sampled (no model assets). The
 * cloud morphs between shapes as jobs cross the viewport center (driven by
 * the same picker as the theme shift, via the `forge:job` event) and its
 * color follows the live `--ember` token (via `forge:theme`).
 *
 * Loaded lazily from main.ts only on wide, motion-friendly viewports.
 */

import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Color,
  PerspectiveCamera,
  Points,
  PointsMaterial,
  Scene,
  WebGLRenderer,
} from 'three';
import { gsap } from 'gsap';

const COUNT = 3200;

/* ------------------------------------------------------------------ */
/* Point samplers — all emit flat [x,y,z, x,y,z, …] triplets           */
/* ------------------------------------------------------------------ */
const rnd = (a: number, b: number) => a + Math.random() * (b - a);

/** Points on the surface of an axis-aligned box, faces weighted by area. */
function box(out: number[], n: number, cx: number, cy: number, cz: number, w: number, h: number, d: number) {
  const ax = h * d, ay = w * d, az = w * h;
  const total = 2 * (ax + ay + az);
  for (let i = 0; i < n; i++) {
    const r = Math.random() * total;
    let x: number, y: number, z: number;
    if (r < 2 * ax) {
      x = (r < ax ? -0.5 : 0.5) * w; y = rnd(-0.5, 0.5) * h; z = rnd(-0.5, 0.5) * d;
    } else if (r < 2 * (ax + ay)) {
      y = (r < 2 * ax + ay ? -0.5 : 0.5) * h; x = rnd(-0.5, 0.5) * w; z = rnd(-0.5, 0.5) * d;
    } else {
      z = (r < 2 * (ax + ay) + az ? -0.5 : 0.5) * d; x = rnd(-0.5, 0.5) * w; y = rnd(-0.5, 0.5) * h;
    }
    out.push(cx + x, cy + y, cz + z);
  }
}

/** Lateral surface of a (possibly tapered) cylinder along an axis. */
function cyl(
  out: number[], n: number, cx: number, cy: number, cz: number,
  r0: number, r1: number, h: number, axis: 'x' | 'y' | 'z' = 'y',
) {
  for (let i = 0; i < n; i++) {
    const t = Math.random();
    const a = Math.random() * Math.PI * 2;
    const r = r0 + (r1 - r0) * t;
    const u = Math.cos(a) * r, v = Math.sin(a) * r, w = (t - 0.5) * h;
    if (axis === 'y') out.push(cx + u, cy + w, cz + v);
    else if (axis === 'x') out.push(cx + w, cy + u, cz + v);
    else out.push(cx + u, cy + v, cz + w);
  }
}

/** Torus in a plane (xy = wheel facing the viewer). */
function torus(out: number[], n: number, cx: number, cy: number, cz: number, R: number, r: number) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2;
    const b = Math.random() * Math.PI * 2;
    out.push(
      cx + (R + r * Math.cos(b)) * Math.cos(a),
      cy + (R + r * Math.cos(b)) * Math.sin(a),
      cz + r * Math.sin(b),
    );
  }
}

/** Jittered line segment. */
function seg(
  out: number[], n: number,
  x1: number, y1: number, z1: number, x2: number, y2: number, z2: number,
  jit = 0.014,
) {
  for (let i = 0; i < n; i++) {
    const t = Math.random();
    out.push(
      x1 + (x2 - x1) * t + rnd(-jit, jit),
      y1 + (y2 - y1) * t + rnd(-jit, jit),
      z1 + (z2 - z1) * t + rnd(-jit, jit),
    );
  }
}

/** Small spherical blob. */
function blob(out: number[], n: number, cx: number, cy: number, cz: number, r: number) {
  for (let i = 0; i < n; i++) {
    const u = Math.random(), v = Math.random();
    const th = 2 * Math.PI * u, ph = Math.acos(2 * v - 1);
    const rr = r * Math.cbrt(Math.random());
    out.push(
      cx + rr * Math.sin(ph) * Math.cos(th),
      cy + rr * Math.sin(ph) * Math.sin(th),
      cz + rr * Math.cos(ph),
    );
  }
}

/** Flat horizontal disk. */
function disk(out: number[], n: number, cx: number, cy: number, cz: number, r: number) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2;
    const rr = r * Math.sqrt(Math.random());
    out.push(cx + Math.cos(a) * rr, cy + rnd(-0.01, 0.01), cz + Math.sin(a) * rr);
  }
}

/** Resample to exactly COUNT triplets and shuffle so morphs swarm organically. */
function normalize(src: number[]): Float32Array {
  const triplets = src.length / 3;
  const out = new Float32Array(COUNT * 3);
  for (let i = 0; i < COUNT; i++) {
    const j = (i < triplets ? i : Math.floor(Math.random() * triplets)) * 3;
    out[i * 3] = src[j] + (i < triplets ? 0 : rnd(-0.01, 0.01));
    out[i * 3 + 1] = src[j + 1] + (i < triplets ? 0 : rnd(-0.01, 0.01));
    out[i * 3 + 2] = src[j + 2] + (i < triplets ? 0 : rnd(-0.01, 0.01));
  }
  // Fisher–Yates on triplets
  for (let i = COUNT - 1; i > 0; i--) {
    const k = Math.floor(Math.random() * (i + 1));
    for (let c = 0; c < 3; c++) {
      const tmp = out[i * 3 + c];
      out[i * 3 + c] = out[k * 3 + c];
      out[k * 3 + c] = tmp;
    }
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* Shapes — one per job, in experience order                           */
/* ------------------------------------------------------------------ */

function shapeScatter(): Float32Array {
  const p: number[] = [];
  blob(p, COUNT, 0, 0, 0, 1.15);
  return normalize(p);
}

/** 01 — Gantry crane lifting a container (shipping operations). */
function shapeCrane(): Float32Array {
  const p: number[] = [];
  box(p, 280, -0.5, -0.92, 0, 0.95, 0.07, 0.2);          // base / rail bogie
  box(p, 600, -0.5, -0.08, 0, 0.17, 1.65, 0.17);         // mast
  box(p, 620, 0.05, 0.78, 0, 1.9, 0.1, 0.13);            // jib
  cyl(p, 130, -0.5, 1.0, 0, 0.1, 0.012, 0.38);           // apex pylon
  seg(p, 130, -0.5, 1.19, 0, 0.95, 0.83, 0);             // forward tie
  seg(p, 90, -0.5, 1.19, 0, -0.86, 0.83, 0);             // rear tie
  box(p, 190, -0.86, 0.6, 0, 0.24, 0.22, 0.2);           // counterweight
  box(p, 140, 0.7, 0.71, 0, 0.16, 0.07, 0.13);           // trolley
  seg(p, 120, 0.7, 0.68, 0, 0.7, 0.04, 0, 0.008);        // hoist cable
  box(p, 900, 0.7, -0.13, 0, 0.58, 0.3, 0.28);           // container
  return normalize(p);
}

/** 02 — Structural steel I-beam. */
function shapeBeam(): Float32Array {
  const p: number[] = [];
  box(p, 1150, 0, 0.45, 0, 1.75, 0.11, 0.52);            // top flange
  box(p, 1150, 0, -0.45, 0, 1.75, 0.11, 0.52);           // bottom flange
  box(p, 900, 0, 0, 0, 1.75, 0.79, 0.09);                // web
  return normalize(p);
}

/** 03 — Mortarboard with tassel (teaching & tutoring). */
function shapeCap(): Float32Array {
  const p: number[] = [];
  box(p, 1450, 0, 0.34, 0, 1.5, 0.05, 1.5);              // mortarboard
  cyl(p, 850, 0, 0.06, 0, 0.45, 0.5, 0.5);               // skull cap
  disk(p, 70, 0, 0.38, 0, 0.07);                          // button
  seg(p, 90, 0, 0.37, 0, 0.72, 0.35, 0.72, 0.008);       // tassel cord (across board)
  seg(p, 120, 0.72, 0.35, 0.72, 0.76, -0.18, 0.76, 0.01); // tassel drop
  blob(p, 120, 0.76, -0.26, 0.76, 0.07);                  // tassel tuft
  return normalize(p);
}

/** 04 — Wind turbine (renewables / SCADA). */
function shapeTurbine(): Float32Array {
  const p: number[] = [];
  cyl(p, 680, 0, -0.25, 0, 0.105, 0.05, 1.5);            // tapered tower
  box(p, 160, 0.04, 0.55, 0, 0.3, 0.15, 0.15);           // nacelle
  blob(p, 90, 0, 0.55, 0.11, 0.06);                       // hub
  disk(p, 240, 0, -1.0, 0, 0.5);                          // ground pad
  // three blades in the rotor plane, 120° apart
  const bladeN = 640;
  for (let k = 0; k < 3; k++) {
    const th = Math.PI / 2 + (k * 2 * Math.PI) / 3;
    for (let i = 0; i < bladeN; i++) {
      const t = Math.random();
      const len = 0.14 + 0.78 * t;
      const wd = 0.055 * (1 - t * 0.8);
      const off = rnd(-wd, wd);
      p.push(
        len * Math.cos(th) - off * Math.sin(th),
        0.55 + len * Math.sin(th) + off * Math.cos(th),
        0.11 + rnd(-0.012, 0.012),
      );
    }
  }
  return normalize(p);
}

/** 05 — Cargo delivery bike (last-mile logistics). */
function shapeBike(): Float32Array {
  const p: number[] = [];
  torus(p, 430, -0.62, -0.42, 0, 0.3, 0.03);             // rear wheel
  torus(p, 430, 0.62, -0.42, 0, 0.3, 0.03);              // front wheel
  blob(p, 50, -0.62, -0.42, 0, 0.04);                     // rear hub
  blob(p, 50, 0.62, -0.42, 0, 0.04);                      // front hub
  box(p, 850, 0.28, 0.02, 0, 0.56, 0.42, 0.32);          // cargo box
  seg(p, 130, -0.62, -0.42, 0, -0.42, 0.08, 0);          // seat stay
  seg(p, 130, -0.42, 0.08, 0, -0.28, -0.4, 0);           // seat tube
  seg(p, 130, -0.28, -0.4, 0, -0.62, -0.42, 0);          // chain stay
  seg(p, 120, -0.28, -0.4, 0, -0.02, 0.1, 0);            // down tube
  seg(p, 90, -0.02, 0.1, 0, -0.02, 0.32, 0);             // steer post
  seg(p, 90, -0.14, 0.32, 0, 0.1, 0.32, 0);              // handlebar
  box(p, 110, -0.44, 0.13, 0, 0.18, 0.05, 0.09);         // saddle
  blob(p, 60, -0.28, -0.4, 0, 0.05);                      // crank
  return normalize(p);
}

const SHAPES: { pts: Float32Array; label: string }[] = [
  { pts: shapeCrane(), label: 'Gantry crane — shipping ops' },
  { pts: shapeBeam(), label: 'Structural steel — reporting platform' },
  { pts: shapeCap(), label: 'Mortarboard — teaching & tutoring' },
  { pts: shapeTurbine(), label: 'Wind turbine — renewables SCADA' },
  { pts: shapeBike(), label: 'Cargo bike — last-mile delivery' },
];
const SCATTER = { pts: shapeScatter(), label: 'Ember field' };

/* ------------------------------------------------------------------ */
/* Renderer                                                            */
/* ------------------------------------------------------------------ */

function makeSprite(): CanvasTexture {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const ctx = c.getContext('2d')!;
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.35, 'rgba(255,255,255,0.55)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  return new CanvasTexture(c);
}

function currentEmber(): string {
  return (
    document.documentElement.style.getPropertyValue('--ember').trim() ||
    getComputedStyle(document.documentElement).getPropertyValue('--ember').trim() ||
    '#ff4d00'
  );
}

export function initMorphCloud(host: HTMLElement) {
  const canvas = host.querySelector<HTMLCanvasElement>('[data-cloud-canvas]');
  const label = host.querySelector<HTMLElement>('[data-cloud-label]');
  if (!canvas) return;

  const renderer = new WebGLRenderer({ canvas, alpha: true, antialias: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  const scene = new Scene();
  const camera = new PerspectiveCamera(38, 1, 0.1, 20);
  camera.position.set(0, 0.05, 3.4);

  const geometry = new BufferGeometry();
  const positions = new Float32Array(SCATTER.pts);
  geometry.setAttribute('position', new BufferAttribute(positions, 3));

  const material = new PointsMaterial({
    size: 0.042,
    map: makeSprite(),
    color: new Color(currentEmber()),
    transparent: true,
    opacity: 0.85,
    depthWrite: false,
    blending: AdditiveBlending,
    sizeAttenuation: true,
  });

  const points = new Points(geometry, material);
  scene.add(points);

  // Per-point morph delays → swarm-like transitions.
  const delays = new Float32Array(COUNT);
  for (let i = 0; i < COUNT; i++) delays[i] = Math.random();

  let from = new Float32Array(positions);
  let target = SCATTER.pts;
  const tween = { t: 1 };
  let activeTween: gsap.core.Tween | null = null;

  const applyMorph = () => {
    const spread = 0.45;
    for (let i = 0; i < COUNT; i++) {
      const k = Math.min(1, Math.max(0, tween.t * (1 + spread) - delays[i] * spread));
      const e = k * k * (3 - 2 * k);
      const j = i * 3;
      positions[j] = from[j] + (target[j] - from[j]) * e;
      positions[j + 1] = from[j + 1] + (target[j + 1] - from[j + 1]) * e;
      positions[j + 2] = from[j + 2] + (target[j + 2] - from[j + 2]) * e;
    }
    geometry.attributes.position.needsUpdate = true;
  };

  let currentLabel = '';
  const setLabel = (text: string) => {
    if (!label || text === currentLabel) return;
    currentLabel = text;
    label.classList.add('is-swap');
    setTimeout(() => {
      label.textContent = text;
      label.classList.remove('is-swap');
    }, 220);
  };

  const morphTo = (shape: { pts: Float32Array; label: string }, instant = false) => {
    if (shape.pts === target) return;
    activeTween?.kill();
    from = new Float32Array(positions);
    target = shape.pts;
    setLabel(shape.label);
    if (instant) {
      tween.t = 1;
      applyMorph();
      return;
    }
    tween.t = 0;
    activeTween = gsap.to(tween, { t: 1, duration: 1.5, ease: 'power2.inOut', onUpdate: applyMorph });
  };

  const shapeFor = (index: number | null) =>
    index !== null && index >= 0 && index < SHAPES.length ? SHAPES[index] : SCATTER;

  // Shape follows the active job (same picker as the theme shift).
  document.addEventListener('forge:job', (e) => {
    morphTo(shapeFor((e as CustomEvent<{ index: number | null }>).detail.index));
  });

  // Color follows the live ember token (incl. SCADA green).
  document.addEventListener('forge:theme', (e) => {
    const ember = (e as CustomEvent<{ ember: string }>).detail.ember;
    const c = new Color(ember);
    gsap.to(material.color, { r: c.r, g: c.g, b: c.b, duration: 0.9, ease: 'power2.out' });
  });

  // Adopt whatever job is already active when we load in late.
  const initial = document.documentElement.dataset.forgeJob;
  morphTo(shapeFor(initial !== undefined && initial !== '' ? parseInt(initial, 10) : null), true);
  setLabel(target === SCATTER.pts ? SCATTER.label : SHAPES[parseInt(initial || '0', 10)]?.label ?? SCATTER.label);

  /* ---- size / render loop ---- */
  const resize = () => {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  new ResizeObserver(resize).observe(canvas);
  resize();

  let raf = 0;
  let running = false;
  const tick = (time: number) => {
    // Oscillate instead of spinning — these are side-view silhouettes,
    // a full rotation would put them edge-on half the time.
    points.rotation.y = Math.sin(time * 0.00042) * 0.55;
    points.position.y = Math.sin(time * 0.0006) * 0.04;
    renderer.render(scene, camera);
    raf = requestAnimationFrame(tick);
  };
  const start = () => {
    if (running) return;
    running = true;
    raf = requestAnimationFrame(tick);
  };
  const stop = () => {
    running = false;
    cancelAnimationFrame(raf);
  };

  new IntersectionObserver(
    (entries) => {
      for (const ent of entries) {
        if (ent.isIntersecting) start();
        else stop();
      }
    },
    { threshold: 0 },
  ).observe(host);
  start();
}
