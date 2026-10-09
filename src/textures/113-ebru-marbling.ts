import { R, defineTexture } from './define';

export default defineTexture({
  id: 'ebru-marbling', name: 'Ebru – mramorovaný papier', category: 'nature',
  params: [
    R('freq', 'Hustota pásov', 2, 30, 9),
    R('comb', 'Hrebeň (frekvencia)', 1, 20, 6),
    R('amp', 'Sila hrebeňa', 0, 0.3, 0.1),
    R('warp', 'Zvlnenie', 0, 2, 0.8),
    R('angle', 'Uhol', 0, 180, 0, 1),
    R('lines', 'Predely medzi farbami', 0, 1, 0.5),
  ],
  glsl: /* glsl */ `
    vec3 tex(vec2 p, vec2 uv){
      vec2 q = rot(radians(u_angle)) * p;
      float w = (tfbm(q * 1.4 + u_so, 0.5) - 0.5) * u_warp * 0.5;
      float y = q.y + w + u_amp * sin(q.x * u_comb * 1.0 + 3.0 * (tfbm(q * 0.8 + u_so + 3.0, 0.5) - 0.5)) * (0.5 + 0.5 * sin(q.y * 7.0));
      y += u_amp * 0.6 * sin(q.x * u_comb * 2.3 + 5.0 * w) ;
      float x = y * u_freq;
      float id = floor(x);
      float f = fract(x);
      vec3 col = palc(int(mod(id + floor(hash(id + u_so) * 3.0), 5.0)));
      col = mix(col, palc(1 + int(floor(hash(id + 7.0) * 3.0))), 0.35);
      col *= 0.85 + 0.25 * vnoise(vec2(q.x * 30.0, id));
      float ln = (1.0 - smoothstep(0.0, 0.05 + fwidth(x), min(f, 1.0 - f))) * u_lines;
      col = mix(col, u_bg * 0.6, ln * 0.5);
      return col;
    }
  `,
});
