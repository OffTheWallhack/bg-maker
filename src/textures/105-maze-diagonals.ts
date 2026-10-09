import { R, defineTexture } from './define';

export default defineTexture({
  id: 'maze-diagonals', name: 'Labyrint (10 PRINT)', category: 'folk',
  params: [
    R('cells', 'Veľkosť poľa (počet)', 6, 60, 22, 1),
    R('thick', 'Hrúbka ťahu', 0.1, 0.5, 0.26),
    R('bias', 'Prevaha smeru', 0, 1, 0.5),
    R('zig', 'Zalomenie', 0, 1, 0.5),
    R('color', 'Farebné ťahy', 0, 1, 0.3),
    R('field', 'Premenlivosť', 0, 1, 0.5),
  ],
  glsl: /* glsl */ `
    vec3 tex(vec2 p, vec2 uv){
      vec2 q = p * u_cells;
      vec2 id = floor(q);
      vec2 f = fract(q);
      float fieldv = (tfbm(p * 1.5 + u_so, 0.5) - 0.5) * u_field * 1.4;
      float flip = step(hash(id + u_so), clamp(u_bias + fieldv, 0.0, 1.0));
      if (flip > 0.5) f.x = 1.0 - f.x;
      float d = abs(f.x - f.y) * 0.7071;
      float seg = step(u_zig, hash(id + 5.0 + u_so));
      float d2 = min(abs(f.y - 0.5 - (f.x - 0.5) * 0.0) , 9.0);
      float use = mix(d, abs(f.x - 0.5) * 1.0 * step(0.5, f.y) + abs(f.y - 0.5) * step(f.y, 0.5) * 0.0 + d * 0.0, 0.0);
      float w = u_thick * 0.7071;
      float aa = fwidth(d) * 1.2 + 0.01;
      float m = 1.0 - smoothstep(w - aa, w + aa, d);
      vec3 col = mix(u_ink1, u_ink2, step(1.0 - u_color, hash(id + 9.0 + u_so)));
      vec3 c = mix(u_bg, col, m);
      return c;
    }
  `,
});
