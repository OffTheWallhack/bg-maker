import { R, defineTexture } from './define';

export default defineTexture({
  id: 'cell-outlines', name: 'Bunkové obrysy (mikrobiológia)', category: 'nature',
  params: [
    R('scale', 'Veľkosť buniek', 1, 10, 4),
    R('smooth', 'Splývanie', 0.5, 3, 1.2),
    R('echo', 'Počet obrysov', 0, 8, 4, 1),
    R('gap', 'Rozostup obrysov', 0.1, 1, 0.45),
    R('fill', 'Výplň buniek', 0, 1, 1.0),
    R('warp', 'Organickosť', 0, 1, 0.5),
  ],
  glsl: /* glsl */ `
    float t_f(vec2 p){
      vec2 q = p * u_scale + (vec2(fbm(p * 3.0 + u_so), fbm(p * 3.0 + u_so + 4.0)) - 0.5) * u_warp * 1.2;
      vec2 i = floor(q);
      float f = 0.0;
      for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++){
        vec2 g = i + vec2(float(x), float(y));
        vec3 h = hash3(g + u_so);
        vec2 ctr = g + 0.2 + 0.6 * h.xy + 0.1 * vec2(cos(TT + h.x * 6.0), sin(TT + h.y * 6.0));
        float r = 0.1 + 0.3 * h.z * h.z;
        f += pow(r * r / (dot(q - ctr, q - ctr) + 1e-3), u_smooth);
      }
      return f;
    }
    vec3 tex(vec2 p, vec2 uv){
      float f = t_f(p);
      float lf = log2(f + 1e-4) / u_smooth;
      vec3 c = u_bg;
      float inside = smoothstep(-0.03, 0.03, lf);
      c = mix(c, u_ink1 * 0.95, inside * u_fill);
      float x = -lf / u_gap;
      float fw = fwidth(x) + 1e-3;
      float lineId = floor(x);
      float ln = (1.0 - smoothstep(0.0, 0.12 + fw, abs(fract(x) - 0.5) * 2.0 - 0.0 + 0.0 - 0.0 - 0.0 + 0.0 + 0.0)) * 0.0;
      float edge = 1.0 - smoothstep(0.0, 0.05 + fwidth(lf), abs(lf));
      c = mix(c, u_bg * 0.2, edge * 0.0);
      for (int k = 0; k < 8; k++){
        if (float(k) >= u_echo) break;
        float lv = -(float(k) + 1.0) * u_gap * 0.35;
        float d = abs(lf - lv);
        float l = 1.0 - smoothstep(0.012, 0.012 + fwidth(lf) * 1.4 + 0.004, d);
        vec3 lc = mod(float(k), 2.0) < 0.5 ? u_ink1 : u_bg * 0.15;
        c = mix(c, lc, l * step(lf, 0.0));
      }
      float rim = 1.0 - smoothstep(0.0, 0.02 + fwidth(lf) * 1.4, abs(lf));
      c = mix(c, u_bg * 0.1, rim);
      c = mix(c, u_ink1, (1.0 - smoothstep(0.0, 0.02 + fwidth(lf) * 1.4, abs(lf + 0.05))) * 0.9);
      return c;
    }
  `,
});
