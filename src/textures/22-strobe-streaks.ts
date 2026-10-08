import { R, defineTexture } from './define';

export default defineTexture({
  id: 'strobe-streaks', name: 'Strobe – dlhá expozícia', category: 'light',
  params: [
    R('angle', 'Uhol', 0, 180, 72, 1),
    R('density', 'Hustota', 10, 120, 46, 1),
    R('length', 'Dĺžka', 0.1, 1.5, 0.7),
    R('thick', 'Hrúbka', 0.05, 1, 0.3),
    R('glow', 'Žiara', 0, 1.5, 0.7),
    R('layers', 'Vrstvy', 1, 3, 2, 1),
    R('haze', 'Hmla', 0, 1, 0.4),
  ],
  glsl: /* glsl */ `
    vec3 tex(vec2 p, vec2 uv){
      vec2 q = rot(radians(u_angle)) * p;
      vec3 c = u_bg;
      c += ramp(0.45) * 0.18 * u_haze * tfbm(p * 1.6 + u_so, 0.7);
      for (int L = 0; L < 3; L++){
        if (float(L) >= u_layers) break;
        float fl = float(L);
        float N = u_density * (1.0 + fl * 0.8);
        float x = q.x * N + fl * 31.0;
        float id = floor(x);
        float fx = fract(x) - 0.5;
        vec3 h = hash3(vec2(id, fl + 3.0) + u_so);
        float on = step(0.42, h.x);
        float cy = (h.y - 0.5) * 1.6 + 0.08 * sin(TT + id);
        float len = u_length * (0.15 + 0.85 * h.z);
        float dy = abs(q.y - cy) - len * 0.5;
        float fadeY = 1.0 - smoothstep(0.0, len * 0.5 + 0.02, abs(q.y - cy));
        float w = (0.05 + 0.4 * u_thick * hash(vec2(id, 7.0 + fl)));
        float core = exp(-pow(fx / w, 2.0)) * smoothstep(0.02, 0.0, dy);
        float halo = exp(-pow(fx / (w * 4.0 + 0.2), 2.0)) * smoothstep(0.1, 0.0, dy) * 0.3;
        float br = (core * (0.4 + 0.6 * fadeY) + halo * u_glow) * on * (0.4 + 0.6 * hash(vec2(id, 13.0)));
        vec3 col = palc(1 + int(floor(hash(vec2(id, 17.0 + fl) + u_so) * 3.0)));
        c += col * br;
      }
      return c;
    }
  `,
});
