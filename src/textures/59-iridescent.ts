import { R, defineTexture } from './define';

export default defineTexture({
  id: 'iridescent', name: 'Perleťový / dúhový film', category: 'soft',
  params: [
    R('scale', 'Mierka', 0.3, 4, 1.1),
    R('bands', 'Počet farebných pásov', 0.5, 6, 1.8),
    R('rainbow', 'Dúhovosť', 0, 1, 0.6),
    R('hue', 'Posun farieb', 0, 1, 0.0),
    R('warp', 'Zvlnenie', 0, 1.5, 0.7),
    R('dark', 'Tmavosť', 0, 1, 0.55),
  ],
  glsl: /* glsl */ `
    vec3 tex(vec2 p, vec2 uv){
      vec2 s = p * u_scale + u_so;
      vec2 q = vec2(tfbm(s, 0.8), tfbm(s + 4.0, 0.8));
      float n = tfbm(s + u_warp * 2.0 * q, 0.8);
      vec3 rb = 0.5 + 0.5 * cos(TAU * (n * u_bands + vec3(0.0, 0.33, 0.67) + u_hue));
      float v = clamp(n * 1.2 - 0.1, 0.0, 1.0);
      vec3 base = ramp(v);
      vec3 c = mix(base, rb * (0.35 + 0.65 * v), u_rainbow);
      c *= 1.0 - u_dark * 0.55 * (1.0 - v);
      return c;
    }
  `,
});
