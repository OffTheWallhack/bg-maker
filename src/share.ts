import { defaultFinish, defaultFxOn, makeScene } from './defaults';
import type { Scene } from './types';

// A "recipe link" holds everything but the photo. Only values that differ from the defaults are stored.
function diff<T extends Record<string, unknown>>(a: T, def: T): Partial<T> {
  const out: Record<string, unknown> = {};
  for (const k of Object.keys(a)) if (JSON.stringify(a[k]) !== JSON.stringify(def[k])) out[k] = a[k];
  return out as Partial<T>;
}

const b64 = (s: string) => btoa(unescape(encodeURIComponent(s))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const unb64 = (s: string) => decodeURIComponent(escape(atob(s.replace(/-/g, '+').replace(/_/g, '/'))));

export function encodeScene(s: Scene): string {
  const d = makeScene();
  const lay = s.layer.on ? s.layer : undefined;
  const payload = {
    v: 1,
    t: s.textureId,
    p: s.params[s.textureId] ?? {},
    s: s.seed,
    f: [s.format.preset, s.format.w, s.format.h],
    c: s.palette,
    g: diff(s.grade as never, d.grade as never),
    e: diff(s.finish, defaultFinish()),
    o: diff(s.fxOn, defaultFxOn()),
    a: s.anim,
    l: lay,
    ph: s.photo.on ? s.photo : undefined,
  };
  return b64(JSON.stringify(payload));
}

export function decodeScene(code: string): Scene | null {
  try {
    const j = JSON.parse(unb64(code));
    const d = makeScene();
    return {
      ...d,
      textureId: j.t,
      params: { [j.t]: j.p ?? {} },
      seed: j.s ?? d.seed,
      format: { preset: j.f[0], w: j.f[1], h: j.f[2] },
      palette: j.c ?? d.palette,
      grade: { ...d.grade, ...j.g },
      finish: { ...defaultFinish(), ...j.e },
      fxOn: { ...defaultFxOn(), ...j.o },
      anim: { ...d.anim, ...j.a, on: false },
      layer: j.l ? { ...d.layer, ...j.l } : d.layer,
      photo: { ...d.photo, on: false },
    };
  } catch {
    return null;
  }
}

export function parseShare(hash: string): Scene | null {
  const m = /^#r=(.+)$/.exec(hash);
  return m ? decodeScene(m[1]) : null;
}

export function shareUrl(s: Scene): string {
  return `${location.origin}${location.pathname}#r=${encodeScene(s)}`;
}
