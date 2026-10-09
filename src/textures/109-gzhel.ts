import { R, defineTexture } from './define';

export default defineTexture({
  id: 'gzhel', name: 'Modrý ornament (gzhel)', category: 'folk',
  params: [
    R('rows', 'Počet radov', 2, 10, 5, 1),
    R('leaves', 'Listy vo vejári', 3, 9, 5, 1),
    R('size', 'Veľkosť listov', 0.1, 0.5, 0.26),
    R('stem', 'Stonka', 0, 1, 0.7),
    R('wash', 'Akvarelový prechod', 0, 1, 0.7),
    R('rough', 'Neistá ruka', 0, 1, 0.4),
  ],
  glsl: /* glsl */ `
    float t_lens(vec2 f, float len, float wid){
      float t = clamp(f.y / len, 0.0, 1.0);
      float w = wid * 4.0 * t * (1.0 - t) * (1.0 - 0.3 * t);
      return abs(f.x) - w;
    }
    vec3 tex(vec2 p, vec2 uv){
      vec2 q = vec2(abs(p.x), p.y);
      q += (vec2(fbm(p * 8.0 + u_so), fbm(p * 8.0 + u_so + 3.0)) - 0.5) * u_rough * 0.012;
      float rowH = 1.0 / u_rows;
      float ry = (q.y + 0.5) / rowH;
      float rid = floor(ry);
      vec2 f = vec2(q.x, (fract(ry) - 0.1) * rowH);
      float tone = 0.0, m = 0.0;
      float len = u_size * 0.9;
      float wob = (hash(vec2(rid, 3.0) + u_so) - 0.5) * 0.3;
      for (int i = 0; i < 9; i++){
        if (float(i) >= u_leaves) break;
        float t = (float(i) + 0.5) / u_leaves - 0.5;
        float ang = t * 2.2 + wob;
        vec2 r = rot(-ang) * (f - vec2(0.0, 0.0));
        float d = t_lens(vec2(r.x, r.y), len * (1.0 - abs(t) * 0.5), 0.07 * (1.0 - abs(t) * 0.3));
        float aa = fwidth(d) + 0.0015;
        float mm = 1.0 - smoothstep(-aa, aa, d);
        float inner = clamp(-d / 0.03, 0.0, 1.0);
        tone = max(tone, mm * (1.0 - u_wash * 0.65 * inner));
        m = max(m, mm);
      }
      float stem = (1.0 - smoothstep(0.003, 0.006, abs(f.x))) * step(-0.05 * rowH, f.y) * step(f.y, rowH * 0.85) * u_stem;
      float sd = abs(f.x - 0.0) ;
      tone = max(tone, stem * 0.9);
      m = max(m, stem);
      float blob = (1.0 - smoothstep(0.012, 0.02, length(f - vec2(0.0, rowH * 0.88)))) * u_stem;
      m = max(m, blob); tone = max(tone, blob);
      vec3 paper = u_bg * (0.96 + 0.04 * fbm(p * 12.0 + u_so));
      float granul = 0.9 + 0.2 * vnoise(p * 300.0 + u_so);
      return mix(paper, mix(paper, u_ink1, 0.95) * mix(1.0, 0.85, granul - 0.9), clamp(tone * m, 0.0, 1.0));
    }
  `,
});
