import { R, defineTexture } from './define';

export default defineTexture({
  id: 'uv-blacklight', name: 'UV blacklight žiara', category: 'light',
  params: [
    R('haze', 'Fialová hmla', 0, 1.5, 0.7),
    R('splat', 'Fľaky farby', 0, 1, 0.55),
    R('size', 'Veľkosť fľakov', 0.5, 4, 1.6),
    R('glow', 'Žiara', 0, 2, 1.0),
    R('fiber', 'Trblietanie vlákien', 0, 1, 0.5),
    R('drip', 'Stekanie', 0, 1, 0.35),
  ],
  glsl: /* glsl */ `
    vec3 tex(vec2 p, vec2 uv){
      float haze = tfbm(p * 1.7 + u_so, 0.8);
      vec3 c = u_bg + mix(u_ink2, u_ink1, 0.3) * (haze * haze) * 0.25 * u_haze;
      vec2 q = p * u_size * 4.0 + u_so;
      vec3 v = voronoi(warp(q * 0.25, 0.4, 0.8) * 4.0, 0.15);
      float on = step(1.0 - u_splat * 0.6, hash(vec2(v.z * 100.0, 4.0)));
      float rad = 0.2 + 0.35 * hash(vec2(v.z * 100.0, 5.0));
      float blob = smoothstep(rad + 0.05, rad - 0.03, v.x) * on;
      float aura = exp(-max(v.x - rad, 0.0) * 6.0) * on * u_glow;
      float drips = vnoise(vec2(p.x * 80.0, p.y * 3.0 + u_so.y)) * vnoise(vec2(p.x * 7.0, p.y * 0.6 + u_so.x));
      float drip = smoothstep(0.38, 0.55, drips) * u_drip * smoothstep(0.55, 0.2, haze) * 0.6;
      vec3 col = palc(1 + int(floor(hash(vec2(v.z * 100.0, 9.0)) * 3.0)));
      c += col * aura * 0.35;
      c = mix(c, mix(col, vec3(1.0), 0.35), blob);
      c += mix(u_ink1, u_ink2, 0.5) * drip * u_glow * 0.6;
      float fib = pow(vnoise(vec2(p.x * 900.0, p.y * 60.0) + u_so), 6.0) + pow(vnoise(vec2(p.x * 70.0, p.y * 800.0) + u_so + 3.0), 6.0);
      c += vec3(0.8, 0.85, 1.0) * fib * 0.8 * u_fiber * (0.3 + haze);
      return c;
    }
  `,
});
