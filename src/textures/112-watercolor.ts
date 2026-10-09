import { R, defineTexture } from './define';

export default defineTexture({
  id: 'watercolor', name: 'Akvarel – rozpité škvrny', category: 'nature',
  params: [
    R('layers', 'Počet pigmentov', 1, 4, 3, 1),
    R('scale', 'Veľkosť škvŕn', 0.4, 4, 1.2),
    R('cover', 'Pokrytie', 0.2, 0.8, 0.5),
    R('edge', 'Tmavý okraj', 0, 1, 0.7),
    R('gran', 'Granulácia', 0, 1, 0.5),
    R('wet', 'Rozpitie', 0, 1, 0.5),
  ],
  glsl: /* glsl */ `
    vec3 tex(vec2 p, vec2 uv){
      vec3 paper = u_bg * (0.96 + 0.04 * fbm(p * 14.0 + u_so)) ;
      vec3 c = paper;
      float gr = vnoise(p * 380.0 + u_so) * 0.5 + vnoise(p * 140.0 + u_so + 2.0) * 0.5;
      for (int i = 0; i < 4; i++){
        if (float(i) >= u_layers) break;
        float fi = float(i);
        vec2 q = p * u_scale + u_so + fi * 9.3;
        vec2 w = q + (vec2(fbm(q * 2.0), fbm(q * 2.0 + 4.0)) - 0.5) * 0.6;
        float f = tfbm(w, 0.5);
        float thr = 1.0 - u_cover;
        float soft = mix(0.02, 0.25, u_wet);
        float m = smoothstep(thr - soft, thr + soft * 0.4, f);
        float rim = smoothstep(0.06, 0.0, abs(f - thr - soft * 0.1)) * u_edge;
        float dens = m * (0.45 + 0.35 * f) + rim * 0.5;
        dens *= 1.0 - u_gran * 0.5 * gr;
        vec3 pig = palc(1 + int(mod(fi, 3.0)));
        c = inkOn(c, pig, clamp(dens, 0.0, 1.0) * 0.9);
      }
      return c;
    }
  `,
});
