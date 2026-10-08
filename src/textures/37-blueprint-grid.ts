import { R, T, defineTexture } from './define';

export default defineTexture({
  id: 'blueprint-grid', name: 'Mriežka / blueprint', category: 'geometry',
  params: [
    R('cells', 'Veľkosť poľa (počet)', 3, 20, 8, 0.5),
    R('sub', 'Delenie', 1, 10, 5, 1),
    R('angle', 'Natočenie', -45, 45, 0, 0.5),
    R('thick', 'Hrúbka čiar', 0.2, 3, 1.0),
    T('cross', 'Značky na priesečníkoch', true),
    T('circles', 'Konštrukčné kruhy', true),
    T('diag', 'Uhlopriečky', false),
    R('fade', 'Vyblednutie', 0, 1, 0.45),
  ],
  glsl: /* glsl */ `
    float t_ln(float d, float w){ return aaLine(d, w); }
    vec3 tex(vec2 p, vec2 uv){
      vec2 q = rot(radians(u_angle)) * p * u_cells;
      vec2 g = abs(fract(q + 0.5) - 0.5);
      float w = u_thick * 0.0007 * u_cells;
      float major = max(t_ln(g.x, w * 1.6), t_ln(g.y, w * 1.6));
      vec2 qm = q * u_sub;
      vec2 gm = abs(fract(qm + 0.5) - 0.5);
      float minor = max(t_ln(gm.x, w * u_sub * 0.9), t_ln(gm.y, w * u_sub * 0.9));
      float fadeM = 1.0 - u_fade * smoothstep(0.35, 0.8, fbm(p * 2.0 + u_so));
      vec3 c = u_bg + u_ink1 * 0.03 * (1.0 - length(p));
      c = inkOn(c, u_ink1, minor * 0.22 * fadeM);
      c = inkOn(c, u_ink1, major * 0.55 * fadeM);
      if (u_cross > 0.5){
        vec2 f = q - floor(q + 0.5);
        float arm = 0.12;
        float cx = t_ln(abs(f.x), w * 2.2) * step(abs(f.y), arm);
        float cy = t_ln(abs(f.y), w * 2.2) * step(abs(f.x), arm);
        c = inkOn(c, u_ink2, max(cx, cy) * 0.95);
      }
      if (u_circles > 0.5){
        float r = length(q);
        float rr = abs(r - floor(r + 0.5));
        float ring = t_ln(rr, w * 1.4) * step(r, 6.5);
        c = inkOn(c, u_ink1, ring * 0.35 * fadeM);
        float r2 = abs(length(q - vec2(2.0, -3.0)) - 2.0);
        c = inkOn(c, u_ink2, t_ln(r2, w * 1.6) * 0.7);
      }
      if (u_diag > 0.5){
        float dd = abs(fract((q.x + q.y) * 0.5 + 0.5) - 0.5) * 2.0;
        c = inkOn(c, u_ink1, t_ln(dd, w * 1.2) * 0.2 * fadeM);
      }
      return c;
    }
  `,
});
