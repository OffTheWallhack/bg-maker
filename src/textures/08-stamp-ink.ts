import { R, S, T, defineTexture } from './define';

export default defineTexture({
  id: 'stamp-ink', name: 'Pečiatka / ink pad', category: 'print',
  params: [
    S('shape', 'Tvar', ['Kruh', 'Štvorec', 'Dvojitý kruh', 'Plný kruh'], 0),
    R('size', 'Veľkosť', 0.2, 1.2, 0.62),
    R('thick', 'Hrúbka', 0.01, 0.25, 0.07),
    R('angle', 'Natočenie', -180, 180, -12, 1),
    R('x', 'Posun X', -0.5, 0.5, 0),
    R('y', 'Posun Y', -0.5, 0.5, 0.02),
    R('rough', 'Drsnosť hrán', 0, 1, 0.5),
    R('voids', 'Nerovnomerný tlak', 0, 1, 0.6),
    T('second', 'Druhá pečiatka', true),
  ],
  glsl: /* glsl */ `
    float t_stamp(vec2 p, float size, float ang, vec2 c0, float seed){
      vec2 q = rot(radians(ang)) * (p - c0);
      q += (vec2(fbm(q * 9.0 + u_so + seed), fbm(q * 9.0 + u_so + seed + 5.0)) - 0.5) * u_rough * 0.07;
      float d;
      if (u_shape < 0.5) d = abs(length(q) - size * 0.5) - u_thick * 0.5;
      else if (u_shape < 1.5){ vec2 b = abs(q) - vec2(size * 0.5); d = abs(length(max(b, 0.0)) + min(max(b.x, b.y), 0.0)) - u_thick * 0.5; }
      else if (u_shape < 2.5) d = min(abs(length(q) - size * 0.5), abs(length(q) - size * 0.38)) - u_thick * 0.3;
      else d = length(q) - size * 0.5;
      float aa = fwidth(d) + 0.0015;
      float mask = 1.0 - smoothstep(-aa, aa, d);
      float press = tfbm(p * 3.0 + u_so + seed, 0.5);
      float v = (1.0 - press) + (vnoise(p * 210.0 + u_so + seed) - 0.5) * 0.9;
      float cov = mask * (1.0 - u_voids * smoothstep(0.42, 0.85, v));
      return cov * (0.82 + 0.18 * press);
    }
    vec3 tex(vec2 p, vec2 uv){
      vec3 c = u_bg;
      c = mix(c, u_dirt, 0.12 * fbm(p * 4.0 + u_so));
      c = inkOn(c, u_ink1, t_stamp(p, u_size, u_angle, vec2(u_x, u_y), 0.0));
      if (u_second > 0.5) c = inkOn(c, u_ink2, t_stamp(p, u_size * 0.42, u_angle * -2.0 + 20.0, vec2(u_x + 0.2, u_y - 0.28), 11.0));
      return c;
    }
  `,
});
