import { R, defineTexture } from './define';

export default defineTexture({
  id: 'crt-bloom-bars', name: 'CRT – žiariace pásy', category: 'glitch',
  params: [
    R('count', 'Počet pásov', 2, 12, 7, 1),
    R('thick', 'Hrúbka', 0.004, 0.08, 0.02, 0.001),
    R('bloom', 'Žiara (bloom)', 0, 2, 1.0),
    R('hvar', 'Premenlivosť po šírke', 0.2, 4, 1.2),
    R('mask', 'Fosforová maska', 0, 1, 0.4),
    R('maskn', 'Jemnosť masky', 60, 600, 240, 1),
    R('roll', 'Chvenie', 0, 1, 0.3),
  ],
  glsl: /* glsl */ `
    vec3 tex(vec2 p, vec2 uv){
      float asp = u_res.x / u_res.y;
      vec3 acc = vec3(0.0);
      float jit = u_roll * 0.004 * sin(p.y * 120.0 + TT * 2.0);
      for (int i = 0; i < 12; i++){
        if (float(i) >= u_count) break;
        float fi = float(i);
        vec3 h = hash3(vec2(fi, 4.0) + u_so);
        float y0 = (h.x - 0.5) * 1.05 + 0.02 * sin(TT + fi * 1.9);
        float th = u_thick * (0.4 + 1.2 * h.y);
        float d = p.y - y0 + jit;
        float core = exp(-pow(d / th, 2.0));
        float blm = exp(-abs(d) / (th * 7.0)) * 0.3 * u_bloom;
        float along = smoothstep(0.15, 0.85, tfbm(vec2(p.x * u_hvar * 1.5, fi * 3.0) + u_so, 0.8));
        vec3 col = palc(1 + int(mod(fi, 3.0)));
        acc += col * (core + blm) * along * (0.45 + 0.55 * h.z);
      }
      float mx = floor(fract(p.x * u_maskn) * 3.0);
      vec3 mk = vec3(mx < 0.5 ? 1.0 : 0.5, (mx > 0.5 && mx < 1.5) ? 1.0 : 0.5, mx > 1.5 ? 1.0 : 0.5);
      acc *= mix(vec3(1.0), mk * 1.3, u_mask);
      acc *= 0.9 + 0.1 * sin(p.y * 700.0);
      vec3 c = u_bg + acc;
      c += u_dirt * 0.04 * tfbm(p * 2.0 + u_so, 0.6);
      return c / (1.0 + c * 0.25);
    }
  `,
});
