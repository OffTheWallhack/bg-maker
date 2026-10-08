import { R, defineTexture } from './define';

export default defineTexture({
  id: 'wood-grain', name: 'Drevo – letokruhy', category: 'nature',
  params: [
    R('rings', 'Hustota letokruhov', 3, 60, 18, 0.5),
    R('stretch', 'Natiahnutie', 0.1, 4, 0.5),
    R('warp', 'Zvlnenie', 0, 2, 0.8),
    R('grain', 'Jemná kresba', 0, 1, 0.6),
    R('cx', 'Stred X', -1.5, 1.5, 0.9),
    R('cy', 'Stred Y', -1.5, 1.5, -0.2),
    R('contrast', 'Kontrast', 0.5, 2.5, 1.2),
  ],
  glsl: /* glsl */ `
    vec3 tex(vec2 p, vec2 uv){
      vec2 d = (p - vec2(u_cx, u_cy)) * vec2(u_stretch, 1.0);
      float w = tfbm(p * 1.4 + u_so, 0.5) * u_warp * 0.35;
      float r = length(d) + w;
      float x = r * u_rings;
      float ring = pow(abs(sin(x * PI)), 0.7);
      float fine = vnoise(vec2(p.x * 700.0 * u_stretch, p.y * 40.0) + u_so) * 0.5 + vnoise(vec2(p.x * 160.0, p.y * 12.0) + u_so + 4.0) * 0.5;
      float v = mix(ring, fine, 0.35 * u_grain) * 0.8 + 0.1;
      v = clamp((v - 0.5) * u_contrast + 0.5, 0.0, 1.0);
      return ramp(0.1 + 0.8 * v);
    }
  `,
});
