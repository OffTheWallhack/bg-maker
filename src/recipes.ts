import { defaultFxOn, makeScene } from './defaults';
import { EFFECTS } from './finish';
import { BUILTIN_PALETTES } from './palettes';
import type { Layer2, Scene, Values } from './types';

export interface Recipe { id: string; name: string; build: () => Scene }

interface Opts {
  fx?: Record<string, number | true>;
  finish?: Values;
  layer?: Partial<Layer2>;
  invert?: boolean;
  seed?: number;
}

function recipe(id: string, name: string, tex: string, params: Values, pal: string | string[], o: Opts = {}): Recipe {
  return {
    id, name,
    build: () => {
      const colors = Array.isArray(pal) ? pal : BUILTIN_PALETTES.find((p) => p.id === pal)!.colors;
      const s = makeScene(tex, colors);
      s.params = { [tex]: params };
      s.seed = o.seed ?? 11;
      const fxOn = defaultFxOn();
      const finish = { ...s.finish };
      for (const [k, v] of Object.entries(o.fx ?? {})) {
        fxOn[k] = true;
        const e = EFFECTS.find((x) => x.id === k);
        if (e && typeof v === 'number') finish[e.params[0].id] = v;
      }
      s.fxOn = fxOn;
      s.finish = { ...finish, ...o.finish };
      if (o.layer) s.layer = { ...s.layer, on: true, ...o.layer };
      if (o.invert) s.grade.invert = true;
      return s;
    },
  };
}

/** Ready-made looks: texture + palette + effects (+ second layer). */
export const RECIPES: Recipe[] = [
  recipe('riso-party', 'Riso párty', 'riso-gradient', { angle: 40, contrast: 1.5 }, 'riso-fluoro', { fx: { grain: 30, paper: 50, misreg: true } }),
  recipe('xerox-poster', 'Xerox plagát', 'xerox-fade', {}, 'mono-chrome', { fx: { toner: 45, streaks: 40, dust: 40, grain: 24 }, seed: 5 }),
  recipe('chrome-tribal', 'Neotribal chróm', 'neotribal-blades', { count: 14 }, 'mono-chrome', { fx: { glow: 35, grain: 22 }, seed: 8 }),
  recipe('violet-haze', 'Fialová hmla', 'mesh-gradient', { drift: 0.8 }, 'ultraviolet', { fx: { glow: 40, grain: 30 }, layer: { textureId: 'smoke', blend: 2, opacity: 0.7 }, seed: 3 }),
  recipe('thermal', 'Termo záblesk', 'thermal', { spectrum: true, levels: 10 }, 'midnight-ember', { fx: { grain: 26, ca: 40 }, seed: 6 }),
  recipe('ebru', 'Ebru terakota', 'ebru-marbling', {}, 'terracotta', { fx: { grain: 20, paper: 40 }, seed: 9 }),
  recipe('night-water', 'Nočná voda', 'water-caustics', {}, 'deep-sea', { fx: { grain: 22, glow: 30 }, layer: { textureId: 'fog-below', blend: 2, opacity: 0.55 }, seed: 4 }),
  recipe('marble-cobalt', 'Mramor a kobalt', 'marble', { freq: 5 }, 'bone-cobalt', { fx: { grain: 16, paper: 40 }, seed: 12 }),
  recipe('dusk', 'Súmrak', 'dusk-horizon', {}, 'lagoon-sunset', { fx: { grain: 30, edge: 30 }, seed: 2 }),
  recipe('aurora', 'Aurora', 'aurora-veils', {}, 'forest-night', { fx: { grain: 24, glow: 25 }, seed: 14 }),
  recipe('pink-glitch', 'Ružový glitch', 'gradient-tear', {}, 'cyber-peach', { fx: { slice: 35, grain: 26 }, seed: 7 }),
  recipe('crt-night', 'CRT noc', 'crt-bloom-bars', {}, 'acid-lime', { fx: { scan: 35, ca: 30, grain: 24 }, seed: 10 }),
  recipe('indigo-sashiko', 'Indigo sashiko', 'sashiko', {}, 'bone-cobalt', { fx: { grain: 14, paper: 40 }, invert: true }),
  recipe('red-stitch', 'Červený krížik', 'cross-stitch', {}, ['#F3EBDD', '#9B1B30', '#C24A5A', '#7A1224', '#B8A99A'], { fx: { paper: 45, grain: 14 }, seed: 3 }),
  recipe('manual', 'Technický návod', 'tech-drawing', {}, 'riso-fluoro', { fx: { paper: 40, grain: 14 }, seed: 6 }),
  recipe('holo', 'Holo fólia', 'holo-foil', {}, 'ultraviolet', { fx: { grain: 26, glow: 30 }, seed: 5 }),
  recipe('smoke', 'Dym', 'smoke', {}, 'mono-chrome', { fx: { grain: 28, vignette: 35 }, seed: 3 }),
  recipe('ember-orb', 'Žiariaca guľa', 'grain-orb', {}, 'crimson-night', { fx: { grain: 20, glow: 25 }, seed: 9 }),
  recipe('dry-brush', 'Suchý štetec', 'dry-brush', {}, 'sunset-pastel', { fx: { paper: 45, grain: 18 }, invert: true, seed: 16 }),
  recipe('memphis', 'Memphis', 'memphis', {}, 'bubblegum', { fx: { grain: 16 }, seed: 4 }),
];
