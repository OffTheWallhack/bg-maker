// Copy this file, rename it (e.g. `51-my-texture.ts`), edit and it is picked up automatically.
// Files starting with "_" are ignored by the registry.
import { C, R, S, T, defineTexture } from './define';

export default defineTexture({
  id: 'my-texture',            // unique, kebab-case
  name: 'Moja textúra',        // Slovak display name
  category: 'print',           // print | material | light | geometry | glitch
  params: [                    // each becomes a uniform `u_<id>` and a UI control
    R('scale', 'Mierka', 0.5, 8, 2),
    R('angle', 'Uhol', 0, 360, 30, 1),
    R('contrast', 'Kontrast', 0.3, 3, 1.2),
    S('mode', 'Režim', ['A', 'B'], 0),
    T('rough', 'Drsné', false),
    C('tint', 'Odtieň', '#ff2060'),
  ],
  // `p`: centred coords, height = 1 (y in -0.5..0.5, y up). `uv`: 0..1.
  // Palette: u_bg, u_ink1, u_ink2, u_hi, u_dirt and ramp(t). Seed: add SOF/u_so to noise coords.
  // Loop-safe time: TT (angle) inside sin/cos, or tfbm()/voronoi(...,mv).
  glsl: /* glsl */ `
    vec3 tex(vec2 p, vec2 uv){
      vec2 q = rot(radians(u_angle)) * p;
      float n = tfbm(q * u_scale + u_so, 0.8);
      n = remap(n, 0.5 - 0.5 / u_contrast, 0.5 + 0.5 / u_contrast);
      return mix(u_bg, u_ink1, n);
    }
  `,
});
