import { R, S, defineTexture } from './define';

export default defineTexture({
  id: 'moire', name: 'Interferenčné moiré', category: 'geometry',
  params: [
    S('type', 'Typ', ['Čiary', 'Kruhy', 'Bodky'], 0),
    R('freq', 'Hustota', 10, 140, 60, 1),
    R('diff', 'Rozdiel uhlov', 0.2, 12, 2.4),
    R('angle', 'Uhol', 0, 180, 20, 1),
    R('curve', 'Zakrivenie', 0, 1, 0.3),
    R('offset', 'Posun stredov', 0, 0.5, 0.1),
    R('duty', 'Hrúbka čiar', 0.15, 0.85, 0.5),
  ],
  glsl: /* glsl */ `
    float t_pat(vec2 q, vec2 c0){
      if (u_type < 0.5){
        float x = q.x * u_freq;
        float t = abs(fract(x) - 0.5) * 2.0;
        float fw = fwidth(x) * 1.2 + 1e-4;
        return 1.0 - smoothstep(u_duty * 1.0 - fw, u_duty * 1.0 + fw, t);
      }
      if (u_type < 1.5){
        float x = length(q - c0) * u_freq;
        float t = abs(fract(x) - 0.5) * 2.0;
        float fw = fwidth(x) * 1.2 + 1e-4;
        return 1.0 - smoothstep(u_duty - fw, u_duty + fw, t);
      }
      vec2 g = q * u_freq * 0.7;
      vec2 f = fract(g) - 0.5;
      float fw = fwidth(g.x) * 1.2 + 1e-4;
      return 1.0 - smoothstep(u_duty * 0.5 - fw, u_duty * 0.5 + fw, length(f));
    }
    vec3 tex(vec2 p, vec2 uv){
      vec2 w = p + u_curve * 0.12 * vec2(sin(p.y * 4.0 + u_so.x), cos(p.x * 3.0 + u_so.y));
      float a0 = radians(u_angle);
      float a1 = a0 + radians(u_diff) * (1.0 + 0.0 * sin(TT));
      float a2 = a0 - radians(u_diff) * 0.0;
      vec2 c1 = vec2(-u_offset, 0.0), c2 = vec2(u_offset, 0.0);
      float pa = t_pat(rot(a2) * w, rot(a2) * c1);
      float pb = t_pat(rot(a1) * w, rot(a1) * c2);
      vec3 c = u_bg;
      c = inkOn(c, u_ink1, pa * 0.95);
      c = inkOn(c, u_ink2, pb * 0.9);
      return c;
    }
  `,
});
