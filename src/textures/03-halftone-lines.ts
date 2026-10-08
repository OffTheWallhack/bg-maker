import { R, defineTexture } from './define';

export default defineTexture({
  id: 'halftone-lines', name: 'Halftone čiary (line screen)', category: 'print',
  params: [
    R('freq', 'Hustota čiar', 20, 200, 70, 1),
    R('angle', 'Uhol čiar', 0, 180, 18, 1),
    R('gang', 'Uhol prechodu', 0, 360, 95, 1),
    R('range', 'Dĺžka prechodu', 0.3, 3, 1.1),
    R('distort', 'Skreslenie', 0, 1, 0.4),
    R('flow', 'Mierka šumu', 0.4, 5, 1.4),
    R('gamma', 'Gamma', 0.4, 2.5, 1.0),
    R('second', 'Druhá farba', 0, 1, 0.5),
  ],
  glsl: /* glsl */ `
    vec3 tex(vec2 p, vec2 uv){
      float n = tfbm(p * u_flow + u_so, 0.8);
      float f = clamp(0.5 + (rot(radians(u_gang)) * p).y * u_range + (n - 0.5) * u_distort * 2.0, 0.0, 1.0);
      f = pow(f, u_gamma);
      float a = htLines(p, u_freq, radians(u_angle), f);
      float b = htLines(p + vec2(0.0021), u_freq * 0.8, radians(u_angle + 70.0), clamp(1.0 - f * 1.2, 0.0, 1.0)) * u_second;
      return inkOn(inkOn(u_bg, u_ink1, a), u_ink2, b * 0.8);
    }
  `,
});
