// Dev tool: renders every texture into one contact sheet and reports shader errors.
//   npx vite  →  open /dev/sheet.html  (driven by scripts/sheet.mjs)
import { makeScene } from '../src/defaults';
import { Renderer } from '../src/gl/renderer';
import { TEXTURES } from '../src/textures';

const q = new URLSearchParams(location.search);
const W = Number(q.get('w') ?? 216), H = Number(q.get('h') ?? 384), COLS = Number(q.get('cols') ?? 10);
const anim = q.get('anim') === '1';
const phase = Number(q.get('phase') ?? 0);
const only = q.get('only');
const list = only ? TEXTURES.filter((t) => only.split(',').includes(t.id)) : TEXTURES;
const off = document.createElement('canvas');
const r = new Renderer(off);
r.setSize(W, H);
const sheet = document.getElementById('sheet') as HTMLCanvasElement;
sheet.width = COLS * W; sheet.height = Math.ceil(list.length / COLS) * H;
const ctx = sheet.getContext('2d')!;
const errors: Record<string, string> = {};
const t0 = performance.now();
list.forEach((t, i) => {
  const s = makeScene(t.id);
  s.anim.on = anim;
  if (q.get('multi')) { s.finish.multi = Number(q.get('multi')); s.finish.multiMode = Number(q.get('mode') ?? 1); }
  try { r.render(s, phase); ctx.drawImage(off, (i % COLS) * W, Math.floor(i / COLS) * H); }
  catch (e) { errors[t.id] = String(e); }
});
(window as any).__result = { errors, ms: performance.now() - t0, count: list.length, ids: list.map((t) => t.id) };
