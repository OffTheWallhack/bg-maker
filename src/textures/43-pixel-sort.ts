import { R, S, defineTexture } from './define';

export default defineTexture({
  id: 'pixel-sort', name: 'Pixel sort', category: 'glitch',
  params: [
    R('scale', 'Mierka obrazu', 0.5, 5, 1.7),
    R('rows', 'Počet riadkov', 60, 900, 360, 1),
    R('span', 'Dĺžka úsekov', 0.5, 8, 3.0),
    R('thr', 'Prah triedenia', 0.2, 0.8, 0.45),
    R('gamma', 'Tvar prechodu', 0.4, 3, 1.4),
    R('amount', 'Podiel', 0, 1, 0.85),
    S('dir', 'Smer', ['Vodorovne', 'Zvislo'], 0),
  ],
  glsl: /* glsl */ `
    float t_base(vec2 p){ return tfbm(p * u_scale + u_so, 0.8); }
    vec3 tex(vec2 p, vec2 uv){
      vec2 q = u_dir < 0.5 ? p : vec2(p.y, p.x);
      float row = floor((q.y + 0.5) * u_rows);
      float sx = q.x * u_span + hash(vec2(row, 3.0) + u_so) * 50.0;
      float seg = floor(sx);
      float t = fract(sx);
      float rowY = (row + 0.5) / u_rows - 0.5;
      float segLen = 1.0 / u_span;
      float lenJ = 0.5 + hash(vec2(seg, row) + 11.0);
      vec2 sc = u_dir < 0.5 ? vec2((seg + 0.5) / u_span - hash(vec2(row, 3.0) + u_so) * 50.0 / u_span, rowY) : vec2(rowY, (seg + 0.5) / u_span - hash(vec2(row, 3.0) + u_so) * 50.0 / u_span);
      float fb = t_base(sc);
      float act = step(u_thr, fb) * step(hash(vec2(seg, row) + 29.0), u_amount);
      float v = pow(t, u_gamma) * (0.3 + 0.8 * fb) * lenJ;
      float f0 = t_base(p);
      float f = mix(f0, clamp(v, 0.0, 1.0), act);
      return ramp(f);
    }
  `,
});
