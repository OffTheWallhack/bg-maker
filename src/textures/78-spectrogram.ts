import { R, defineTexture } from './define';

export default defineTexture({
  id: 'spectrogram', name: 'Spektrogram', category: 'glitch',
  params: [
    R('cx', 'Počet stĺpcov', 20, 220, 90, 1),
    R('cy', 'Počet riadkov', 20, 220, 120, 1),
    R('tscale', 'Dĺžka v čase', 0.3, 4, 1.4),
    R('fscale', 'Frekvenčné pásma', 1, 14, 5),
    R('harm', 'Harmonické čiary', 0, 1, 0.5),
    R('contrast', 'Kontrast', 0.5, 3, 1.5),
    R('smooth', 'Vyhladenie', 0, 1, 0.0),
  ],
  glsl: /* glsl */ `
    vec3 tex(vec2 p, vec2 uv){
      vec2 g = vec2(u_cx, u_cy);
      vec2 qp = mix((floor(p * g) + 0.5) / g, p, u_smooth);
      float t = qp.x * u_tscale * 3.0 + u_so.x;
      float f = (qp.y + 0.5) * u_fscale;
      float e = tfbm(vec2(t * 0.8, f) + vec2(0.0, 0.0), 0.8);
      float bands = vnoise(vec2(t * 0.35, f * 0.6 + u_so.y));
      float h = pow(max(0.0, sin(f * 6.0 * (1.0 + 0.1 * bands)) * 0.5 + 0.5), 4.0) * smoothstep(0.35, 0.8, bands) * u_harm;
      float v = e * 0.8 * (1.0 - 0.6 * (qp.y + 0.5)) + h * 0.7;
      v = remap(v, 0.5 - 0.5 / u_contrast, 0.5 + 0.5 / u_contrast);
      v += (hash(floor(p * g) + u_so) - 0.5) * 0.06 * (1.0 - u_smooth);
      return ramp(v);
    }
  `,
});
