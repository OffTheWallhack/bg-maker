import { R, defineTexture } from './define';

export default defineTexture({
  id: 'compression-blocks', name: 'Kompresné bloky (JPEG)', category: 'glitch',
  params: [
    R('scale', 'Mierka obrazu', 0.5, 5, 1.4),
    R('blocks', 'Počet blokov (výška)', 8, 90, 36, 1),
    R('levels', 'Kvantizácia', 3, 24, 8, 1),
    R('ring', 'DCT vzor', 0, 1, 0.5),
    R('mosh', 'Zaseknuté bloky', 0, 1, 0.3),
    R('chroma', 'Chroma crush', 0, 1, 0.6),
  ],
  glsl: /* glsl */ `
    float t_base(vec2 p){ return tfbm(p * u_scale + u_so, 0.8); }
    vec3 tex(vec2 p, vec2 uv){
      float N = u_blocks;
      vec2 g = p * N + 1000.0;
      vec2 b = floor(g);
      vec2 f = fract(g);
      vec3 h = hash3(b + u_so);
      vec2 bc = (b + 0.5 - 1000.0) / N;
      vec2 src = bc;
      if (h.z < u_mosh) src += vec2(floor(h.x * 3.0) - 1.0, 0.0) / N * (1.0 + floor(h.y * 3.0));
      float dc = t_base(src);
      dc = floor(dc * u_levels + 0.5) / u_levels;
      float kx = 1.0 + floor(h.y * 3.0), ky = 1.0 + floor(h.x * 3.0);
      float dct = cos(f.x * PI * kx) * cos(f.y * PI * ky) * (h.z - 0.5) * u_ring * 0.35;
      float v = clamp(dc + dct, 0.0, 1.0);
      vec3 c = ramp(v);
      float l = luma(c);
      float q = mix(32.0, 3.0, u_chroma);
      c = vec3(l) + floor((c - vec3(l)) * q + 0.5) / q;
      return c;
    }
  `,
});
