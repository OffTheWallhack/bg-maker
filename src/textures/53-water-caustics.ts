import { R, defineTexture } from './define';

export default defineTexture({
  id: 'water-caustics', name: 'Voda – kaustiky (dno bazéna)', category: 'nature',
  params: [
    R('scale', 'Mierka', 0.4, 4, 1.2),
    R('sharp', 'Ostrosť čiar', 2, 16, 8),
    R('bright', 'Jas', 0.3, 3, 1.4),
    R('depth', 'Hĺbka (tma)', 0, 1, 0.5),
    R('wobble', 'Zvlnenie', 0, 1, 0.3),
    R('tint', 'Farebný odtieň', 0, 1, 0.5),
  ],
  glsl: /* glsl */ `
    float t_caus(vec2 p){
      vec2 q = p * u_scale * 6.0 - 250.0 + u_so * 0.05;
      q += (vec2(fbm(p * 2.0 + u_so), fbm(p * 2.0 + u_so + 4.0)) - 0.5) * u_wobble * 3.0;
      vec2 i = q; float c = 1.0; float inten = 0.0055;
      for (int n = 0; n < 5; n++){
        float t = TT + float(n) * 1.7;
        i = q + vec2(cos(t - i.x) + sin(t + i.y), sin(t - i.y) + cos(t + i.x));
        c += 1.0 / length(vec2(q.x / (sin(i.x + t) / inten), q.y / (cos(i.y + t) / inten)));
      }
      c /= 5.0; c = 1.17 - pow(c, 1.4);
      return pow(abs(c), u_sharp);
    }
    vec3 tex(vec2 p, vec2 uv){
      float c = t_caus(p);
      float c2 = t_caus(p * 1.35 + 3.0);
      vec3 deep = mix(u_bg, ramp(0.25), (1.0 - u_depth) * 0.5 + 0.2 * fbm(p * 2.0 + u_so));
      vec3 col = deep;
      col += mix(u_ink1, u_ink2, u_tint) * c * u_bright;
      col += u_hi * c2 * u_bright * 0.35 * u_tint;
      return col;
    }
  `,
});
