import { R, defineTexture } from './define';

export default defineTexture({
  id: 'smoke', name: 'Dym / hmla (jemný)', category: 'gradient',
  params: [
    R('scale', 'Mierka', 0.4, 4, 1.3),
    R('warp', 'Zvlnenie', 0, 2, 1.2),
    R('stretch', 'Natiahnutie hore', 0.5, 3, 1.5),
    R('power', 'Kontrast dymu', 0.6, 4, 1.8),
    R('bright', 'Jas', 0.3, 2, 1.0),
    R('light', 'Svetlo zospodu', 0, 1, 0.5),
  ],
  glsl: /* glsl */ `
    vec3 tex(vec2 p, vec2 uv){
      vec2 s = vec2(p.x, p.y / u_stretch) * u_scale + u_so;
      vec2 q = vec2(tfbm(s, 0.9), tfbm(s + 4.1, 0.9));
      float f = tfbm(s + u_warp * 2.2 * q + vec2(0.0, 0.4 * sin(TT)), 0.9);
      float sm = pow(clamp(f * 1.25 - 0.1, 0.0, 1.0), u_power);
      float lit = mix(1.0, smoothstep(0.7, -0.5, p.y), u_light);
      vec3 c = u_bg + ramp(0.35 + 0.65 * sm) * sm * u_bright * (0.35 + 0.9 * lit);
      return c;
    }
  `,
});
