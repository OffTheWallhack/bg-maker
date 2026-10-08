import { R, defineTexture } from './define';

export default defineTexture({
  id: 'vhs-tracking', name: 'VHS tracking', category: 'glitch',
  params: [
    R('scale', 'Mierka obrazu', 0.5, 5, 1.6),
    R('bands', 'Pásy trackingu', 0, 4, 2, 1),
    R('bandw', 'Šírka pásu', 0.01, 0.2, 0.06),
    R('jitter', 'Chvenie riadkov', 0, 1, 0.35),
    R('bleed', 'Farebný posun', 0, 1, 0.5),
    R('noise', 'Šum v páse', 0, 1, 0.7),
    R('head', 'Spodný skew', 0, 1, 0.5),
  ],
  glsl: /* glsl */ `
    float t_base(vec2 p){
      float f = tfbm(p * u_scale + u_so, 0.8);
      f += 0.25 * smoothstep(0.5, 0.0, abs(p.y + 0.05 * sin(p.x * 4.0))) ;
      return clamp(f * 0.95, 0.0, 1.0);
    }
    vec3 tex(vec2 p, vec2 uv){
      float y = uv.y;
      float frame = floor(u_phase * u_cycles * 24.0);
      float row = floor(p.y * 480.0);
      float off = (hash(vec2(row, frame)) - 0.5) * u_jitter * 0.012;
      float infl = 0.0;
      for (int k = 0; k < 4; k++){
        if (float(k) >= u_bands) break;
        float fk = float(k);
        float yc = fract(hash(vec2(fk, 7.0) + u_so) + u_phase * u_cycles * (k == 0 ? 1.0 : 1.0) + fk * 0.31);
        float dy = abs(fract(y - yc + 0.5) - 0.5);
        infl = max(infl, smoothstep(u_bandw, 0.0, dy));
      }
      off += infl * (hash(vec2(row, frame + 5.0)) - 0.3) * 0.12;
      float hs = smoothstep(0.07, 0.0, y) * u_head;
      off += hs * (0.05 + 0.1 * hash(vec2(row, frame)));
      float bl = u_bleed * 0.012 * (1.0 + infl * 2.0);
      float fr = t_base(p + vec2(off + bl, 0.0));
      float fg = t_base(p + vec2(off, 0.0));
      float fb = t_base(p + vec2(off - bl, 0.0));
      vec3 c = vec3(ramp(fr).r, ramp(fg).g, ramp(fb).b);
      float n = hash(vec3(floor(gl_FragCoord.xy * 0.5), frame));
      c = mix(c, vec3(n) * 0.9, infl * u_noise * 0.7);
      c += (n - 0.5) * 0.05;
      c *= 0.9 + 0.1 * sin(p.y * 900.0);
      return c;
    }
  `,
});
