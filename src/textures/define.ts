import type { CategoryId, Param, TextureDef } from '../types';

export const CATEGORIES: { id: CategoryId; name: string }[] = [
  { id: 'tribal', name: 'Neotribal / ostré tvary' },
  { id: 'gradient', name: 'Gradienty / mesh' },
  { id: 'print', name: 'Tlač' },
  { id: 'material', name: 'Materiál' },
  { id: 'light', name: 'Svetlo / klub' },
  { id: 'geometry', name: 'Zvuk / geometria' },
  { id: 'glitch', name: 'Glitch / digitál' },
  { id: 'nature', name: 'Voda / maskáč' },
  { id: 'soft', name: 'Lesk / jemné svetlo' },
];

/** slider */
export const R = (id: string, label: string, min: number, max: number, def: number, step?: number): Param => ({
  type: 'range', id, label, min, max, step: step ?? Math.max((max - min) / 200, 0.001), default: def,
});
/** on/off switch */
export const T = (id: string, label: string, def = false): Param => ({ type: 'toggle', id, label, default: def });
/** segmented choice (value is the option index) */
export const S = (id: string, label: string, options: string[], def = 0): Param => ({ type: 'select', id, label, options, default: def });
/** colour picker (hex string, GLSL gets a vec3) */
export const C = (id: string, label: string, def: string): Param => ({ type: 'color', id, label, default: def });

export const defineTexture = (t: TextureDef): TextureDef => t;
