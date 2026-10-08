import { R, defineTexture } from './define';

export default defineTexture({
  id: 'blur-bands', name: 'Mäkké farebné pásy', category: 'gradient',
  params: [
    R('freq', 'Počet pásov', 0.3, 5, 1.3),
    R('angle', 'Uhol', 0, 180, 24, 1),
    R('warp', 'Zvlnenie', 0, 2, 0.9),
    R('soft', 'Mäkkosť', 0.3, 2, 1.0),
    R('fade', 'Zatmenie okrajov', 0, 1, 0.4),
    R('shift', 'Posun', 0, 1, 0.3),
  ],
  glsl: /* glsl */ `
    vec3 tex(vec2 p, vec2 uv){
      vec2 q = rot(radians(u_angle)) * p;
      float w = (tfbm(p * 1.1 + u_so, 0.7) - 0.5) * u_warp * 1.4;
      float x = q.x * u_freq + w + u_shift;
      float v = 0.5 + 0.5 * sin(x * TAU + TT);
      v = pow(v, u_soft);
      float v2 = 0.5 + 0.5 * sin(x * TAU * 0.5 + 1.7 + TT);
      vec3 c = mix(ramp(v), ramp(v2 * 0.7 + 0.15), 0.35);
      c *= 1.0 - u_fade * 0.7 * smoothstep(0.1, 0.85, length(p * vec2(0.8, 1.0)));
      return c;
    }
  `,
});
