import { R, S, defineTexture } from './define';

export default defineTexture({
  id: 'sashiko', name: 'Sashiko – prešívanie', category: 'folk',
  params: [
    S('pattern', 'Vzor', ['Kosoštvorce', 'Vlny', 'Štvorce'], 0),
    R('size', 'Veľkosť vzoru', 3, 24, 9, 0.5),
    R('dash', 'Dĺžka stehu', 4, 40, 14),
    R('thick', 'Hrúbka nite', 0.02, 0.12, 0.05),
    R('wobble', 'Neistá ruka', 0, 1, 0.4),
    R('cloth', 'Látka', 0, 1, 0.6),
  ],
  glsl: /* glsl */ `
    vec3 tex(vec2 p, vec2 uv){
      vec2 w = p + (vec2(fbm(p * 20.0 + u_so), fbm(p * 20.0 + u_so + 3.0)) - 0.5) * u_wobble * 0.006;
      vec2 q = w * u_size;
      float d1, d2, along;
      if (u_pattern < 0.5){
        vec2 r = vec2(q.x + q.y, q.x - q.y) * 0.7071;
        d1 = abs(fract(r.x + 0.5) - 0.5); d2 = abs(fract(r.y + 0.5) - 0.5);
        along = max(0.0, 1.0) * (d1 < d2 ? r.y : r.x);
      } else if (u_pattern < 1.5){
        float y = q.y + 0.3 * sin(q.x * 3.14159);
        d1 = abs(fract(y + 0.5) - 0.5); d2 = abs(fract(q.x * 0.5 + 0.5) - 0.5) * 2.0 + 0.0;
        d2 = abs(fract(q.y + 0.3 * sin((q.x + 1.0) * 3.14159) + 0.5) - 0.5) + 0.0;
        along = q.x; d2 = 9.0;
      } else {
        d1 = abs(fract(q.x + 0.5) - 0.5); d2 = abs(fract(q.y + 0.5) - 0.5);
        along = d1 < d2 ? q.y : q.x;
      }
      float dd = min(d1, d2);
      float stitchPh = (d1 < d2 ? (u_pattern < 0.5 ? (q.x - q.y) * 0.7071 : (u_pattern < 1.5 ? q.x : q.y)) : (u_pattern < 0.5 ? (q.x + q.y) * 0.7071 : q.x)) * u_dash * 0.1;
      float dash = step(0.35, fract(stitchPh));
      float w2 = u_thick;
      float aa = fwidth(dd) * 1.2 + 0.004;
      float ln = (1.0 - smoothstep(w2 - aa, w2 + aa, dd)) * dash;
      vec2 cg = fract(p * 380.0);
      float weave = 0.5 + 0.5 * sin(p.x * 1100.0) * sin(p.y * 1100.0);
      vec3 cloth = u_bg * (1.0 - u_cloth * 0.18 * weave) * (0.92 + 0.14 * fbm(p * 5.0 + u_so));
      vec3 thread = u_ink1 * (0.9 + 0.1 * vnoise(p * 600.0 + u_so));
      return mix(cloth, thread, ln);
    }
  `,
});
