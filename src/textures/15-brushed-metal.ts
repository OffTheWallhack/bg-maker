import { R, defineTexture } from './define';

export default defineTexture({
  id: 'brushed-metal', name: 'Brúsený kov', category: 'material',
  params: [
    R('angle', 'Smer brúsenia', 0, 180, 0, 1),
    R('fine', 'Jemnosť', 100, 900, 420, 5),
    R('sheen', 'Lesk (sheen)', 0, 1.5, 0.9),
    R('sheenang', 'Pozícia lesku', -1, 1, 0.1),
    R('scratch', 'Škrabance', 0, 1, 0.35),
    R('contrast', 'Kontrast', 0.5, 2.5, 1.2),
  ],
  glsl: /* glsl */ `
    vec3 tex(vec2 p, vec2 uv){
      vec2 q = rot(radians(u_angle)) * p;
      float n = vnoise(vec2(q.x * 3.0, q.y * u_fine) + u_so) * 0.5
              + vnoise(vec2(q.x * 9.0, q.y * u_fine * 2.3) + u_so + 7.0) * 0.3
              + vnoise(vec2(q.x * 30.0, q.y * u_fine * 5.0) + u_so + 2.0) * 0.2;
      float band = exp(-pow((q.y - u_sheenang * 0.6 + 0.12 * sin(q.x * 2.0 + TT)) * 2.6, 2.0));
      float band2 = exp(-pow((q.y + 0.35 + u_sheenang * 0.3) * 3.5, 2.0)) * 0.5;
      float s = 0.28 + (n - 0.5) * 0.45 + (band + band2) * u_sheen * (0.55 + 0.7 * n);
      float sc = step(0.992 - u_scratch * 0.012, hash(vec2(floor(q.y * 1100.0), floor(q.x * 3.0) + u_so.x))) * u_scratch;
      s += sc * 0.35;
      s = clamp((s - 0.4) * u_contrast + 0.4, 0.0, 1.0);
      return ramp(s);
    }
  `,
});
