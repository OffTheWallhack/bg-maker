import { R, defineTexture } from './define';

export default defineTexture({
  id: 'xerox-crease', name: 'Xerox – kópia pokrčeného papiera', category: 'print',
  params: [
    R('scale', 'Mierka záhybov', 0.5, 5, 1.6),
    R('depth', 'Hĺbka', 0.3, 3, 1.4),
    R('thr', 'Prah tonera', 0.3, 0.75, 0.52),
    R('light', 'Smer svetla', 0, 360, 130, 1),
    R('noise', 'Zrno tonera', 0, 1, 0.5),
    R('streak', 'Pruhy valca', 0, 1, 0.4),
  ],
  glsl: /* glsl */ `
    float t_h(vec2 p){
      vec2 w = warp(p * u_scale, 0.25, 0.9) + u_so;
      return ridged(w * 1.3) * 0.8 + 0.3 * ridged(w * 3.6 + 3.0);
    }
    vec3 tex(vec2 p, vec2 uv){
      float e = 0.0025;
      float h = t_h(p);
      vec2 g = vec2(t_h(p + vec2(e, 0.0)) - h, t_h(p + vec2(0.0, e)) - h) / e;
      float a = radians(u_light);
      float s = 0.5 + dot(g, vec2(cos(a), sin(a))) * 0.05 * u_depth + (h - 0.5) * 0.3;
      float n = rgrain(p + SOF, 700.0);
      float st = pow(vnoise(vec2(p.x * 350.0 + u_so.x, p.y * 0.6)), 5.0) * u_streak;
      float v = s + (n - 0.5) * u_noise * 0.7 - st * 0.3;
      float m = smoothstep(u_thr - 0.02, u_thr + 0.02, v);
      return mix(u_bg, u_ink1, m);
    }
  `,
});
