import { R, defineTexture } from './define';

export default defineTexture({
  id: 'strata', name: 'Horninové vrstvy', category: 'nature',
  params: [
    R('layers', 'Počet vrstiev', 4, 40, 16, 1),
    R('angle', 'Sklon', -30, 30, 8, 0.5),
    R('erode', 'Erózia hrán', 0, 1, 0.5),
    R('vary', 'Rozdiel farieb', 0, 1, 0.7),
    R('line', 'Škáry', 0, 1, 0.5),
    R('fold', 'Vrásnenie', 0, 1, 0.3),
  ],
  glsl: /* glsl */ `
    vec3 tex(vec2 p, vec2 uv){
      vec2 q = rot(radians(u_angle)) * p;
      float y = q.y + u_fold * 0.12 * sin(q.x * 3.0 + u_so.x) + (fbm(vec2(q.x * 2.0, q.y * 6.0) + u_so) - 0.5) * 0.06 * u_erode;
      float x = (y + 0.5) * u_layers;
      float id = floor(x);
      float f = fract(x);
      float th = 0.5 + 0.5 * hash(id + u_so.x);
      float tone = mix(0.5, hash(id * 3.1 + u_so.y), u_vary);
      vec3 c = ramp(0.1 + 0.8 * tone);
      c *= 0.85 + 0.15 * vnoise(vec2(q.x * 40.0, id) + u_so) + 0.1 * (1.0 - f);
      float ln = (1.0 - smoothstep(0.0, 0.08 + fwidth(x), f)) * u_line;
      c = mix(c, u_bg, ln * 0.8);
      c *= 1.0 - u_erode * 0.2 * smoothstep(0.7, 1.0, f);
      c *= 0.95 + 0.05 * vnoise(p * 500.0 + u_so);
      return c;
    }
  `,
});
