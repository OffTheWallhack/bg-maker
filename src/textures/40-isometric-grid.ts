import { R, T, defineTexture } from './define';

export default defineTexture({
  id: 'isometric-grid', name: 'Izometrická mriežka', category: 'geometry',
  params: [
    R('size', 'Veľkosť poľa', 3, 40, 12, 0.5),
    R('angle', 'Natočenie', 0, 60, 0, 1),
    R('thick', 'Hrúbka čiar', 0.2, 4, 1.0),
    R('fill', 'Vyplnené trojuholníky', 0, 1, 0.3),
    R('flow', 'Mierka výplne', 0.3, 4, 1.2),
    R('tone', 'Rozdiel tónov', 0, 1, 0.6),
    T('dots', 'Body v uzloch', true),
  ],
  glsl: /* glsl */ `
    vec3 tex(vec2 p, vec2 uv){
      vec2 q = rot(radians(u_angle)) * p * u_size;
      float A = q.y;
      float B = dot(q, vec2(0.8660254, -0.5));
      float C = dot(q, vec2(-0.8660254, -0.5));
      vec3 fl = floor(vec3(A, B, C));
      vec3 fr = vec3(A, B, C) - fl;
      vec3 dl = min(fr, 1.0 - fr);
      float w = u_thick * 0.0006 * u_size;
      float lines = max(aaLine(dl.x, w), max(aaLine(dl.y, w), aaLine(dl.z, w)));
      float tri = hash(fl + u_so.x);
      float field = tfbm(p * u_flow + u_so, 0.7);
      float on = step(tri, u_fill * (0.3 + 1.4 * field) );
      float up = mod(fl.x + fl.y + fl.z, 2.0);
      float tone = hash(vec3(fl.yz, fl.x) + 4.0);
      vec3 col = ramp(0.2 + 0.8 * mix(0.5, tone, u_tone) * (0.65 + 0.35 * up));
      vec3 c = u_bg;
      c = mix(c, col, on * 0.9);
      c = inkOn(c, u_ink1, lines * 0.6);
      if (u_dots > 0.5){
        float m = max(dl.x, max(dl.y, dl.z));
        c = inkOn(c, u_ink2, (1.0 - smoothstep(w * 2.0, w * 2.0 + fwidth(m) * 1.5 + 0.001, m)) * 0.95);
      }
      return c;
    }
  `,
});
