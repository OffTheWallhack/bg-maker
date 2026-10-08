import { R, defineTexture } from './define';

export default defineTexture({
  id: 'camo-woodland', name: 'Maskáč – organický', category: 'nature',
  params: [
    R('scale', 'Veľkosť škvŕn', 0.6, 6, 1.8),
    R('warp', 'Zvlnenie', 0, 1, 0.5),
    R('cover', 'Pokrytie', 0.2, 0.8, 0.5),
    R('edge', 'Ostrosť hrán', 0.002, 0.2, 0.012),
    R('fiber', 'Textúra látky', 0, 1, 0.45),
    R('layers', 'Vrstvy', 2, 4, 4, 1),
  ],
  glsl: /* glsl */ `
    vec3 tex(vec2 p, vec2 uv){
      vec2 w = twarp(p, u_warp * 0.25, 1.1, 0.6);
      vec3 c = u_bg;
      for (int i = 0; i < 4; i++){
        if (float(i) >= u_layers) break;
        float fi = float(i);
        float n = tfbm(w * u_scale * (1.0 + fi * 0.18) * vec2(1.0, 1.25) + u_so + fi * 17.0, 0.6);
        float thr = 1.0 - u_cover * (0.95 - fi * 0.12);
        float m = smoothstep(thr - u_edge, thr + u_edge, n);
        c = mix(c, palc(1 + int(mod(fi, 4.0))) * (0.75 + 0.25 * fi * 0.2), m);
      }
      float weave = 0.5 + 0.5 * sin(p.x * 900.0) * sin(p.y * 900.0);
      c *= 1.0 - u_fiber * 0.12 * weave;
      c *= 0.92 + 0.08 * vnoise(p * 500.0 + u_so);
      return c;
    }
  `,
});
