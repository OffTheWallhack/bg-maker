import { R, defineTexture } from './define';

export default defineTexture({
  id: 'xerox-fade', name: 'Xerox – vyblednutý toner', category: 'print',
  params: [
    R('angle', 'Smer prechodu', 0, 360, 100, 1),
    R('range', 'Dĺžka prechodu', 0.4, 3, 1.3),
    R('warp', 'Zvlnenie', 0, 1, 0.35),
    R('grit', 'Veľkosť zrna', 0.4, 3, 1.0),
    R('streak', 'Pruhy valca', 0, 1, 0.6),
    R('edge', 'Tieň okrajov skenera', 0, 1, 0.5),
    R('dust', 'Prach', 0, 1, 0.4),
  ],
  glsl: /* glsl */ `
    vec3 tex(vec2 p, vec2 uv){
      vec2 q = rot(radians(u_angle)) * p;
      float t = clamp(0.5 + q.y * u_range + (tfbm(p * 1.4 + u_so, 0.7) - 0.5) * u_warp, 0.0, 1.0);
      float n = rgrain(p + SOF, 700.0 / u_grit);
      float n2 = rgrain(p * 0.5 + SOF + 3.0, 700.0 / u_grit);
      float streaks = pow(vnoise(vec2(p.x * 380.0 + u_so.x, p.y * 0.6)), 5.0) * u_streak;
      float toner = step(n * 0.7 + n2 * 0.3 - streaks * 0.5, t);
      vec3 c = mix(u_bg, u_ink1, toner);
      float sh = smoothstep(0.05, 0.0, min(uv.x, 1.0 - uv.x)) + smoothstep(0.02, 0.0, uv.y);
      c = mix(c, u_dirt * 0.5, clamp(sh, 0.0, 1.0) * u_edge * 0.7 * (0.5 + 0.5 * vnoise(vec2(uv.y * 40.0, 1.0) + u_so)));
      float d = step(1.0 - 0.012 * u_dust, hash(floor((p + SOF) * 600.0)));
      c = mix(c, u_ink2, d * (1.0 - toner));
      return c;
    }
  `,
});
