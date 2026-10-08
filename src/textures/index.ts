import type { TextureDef } from '../types';
import { CATEGORIES } from './define';

// Every file in this folder except `_*.ts`, `define.ts` and `index.ts` is a texture module
// (default export = defineTexture({...})). Files are ordered by file name.
const mods = import.meta.glob<{ default: TextureDef }>(['./*.ts', '!./_*.ts', '!./define.ts', '!./index.ts'], { eager: true });

export const TEXTURES: TextureDef[] = Object.keys(mods)
  .sort()
  .map((k) => mods[k].default);

export const TEXTURE_BY_ID: Record<string, TextureDef> = Object.fromEntries(TEXTURES.map((t) => [t.id, t]));

export { CATEGORIES };
