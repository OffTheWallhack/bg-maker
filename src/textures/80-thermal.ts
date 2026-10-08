import { R, defineTexture } from './define';

export default defineTexture({
  id: 'thermal', name: 'Termovízia', category: 'glitch',
  params: [
    R('scale', 'Mierka', 0.4, 4, 1.2),
    R('levels', 'Úrovne farieb', 3, 20, 9, 1),
    R('smooth', 'Plynulosť', 0, 1, 0.5),
    R('iso', 'Izočiary', 0, 1, 0.35),
    R('hot', 'Horúce jadrá', 0, 1.5, 0.8),
    R('blur', 'Rozmazanie', 0, 1, 0.5),
  ],
  glsl: /* glsl */ `
    vec3 tex(vec2 p, vec2 uv){
      float h = tfbm(p * u_scale + u_so, 0.8);
      h += u_hot * 0.9 * pow(tfbm(p * u_scale * 0.7 + u_so + 9.0, 0.8), 3.0);
      h = clamp((h - 0.2) / 1.0, 0.0, 1.0);
      h += (vnoise(p * 300.0 + u_so) - 0.5) * 0.05 * (1.0 - u_blur);
      float q = floor(h * u_levels) / u_levels;
      float v = mix(q, h, u_smooth);
      vec3 c = ramp(v);
      float x = h * u_levels;
      float l = 1.0 - smoothstep(0.0, fwidth(x) * 1.5 + 0.03, abs(fract(x) - 0.5) * 2.0 - 0.0);
      c = mix(c, u_bg, (1.0 - smoothstep(0.0, fwidth(x) * 1.5 + 0.02, abs(fract(x + 0.5) - 0.5))) * u_iso * 0.8);
      return c;
    }
  `,
});
