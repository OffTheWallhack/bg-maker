import { R, defineTexture } from './define';

export default defineTexture({
  id: 'ink-water', name: 'Atrament vo vode', category: 'nature',
  params: [
    R('scale', 'Mierka', 0.4, 4, 1.4),
    R('warp', 'Rozvlnenie', 0, 2, 1.1),
    R('power', 'Jemnosť vlákien', 0.6, 5, 2.0),
    R('sx', 'Zdroj X', -0.5, 0.5, 0.0),
    R('sy', 'Zdroj Y', -0.5, 0.5, 0.15),
    R('spread', 'Dosah', 0.2, 1.4, 0.8),
    R('bright', 'Jas', 0.4, 2, 1.0),
  ],
  glsl: /* glsl */ `
    vec3 tex(vec2 p, vec2 uv){
      vec2 s = p * u_scale + u_so;
      vec2 q = vec2(tfbm(s, 0.9), tfbm(s + 3.3, 0.9));
      vec2 w = s + u_warp * 2.2 * (q - 0.5);
      float f = ridged(w * 1.2 + vec2(0.0, 0.3 * sin(TT)));
      float t = pow(clamp(f, 0.0, 1.0), u_power * 2.0);
      float d = length(p - vec2(u_sx, u_sy));
      float src = exp(-pow(d / u_spread, 1.5) * 1.6);
      float v = clamp(t * 1.8 * src + src * src * 0.35, 0.0, 1.0);
      vec3 c = u_bg + ramp(0.25 + 0.75 * v) * v * u_bright;
      return c;
    }
  `,
});
