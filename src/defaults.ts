import { FINISH_PARAMS } from './finish';
import { TEXTURES } from './textures';
import type { Palette, Scene, Values } from './types';

export const FORMATS = [
  { id: 'story', name: 'Story', w: 1080, h: 1920 },
  { id: 'post', name: 'Post 4:5', w: 1080, h: 1350 },
  { id: 'square', name: 'Štvorec', w: 1080, h: 1080 },
  { id: 'reel', name: 'Reel cover', w: 1080, h: 1920 },
  { id: 'landscape', name: 'Na šírku', w: 1920, h: 1080 },
  { id: 'custom', name: 'Vlastný', w: 1080, h: 1080 },
];

export const PALETTE_SLOTS = ['Pozadie', 'Ink 1', 'Ink 2', 'Akcent', 'Špina'];

export const DEFAULT_PALETTES: Palette[] = [
  { id: 'dropups', name: 'Drop Ups', colors: ['#0A0A0B', '#E2E1DA', '#F9124A', '#B80C37', '#8C8C88'] },
  { id: 'blood', name: 'Blood', colors: ['#090707', '#3A0406', '#AA0A12', '#D62C10', '#FF5C1C'] },
];

export const MOTION_NAMES = ['Drift', 'Pulz', 'Blikanie', 'Posun', 'Rotácia'];
export const LOOP_LENGTHS = [2, 4, 6, 8, 10];

export function defaultFinish(): Values {
  return Object.fromEntries(FINISH_PARAMS.map((p) => [p.id, p.default]));
}

export function makeScene(textureId = TEXTURES[0].id, palette = DEFAULT_PALETTES[0].colors): Scene {
  return {
    textureId,
    params: {},
    seed: 7,
    format: { preset: 'story', w: 1080, h: 1920 },
    palette: [...palette],
    grade: { hue: 0, contrast: 1, brightness: 0, saturation: 1, invert: false, duotone: false, duoA: 0, duoB: 1 },
    finish: defaultFinish(),
    anim: { on: false, speed: 1, loop: 6, motion: 0 },
  };
}
