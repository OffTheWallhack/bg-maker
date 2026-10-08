import { R, S, T, defineTexture } from './define';

export default defineTexture({
  id: 'led-wall', name: 'LED stena – pixely', category: 'light',
  params: [
    R('pitch', 'Počet LED (výška)', 20, 140, 70, 1),
    S('content', 'Obsah', ['Plazma', 'Pruhy', 'Prechod', 'Šum'], 0),
    R('round', 'Zaoblenie', 0, 1, 0.6),
    R('gap', 'Medzera', 0.05, 0.6, 0.22),
    R('contrast', 'Kontrast', 0.5, 3, 1.4),
    R('bloom', 'Žiara', 0, 1.5, 0.6),
    T('rgb', 'RGB subpixely', false),
  ],
  glsl: /* glsl */ `
    float t_content(vec2 p){
      if (u_content < 0.5){
        float a = sin(p.x * 5.0 + TT) + sin(p.y * 4.0 + 1.3 * sin(TT + 1.0)) + sin((p.x + p.y) * 3.0 - TT) + sin(length(p) * 7.0 - TT);
        return 0.5 + 0.25 * a;
      }
      if (u_content < 1.5) return 0.5 + 0.5 * sin(p.x * 14.0 + 3.0 * tnoise(p * 2.0 + u_so, 1.0));
      if (u_content < 2.5) return clamp(0.5 + p.y * 1.4 + (tfbm(p * 1.5 + u_so, 0.8) - 0.5) * 0.8, 0.0, 1.0);
      return tfbm(p * 3.0 + u_so, 0.9);
    }
    vec3 tex(vec2 p, vec2 uv){
      vec2 q = p * u_pitch;
      vec2 id = floor(q); vec2 f = fract(q) - 0.5;
      vec2 cp = (id + 0.5) / u_pitch;
      float v = remap(t_content(cp), 0.5 - 0.5 / u_contrast, 0.5 + 0.5 / u_contrast);
      float r = mix(0.0, 0.5, u_round);
      vec2 b = abs(f) - (0.5 - u_gap * 0.5) + r;
      float d = length(max(b, 0.0)) + min(max(b.x, b.y), 0.0) - r;
      float aa = fwidth(d) + 0.01;
      float led = 1.0 - smoothstep(-aa, aa, d);
      vec3 col = ramp(v);
      if (u_rgb > 0.5){
        float sx = floor((f.x + 0.5) * 3.0);
        vec3 m = vec3(sx < 0.5 ? 1.0 : 0.15, (sx > 0.5 && sx < 1.5) ? 1.0 : 0.15, sx > 1.5 ? 1.0 : 0.15);
        col *= mix(vec3(1.0), m * 1.4, 0.55);
      }
      vec3 c = u_bg * 0.25 + col * led;
      float glow = exp(-dot(f, f) * 5.0) * v * u_bloom * 0.35;
      c += col * glow;
      return c;
    }
  `,
});
