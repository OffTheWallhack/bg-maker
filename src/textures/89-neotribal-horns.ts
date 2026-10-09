import { R, T, defineTexture } from './define';

export default defineTexture({
  id: 'neotribal-horns', name: 'Neotribal – rohy zo spodu', category: 'tribal',
  params: [
    R('count', 'Počet rohov', 3, 20, 11, 1),
    R('dir', 'Hlavný smer', 40, 140, 92, 1),
    R('spread', 'Rozptyl', 5, 70, 34, 1),
    R('len', 'Dĺžka', 0.3, 1.4, 0.85),
    R('width', 'Šírka', 0.04, 0.3, 0.12),
    R('taper', 'Zbiehavosť', 0.6, 3, 1.1),
    R('bend', 'Zakrivenie von', -1, 1.5, 0.7),
    T('mirror', 'Zrkadlo', true),
  ],
  glsl: /* glsl */ `
    vec3 tex(vec2 p, vec2 uv){
      vec2 q = vec2(u_mirror > 0.5 ? abs(p.x) : p.x, p.y);
      vec3 c = u_bg + ramp(0.15) * 0.1 * smoothstep(0.9, -0.5, p.y);
      for (int i = 0; i < 20; i++){
        if (float(i) >= u_count) break;
        float fi = float(i);
        vec3 h = hash3(vec2(fi, 21.0) + u_so);
        vec2 o = vec2(h.x * 0.06, -0.58 + h.y * 0.12);
        float ang = radians(u_dir) + radians(u_spread) * (h.z * 2.0 - 1.0);
        vec2 dir = vec2(cos(ang), sin(ang)), perp = vec2(-dir.y, dir.x);
        float len = u_len * (0.45 + 0.7 * hash(vec2(fi, 23.0) + u_so));
        vec2 d = q - o;
        float t = dot(d, dir) / len;
        float s = dot(d, perp) + u_bend * (0.4 + h.x) * t * t * len + 0.015 * sin(TT + fi) * t;
        float w = u_width * len * pow(clamp(1.0 - t, 0.0, 1.0), u_taper) * smoothstep(0.0, 0.06, t);
        float aa = fwidth(s) + 0.0008;
        float m = step(0.0, t) * step(t, 1.0) * (1.0 - smoothstep(w - aa, w + aa, abs(s)));
        float lit = clamp(0.5 - 0.5 * s / max(w, 1e-4), 0.0, 1.0);
        vec3 col = ramp(0.1 + 0.9 * pow(lit, 1.5) * (0.6 + 0.4 * t));
        col = mix(col, u_ink1, (1.0 - smoothstep(0.0, 0.15, abs(s) / max(w, 1e-4))) * 0.3);
        c = mix(c, u_bg, smoothstep(w + 0.008 + aa, w, abs(s)) * step(0.0, t) * step(t, 1.0) * (1.0 - m) * 0.9);
        c = mix(c, col, m);
      }
      return c;
    }
  `,
});
