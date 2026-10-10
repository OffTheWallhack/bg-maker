export type ParamValue = number | boolean | string;

export interface RangeParam { type: 'range'; id: string; label: string; min: number; max: number; step: number; default: number; group?: string }
export interface ToggleParam { type: 'toggle'; id: string; label: string; default: boolean; group?: string }
export interface SelectParam { type: 'select'; id: string; label: string; options: string[]; default: number; group?: string }
export interface ColorParam { type: 'color'; id: string; label: string; default: string; group?: string }
export type Param = RangeParam | ToggleParam | SelectParam | ColorParam;

export type Values = Record<string, ParamValue>;

export type CategoryId = 'print' | 'material' | 'light' | 'geometry' | 'glitch' | 'nature' | 'soft' | 'gradient' | 'tribal' | 'folk';

export interface TextureDef {
  id: string;
  name: string;
  category: CategoryId;
  params: Param[];
  /** GLSL defining `vec3 tex(vec2 p, vec2 uv)`. Params are available as `u_<id>` uniforms. */
  glsl: string;
}

export interface Palette { id: string; name: string; colors: string[] } // 5 colors: bg, ink1, ink2, highlight, dirt

export interface FormatSel { preset: string; w: number; h: number }

export interface GlobalGrade {
  hue: number; contrast: number; brightness: number; saturation: number;
  invert: boolean; duotone: boolean; duoA: number; duoB: number;
}

export interface Anim { on: boolean; speed: number; loop: number; motion: number; amount: number }

export interface Layer2 { on: boolean; textureId: string; params: Values; blend: number; opacity: number; maskMode: number; maskPos: number; maskSoft: number; maskInv: boolean }
export interface PhotoOpts { on: boolean; mode: number; blend: number; opacity: number; zoom: number; x: number; y: number; contrast: number }

/** Everything that defines the image. Serialisable; used for undo/redo and presets. */
export interface Scene {
  textureId: string;
  params: Record<string, Values>; // per-texture values (only changed ones need to exist)
  seed: number;
  format: FormatSel;
  palette: string[];
  grade: GlobalGrade;
  finish: Values;
  /** which effects are switched on (id -> bool) */
  fxOn: Record<string, boolean>;
  layer: Layer2;
  photo: PhotoOpts;
  anim: Anim;
}

export interface Preset { id: string; name: string; thumb: string; created: number; scene: Scene }
