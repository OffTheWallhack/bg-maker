import { R, defineTexture } from './define';

export default defineTexture({
  id: 'flow-lines', name: 'Prúdnice (jemné čiary)', category: 'gradient',
  params: [
    R('freq', 'Hustota čiar', 20, 300, 60, 1),
    R('scale', 'Mierka toku', 0.3, 3, 0.9),
    R('warp', 'Zvlnenie', 0, 2, 1.1),
    R('thick', 'Hrúbka', 0.05, 0.8, 0.2),
    R('accent', 'Akcentové čiary', 0, 1, 0.25),
    R('fade', 'Zmiznutie', 0, 1, 0.5),
  ],
  glsl: /* glsl */ `
    vec3 tex(vec2 p, vec2 uv){
      vec2 s = p * u_scale + u_so;
      vec2 q = vec2(tfbm(s, 0.7), tfbm(s + 4.0, 0.7));
      float f = (p.y * 1.0 + (tfbm(s + u_warp * 1.8 * q, 0.7) - 0.5) * u_warp * 1.6) * u_freq;
      float id = floor(f);
      float d = abs(fract(f) - 0.5) * 2.0;
      float th = u_thick * (0.4 + 0.9 * vnoise(vec2(id * 0.1 + u_so.x, p.x * 2.0)));
      float fw = fwidth(f) * 2.0 + 0.01;
      float ln = 1.0 - smoothstep(1.0 - th - fw, 1.0 - th + fw, d);
      float vis = mix(1.0, smoothstep(0.35, 0.7, tfbm(p * 1.4 + u_so + 7.0, 0.6)), u_fade);
      vec3 col = mix(u_ink1, u_ink2, step(1.0 - u_accent * 0.5, hash(vec2(id, 5.0) + u_so)));
      return mix(u_bg, col, ln * vis);
    }
  `,
});
