import { R, defineTexture } from './define';

export default defineTexture({
  id: 'conic-gradient', name: 'Kužeľový gradient', category: 'gradient',
  params: [
    R('segs', 'Počet výsekov', 1, 8, 2, 1),
    R('cx', 'Stred X', -0.5, 0.5, 0.05),
    R('cy', 'Stred Y', -0.5, 0.5, -0.05),
    R('twist', 'Špirála', -3, 3, 0.8),
    R('warp', 'Zvlnenie', 0, 1, 0.3),
    R('fade', 'Zatmenie do strán', 0, 1.5, 0.6),
    R('soft', 'Mäkkosť', 0.4, 2.5, 1.0),
  ],
  glsl: /* glsl */ `
    vec3 tex(vec2 p, vec2 uv){
      vec2 d = p - vec2(u_cx, u_cy);
      float r = length(d);
      float a = atan(d.y, d.x) / TAU + u_twist * r * 0.5 + (tfbm(p * 1.5 + u_so, 0.6) - 0.5) * u_warp;
      float v = pow(0.5 + 0.5 * cos(TAU * (a * u_segs) + TT), u_soft);
      vec3 c = ramp(v);
      c = mix(c, u_bg, smoothstep(0.0, 1.0, r * u_fade));
      c += u_ink1 * 0.15 * exp(-r * 12.0);
      return c;
    }
  `,
});
