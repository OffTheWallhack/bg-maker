import { R, S, defineTexture } from './define';

export default defineTexture({
  id: 'speaker-grille', name: 'Perforovaná mriežka reproduktora', category: 'material',
  params: [
    S('pattern', 'Raster', ['Šesťuholníkový', 'Štvorcový'], 0),
    R('count', 'Počet otvorov', 8, 70, 30, 1),
    R('hole', 'Veľkosť otvoru', 0.2, 0.9, 0.55),
    R('angle', 'Natočenie', 0, 90, 0, 1),
    R('light', 'Smer svetla', 0, 360, 125, 1),
    R('bevel', 'Hrana otvoru', 0, 1, 0.6),
    R('glow', 'Svetlo zozadu', 0, 1, 0.25),
  ],
  glsl: /* glsl */ `
    vec3 tex(vec2 p, vec2 uv){
      vec2 q = rot(radians(u_angle)) * p * u_count;
      vec2 f; vec2 id;
      if (u_pattern < 0.5){
        vec2 r = vec2(1.0, 1.7320508);
        vec2 h = r * 0.5;
        vec2 a = mod(q, r) - h;
        vec2 b = mod(q - h, r) - h;
        vec2 gv = dot(a, a) < dot(b, b) ? a : b;
        f = gv; id = q - gv;
      } else { f = fract(q) - 0.5; id = floor(q); }
      float d = length(f) - u_hole * 0.5;
      float aa = fwidth(d) + 0.002;
      float inside = 1.0 - smoothstep(-aa, aa, d);
      float li = radians(u_light);
      vec2 ld = vec2(cos(li), sin(li));
      float bev = smoothstep(0.0, 0.18, d) * (1.0 - smoothstep(0.18, 0.4, d));
      float lit = dot(normalize(f + 1e-5), ld) * u_bevel * bev;
      float plate = 0.34 + 0.15 * (fbm(p * 3.0 + u_so) - 0.5) + lit * 0.45;
      plate += 0.12 * smoothstep(0.7, 0.0, length(p - ld * 0.3));
      plate -= 0.04 * vnoise(p * 400.0 + u_so);
      vec3 c = ramp(clamp(plate, 0.0, 1.0));
      vec3 back = mix(u_bg * 0.35, ramp(0.55) , u_glow * (0.4 + 0.6 * hash(id + u_so) ));
      back *= 0.55 + 0.45 * smoothstep(0.0, -0.3, d);
      return mix(c, back, inside);
    }
  `,
});
