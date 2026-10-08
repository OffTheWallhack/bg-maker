import { R, T, defineTexture } from './define';

export default defineTexture({
  id: 'concrete', name: 'Betón', category: 'material',
  params: [
    R('scale', 'Mierka', 0.5, 6, 1.8),
    R('rough', 'Drsnosť', 0, 1, 0.6),
    R('pits', 'Póry', 0, 1, 0.5),
    R('stains', 'Škvrny', 0, 1, 0.45),
    R('contrast', 'Kontrast', 0.5, 2.5, 1.3),
    R('light', 'Smer svetla', 0, 360, 120, 1),
    T('seams', 'Debnenie (škáry)', true),
  ],
  glsl: /* glsl */ `
    float t_h(vec2 p){
      float h = fbm(p * u_scale * 2.0 + u_so) * 0.7 + fbm(p * u_scale * 14.0 + u_so) * 0.25 * u_rough;
      h -= u_pits * 0.6 * smoothstep(0.78, 0.9, vnoise(p * u_scale * 38.0 + u_so + 3.0));
      return h;
    }
    vec3 tex(vec2 p, vec2 uv){
      float e = 0.002;
      float h = t_h(p);
      vec2 g = vec2(t_h(p + vec2(e, 0.0)) - h, t_h(p + vec2(0.0, e)) - h) / e;
      float a = radians(u_light);
      float s = 0.5 + dot(g, vec2(cos(a), sin(a))) * 0.05 * (0.4 + u_rough);
      s += (h - 0.5) * 0.5;
      s = clamp((s - 0.5) * u_contrast + 0.5, 0.0, 1.0);
      vec3 c = ramp(s * 0.7);
      float st = fbm(p * 2.2 + u_so + 9.0);
      c = mix(c, u_dirt * 0.5, smoothstep(0.5, 0.85, st) * u_stains * 0.7);
      if (u_seams > 0.5){
        vec2 sp = vec2(abs(fract(p.x * 1.0 + 0.5) - 0.5), abs(fract(p.y * 0.6 + 0.5) - 0.5));
        float line = min(smoothstep(0.004, 0.0, sp.x), 1.0) + smoothstep(0.004, 0.0, sp.y);
        c *= 1.0 - clamp(line, 0.0, 1.0) * 0.5;
        c += clamp(smoothstep(0.012, 0.004, sp.x) - smoothstep(0.004, 0.0, sp.x), 0.0, 1.0) * 0.03;
      }
      return c;
    }
  `,
});
