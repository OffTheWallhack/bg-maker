import { R, defineTexture } from './define';

export default defineTexture({
  id: 'brutalist-blocks', name: 'Brutalistické bloky', category: 'geometry',
  params: [
    R('depth', 'Počet delení', 2, 7, 5, 1),
    R('gap', 'Škára', 0, 0.02, 0.005, 0.001),
    R('empty', 'Prázdne bloky', 0, 0.8, 0.35),
    R('lines', 'Rastrované bloky', 0, 1, 0.3),
    R('grad', 'Prechody', 0, 1, 0.3),
    R('ratio', 'Nepravidelnosť', 0, 1, 0.6),
  ],
  glsl: /* glsl */ `
    vec3 tex(vec2 p, vec2 uv){
      float asp = u_res.x / u_res.y;
      vec2 lo = vec2(-asp * 0.5, -0.5), hi = vec2(asp * 0.5, 0.5);
      float id = 1.0;
      for (int i = 0; i < 7; i++){
        if (float(i) >= u_depth) break;
        float fi = float(i);
        float r = mix(0.5, 0.2 + 0.6 * hash(vec2(id, fi + 3.0) + u_so), u_ratio);
        bool vert = (hi.x - lo.x) > (hi.y - lo.y) * (0.7 + 0.6 * hash(vec2(id, fi + 9.0) + u_so));
        if (vert){ float m = mix(lo.x, hi.x, r); if (p.x < m){ hi.x = m; id = id * 2.0; } else { lo.x = m; id = id * 2.0 + 1.0; } }
        else { float m = mix(lo.y, hi.y, r); if (p.y < m){ hi.y = m; id = id * 2.0; } else { lo.y = m; id = id * 2.0 + 1.0; } }
      }
      float h = hash(vec2(id, 77.0) + u_so);
      float typ = hash(vec2(id, 55.0) + u_so);
      vec3 col = h < 0.4 ? u_ink1 : (h < 0.7 ? u_ink2 : (h < 0.9 ? u_hi : u_dirt));
      vec2 q = (p - lo) / (hi - lo);
      vec3 c = u_bg;
      float cov = 1.0;
      if (typ < u_empty) cov = 0.0;
      else if (typ < u_empty + u_grad * 0.5){ c = mix(u_bg, col, q.y); cov = 0.0; }
      else if (typ < u_empty + u_grad * 0.5 + u_lines * 0.5){ cov = htLines(p, 70.0, 0.0, 0.55); }
      c = mix(c, col, cov);
      float edge = min(min(p.x - lo.x, hi.x - p.x), min(p.y - lo.y, hi.y - p.y));
      c = mix(c, u_bg * 0.5, 1.0 - smoothstep(u_gap, u_gap + 0.002, edge));
      c *= 0.94 + 0.06 * rgrain(p + SOF, 700.0);
      return c;
    }
  `,
});
