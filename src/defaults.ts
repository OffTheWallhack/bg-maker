import { EFFECTS, FINISH_PARAMS } from './finish';
import { BUILTIN_PALETTES } from './palettes';
import type { Scene, Values } from './types';

export const FORMATS = [
  { id: 'story', name: 'Story', w: 1080, h: 1920 },
  { id: 'post', name: 'Post 4:5', w: 1080, h: 1350 },
  { id: 'square', name: 'Štvorec', w: 1080, h: 1080 },
  { id: 'reel', name: 'Reel cover', w: 1080, h: 1920 },
  { id: 'landscape', name: 'Na šírku', w: 1920, h: 1080 },
  { id: 'custom', name: 'Vlastný', w: 1080, h: 1080 },
];

export const PALETTE_SLOTS = ['Pozadie', 'Ink 1', 'Ink 2', 'Akcent', 'Špina'];

export const MOTION_NAMES = ['Plávanie', 'Vlnenie', 'Dýchanie', 'Posun', 'Vír', 'Blikanie', 'Glitch'];
export const MOTION_HINTS = ['každá časť obrazu pláva po svojom', 'jemné vlnenie ako hladina', 'časti sa nafukujú a zmenšujú', 'celý obraz plynie nahor', 'obraz sa točí okolo stredu', 'blikanie jasu', 'trhanie riadkov'];
export const LOOP_LENGTHS = [2, 4, 6, 8, 10];

export function defaultFinish(): Values {
  return Object.fromEntries(FINISH_PARAMS.map((p) => [p.id, p.default]));
}

export const defaultFxOn = (): Record<string, boolean> => Object.fromEntries(EFFECTS.map((e) => [e.id, e.on]));

export function makeScene(textureId = 'mesh-gradient', palette = BUILTIN_PALETTES[0].colors): Scene {
  return {
    textureId,
    params: {},
    seed: 7,
    format: { preset: 'story', w: 1080, h: 1920 },
    palette: [...palette],
    grade: { hue: 0, contrast: 1, brightness: 0, saturation: 1, invert: false, duotone: false, duoA: 0, duoB: 1 },
    finish: defaultFinish(),
    fxOn: defaultFxOn(),
    anim: { on: false, speed: 1, loop: 6, motion: 0, amount: 1 },
  };
}
