import { R, defineTexture } from './define';

export default defineTexture({
  id: 'soft-rings', name: 'Mäkké žiariace kruhy', category: 'gradient',
  params: [
    R('freq', 'Počet kruhov', 1, 14, 5),
    R('cx', 'Stred X', -0.5, 0.5, 0.0),
    R('cy', 'Stred Y', -0.5, 0.5, 0.1),
    R('soft', 'Mäkkosť', 0.3, 3, 1.2),
    R('warp', 'Zvlnenie', 0, 1, 0.35),
    R('decay', 'Útlm', 0, 3, 0.9),
    R('core', 'Žiara stredu', 0, 2, 1.0),
  ],
  glsl: /* glsl */ `
    vec3 tex(vec2 p, vec2 uv){
      vec2 d = p - vec2(u_cx, u_cy);
      float r = length(d) * (1.0 + (tfbm(p * 1.6 + u_so, 0.7) - 0.5) * u_warp * 0.6);
      float v = pow(0.5 + 0.5 * sin(r * u_freq * TAU - TT), u_soft);
      float env = exp(-r * u_decay);
      vec3 c = mix(u_bg, ramp(0.15 + 0.85 * v), env * 0.95);
      c += mix(u_ink1, u_hi, 0.4) * exp(-r * 9.0) * u_core * 0.8;
      return c;
    }
  `,
});
