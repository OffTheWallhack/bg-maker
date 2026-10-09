import { R, S, defineTexture } from './define';

export default defineTexture({
  id: 'ascii-matrix', name: 'ASCII / dot-matrix pole', category: 'glitch',
  params: [
    R('cells', 'Počet buniek (výška)', 20, 140, 64, 1),
    S('field', 'Pole', ['Šum', 'Prechod', 'Kruhy'], 0),
    R('scale', 'Mierka poľa', 0.4, 5, 1.5),
    R('contrast', 'Kontrast', 0.5, 3, 1.5),
    R('weight', 'Hrúbka znakov', 0.5, 1.6, 1.0),
    R('tint', 'Farebné bunky', 0, 1, 0.12),
    R('jitter', 'Nepravidelnosť', 0, 1, 0.2),
  ],
  glsl: /* glsl */ `
    float t_field(vec2 p){
      float n = tfbm(p * u_scale + u_so, 0.8);
      if (u_field < 0.5) return n;
      if (u_field < 1.5) return 0.5 + p.y * 1.2 + (n - 0.5) * 0.5;
      return 0.5 + 0.5 * sin(length(p) * u_scale * 9.0 - TT) * 0.6 + (n - 0.5) * 0.5;
    }
    vec3 tex(vec2 p, vec2 uv){
      vec2 q = p * u_cells;
      vec2 id = floor(q);
      vec2 f = fract(q) - 0.5;
      vec3 h = hash3(id + u_so);
      float t = remap(t_field((id + 0.5) / u_cells), 0.5 - 0.5 / u_contrast, 0.5 + 0.5 / u_contrast);
      t = clamp(t + (h.x - 0.5) * u_jitter * 0.4, 0.0, 0.999);
      float lv = floor(t * 6.0);
      float w = u_weight;
      float aa = fwidth(q.x) * 0.9 + 0.01;
      float g = 0.0;
      if (lv < 0.5) g = 0.0;
      else if (lv < 1.5) g = 1.0 - smoothstep(0.07 * w - aa, 0.07 * w + aa, length(f));
      else if (lv < 2.5) g = 1.0 - smoothstep(0.2 * w - aa, 0.2 * w + aa, length(f));
      else if (lv < 3.5){ float a = min(abs(f.x), abs(f.y)); g = (1.0 - smoothstep(0.06 * w, 0.06 * w + aa, a)) * step(max(abs(f.x), abs(f.y)), 0.3); }
      else if (lv < 4.5){ float s = h.y < 0.5 ? 1.0 : -1.0; g = (1.0 - smoothstep(0.07 * w, 0.07 * w + aa, abs(f.x - s * f.y))) * step(max(abs(f.x), abs(f.y)), 0.36); }
      else g = 1.0 - smoothstep(0.36 * w - aa, 0.36 * w + aa, max(abs(f.x), abs(f.y)));
      vec3 col = lv > 4.5 ? u_hi : (h.z < u_tint ? u_ink2 : u_ink1);
      vec3 c = u_bg;
      c = mix(c, col, g);
      return c;
    }
  `,
});
