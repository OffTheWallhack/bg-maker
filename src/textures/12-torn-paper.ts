import { R, defineTexture } from './define';

export default defineTexture({
  id: 'torn-paper', name: 'Trhaný papier – vrstvy', category: 'material',
  params: [
    R('layers', 'Vrstvy', 2, 6, 4, 1),
    R('angle', 'Uhol', 0, 360, 12, 1),
    R('rough', 'Roztrhanosť', 0, 1, 0.5),
    R('freq', 'Frekvencia hrán', 0.5, 6, 2.2),
    R('shadow', 'Tieň', 0, 1, 0.6),
    R('rim', 'Biely okraj', 0, 1, 0.7),
    R('fiber', 'Vlákna', 0, 1, 0.4),
  ],
  glsl: /* glsl */ `
    vec3 tex(vec2 p, vec2 uv){
      vec2 q = rot(radians(u_angle)) * p;
      vec3 c = u_bg;
      for (int i = 0; i < 6; i++){
        if (float(i) >= u_layers) break;
        float fi = float(i);
        float thr = 0.62 - (fi + 1.0) / (u_layers + 0.6) * 1.1;
        float n = (fbm(vec2(q.x * u_freq, fi * 7.3) + u_so) - 0.5) * 0.28 * (0.3 + u_rough)
                + (vnoise(vec2(q.x * 60.0, fi * 3.0) + u_so) - 0.5) * 0.02 * u_rough
                + (vnoise(vec2(q.x * 400.0, fi) + u_so) - 0.5) * 0.004 * u_rough;
        float e = (q.y - thr) + n;      // >0 : inside this layer
        float aa = fwidth(e) + 0.0006;
        float sh = smoothstep(0.07, 0.0, -e) * step(e, 0.0);
        c *= 1.0 - sh * u_shadow * 0.55;
        float inside = smoothstep(-aa, aa, e);
        int ci = int(mod(fi + 1.0, 4.0)) + 1;
        vec3 lc = palc(ci > 3 ? 1 : ci);
        lc *= 0.9 + 0.1 * fbm(q * 6.0 + fi * 5.0 + u_so);
        lc *= 1.0 - u_fiber * 0.10 * vnoise(vec2(q.x * 500.0, q.y * 50.0) + fi);
        float rimw = 0.004 + 0.012 * u_rough * (0.5 + vnoise(vec2(q.x * 90.0, fi)));
        float rim = smoothstep(rimw, 0.0, e) * u_rim;
        lc = mix(lc, max(u_ink1, lc) * 1.05 + 0.08, rim * 0.8);
        c = mix(c, lc, inside);
      }
      return c;
    }
  `,
});
