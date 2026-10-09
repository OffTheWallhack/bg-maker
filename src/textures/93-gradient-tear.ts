import { R, defineTexture } from './define';

export default defineTexture({
  id: 'gradient-tear', name: 'Gradient s trhlinami (glitch)', category: 'glitch',
  params: [
    R('points', 'Farebné body', 3, 6, 4, 1),
    R('slices', 'Počet rezov', 4, 60, 20, 1),
    R('shift', 'Posun rezov', 0, 0.5, 0.14),
    R('split', 'RGB rozdelenie', 0, 0.06, 0.012, 0.001),
    R('activity', 'Podiel rezov', 0, 1, 0.45),
    R('power', 'Mäkkosť gradientu', 0.8, 4, 2.0),
  ],
  glsl: /* glsl */ `
    vec3 t_grad(vec2 p){
      float asp = u_res.x / u_res.y;
      vec3 acc = vec3(0.0); float ws = 0.0;
      for (int i = 0; i < 6; i++){
        if (float(i) >= u_points) break;
        float fi = float(i);
        vec3 h = hash3(vec2(fi, 41.0) + u_so);
        vec2 ctr = (h.xy - 0.5) * vec2(asp, 1.0) * 0.9 + 0.06 * vec2(cos(TT + fi), sin(TT + fi * 1.7));
        float w = 1.0 / pow(length(p - ctr) + 0.04, u_power);
        int k = int(mod(fi, 4.0));
        acc += (k == 0 ? u_ink2 : (k == 1 ? u_ink1 : (k == 2 ? u_hi : u_bg))) * w; ws += w;
      }
      return acc / ws;
    }
    vec3 tex(vec2 p, vec2 uv){
      float frame = floor(u_phase * u_cycles * 8.0);
      float ys = (p.y + 0.5) * u_slices;
      float id = floor(ys + (vnoise(vec2(ys * 0.5, u_so.x)) - 0.5) * 1.6);
      float on = step(hash(vec2(id, frame + 3.0)), u_activity);
      float sh = (hash(vec2(id, frame)) - 0.5) * 2.0 * u_shift * on;
      float sp = u_split * (0.3 + on * 1.7);
      return vec3(t_grad(p + vec2(sh + sp, 0.0)).r, t_grad(p + vec2(sh, 0.0)).g, t_grad(p + vec2(sh - sp, 0.0)).b);
    }
  `,
});
