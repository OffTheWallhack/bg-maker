import { useSyncExternalStore } from 'react';
import { DEFAULT_PALETTES, makeScene } from './defaults';
import { TEXTURES, TEXTURE_BY_ID } from './textures';
import { generatePalette } from './paletteGen';
import type { Harmony } from './paletteGen';
import type { Palette, Param, Preset, Scene, Values } from './types';

export type Tab = 'texture' | 'colors' | 'dirt' | 'anim' | 'export';
export type Sheet = 'peek' | 'half' | 'full';

export interface AppState {
  scene: Scene;
  past: Scene[];
  future: Scene[];
  tab: Tab;
  sheet: Sheet;
  safe: boolean;
  palettes: Palette[];
  activePalette: string | null;
  presets: Preset[];
}

const LS = { palettes: 'bglab.palettes', presets: 'bglab.presets', scene: 'bglab.scene', active: 'bglab.activePalette' };

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
export function save(key: keyof typeof LS, value: unknown): boolean {
  try {
    localStorage.setItem(LS[key], JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

/** Make a stored scene safe to use even if textures/params changed since it was saved. */
export function sanitizeScene(s: Scene): Scene {
  const base = makeScene();
  const out: Scene = {
    ...base,
    ...s,
    grade: { ...base.grade, ...s.grade },
    finish: { ...base.finish, ...s.finish },
    anim: { ...base.anim, ...s.anim },
    format: { ...base.format, ...s.format },
    params: s.params ?? {},
    palette: Array.isArray(s.palette) && s.palette.length === 5 ? s.palette : base.palette,
  };
  if (!TEXTURE_BY_ID[out.textureId]) out.textureId = TEXTURES[0].id;
  return out;
}

function initial(): AppState {
  const palettes = load<Palette[]>(LS.palettes, DEFAULT_PALETTES);
  const stored = load<Scene | null>(LS.scene, null);
  return {
    scene: stored ? sanitizeScene(stored) : makeScene(),
    past: [],
    future: [],
    tab: 'texture',
    sheet: 'half',
    safe: false,
    palettes: palettes.length ? palettes : DEFAULT_PALETTES,
    activePalette: load<string | null>(LS.active, 'dropups'),
    presets: load<Preset[]>(LS.presets, []),
  };
}

let state: AppState = initial();
const listeners = new Set<() => void>();

export const getState = () => state;
export function setState(patch: Partial<AppState>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}
export const subscribe = (l: () => void) => (listeners.add(l), () => listeners.delete(l));
export function useStore<T>(sel: (s: AppState) => T): T {
  return useSyncExternalStore(subscribe, () => sel(state));
}

let saveTimer = 0;
function persistSceneSoon() {
  clearTimeout(saveTimer);
  saveTimer = window.setTimeout(() => save('scene', state.scene), 400);
}

// ---------- undo / redo ----------
let lastKey = '';
let lastAt = 0;

/** Apply a scene change. Changes with the same `key` within 700 ms collapse into a single undo step. */
export function update(fn: (s: Scene) => Scene, key = '') {
  const next = fn(state.scene);
  if (next === state.scene) return;
  const now = performance.now();
  const coalesce = key && key === lastKey && now - lastAt < 700;
  lastKey = key; lastAt = now;
  const past = coalesce ? state.past : [...state.past.slice(-99), state.scene];
  setState({ scene: next, past, future: [] });
  persistSceneSoon();
}
export function undo() {
  if (!state.past.length) return;
  const prev = state.past[state.past.length - 1];
  lastKey = '';
  setState({ scene: prev, past: state.past.slice(0, -1), future: [state.scene, ...state.future] });
  persistSceneSoon();
}
export function redo() {
  if (!state.future.length) return;
  const [next, ...rest] = state.future;
  lastKey = '';
  setState({ scene: next, past: [...state.past, state.scene], future: rest });
  persistSceneSoon();
}

// ---------- scene helpers ----------
export const texParams = (s: Scene, id = s.textureId): Values => s.params[id] ?? {};

export function setParam(id: string, value: number | boolean | string) {
  update((s) => ({ ...s, params: { ...s.params, [s.textureId]: { ...s.params[s.textureId], [id]: value } } }), `p:${state.scene.textureId}:${id}`);
}
export function resetParam(def: Param) {
  update((s) => {
    const cur = { ...s.params[s.textureId] };
    delete cur[def.id];
    return { ...s, params: { ...s.params, [s.textureId]: cur } };
  });
}
export function setFinish(id: string, value: number | boolean | string) {
  update((s) => ({ ...s, finish: { ...s.finish, [id]: value } }), `f:${id}`);
}
export function setGrade<K extends keyof Scene['grade']>(k: K, v: Scene['grade'][K]) {
  update((s) => ({ ...s, grade: { ...s.grade, [k]: v } }), `g:${k}`);
}
export function setAnim<K extends keyof Scene['anim']>(k: K, v: Scene['anim'][K]) {
  update((s) => ({ ...s, anim: { ...s.anim, [k]: v } }), `a:${k}`);
}
export function setPaletteColor(i: number, hex: string) {
  update((s) => ({ ...s, palette: s.palette.map((c, j) => (j === i ? hex : c)) }), `c:${i}`);
}
export function selectTexture(id: string) {
  update((s) => ({ ...s, textureId: id }));
}
export function setSeed(seed: number) {
  update((s) => ({ ...s, seed: Math.max(0, Math.floor(seed)) }), 'seed');
}
export function setFormat(preset: string, w: number, h: number) {
  const cl = (v: number) => Math.max(64, Math.min(4096, Math.round(v) || 64));
  update((s) => ({ ...s, format: { preset, w: cl(w), h: cl(h) } }), preset === 'custom' ? 'fmt' : '');
}

// ---------- random / remix ----------
const rnd = Math.random;
const gauss = () => (rnd() + rnd() + rnd() - 1.5) / 1.5; // ~[-1,1], bell shaped

function nudgeParams(defs: Param[], cur: Values, spread: number, flipChance: number): Values {
  const out: Values = {};
  for (const p of defs) {
    const base = p.id in cur ? cur[p.id] : p.default;
    if (p.type === 'range') {
      const v = Number(base) + gauss() * spread * (p.max - p.min);
      const q = Math.round(Math.min(p.max, Math.max(p.min, v)) / p.step) * p.step;
      out[p.id] = Math.min(p.max, Math.max(p.min, +q.toFixed(4)));
    } else if (p.type === 'toggle') out[p.id] = rnd() < flipChance ? !base : base;
    else if (p.type === 'select') out[p.id] = rnd() < flipChance * 1.5 ? Math.floor(rnd() * p.options.length) : base;
    else out[p.id] = base;
  }
  return out;
}

export function randomize() {
  update((s) => {
    const others = TEXTURES.filter((t) => t.id !== s.textureId);
    const t = others[Math.floor(rnd() * others.length)];
    const params = nudgeParams(t.params, {}, 0.22, 0.25);
    return { ...s, textureId: t.id, params: { ...s.params, [t.id]: params }, seed: Math.floor(rnd() * 99999) };
  });
}
export function remix() {
  update((s) => {
    const t = TEXTURE_BY_ID[s.textureId];
    const params = nudgeParams(t.params, s.params[t.id] ?? {}, 0.07, 0.04);
    return { ...s, params: { ...s.params, [t.id]: params } };
  });
}

export function randomPalette(mode: Harmony = 'auto') {
  update((s) => ({ ...s, palette: generatePalette(mode) }));
}

/** Everything random: texture, params, seed, palette, finish and a bit of grade. */
export function randomAll() {
  update((s) => {
    const t = TEXTURES[Math.floor(rnd() * TEXTURES.length)];
    const params = nudgeParams(t.params, {}, 0.25, 0.3);
    const palette = generatePalette('auto');
    const finish: Values = { ...makeScene().finish };
    const r = (a: number, b: number) => Math.round(a + rnd() * (b - a));
    finish.grain = r(10, 40); finish.grainSize = +(1 + rnd() * 1.4).toFixed(1); finish.vignette = r(0, 45);
    const extras = ['dust', 'paper', 'toner', 'streaks', 'ca', 'bleed', 'scan', 'edge', 'leak', 'hairs', 'jpeg'];
    const n = Math.floor(rnd() * 3);
    for (let i = 0; i < n; i++) {
      const k = extras[Math.floor(rnd() * extras.length)];
      finish[k] = k === 'jpeg' ? r(8, 25) : r(15, 50);
      if (k === 'leak') { finish.leakX = r(0, 100); finish.leakY = r(0, 100); finish.leakColor = palette[2]; }
    }
    const grade = { ...s.grade, hue: 0, invert: false, contrast: +(0.95 + rnd() * 0.25).toFixed(2), brightness: 0, saturation: +(0.9 + rnd() * 0.25).toFixed(2), duotone: rnd() < 0.08, duoA: 0, duoB: 1 + Math.floor(rnd() * 3) };
    return { ...s, textureId: t.id, params: { ...s.params, [t.id]: params }, seed: Math.floor(rnd() * 99999), palette, finish, grade };
  });
  save('active', null);
  setState({ activePalette: null });
}

// ---------- palettes (brand profiles) ----------
function savePalettes(palettes: Palette[], active: string | null) {
  save('palettes', palettes);
  save('active', active);
  setState({ palettes, activePalette: active });
}
const uid = () => Math.random().toString(36).slice(2, 10);

export function selectPalette(id: string) {
  const p = state.palettes.find((x) => x.id === id);
  if (!p) return;
  update((s) => ({ ...s, palette: [...p.colors] }));
  save('active', id);
  setState({ activePalette: id });
}
export function newPalette(name: string) {
  const p: Palette = { id: uid(), name, colors: [...state.scene.palette] };
  savePalettes([...state.palettes, p], p.id);
}
export function renamePalette(id: string, name: string) {
  savePalettes(state.palettes.map((p) => (p.id === id ? { ...p, name } : p)), state.activePalette);
}
export function deletePalette(id: string) {
  const rest = state.palettes.filter((p) => p.id !== id);
  savePalettes(rest, state.activePalette === id ? null : state.activePalette);
}
export function updatePaletteFromScene(id: string) {
  savePalettes(state.palettes.map((p) => (p.id === id ? { ...p, colors: [...state.scene.palette] } : p)), state.activePalette);
}

// ---------- presets ----------
export function savePresets(presets: Preset[]): boolean {
  setState({ presets });
  return save('presets', presets);
}
export function loadScene(scene: Scene) {
  update(() => sanitizeScene(JSON.parse(JSON.stringify(scene))));
}
export { uid };
