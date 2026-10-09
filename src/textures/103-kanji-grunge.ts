import { R, defineTexture } from './define';

export default defineTexture({
  id: 'kanji-grunge', name: 'Grunge ťahy (visual kei)', category: 'print',
  params: [
    R('cells', 'Počet znakov (šírka)', 3, 16, 6, 1),
    R('thick', 'Hrúbka ťahov', 0.06, 0.3, 0.14),
    R('density', 'Hustota ťahov', 0.3, 1, 0.65),
    R('distress', 'Rozpadnutosť', 0, 1, 0.55),
    R('grad', 'Prechod pozadia', 0, 1, 0.9),
    R('angle', 'Sklon pozadia', 0, 360, 100, 1),
  ],
  glsl: /* glsl */ `
    float t_bar(vec2 f, vec2 a, vec2 b, float w){ return 1.0 - smoothstep(w * 0.9, w, segDist(f, a, b)); }
    vec3 tex(vec2 p, vec2 uv){
      float asp = u_res.x / u_res.y;
      vec2 q = vec2(p.x + asp * 0.5, p.y + 0.5) * u_cells / asp;
      vec2 id = floor(q);
      vec2 f = fract(q);
      vec3 h = hash3(id + u_so);
      vec3 h2 = hash3(id + u_so + 17.0);
      float w = u_thick;
      float m = 0.0;
      vec2 jit = (h.xy - 0.5) * 0.1;
      if (h.x < u_density + 0.2) m = max(m, t_bar(f, vec2(0.1, 0.2) + jit, vec2(0.9, 0.2 + (h.z - 0.5) * 0.1), w));
      if (h.y < u_density) m = max(m, t_bar(f, vec2(0.15, 0.5), vec2(0.85, 0.5 + (h2.x - 0.5) * 0.12), w));
      if (h.z < u_density) m = max(m, t_bar(f, vec2(0.1, 0.82), vec2(0.9, 0.82), w));
      if (h2.x < u_density) m = max(m, t_bar(f, vec2(0.3 + jit.x, 0.05), vec2(0.3 + jit.x, 0.95), w));
      if (h2.y < u_density) m = max(m, t_bar(f, vec2(0.7 + jit.y, 0.05), vec2(0.7 + jit.y, 0.95), w));
      if (h2.z < u_density * 0.7) m = max(m, t_bar(f, vec2(0.15, 0.9), vec2(0.85, 0.1), w * 0.9));
      if (h.x > 0.6 && h2.z > 0.5) m = max(m, t_bar(f, vec2(0.15, 0.1), vec2(0.85, 0.9), w * 0.9));
      float er = vnoise(p * 260.0 + u_so) * 0.6 + vnoise(p * 70.0 + u_so + 3.0) * 0.4;
      float rough = smoothstep(0.3 + 0.35 * u_distress, 0.7, er);
      m *= 1.0 - u_distress * 0.8 * (1.0 - rough);
      m = smoothstep(0.35, 0.65, m);
      vec2 qg = rot(radians(u_angle)) * p;
      float t = clamp(0.5 + qg.y * 1.3 + (tfbm(p * 1.2 + u_so, 0.5) - 0.5) * 0.4, 0.0, 1.0);
      vec3 paper = mix(u_ink1, u_ink2, smoothstep(0.1, 0.9, t) * u_grad);
      vec3 c = mix(paper, u_bg, m);
      c *= 0.93 + 0.07 * vnoise(p * 500.0 + u_so);
      return c;
    }
  `,
});
