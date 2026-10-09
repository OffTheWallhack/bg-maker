import { R, defineTexture } from './define';

export default defineTexture({
  id: 'tech-drawing', name: 'Technický výkres (návod)', category: 'print',
  params: [
    R('cells', 'Veľkosť poľa (počet)', 3, 14, 6, 0.5),
    R('thick', 'Hrúbka čiar', 0.3, 3, 1.0),
    R('density', 'Hustota prvkov', 0.2, 1, 0.75),
    R('dash', 'Čiarkovanie', 4, 40, 16),
    R('accent', 'Akcentová farba', 0, 1, 0.25),
    R('grid', 'Podkladová mriežka', 0, 1, 0.2),
  ],
  glsl: /* glsl */ `
    float t_ln(float d, float w){ return aaLine(d, w); }
    vec3 tex(vec2 p, vec2 uv){
      vec2 q = p * u_cells;
      vec2 id = floor(q);
      vec2 f = fract(q) - 0.5;
      vec3 h = hash3(id + u_so);
      float w = u_thick * 0.0016 * u_cells;
      float ink = 0.0, acc = 0.0;
      vec2 g = abs(fract(q * 4.0) - 0.5);
      float grid = max(t_ln(g.x, w * 0.3), t_ln(g.y, w * 0.3)) * u_grid;
      if (h.x < u_density){
        float typ = floor(h.y * 5.0);
        vec2 r = rot(floor(h.z * 4.0) * 0.5236 * 0.0 + (h.z - 0.5) * 0.6) * f;
        if (typ < 0.5){
          vec2 b = abs(r) - vec2(0.28, 0.2) * (0.6 + 0.8 * hash(id + 3.0));
          float d = length(max(b, 0.0)) + min(max(b.x, b.y), 0.0);
          ink = t_ln(abs(d), w);
          ink = max(ink, t_ln(abs(r.x), w * 0.8) * step(abs(r.y), 0.12) * step(0.5, hash(id + 5.0)));
        } else if (typ < 1.5){
          float x = r.x * u_dash;
          float dash = step(0.5, fract(x));
          float ln = t_ln(abs(r.y), w) * step(abs(r.x), 0.42) * dash;
          vec2 a = r - vec2(0.42, 0.0);
          float head = t_ln(abs(abs(a.y) - (a.x + 0.0) * -1.0 * 0.0 - 0.0), 0.0) * 0.0;
          float tri = step(0.0, -a.x) * step(abs(a.y), -a.x * 0.45) * step(-a.x, 0.1);
          ink = max(ln, tri * 0.0 + tri * 1.0);
        } else if (typ < 2.5){
          float l1 = t_ln(abs(r.x + 0.2), w) * step(abs(r.y), 0.3);
          float l2 = t_ln(abs(r.y - 0.3), w) * step(r.x, 0.3) * step(-0.2, r.x);
          vec2 a = r - vec2(0.3, 0.3);
          float tri = step(-a.x, 0.1) * step(0.0, -a.x) * step(abs(a.y), -a.x * 0.5);
          ink = max(max(l1, l2), tri);
        } else if (typ < 3.5){
          float cx = max(t_ln(abs(r.x), w), t_ln(abs(r.y), w)) * step(max(abs(r.x), abs(r.y)), 0.3);
          ink = cx;
          acc = cx;
        } else {
          float hat = t_ln(abs(fract((r.x + r.y) * 9.0) - 0.5) * 0.12, w * 0.5) * step(max(abs(r.x), abs(r.y)), 0.28);
          ink = hat;
        }
      }
      float isAcc = step(1.0 - u_accent * 0.4, hash(id + 9.0)) * step(0.001, ink);
      vec3 c = u_bg;
      c = mix(c, u_ink1 * 0.7, grid);
      c = mix(c, u_ink1, clamp(ink, 0.0, 1.0));
      c = mix(c, u_ink2, clamp(ink, 0.0, 1.0) * isAcc);
      return c;
    }
  `,
});
