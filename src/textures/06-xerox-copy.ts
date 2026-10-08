import { R, defineTexture } from './define';

export default defineTexture({
  id: 'xerox-copy', name: 'Xerox kópia', category: 'print',
  params: [
    R('scale', 'Mierka', 0.5, 6, 1.8),
    R('thr', 'Prah', 0.25, 0.75, 0.52),
    R('distort', 'Skreslenie', 0, 1, 0.5),
    R('noise', 'Zrno tonera', 0, 1, 0.45),
    R('grit', 'Veľkosť zrna', 0.5, 3, 1.2),
    R('streak', 'Pruhy valca', 0, 1, 0.4),
    R('speck', 'Škvrny', 0, 1, 0.4),
  ],
  glsl: /* glsl */ `
    vec3 tex(vec2 p, vec2 uv){
      vec2 pp = twarp(p, u_distort * 0.35, 1.2, 0.6);
      float f = tfbm(pp * u_scale + u_so, 0.7);
      float streaks = vnoise(vec2(p.x * 7.0 + u_so.x, p.y * 1.2)) * vnoise(vec2(p.x * 260.0, p.y * 0.8));
      float g = rgrain(p + SOF, 650.0 / u_grit);
      float v = f + (g - 0.5) * u_noise * 1.1 + (streaks - 0.25) * u_streak * 0.8;
      float m = smoothstep(u_thr - 0.02, u_thr + 0.02, v);
      float halo = smoothstep(u_thr - 0.18, u_thr, v) * (1.0 - m) * 0.3;
      float spk = step(1.0 - u_speck * 0.05, hash(floor((p + SOF) * 700.0))) * (1.0 - m);
      vec3 c = u_bg;
      c = mix(c, u_dirt, halo * 0.5);
      c = mix(c, u_ink1, m);
      c = mix(c, u_ink2, spk);
      return c;
    }
  `,
});
