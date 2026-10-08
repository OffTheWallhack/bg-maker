import { R, S, defineTexture } from './define';

export default defineTexture({
  id: 'swiss-bars', name: 'Swiss pruhy (bez typografie)', category: 'geometry',
  params: [
    S('orient', 'Orientácia', ['Zvislé', 'Vodorovné'], 0),
    R('count', 'Počet pruhov', 4, 32, 14, 1),
    R('vary', 'Rôznosť šírok', 0, 1, 0.8),
    R('gap', 'Medzera', 0, 0.3, 0.04),
    R('trunc', 'Skrátené pruhy', 0, 1, 0.5),
    R('grad', 'Prechody', 0, 1, 0.4),
    R('lines', 'Rastrované pruhy', 0, 1, 0.4),
    R('empty', 'Prázdne pruhy', 0, 0.8, 0.25),
  ],
  glsl: /* glsl */ `
    float t_w(float i){ return 0.25 + (hash(vec2(i, 2.0) + u_so) * 2.0) * u_vary + (1.0 - u_vary) * 0.9; }
    vec3 tex(vec2 p, vec2 uv){
      float asp = u_res.x / u_res.y;
      vec2 q = u_orient < 0.5 ? p : vec2(p.y, -p.x);
      float W = u_orient < 0.5 ? asp : 1.0;
      float H = u_orient < 0.5 ? 1.0 : asp;
      float x = q.x / W + 0.5;
      float y = q.y / H;
      float total = 0.0;
      for (int i = 0; i < 32; i++){ if (float(i) >= u_count) break; total += t_w(float(i)); }
      float pos = x * total, acc = 0.0, id = 0.0, lo = 0.0, wd = 1.0;
      for (int i = 0; i < 32; i++){
        if (float(i) >= u_count) break;
        float w = t_w(float(i));
        if (pos >= acc && pos < acc + w){ id = float(i); lo = acc; wd = w; }
        acc += w;
      }
      float fx = (pos - lo) / wd;
      float gapx = u_gap * 3.0 / wd;
      float inside = step(gapx * 0.5, fx) * step(fx, 1.0 - gapx * 0.5);
      vec3 h = hash3(vec2(id, 5.0) + u_so);
      float y0 = -0.5 + step(0.5, h.x) * h.y * 0.8 * u_trunc;
      float y1 = 0.5 - step(0.5, h.z) * hash(vec2(id, 9.0) + u_so) * 0.8 * u_trunc;
      float inY = step(y0, y) * step(y, y1);
      vec3 col = palc(1 + int(floor(hash(vec2(id, 21.0) + u_so) * 3.0)));
      float typ = hash(vec2(id, 31.0) + u_so);
      float t = clamp((y - y0) / max(y1 - y0, 0.01), 0.0, 1.0);
      vec3 c = u_bg;
      float cov = inside * inY;
      if (typ < u_empty){
        cov = 0.0;
      } else if (typ < u_empty + u_grad * 0.4){
        c = mix(u_bg, col, cov * t);
        cov = 0.0;
      } else if (typ < u_empty + u_grad * 0.4 + u_lines * 0.4){
        float ln = htLines(vec2(q.y, q.x), 90.0, 0.0, 0.6);
        c = mix(c, col, cov * ln);
        cov = 0.0;
      }
      c = mix(c, col, cov);
      c *= 0.94 + 0.06 * rgrain(p + SOF, 700.0);
      return c;
    }
  `,
});
