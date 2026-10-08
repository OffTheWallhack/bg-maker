import { R, defineTexture } from './define';

export default defineTexture({
  id: 'marble', name: 'Mramor', category: 'nature',
  params: [
    R('scale', 'Mierka', 0.3, 4, 1.0),
    R('freq', 'Hustota žíl', 1, 14, 4),
    R('warp', 'Zvlnenie žíl', 0, 3, 1.4),
    R('sharp', 'Ostrosť žíl', 2, 40, 14),
    R('fine', 'Jemné žilky', 0, 1, 0.5),
    R('cloud', 'Mrakovitosť', 0, 1, 0.5),
  ],
  glsl: /* glsl */ `
    float t_vein(vec2 s, float fr, float sh){
      float w = tfbm(s * 0.9 + u_so, 0.6) * u_warp * 3.0 + tfbm(s * 2.4 + u_so + 5.0, 0.6) * u_warp;
      return pow(1.0 - abs(sin((s.x + s.y * 0.6) * fr * 0.5 + w)), sh);
    }
    vec3 tex(vec2 p, vec2 uv){
      vec2 s = p * u_scale;
      float cl = tfbm(s * 1.4 + u_so + 3.0, 0.5);
      vec3 base = ramp(0.55 + 0.4 * mix(0.5, cl, u_cloud));
      float v = t_vein(s, u_freq, u_sharp);
      float v2 = t_vein(s * 2.3 + 4.0, u_freq * 1.6, u_sharp * 1.4) * u_fine * 0.6;
      vec3 c = mix(base, ramp(0.1), clamp(v * 0.85 + v2, 0.0, 1.0));
      c = mix(c, u_ink2, clamp(v * v * 0.5, 0.0, 1.0) * smoothstep(0.5, 0.8, cl));
      return c * (0.97 + 0.03 * vnoise(p * 500.0 + u_so));
    }
  `,
});
