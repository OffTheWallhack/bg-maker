import { R, defineTexture } from './define';

export default defineTexture({
  id: 'crumpled-paper', name: 'Pokrčený papier', category: 'material',
  params: [
    R('scale', 'Mierka záhybov', 0.6, 5, 1.7),
    R('depth', 'Hĺbka', 0.2, 3, 1.3),
    R('detail', 'Jemné záhyby', 0, 1, 0.55),
    R('light', 'Smer svetla', 0, 360, 135, 1),
    R('contrast', 'Kontrast', 0.5, 2.5, 1.2),
    R('fiber', 'Vlákna', 0, 1, 0.3),
  ],
  glsl: /* glsl */ `
    float t_h(vec2 p){
      vec2 w = warp(p * u_scale, 0.25, 0.9) + u_so;
      float h = ridged(w * 1.3) * 0.8 + u_detail * 0.5 * ridged(w * 4.1 + 3.0);
      return h;
    }
    vec3 tex(vec2 p, vec2 uv){
      float e = 0.0025;
      float h = t_h(p);
      float hx = t_h(p + vec2(e, 0.0)) - h;
      float hy = t_h(p + vec2(0.0, e)) - h;
      vec3 n = normalize(vec3(-hx * u_depth * 40.0, -hy * u_depth * 40.0, 1.0));
      float a = radians(u_light);
      vec3 l = normalize(vec3(cos(a) * 0.7, sin(a) * 0.7, 0.6));
      float s = dot(n, l);
      s = clamp((s - 0.6) * u_contrast + 0.55, 0.0, 1.0);
      s *= 1.0 - u_fiber * 0.12 * vnoise(vec2(p.x * 500.0, p.y * 40.0) + u_so);
      return ramp(s * 0.95);
    }
  `,
});
