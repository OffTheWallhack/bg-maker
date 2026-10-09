import { R, defineTexture } from './define';

export default defineTexture({
  id: 'cross-stitch', name: 'Krížikový vzor (výšivka)', category: 'folk',
  params: [
    R('cells', 'Veľkosť krížikov (počet)', 20, 120, 52, 1),
    R('tile', 'Rozmer vzoru', 6, 24, 13, 1),
    R('density', 'Hustota ornamentu', 0.2, 0.8, 0.45),
    R('thick', 'Hrúbka nite', 0.05, 0.3, 0.14),
    R('cloth', 'Látka (Aida)', 0, 1, 0.5),
    R('accent', 'Druhá farba', 0, 1, 0.35),
  ],
  glsl: /* glsl */ `
    vec3 tex(vec2 p, vec2 uv){
      vec2 q = p * u_cells;
      vec2 id = floor(q);
      vec2 f = fract(q);
      float T = u_tile;
      vec2 tc = floor(id / T);
      vec2 loc = mod(id, T) - (T - 1.0) * 0.5;
      vec2 a = abs(loc);
      float key = hash(tc + u_so * 0.1);
      vec2 fold = floor(a + 0.01);
      float bits = step(hash(fold + u_so + floor(key * 5.0) * 31.0), u_density);
      float diamond = step(abs(abs(a.x) + abs(a.y) - floor(T * 0.45)), 0.5);
      float frame = step(abs(max(a.x, a.y) - floor(T * 0.5)), 0.5);
      float inner = step(max(a.x, a.y), floor(T * 0.5) - 1.0);
      float on = max(frame, max(diamond * inner, bits * inner * step(0.5, key + 0.3)));
      float isAcc = step(1.0 - u_accent, hash(fold + 3.0 + u_so)) * (diamond + frame * 0.0);
      float w = u_thick;
      vec2 g = f - 0.5;
      float x1 = abs(g.x - g.y) * 0.7071, x2 = abs(g.x + g.y) * 0.7071;
      float lim = step(max(abs(g.x), abs(g.y)), 0.42);
      float aa = fwidth(x1) * 1.2 + 0.01;
      float stitch = max(1.0 - smoothstep(w - aa, w + aa, x1), 1.0 - smoothstep(w - aa, w + aa, x2)) * lim;
      float fiber = 0.85 + 0.15 * vnoise(vec2(dot(g, vec2(1.0, 1.0)) * 18.0 + id.x, id.y));
      vec3 cloth = u_bg * (1.0 - u_cloth * 0.12 * (smoothstep(0.42, 0.5, abs(g.x)) + smoothstep(0.42, 0.5, abs(g.y))));
      cloth *= 0.96 + 0.04 * hash(id + 1.0);
      vec3 col = mix(u_ink1, u_ink2, clamp(isAcc, 0.0, 1.0)) * fiber;
      return mix(cloth, col, stitch * on);
    }
  `,
});
