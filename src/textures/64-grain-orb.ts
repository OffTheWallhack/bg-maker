import { R, defineTexture } from './define';

export default defineTexture({
  id: 'grain-orb', name: 'Zrnitá guľa svetla (grainy gradient)', category: 'gradient',
  params: [
    R('x', 'Pozícia X', -0.5, 0.5, 0.12),
    R('y', 'Pozícia Y', -0.5, 0.5, -0.1),
    R('size', 'Veľkosť', 0.2, 1.4, 0.65),
    R('fall', 'Útlm', 0.4, 3, 1.3),
    R('dither', 'Zrnitosť', 0, 1.5, 0.8),
    R('grit', 'Veľkosť zrna', 0.5, 3, 1.0),
    R('second', 'Druhé svetlo', 0, 1, 0.6),
  ],
  glsl: /* glsl */ `
    float t_orb(vec2 p, vec2 c0, float r, float seed){
      vec2 d = (p - c0) / r;
      d += (vec2(fbm(p * 2.0 + u_so + seed), fbm(p * 2.0 + u_so + seed + 3.0)) - 0.5) * 0.3;
      float f = clamp(1.0 - length(d), 0.0, 1.0);
      f = pow(f, u_fall);
      float n = rgrain(p + SOF + seed, 900.0 / u_grit);
      return clamp((f - (n - 0.5) * u_dither * 0.9) * 1.0 + (f - 0.5) * 0.0, 0.0, 1.0) * smoothstep(0.0, 0.03, f);
    }
    vec3 tex(vec2 p, vec2 uv){
      vec3 c = u_bg;
      float a = t_orb(p, vec2(u_x, u_y), u_size, 0.0);
      float b = t_orb(p, vec2(-u_x * 1.4 - 0.1, -u_y + 0.35), u_size * 0.7, 5.0) * u_second;
      c = mix(c, mix(u_ink2, u_ink1, a), smoothstep(0.0, 0.35, a));
      c = inkOn(c, u_hi, b * 0.9);
      return c;
    }
  `,
});
