import { R, defineTexture } from './define';

export default defineTexture({
  id: 'crosshatch', name: 'Crosshatch šrafovanie', category: 'print',
  params: [
    R('freq', 'Hustota', 20, 160, 56, 1),
    R('angle', 'Uhol', 0, 180, 25, 1),
    R('flow', 'Mierka tónov', 0.4, 5, 1.3),
    R('contrast', 'Kontrast', 0.4, 3, 1.5),
    R('wobble', 'Chvenie ruky', 0, 1.5, 0.35),
    R('accent', 'Akcent', 0, 1, 0.5),
  ],
  glsl: /* glsl */ `
    float t_hatch(vec2 p, float ang, float freq, float d, float th){
      vec2 q = rot(ang) * p;
      float x = q.y * freq + (vnoise(q * 7.0 + u_so) - 0.5) * u_wobble;
      float c = abs(fract(x) - 0.5);
      float w = clamp((d - th) * 1.6, 0.0, 1.0) * 0.5;
      float fw = fwidth(x) * 0.8 + 1e-4;
      return (1.0 - smoothstep(w - fw, w + fw, c)) * step(0.002, w);
    }
    vec3 tex(vec2 p, vec2 uv){
      float d = remap(tfbm(p * u_flow + u_so, 0.8), 0.5 - 0.5 / u_contrast, 0.5 + 0.5 / u_contrast);
      float a = radians(u_angle);
      float h = t_hatch(p, a, u_freq, d, 0.08);
      h = max(h, t_hatch(p, a + 1.5708, u_freq, d, 0.3));
      h = max(h, t_hatch(p, a + 0.7854, u_freq * 1.1, d, 0.5));
      h = max(h, t_hatch(p, a - 0.7854, u_freq * 1.1, d, 0.7));
      float k = t_hatch(p + 0.004, a + 0.35, u_freq * 0.7, d, 0.75) * u_accent;
      return inkOn(inkOn(u_bg, u_ink1, h), u_ink2, k);
    }
  `,
});
