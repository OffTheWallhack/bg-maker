import { makeScene } from './defaults';
import { Renderer } from './gl/renderer';
import type { Scene } from './types';

let r: Renderer | null = null;
const getR = () => r ?? (r = new Renderer(document.createElement('canvas')));
const cache = new Map<string, string>();
const queue: { pal: string | null; run: () => void }[] = [];
let latestPal = '';
let busy = false;

function pump() {
  if (busy) return;
  let job = queue.shift();
  while (job && job.pal !== null && job.pal !== latestPal) job = queue.shift(); // drop jobs for an old palette
  if (!job) return;
  busy = true;
  setTimeout(() => { try { job!.run(); } finally { busy = false; pump(); } }, 0);
}

/** Small JPEG data-URL of a scene (sync). */
export function sceneThumb(scene: Scene, maxSide = 160): string {
  const rr = getR();
  const k = maxSide / Math.max(scene.format.w, scene.format.h);
  rr.setSize(scene.format.w * k, scene.format.h * k);
  rr.render(scene, 0);
  return rr.canvas.toDataURL('image/jpeg', 0.78);
}

/** Lazily rendered texture tile (default params, current palette). */
export function textureThumb(id: string, palette: string[], cb: (url: string) => void) {
  const key = id + palette.join('');
  latestPal = palette.join('');
  const hit = cache.get(key);
  if (hit) return cb(hit);
  queue.push({ pal: palette.join(''), run: () => {
    try {
      const s = makeScene(id, palette);
      s.format = { preset: 'post', w: 128, h: 160 };
      const url = sceneThumb(s, 160);
      cache.set(key, url);
      cb(url);
    } catch { /* shader error: leave tile empty */ }
  } });
  pump();
}

const sceneCache = new Map<string, string>();
/** Lazily rendered thumbnail of a whole scene (recipes). */
export function lazySceneThumb(key: string, build: () => Scene, cb: (url: string) => void) {
  const hit = sceneCache.get(key);
  if (hit) return cb(hit);
  queue.push({ pal: null, run: () => {
    try { const url = sceneThumb(build(), 160); sceneCache.set(key, url); cb(url); } catch { /* ignore */ }
  } });
  pump();
}
