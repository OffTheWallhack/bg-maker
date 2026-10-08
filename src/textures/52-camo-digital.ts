import { R, defineTexture } from './define';

export default defineTexture({
  id: 'camo-digital', name: 'Maskáč – digitálny pixel', category: 'nature',
  params: [
    R('cells', 'Veľkosť pixelu (počet)', 20, 160, 70, 1),
    R('scale', 'Veľkosť škvŕn', 0.6, 6, 2.2),
    R('cover', 'Pokrytie', 0.2, 0.8, 0.5),
    R('mix', 'Dva rastre', 0, 1, 0.6),
    R('gap', 'Medzery', 0, 0.3, 0.05),
    R('layers', 'Vrstvy', 2, 4, 4, 1),
  ],
  glsl: /* glsl */ `
    float t_camo(vec2 q, float fi){ return tfbm(q * u_scale + u_so + fi * 13.0, 0.5); }
    vec3 tex(vec2 p, vec2 uv){
      vec3 c = u_bg;
      vec2 f1 = fract(p * u_cells + 0.5) - 0.5;
      float cell = 1.0 / u_cells;
      for (int i = 0; i < 4; i++){
        if (float(i) >= u_layers) break;
        float fi = float(i);
        vec2 q1 = (floor(p * u_cells) + 0.5) * cell;
        vec2 q2 = (floor(p * u_cells * 0.5) + 0.5) * cell * 2.0;
        float big = step(0.5 + 0.5 * hash(floor(p * u_cells * 0.25) + fi + u_so), u_mix);
        float n = t_camo(mix(q1, q2, big), fi);
        float thr = 1.0 - u_cover * (0.95 - fi * 0.13);
        c = mix(c, palc(1 + int(mod(fi, 4.0))), step(thr, n));
      }
      float g = max(abs(f1.x), abs(f1.y));
      c *= 1.0 - smoothstep(0.5 - u_gap - 0.02, 0.5 - u_gap + 0.02, g) * step(0.001, u_gap) * 0.5;
      return c;
    }
  `,
});
