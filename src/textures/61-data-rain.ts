import { R, defineTexture } from './define';

export default defineTexture({
  id: 'data-rain', name: 'Dátový dážď (bloky)', category: 'glitch',
  params: [
    R('cols', 'Počet stĺpcov', 8, 90, 34, 1),
    R('rows', 'Počet riadkov', 20, 160, 80, 1),
    R('tail', 'Dĺžka chvosta', 0.3, 4, 1.6),
    R('density', 'Hustota', 0.1, 1, 0.55),
    R('gap', 'Medzera', 0, 0.5, 0.18),
    R('speed', 'Rýchlostné pásma', 1, 3, 2, 1),
  ],
  glsl: /* glsl */ `
    vec3 tex(vec2 p, vec2 uv){
      float asp = u_res.x / u_res.y;
      float x = (p.x / asp + 0.5) * u_cols;
      float id = floor(x);
      float fx = fract(x) - 0.5;
      float spd = 1.0 + floor(hash(vec2(id, 4.0) + u_so) * u_speed);
      float yy = uv.y + hash(vec2(id, 1.0) + u_so) + u_phase * u_cycles * spd;
      float r = yy * u_rows;
      float rid = floor(r);
      float fy = fract(r) - 0.5;
      float head = fract(yy / (u_tail * 0.3 + 0.2));
      float trail = pow(head, 2.0);
      float lit = step(hash(vec2(id, floor(yy * u_rows / 6.0)) + u_so), u_density);
      float blk = step(max(abs(fx), abs(fy * u_rows / u_cols * asp)), 0.5 - u_gap);
      float on = blk * lit * trail;
      float headFlash = smoothstep(0.93, 1.0, head) * lit * blk;
      vec3 c = u_bg;
      c = mix(c, ramp(0.35 + 0.35 * trail), on);
      c = mix(c, u_ink1, headFlash);
      return c;
    }
  `,
});
