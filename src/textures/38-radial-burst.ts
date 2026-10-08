import { R, defineTexture } from './define';

export default defineTexture({
  id: 'radial-burst', name: 'Radiálny výbuch (jemný)', category: 'geometry',
  params: [
    R('rays', 'Počet lúčov', 8, 160, 54, 1),
    R('cx', 'Stred X', -0.5, 0.5, 0.0),
    R('cy', 'Stred Y', -0.5, 0.5, 0.05),
    R('thr', 'Prah (hrúbka)', 0.3, 0.8, 0.52),
    R('soft', 'Mäkkosť', 0.01, 0.4, 0.06),
    R('fall', 'Útlm', 0, 3, 1.1),
    R('hole', 'Prázdny stred', 0, 0.4, 0.06),
    R('twist', 'Špirála', -2, 2, 0.3),
  ],
  glsl: /* glsl */ `
    float t_rays(vec2 d, float n, float seed){
      float a = atan(d.y, d.x) + u_twist * length(d) + 0.1 * sin(TT + seed);
      float v = vnoise(vec2(cos(a), sin(a)) * n * 0.16 + u_so + seed);
      v = 0.6 * v + 0.4 * vnoise(vec2(cos(a), sin(a)) * n * 0.45 + u_so + seed + 4.0);
      return smoothstep(u_thr - u_soft, u_thr + u_soft, v);
    }
    vec3 tex(vec2 p, vec2 uv){
      vec2 d = p - vec2(u_cx, u_cy);
      float r = length(d);
      float f = exp(-r * u_fall) * smoothstep(u_hole * 0.5, u_hole + 0.04, r);
      float r1 = t_rays(d, u_rays, 0.0);
      float r2 = t_rays(d, u_rays * 0.45, 7.0);
      vec3 c = u_bg;
      c = inkOn(c, u_ink2, r2 * f * 0.7);
      c = inkOn(c, u_ink1, r1 * f * 0.9);
      c += u_hi * 0.25 * exp(-r * 9.0);
      return c;
    }
  `,
});
