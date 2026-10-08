import { R, S, defineTexture } from './define';

export default defineTexture({
  id: 'halftone-dots', name: 'Halftone bodky', category: 'print',
  params: [
    R('freq', 'Hustota bodiek', 20, 160, 62, 1),
    R('angle', 'Uhol rastra', 0, 90, 22, 1),
    S('mode', 'Pole', ['Šum', 'Lineárne', 'Radiálne'], 0),
    R('flow', 'Mierka poľa', 0.4, 5, 1.5),
    R('gang', 'Uhol prechodu', 0, 360, 110, 1),
    R('contrast', 'Kontrast', 0.4, 3, 1.4),
    R('gamma', 'Gamma', 0.4, 2.5, 1.0),
    R('second', 'Druhá farba', 0, 1, 0.6),
  ],
  glsl: /* glsl */ `
    vec3 tex(vec2 p, vec2 uv){
      float n = tfbm(p * u_flow + u_so, 0.8);
      float f;
      if (u_mode < 0.5) f = n;
      else if (u_mode < 1.5) f = 0.5 + (rot(radians(u_gang)) * p).y * 1.3 + (n - 0.5) * 0.5;
      else f = 1.0 - length(p - vec2(0.12, 0.1)) * 1.5 + (n - 0.5) * 0.6;
      f = pow(remap(f, 0.5 - 0.5 / u_contrast, 0.5 + 0.5 / u_contrast), u_gamma);
      float d1 = htDots(p, u_freq, radians(u_angle), f);
      float d2 = htDots(p + vec2(0.003, -0.002), u_freq, radians(u_angle + 30.0), 1.0 - f) * u_second;
      vec3 c = inkOn(u_bg, u_ink1, d1);
      return inkOn(c, u_ink2, d2 * 0.85);
    }
  `,
});
