import { R, defineTexture } from './define';

export default defineTexture({
  id: 'haze-gradient', name: 'Hmlistý gradient', category: 'gradient',
  params: [
    R('angle', 'Uhol', 0, 360, 200, 1),
    R('range', 'Dĺžka prechodu', 0.4, 3, 1.2),
    R('lobe', 'Svetelný lalok', 0, 1.5, 0.8),
    R('lx', 'Lalok X', -0.5, 0.5, 0.15),
    R('ly', 'Lalok Y', -0.5, 0.5, -0.25),
    R('warp', 'Zvlnenie', 0, 1, 0.4),
    R('gamma', 'Gamma', 0.5, 2.5, 1.2),
  ],
  glsl: /* glsl */ `
    vec3 tex(vec2 p, vec2 uv){
      vec2 q = rot(radians(u_angle)) * p;
      float w = (tfbm(p * 1.0 + u_so, 0.6) - 0.5) * u_warp;
      float t = clamp(0.5 + q.y * u_range + w * 0.8, 0.0, 1.0);
      vec3 c = ramp(pow(t, u_gamma) * 0.85);
      vec2 d = (p - vec2(u_lx, u_ly)) * vec2(1.0, 0.7);
      float g = exp(-dot(d, d) * 5.0 / (0.3 + u_warp * 0.3)) * u_lobe;
      c = 1.0 - (1.0 - c) * (1.0 - mix(u_ink2, u_ink1, 0.5) * g * 0.7);
      return c;
    }
  `,
});
