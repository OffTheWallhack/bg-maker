import { R, T, defineTexture } from './define';

export default defineTexture({
  id: 'neotribal-blades', name: 'Neotribal – ostré čepele', category: 'tribal',
  params: [
    R('count', 'Počet čepelí', 4, 24, 15, 1),
    R('dir', 'Hlavný smer', 0, 180, 68, 1),
    R('spread', 'Rozptyl smeru', 5, 120, 62, 1),
    R('len', 'Dĺžka', 0.15, 1.0, 0.55),
    R('width', 'Šírka', 0.03, 0.3, 0.1),
    R('taper', 'Zbiehavosť hrotu', 0.5, 3, 1.3),
    R('bend', 'Zakrivenie', -1, 1, 0.6),
    R('wobble', 'Organickosť', 0, 1, 0.3),
    T('mirror', 'Zrkadlová symetria', true),
  ],
  glsl: /* glsl */ `
    vec3 tex(vec2 p, vec2 uv){
      vec2 q = vec2(u_mirror > 0.5 ? abs(p.x) : p.x, p.y);
      q += (vec2(fbm(p * 2.0 + u_so), fbm(p * 2.0 + u_so + 4.0)) - 0.5) * u_wobble * 0.06;
      vec3 c = u_bg + ramp(0.2) * 0.12 * smoothstep(0.8, 0.0, length(p));
      for (int i = 0; i < 24; i++){
        if (float(i) >= u_count) break;
        float fi = float(i);
        vec3 h = hash3(vec2(fi, 7.0) + u_so);
        vec2 o = vec2(h.x * 0.1, mix(-0.5, 0.3, h.y));
        float ang = radians(u_dir) + radians(u_spread) * (h.z * 2.0 - 1.0);
        vec2 dir = vec2(cos(ang), sin(ang)), perp = vec2(-dir.y, dir.x);
        float len = u_len * (0.4 + 0.8 * hash(vec2(fi, 11.0) + u_so));
        vec2 d = q - o;
        float t = dot(d, dir) / len;
        float bend = u_bend * (hash(vec2(fi, 13.0) + u_so) - 0.3) * 2.0;
        float s = dot(d, perp) - bend * t * t * len * 0.8 + 0.03 * sin(TT + fi) * t;
        float w = u_width * len * pow(clamp(1.0 - t, 0.0, 1.0), u_taper) * smoothstep(0.0, 0.1, t);
        float aa = fwidth(s) + 0.0008;
        float m = step(0.0, t) * step(t, 1.0) * (1.0 - smoothstep(w - aa, w + aa, abs(s)));
        float lit = clamp(0.5 + 0.5 * s / max(w, 1e-4), 0.0, 1.0);
        float ridge = 1.0 - smoothstep(0.0, 0.18, abs(s) / max(w, 1e-4));
        vec3 col = ramp(0.15 + 0.85 * pow(lit, 1.4));
        col = mix(col, u_ink1, ridge * 0.35);
        float rim = smoothstep(0.82, 1.0, abs(s) / max(w, 1e-4));
        col = mix(col, u_bg, rim * 0.6);
        float outline = smoothstep(w + 0.006 + aa, w, abs(s)) * step(0.0, t) * step(t, 1.0);
        c = mix(c, u_bg, outline * (1.0 - m) * 0.9);
        c = mix(c, col, m);
      }
      return c;
    }
  `,
});
