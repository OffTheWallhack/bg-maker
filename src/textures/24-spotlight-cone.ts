import { R, defineTexture } from './define';

export default defineTexture({
  id: 'spotlight-cone', name: 'Svetelný kužeľ (spot)', category: 'light',
  params: [
    R('x', 'Pozícia X', -0.5, 0.5, 0.1),
    R('tilt', 'Náklon', -45, 45, 8, 1),
    R('spread', 'Šírka kužeľa', 3, 40, 14, 0.5),
    R('soft', 'Mäkkosť okraja', 0.05, 1, 0.45),
    R('haze', 'Hmla', 0, 1.5, 0.8),
    R('pool', 'Svetlo na podlahe', 0, 1.5, 0.9),
    R('beam', 'Intenzita', 0.3, 2, 1.0),
  ],
  glsl: /* glsl */ `
    vec3 tex(vec2 p, vec2 uv){
      vec2 src = vec2(u_x, 0.62);
      vec2 d = p - src;
      float tl = radians(u_tilt);
      float ang = atan(d.x, -d.y) - tl;
      float r = length(d);
      float hz = 0.35 + 0.65 * tfbm(p * 2.4 + u_so, 0.8);
      float half_ = radians(u_spread);
      float cone = 1.0 - smoothstep(half_ * (1.0 - u_soft), half_ * (1.0 + u_soft * 0.6), abs(ang));
      float fall = exp(-r * 1.1);
      vec3 c = u_bg;
      c += mix(u_ink1, u_ink2, 0.35) * cone * fall * (0.2 + hz * u_haze) * u_beam;
      c += u_ink2 * 0.06 * u_haze * hz * exp(-r * 1.5);
      vec2 fl = vec2(u_x + tan(tl) * 1.05, -0.4);
      vec2 e = (p - fl) * vec2(1.0, 3.2);
      float pool = exp(-dot(e, e) * 7.0 / (u_spread * 0.12 + 0.3));
      c += u_ink1 * pool * u_pool * 0.9 * (0.7 + 0.3 * vnoise(p * 80.0 + u_so));
      c += u_hi * 0.5 * exp(-r * 45.0) * u_beam;
      return c;
    }
  `,
});
