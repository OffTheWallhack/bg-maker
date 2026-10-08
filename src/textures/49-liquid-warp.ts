import { R, T, defineTexture } from './define';

export default defineTexture({
  id: 'liquid-warp', name: 'Tekutina – domain warp', category: 'glitch',
  params: [
    R('scale', 'Mierka', 0.4, 4, 1.3),
    R('w1', 'Skreslenie 1', 0, 1.5, 0.8),
    R('w2', 'Skreslenie 2', 0, 1.5, 0.9),
    R('flow', 'Prúdenie', 0, 2, 1.0),
    R('shade', 'Tieňovanie', 0, 2, 0.8),
    R('contrast', 'Kontrast', 0.5, 3, 1.4),
    T('contours', 'Vrstevnice', false),
  ],
  glsl: /* glsl */ `
    vec3 tex(vec2 p, vec2 uv){
      vec2 s = p * u_scale + u_so;
      vec2 q = vec2(tfbm(s, u_flow), tfbm(s + vec2(5.2, 1.3), u_flow));
      vec2 r = vec2(tfbm(s + u_w1 * 4.0 * q + vec2(1.7, 9.2), u_flow), tfbm(s + u_w1 * 4.0 * q + vec2(8.3, 2.8), u_flow));
      float f = tfbm(s + u_w2 * 4.0 * r, u_flow);
      float v = remap(f, 0.5 - 0.5 / u_contrast, 0.5 + 0.5 / u_contrast);
      vec3 c = ramp(v);
      c = mix(c, ramp(clamp(length(q) * 0.9, 0.0, 1.0)), 0.25);
      vec2 gr = vec2(dFdx(f), dFdy(f)) * u_res.y * 0.0035 * u_shade;
      vec3 n = normalize(vec3(-gr, 1.0));
      float diff = dot(n, normalize(vec3(-0.5, 0.6, 0.7)));
      c *= 0.7 + 0.5 * diff;
      c += pow(max(diff, 0.0), 24.0) * 0.25 * u_shade;
      if (u_contours > 0.5){
        float x = f * 14.0;
        float l = aaLine(abs(fract(x) - 0.5) * 2.0 - 1.0 + 0.0, 0.0);
        float ln = 1.0 - smoothstep(0.0, fwidth(x) * 1.5 + 0.02, abs(fract(x) - 0.5) * 2.0 - 0.9);
        c = mix(c, u_ink1, clamp(ln, 0.0, 1.0) * 0.5);
      }
      return c;
    }
  `,
});
