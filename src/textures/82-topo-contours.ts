import { R, T, defineTexture } from './define';

export default defineTexture({
  id: 'topo-contours', name: 'Vrstevnice (topo)', category: 'nature',
  params: [
    R('scale', 'Mierka terénu', 0.3, 4, 1.1),
    R('levels', 'Počet vrstevníc', 6, 60, 26, 1),
    R('thick', 'Hrúbka čiar', 0.2, 3, 1.0),
    R('major', 'Hrubšia každá n-tá', 2, 10, 5, 1),
    R('fill', 'Výplň terénu', 0, 1, 0.6),
    T('warp', 'Organické zvlnenie', true),
  ],
  glsl: /* glsl */ `
    vec3 tex(vec2 p, vec2 uv){
      vec2 s = p * u_scale;
      if (u_warp > 0.5) s += (vec2(fbm(s * 1.5 + u_so), fbm(s * 1.5 + u_so + 4.0)) - 0.5) * 0.4;
      float h = tfbm(s * 1.2 + u_so, 0.6);
      float x = h * u_levels;
      float fw = fwidth(x) + 1e-4;
      float d = abs(fract(x) - 0.5) * 2.0;
      float w = 0.06 * u_thick;
      float line = 1.0 - smoothstep(1.0 - w - fw, 1.0 - w + fw * 0.5 + 0.01, d);
      float idx = floor(x);
      float isMajor = step(mod(idx, u_major), 0.5);
      float thick2 = 1.0 - smoothstep(1.0 - w * 3.0 - fw, 1.0 - w * 3.0 + fw, d);
      vec3 c = mix(u_bg, ramp(0.1 + 0.35 * h), u_fill);
      c = mix(c, u_ink1, line * 0.8);
      c = mix(c, u_ink2, thick2 * isMajor * 0.9);
      return c;
    }
  `,
});
