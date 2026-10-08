import { R, S, defineTexture } from './define';

export default defineTexture({
  id: 'rgb-split', name: 'RGB split glitch', category: 'glitch',
  params: [
    S('base', 'Základ', ['Škvrny', 'Kruh', 'Pruhy'], 1),
    R('scale', 'Mierka', 0.5, 5, 1.5),
    R('slices', 'Počet rezov', 4, 60, 22, 1),
    R('shift', 'Posun rezov', 0, 0.5, 0.12),
    R('split', 'RGB rozdelenie', 0, 0.08, 0.02, 0.001),
    R('activity', 'Podiel rezov', 0, 1, 0.5),
    R('blocks', 'Farebné bloky', 0, 1, 0.3),
  ],
  glsl: /* glsl */ `
    float t_base(vec2 p){
      if (u_base < 0.5) return smoothstep(0.35, 0.65, tfbm(p * u_scale + u_so, 0.8));
      if (u_base < 1.5){
        float r = length(p - vec2(0.0, 0.03)) * u_scale;
        return smoothstep(0.55, 0.5, r) * smoothstep(0.22, 0.27, r) + 0.8 * smoothstep(0.1, 0.09, r);
      }
      return smoothstep(0.45, 0.55, 0.5 + 0.5 * sin(p.y * u_scale * 30.0 + 2.0 * tnoise(p * 1.5 + u_so, 1.0)));
    }
    vec3 tex(vec2 p, vec2 uv){
      float frame = floor(u_phase * u_cycles * 8.0);
      float ys = (p.y + 0.5) * u_slices;
      float id = floor(ys + (vnoise(vec2(ys * 0.5, u_so.x)) - 0.5) * 1.6);
      float on = step(hash(vec2(id, frame + 3.0)), u_activity);
      float sh = (hash(vec2(id, frame)) - 0.5) * 2.0 * u_shift * on;
      float sp = u_split * (0.4 + on * 1.6);
      float fr = t_base(p + vec2(sh + sp, 0.0));
      float fg = t_base(p + vec2(sh, 0.0));
      float fb = t_base(p + vec2(sh - sp, 0.0));
      vec3 c = vec3(mix(u_bg.r, u_ink1.r, fr), mix(u_bg.g, u_ink1.g, fg), mix(u_bg.b, u_ink1.b, fb));
      c = inkOn(c, u_ink2, max(max(fr, fb) - fg, 0.0) * 0.9);
      vec2 bq = floor(p * vec2(8.0, 22.0) + 100.0 + frame);
      float blk = step(1.0 - u_blocks * 0.12, hash(bq + u_so)) * on;
      c = mix(c, u_ink2, blk * 0.8);
      return c;
    }
  `,
});
