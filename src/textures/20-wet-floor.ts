import { R, defineTexture } from './define';

export default defineTexture({
  id: 'wet-floor', name: 'Mokrá podlaha – odraz', category: 'material',
  params: [
    R('horizon', 'Horizont', -0.3, 0.4, 0.12),
    R('count', 'Počet svetiel', 3, 24, 9, 1),
    R('stretch', 'Natiahnutie odrazu', 0.5, 6, 2.6),
    R('ripple', 'Vlnenie', 0, 1, 0.45),
    R('puddle', 'Kaluže', 0, 1, 0.7),
    R('glow', 'Žiara', 0, 1, 0.6),
    R('grit', 'Zrno podlahy', 0, 1, 0.5),
  ],
  glsl: /* glsl */ `
    float t_lights(float x, float y, out vec3 col){
      float acc = 0.0; col = vec3(0.0);
      for (int i = 0; i < 24; i++){
        if (float(i) >= u_count) break;
        float fi = float(i);
        float lx = (hash(vec2(fi, 1.0) + u_so) - 0.5) * 1.6;
        float w = 0.004 + 0.02 * hash(vec2(fi, 2.0) + u_so);
        float br = 0.35 + 0.65 * hash(vec2(fi, 3.0) + u_so);
        br *= 0.75 + 0.25 * sin(TT + fi * 2.1);
        float g = exp(-pow((x - lx) / w, 2.0)) * br;
        vec3 lc = palc(1 + int(mod(fi, 3.0)));
        acc += g; col += lc * g;
      }
      col /= max(acc, 1e-3);
      return acc;
    }
    vec3 tex(vec2 p, vec2 uv){
      float y = p.y - u_horizon;
      vec3 c;
      if (y > 0.0){
        vec3 lc; float l = t_lights(p.x, 0.0, lc);
        vec3 sky = mix(u_bg * 1.2, u_bg * 0.5, smoothstep(0.0, 0.6, y));
        float bar = smoothstep(0.02, 0.0, y) ;
        c = sky + lc * l * bar * 0.8;
        c += ramp(0.6) * 0.15 * u_glow * exp(-y * 7.0) * (0.4 + 0.6 * fbm(vec2(p.x * 3.0, 0.0) + u_so));
      } else {
        float d = -y;
        float rip = (fbm(vec2(p.x * 6.0, d * 28.0) + u_so) - 0.5) * u_ripple * 0.12 * (0.3 + d * 2.0);
        vec3 lc; float l = t_lights(p.x + rip, 0.0, lc);
        float fall = exp(-d * u_stretch);
        float pud = smoothstep(0.55 - u_puddle * 0.3, 0.7 - u_puddle * 0.3, fbm(p * 3.5 + u_so + 14.0) + 0.1 * (1.0 - d));
        float streak = 0.5 + 0.5 * vnoise(vec2(p.x * 300.0, d * 4.0) + u_so);
        vec3 floorc = ramp(0.08 + 0.15 * vnoise(p * 260.0 + u_so) * u_grit + 0.08 * fbm(p * 8.0 + u_so));
        vec3 refl = lc * l * fall * (0.5 + 0.9 * streak) * (0.4 + 0.6 * pud);
        c = floorc * 0.7 + refl * (0.7 + u_glow) + ramp(0.5) * u_glow * 0.18 * fall * pud;
      }
      return c;
    }
  `,
});
