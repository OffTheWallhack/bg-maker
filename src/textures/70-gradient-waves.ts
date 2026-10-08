import { R, defineTexture } from './define';

export default defineTexture({
  id: 'gradient-waves', name: 'Gradientové vlny', category: 'gradient',
  params: [
    R('layers', 'Počet vĺn', 2, 8, 5, 1),
    R('amp', 'Výška vĺn', 0.02, 0.35, 0.12),
    R('freq', 'Dĺžka vĺn', 0.3, 3, 1.0),
    R('edge', 'Mäkkosť hrany', 0.002, 0.15, 0.01),
    R('shadow', 'Tieň', 0, 1, 0.6),
    R('tilt', 'Sklon', -0.5, 0.5, 0.1),
  ],
  glsl: /* glsl */ `
    vec3 tex(vec2 p, vec2 uv){
      float asp = u_res.x / u_res.y;
      vec3 c = u_bg;
      for (int i = 0; i < 8; i++){
        if (float(i) >= u_layers) break;
        float fi = float(i);
        float t = fi / max(u_layers - 1.0, 1.0);
        float base = mix(0.4, -0.35, t);
        float x = p.x * u_freq;
        float y = base + p.x * u_tilt
          + u_amp * sin(x * 3.0 + fi * 1.9 + TT + u_so.x)
          + u_amp * 0.5 * sin(x * 7.3 - fi * 2.7 - TT + u_so.y)
          + (vnoise(vec2(x * 1.5, fi * 3.0) + u_so) - 0.5) * u_amp * 1.5;
        float d = p.y - y;
        float m = 1.0 - smoothstep(-u_edge, u_edge, d);
        float sh = (1.0 - smoothstep(0.0, 0.15, -d)) * step(d, 0.0) * 0.0;
        float shadowAbove = smoothstep(0.12, 0.0, d) * step(0.0, d);
        c *= 1.0 - shadowAbove * u_shadow * 0.45;
        float g = clamp(1.0 + d * 2.2, 0.0, 1.0);
        vec3 col = mix(ramp(0.15 + 0.8 * t), ramp(0.05 + 0.9 * t * 0.8), g) * (0.75 + 0.35 * g);
        c = mix(c, col, m);
      }
      return c;
    }
  `,
});
