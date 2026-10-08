import { R, T, defineTexture } from './define';

export default defineTexture({
  id: 'lissajous', name: 'Oscilloscope – Lissajous', category: 'geometry',
  params: [
    R('a', 'Frekvencia X', 1, 9, 3, 1),
    R('b', 'Frekvencia Y', 1, 9, 2, 1),
    R('ph', 'Fáza', 0, 6.283, 1.2),
    R('size', 'Veľkosť', 0.3, 1.1, 0.78),
    R('thick', 'Hrúbka', 0.0008, 0.01, 0.0026, 0.0002),
    R('glow', 'Žiara', 0, 2, 1.0),
    R('trails', 'Dobiehanie', 1, 3, 3, 1),
    T('grid', 'Mriežka obrazovky', true),
  ],
  glsl: /* glsl */ `
    float t_curve(vec2 p, float ph, vec2 amp){
      float dmin = 1e3;
      vec2 prev = vec2(sin(ph), 0.0) * amp;
      for (int i = 1; i <= 110; i++){
        float t = float(i) / 110.0 * TAU;
        vec2 pt = vec2(sin(u_a * t + ph), sin(u_b * t)) * amp;
        dmin = min(dmin, segDist(p, prev, pt));
        prev = pt;
      }
      return dmin;
    }
    vec3 tex(vec2 p, vec2 uv){
      float asp = u_res.x / u_res.y;
      vec2 amp = vec2(min(u_size * 0.5, asp * 0.46), u_size * 0.5 * 0.9);
      vec3 c = u_bg;
      if (u_grid > 0.5){
        vec2 g = p / (amp / 4.0);
        float gl = max(aaLine(abs(fract(g.x + 0.5) - 0.5) * 0.12, 0.0016) , aaLine(abs(fract(g.y + 0.5) - 0.5) * 0.12, 0.0016));
        gl *= step(abs(p.x), amp.x * 1.04) * step(abs(p.y), amp.y * 1.04);
        c = inkOn(c, u_ink1 * 0.5, gl * 0.35);
      }
      for (int k = 0; k < 3; k++){
        if (float(k) >= u_trails) break;
        float ph = u_ph + TT - float(k) * 0.22;
        float d = t_curve(p, ph, amp);
        float fade = 1.0 - float(k) * 0.35;
        float core = exp(-pow(d / u_thick, 2.0));
        float halo = exp(-d * 40.0 / (0.3 + u_glow * 0.7)) * 0.4 * u_glow;
        vec3 col = mix(u_ink1, u_ink2, float(k) * 0.5);
        c = 1.0 - (1.0 - c) * (1.0 - col * (core + halo) * fade);
      }
      return c;
    }
  `,
});
