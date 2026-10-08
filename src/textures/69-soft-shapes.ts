import { R, defineTexture } from './define';

export default defineTexture({
  id: 'soft-shapes', name: 'Mäkké organické tvary', category: 'gradient',
  params: [
    R('count', 'Počet tvarov', 1, 4, 3, 1),
    R('scale', 'Veľkosť', 0.4, 3, 1.0),
    R('cover', 'Pokrytie', 0.2, 0.8, 0.5),
    R('edge', 'Mäkkosť hrán', 0.005, 0.3, 0.05),
    R('shadow', 'Tieň', 0, 1, 0.5),
    R('gradient', 'Prechod vo vnútri', 0, 1, 0.8),
  ],
  glsl: /* glsl */ `
    vec3 tex(vec2 p, vec2 uv){
      vec3 c = mix(u_bg, ramp(0.25), 0.4 * smoothstep(0.7, -0.4, p.y));
      for (int i = 0; i < 4; i++){
        if (float(i) >= u_count) break;
        float fi = float(i);
        float f = tfbm(p * u_scale * 0.9 + u_so + fi * 11.3, 0.5);
        float thr = 1.0 - u_cover;
        float m = smoothstep(thr, thr + u_edge, f);
        float sh = smoothstep(thr - 0.12, thr + 0.02, f) * (1.0 - m);
        c *= 1.0 - sh * u_shadow * 0.55;
        float g = clamp(0.5 + (f - thr) * 3.0 + p.y * 0.8 * u_gradient, 0.0, 1.0);
        vec3 fill = mix(palc(1 + int(mod(fi, 3.0))), palc(1 + int(mod(fi + 1.0, 3.0))), g * u_gradient);
        c = mix(c, fill, m);
      }
      return c;
    }
  `,
});
