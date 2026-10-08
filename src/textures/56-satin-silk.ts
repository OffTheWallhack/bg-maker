import { R, defineTexture } from './define';

export default defineTexture({
  id: 'satin-silk', name: 'Saténový / hodvábny záhyb', category: 'soft',
  params: [
    R('freq', 'Počet záhybov', 0.5, 6, 1.8),
    R('angle', 'Uhol', 0, 180, 62, 1),
    R('warp', 'Zvlnenie', 0, 2, 1.0),
    R('sheen', 'Lesk', 0, 2, 1.0),
    R('soft', 'Mäkkosť', 0.2, 2, 0.8),
    R('depth', 'Hĺbka tieňov', 0, 1, 0.6),
  ],
  glsl: /* glsl */ `
    float t_f(vec2 p){
      vec2 q = rot(radians(u_angle)) * p;
      float w = tfbm(q * 1.2 + u_so, 0.6) - 0.5;
      float w2 = tfbm(q * 2.7 + u_so + 8.0, 0.6) - 0.5;
      return q.x * u_freq * TAU + (w * 5.0 + w2 * 1.6) * u_warp;
    }
    vec3 tex(vec2 p, vec2 uv){
      float f = t_f(p);
      float slope = cos(f);
      float h = sin(f);
      float lit = 0.5 + 0.5 * slope;
      float base = mix(0.5, lit, u_depth) * (0.75 + 0.25 * h);
      float sh = pow(max(0.0, slope * 0.6 + 0.4 * h + 0.2), 4.0 / u_soft) * u_sheen;
      vec3 c = ramp(0.06 + 0.5 * base);
      c += mix(u_ink2, u_ink1, 0.6) * sh * 0.55;
      c *= 0.95 + 0.05 * vnoise(p * 600.0 + u_so);
      return c;
    }
  `,
});
