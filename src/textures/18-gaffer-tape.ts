import { R, defineTexture } from './define';

export default defineTexture({
  id: 'gaffer-tape', name: 'Gaffer páska', category: 'material',
  params: [
    R('count', 'Počet pások', 1, 5, 3, 1),
    R('width', 'Šírka pásky', 0.1, 0.6, 0.26),
    R('angle', 'Uhol', -90, 90, 24, 1),
    R('weave', 'Tkanina', 40, 400, 190, 1),
    R('wrinkle', 'Vrásky', 0, 1, 0.5),
    R('wear', 'Opotrebenie', 0, 1, 0.4),
    R('shadow', 'Tieň', 0, 1, 0.6),
  ],
  glsl: /* glsl */ `
    float t_weave(vec2 q){
      vec2 w = q * u_weave;
      float a = sin(w.x * TAU) * 0.5 + 0.5;
      float b = sin(w.y * TAU + (floor(w.x) * 0.5) * 3.14159) * 0.5 + 0.5;
      float th = mix(a, b, step(0.5, fract(w.x * 0.5 + floor(w.y) * 0.5)));
      return th;
    }
    vec3 tex(vec2 p, vec2 uv){
      vec3 c = mix(u_bg, u_dirt * 0.5, 0.3 * fbm(p * 5.0 + u_so));
      for (int i = 0; i < 5; i++){
        if (float(i) >= u_count) break;
        float fi = float(i);
        float ang = radians(u_angle) + (mod(fi, 2.0) * 2.0 - 1.0) * 0.25 * float(i > 0) ;
        vec2 q = rot(ang) * p;
        float off = (fi - (u_count - 1.0) * 0.5) * (u_width * 1.18) + (hash(vec2(fi, 4.0) + u_so) - 0.5) * 0.08;
        float d = q.x - off;
        float torn = (vnoise(vec2(q.y * 90.0, fi) + u_so) - 0.5) * 0.004 * u_wear;
        float m = abs(d + torn) - u_width * 0.5;
        float aa = fwidth(m) + 0.0008;
        float inside = 1.0 - smoothstep(-aa, aa, m);
        float sh = smoothstep(0.05, 0.0, m) * (1.0 - inside) * u_shadow;
        c *= 1.0 - sh * 0.5;
        vec3 tc = palc(1 + int(mod(fi, 2.0)));
        float th = t_weave(q + vec2(fi * 0.13));
        float wr = fbm(vec2(q.y * 5.0, d * 20.0) + u_so + fi * 3.0);
        float shade = 0.72 + 0.28 * th;
        shade *= 1.0 + (wr - 0.5) * u_wrinkle * 0.9;
        shade *= 1.0 - smoothstep(0.0, 0.02, -m) * 0.0;
        shade *= 1.0 - 0.18 * smoothstep(0.012, 0.0, -m);
        float wear = smoothstep(0.62, 0.8, fbm(q * 14.0 + u_so + fi)) * u_wear;
        vec3 col = mix(tc * shade, mix(tc, u_dirt, 0.6) * (0.5 + 0.5 * th), wear * 0.7);
        c = mix(c, col, inside);
      }
      return c;
    }
  `,
});
