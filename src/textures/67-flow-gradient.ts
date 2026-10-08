import { R, defineTexture } from './define';

export default defineTexture({
  id: 'flow-gradient', name: 'Tečúci gradient (hodváb)', category: 'gradient',
  params: [
    R('scale', 'Mierka', 0.3, 3, 0.9),
    R('bands', 'Počet farebných prúdov', 0.5, 5, 1.6),
    R('w1', 'Skreslenie', 0, 1.5, 0.9),
    R('flow', 'Prúdenie', 0, 2, 1.0),
    R('soft', 'Mäkkosť', 0.4, 2.2, 1.0),
    R('light', 'Jemný lesk', 0, 1, 0.3),
  ],
  glsl: /* glsl */ `
    vec3 tex(vec2 p, vec2 uv){
      vec2 s = p * u_scale + u_so;
      vec2 q = vec2(tfbm(s, u_flow), tfbm(s + 5.2, u_flow));
      vec2 r = vec2(tfbm(s + u_w1 * 3.0 * q + 1.7, u_flow), tfbm(s + u_w1 * 3.0 * q + 8.3, u_flow));
      float f = tfbm(s + u_w1 * 3.0 * r, u_flow);
      float v = pow(0.5 + 0.5 * cos(TAU * (f * u_bands + 0.1)), u_soft);
      vec3 c = ramp(v);
      c = mix(c, ramp(clamp(length(r), 0.0, 1.0)), 0.25);
      c += u_ink1 * u_light * 0.15 * pow(max(0.0, sin(f * u_bands * TAU * 2.0)), 6.0);
      return c;
    }
  `,
});
