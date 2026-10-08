import { R, S, defineTexture } from './define';

export default defineTexture({
  id: 'dither-gradient', name: 'Stochastický dither prechod', category: 'print',
  params: [
    R('cell', 'Veľkosť pixelu', 3, 24, 6, 1),
    S('method', 'Metóda', ['Bayer', 'Šum', 'Gradient noise'], 2),
    R('angle', 'Uhol', 0, 360, 200, 1),
    R('range', 'Dĺžka prechodu', 0.4, 3, 1.2),
    R('warp', 'Zvlnenie', 0, 1.5, 0.6),
    R('gamma', 'Gamma', 0.4, 2.5, 1.1),
    R('second', 'Druhá farba', 0, 1, 0.7),
  ],
  glsl: /* glsl */ `
    float t_thr(vec2 g){
      if (u_method < 0.5) return bayer(g);
      if (u_method < 1.5) return hash(g + u_so);
      return fract(52.9829189 * fract(dot(g, vec2(0.06711056, 0.00583715))));
    }
    vec3 tex(vec2 p, vec2 uv){
      float N = 1080.0 / u_cell;
      vec2 g = floor(p * N + vec2(2000.0));
      vec2 q = rot(radians(u_angle)) * p;
      float f = clamp(0.5 + q.y * u_range + (tfbm(p * 1.4 + u_so, 0.8) - 0.5) * u_warp, 0.0, 1.0);
      f = pow(f, u_gamma);
      float f2 = clamp(0.5 - q.x * u_range * 0.8 + (tfbm(p * 2.0 + u_so + 9.0, 0.8) - 0.5) * u_warp, 0.0, 1.0) * u_second;
      float m1 = step(t_thr(g), f);
      float m2 = step(t_thr(g + vec2(3.0, 5.0)), f2 * f2);
      return inkOn(inkOn(u_bg, u_ink1, m1), u_ink2, m2 * 0.9);
    }
  `,
});
