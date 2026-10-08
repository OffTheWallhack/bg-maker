import { R, defineTexture } from './define';

export default defineTexture({
  id: 'pixel-mosaic', name: 'Pixelová mozaika (gradient)', category: 'glitch',
  params: [
    R('cells', 'Počet pixelov (výška)', 8, 90, 34, 1),
    R('scale', 'Mierka poľa', 0.3, 3, 0.9),
    R('jitter', 'Náhodnosť', 0, 1, 0.25),
    R('levels', 'Počet úrovní', 3, 16, 8, 1),
    R('merge', 'Väčšie bloky', 0, 1, 0.4),
    R('gap', 'Medzera', 0, 0.2, 0),
  ],
  glsl: /* glsl */ `
    vec3 tex(vec2 p, vec2 uv){
      float N = u_cells;
      vec2 id = floor(p * N);
      float big = step(hash(floor(id * 0.5) + u_so), u_merge);
      vec2 id2 = mix(id, floor(id * 0.5) * 2.0, big);
      vec2 cp = (id2 + mix(0.5, 1.0, big)) / N;
      float v = tfbm(cp * u_scale + u_so, 0.7);
      v += (hash(id2 + u_so + floor(TT * 0.0)) - 0.5) * u_jitter * 0.5;
      v = floor(clamp(v, 0.0, 1.0) * u_levels) / (u_levels - 1.0);
      vec3 c = ramp(v);
      vec2 f = abs(fract(p * N) - 0.5);
      float gp = step(0.5 - u_gap, max(f.x, f.y)) * (1.0 - big) * step(0.001, u_gap);
      return mix(c, u_bg, gp * 0.8);
    }
  `,
});
