import { R, defineTexture } from './define';

export default defineTexture({
  id: 'agate', name: 'Achát – vrstvy minerálu', category: 'nature',
  params: [
    R('scale', 'Mierka', 0.3, 3, 0.9),
    R('bands', 'Počet vrstiev', 3, 40, 16, 1),
    R('warp', 'Zvlnenie', 0, 2, 1.0),
    R('line', 'Hrúbka predelov', 0, 0.3, 0.06),
    R('grain', 'Kryštalické zrno', 0, 1, 0.3),
    R('soft', 'Mäkkosť farieb', 0, 1, 0.6),
  ],
  glsl: /* glsl */ `
    vec3 tex(vec2 p, vec2 uv){
      vec2 s = p * u_scale + u_so;
      vec2 q = vec2(tfbm(s, 0.7), tfbm(s + 5.0, 0.7));
      float h = tfbm(s * 0.8 + u_warp * 1.6 * q, 0.7) + 0.4 * length(p) * 0.0;
      float x = h * u_bands;
      float id = floor(x);
      float f = fract(x);
      float tone = mix(hash(id + u_so.x), 0.5 + 0.5 * sin(id * 0.9), u_soft);
      vec3 c = ramp(0.1 + 0.9 * clamp(tone * 0.8 + f * 0.25 * u_soft, 0.0, 1.0));
      float ln = 1.0 - smoothstep(0.0, u_line + fwidth(x), min(f, 1.0 - f));
      c = mix(c, u_bg * 0.6, ln * step(0.001, u_line));
      c *= 1.0 - u_grain * 0.25 * vnoise(p * 450.0 + u_so);
      return c;
    }
  `,
});
