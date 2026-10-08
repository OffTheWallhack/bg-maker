import { R, defineTexture } from './define';

export default defineTexture({
  id: 'screenprint-bleed', name: 'Sieťotlač – presiaknutá farba', category: 'print',
  params: [
    R('scale', 'Mierka', 0.6, 5, 1.6),
    R('bleed', 'Presiaknutie', 0, 1, 0.5),
    R('pool', 'Nahromadenie na hrane', 0, 1, 0.55),
    R('mesh', 'Sieťka', 0, 1, 0.35),
    R('mis', 'Posun farieb', 0, 30, 9, 0.5),
    R('second', 'Druhá farba', 0, 1, 0.9),
  ],
  glsl: /* glsl */ `
    vec3 tex(vec2 p, vec2 uv){
      float b = u_bleed * 0.1 + 0.003;
      float rn = (vnoise(p * 220.0 + u_so) - 0.5) * u_bleed * 0.22;
      float f1 = tfbm(p * u_scale + u_so, 0.7);
      float f2 = tfbm((p - vec2(u_mis * 0.0012, -u_mis * 0.0008)) * u_scale * 1.1 + u_so + 21.0, 0.7);
      float m1 = smoothstep(0.5 - b, 0.5 + b, f1 + rn);
      float m2 = smoothstep(0.5 - b, 0.5 + b, f2 + rn) * u_second;
      float e1 = exp(-pow((f1 + rn - 0.5) / (b + 0.015), 2.0)) * u_pool;
      float e2 = exp(-pow((f2 + rn - 0.5) / (b + 0.015), 2.0)) * u_pool * u_second;
      float mesh = 1.0 - u_mesh * 0.35 * htDots(p, 260.0, 0.45, 0.35);
      vec3 c = u_bg;
      c = inkOn(c, u_ink1, m1 * mesh * (0.9 + 0.1 * rgrain(p + SOF, 500.0)));
      c = mix(c, c * 0.72 + u_dirt * 0.1, e1 * m1 * 0.6);
      c = inkOn(c, u_ink2, m2 * mesh * 0.92);
      c = mix(c, c * 0.7 + u_dirt * 0.1, e2 * m2 * 0.5);
      return c;
    }
  `,
});
