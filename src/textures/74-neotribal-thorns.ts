import { R, T, defineTexture } from './define';

export default defineTexture({
  id: 'neotribal-thorns', name: 'Neotribal – tŕňový pás', category: 'tribal',
  params: [
    R('rows', 'Počet radov', 1, 5, 3, 1),
    R('freq', 'Počet tŕňov', 2, 24, 9),
    R('height', 'Výška tŕňov', 0.05, 0.5, 0.2),
    R('sharp', 'Ostrosť hrotov', 0.6, 3, 1.5),
    R('wave', 'Vlnenie pásu', 0, 0.3, 0.1),
    R('wf', 'Frekvencia vlny', 0.5, 6, 2.0),
    R('gap', 'Rozostup radov', 0.05, 0.4, 0.2),
    T('mirror', 'Zrkadlo', false),
  ],
  glsl: /* glsl */ `
    vec3 tex(vec2 p, vec2 uv){
      float x = u_mirror > 0.5 ? abs(p.x) : p.x;
      vec3 c = u_bg;
      for (int k = 0; k < 5; k++){
        if (float(k) >= u_rows) break;
        float fk = float(k);
        float yb = (fk - (u_rows - 1.0) * 0.5) * u_gap + u_wave * sin(x * u_wf * 3.0 + fk * 1.3 + TT);
        float dir = mod(fk, 2.0) < 0.5 ? 1.0 : -1.0;
        float u = fract(x * u_freq + 0.37 * fk + 0.5);
        float tri = 1.0 - abs(2.0 * u - 1.0);
        float hh = u_height * pow(tri, u_sharp) * (0.7 + 0.3 * hash(vec2(floor(x * u_freq + 0.37 * fk + 0.5), fk) + u_so));
        float dy = (p.y - yb) * dir;
        float aa = fwidth(dy) + 0.0006;
        float base = 0.012;
        float m = smoothstep(-base - aa, -base + aa, dy) * (1.0 - smoothstep(hh - aa, hh + aa, dy));
        float g = clamp(dy / max(hh, 1e-3), 0.0, 1.0);
        float side = abs(2.0 * u - 1.0);
        vec3 col = ramp(0.2 + 0.8 * (1.0 - g * 0.7) * (0.55 + 0.45 * (1.0 - side)));
        col = mix(col, u_ink1, smoothstep(0.1, 0.0, side) * 0.25);
        float edgeDark = smoothstep(hh + 0.01, hh, dy) * step(0.0, dy) * (1.0 - m);
        c = mix(c, u_bg, edgeDark * 0.85);
        c = mix(c, col, m);
      }
      return c;
    }
  `,
});
