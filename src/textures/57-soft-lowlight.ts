import { R, defineTexture } from './define';

export default defineTexture({
  id: 'soft-lowlight', name: 'Jemné svetlo v tme (low light)', category: 'soft',
  params: [
    R('count', 'Počet svetiel', 1, 6, 4, 1),
    R('spread', 'Rozptyl', 0.3, 1.5, 0.9),
    R('size', 'Veľkosť svetla', 0.15, 0.8, 0.38),
    R('intens', 'Intenzita', 0.2, 2, 0.5),
    R('haze', 'Opar', 0, 1, 0.35),
    R('drift', 'Pohyb', 0, 1, 0.4),
  ],
  glsl: /* glsl */ `
    vec3 tex(vec2 p, vec2 uv){
      float asp = u_res.x / u_res.y;
      vec3 c = u_bg;
      for (int i = 0; i < 6; i++){
        if (float(i) >= u_count) break;
        float fi = float(i);
        vec3 h = hash3(vec2(fi, 5.0) + u_so);
        vec2 ctr = (h.xy - 0.5) * vec2(asp, 1.0) * u_spread + u_drift * 0.08 * vec2(cos(TT + fi * 1.3), sin(TT + fi * 2.1));
        float r = u_size * (0.6 + 0.8 * h.z);
        vec2 d = p - ctr;
        float g = exp(-dot(d, d) / (r * r));
        c += palc(1 + int(mod(fi, 3.0))) * g * u_intens * (0.35 + 0.65 * hash(vec2(fi, 9.0)));
      }
      c += ramp(0.5) * u_haze * 0.18 * tfbm(p * 1.6 + u_so, 0.6);
      c = c / (1.0 + c * 0.9);
      return c;
    }
  `,
});
