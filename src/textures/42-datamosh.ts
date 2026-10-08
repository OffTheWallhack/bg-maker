import { R, S, defineTexture } from './define';

export default defineTexture({
  id: 'datamosh', name: 'Datamosh rozmazanie', category: 'glitch',
  params: [
    R('scale', 'Mierka obrazu', 0.5, 5, 1.5),
    R('blocks', 'Veľkosť blokov (počet)', 3, 40, 12, 1),
    R('activity', 'Podiel blokov', 0, 1, 0.5),
    R('smear', 'Rozmazanie', 0, 1, 0.8),
    S('dir', 'Smer', ['Vodorovne', 'Zvislo', 'Zmiešane'], 2),
    R('levels', 'Posterizácia', 2, 12, 6, 1),
    R('seams', 'Okraje blokov', 0, 1, 0.3),
  ],
  glsl: /* glsl */ `
    float t_base(vec2 p){ return tfbm(p * u_scale + u_so, 0.8); }
    vec3 tex(vec2 p, vec2 uv){
      float N = u_blocks;
      vec2 b = floor(p * N + 1000.0);
      vec3 h = hash3(b + u_so);
      vec2 bc = (b + 0.5) / N - 1000.0 / N;
      vec2 dir = u_dir < 0.5 ? vec2(1.0, 0.0) : (u_dir < 1.5 ? vec2(0.0, 1.0) : normalize(h.yz - 0.5 + 1e-3));
      float act = step(h.x, u_activity);
      vec2 p2 = p;
      float s = dot(p - bc, dir);
      p2 = p - dir * s * u_smear * (0.4 + 0.6 * h.y) * act + (h.yz - 0.5) * 0.06 * act;
      float f = t_base(p2);
      float lv = u_levels;
      f = mix(f, floor(f * lv + 0.5) / lv, act * 0.8);
      vec3 c = ramp(f);
      vec2 g = abs(fract(p * N + 1000.0) - 0.5);
      float edge = smoothstep(0.46, 0.5, max(g.x, g.y)) * act * u_seams;
      c = mix(c, c * 0.55, edge);
      c = mix(c, c * mix(vec3(1.0), u_ink2 * 1.3, 0.5), act * step(0.75, h.z) * 0.6);
      return c;
    }
  `,
});
