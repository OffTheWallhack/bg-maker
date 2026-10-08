import { R, defineTexture } from './define';

export default defineTexture({
  id: 'bokeh', name: 'Bokeh rozostrenie', category: 'light',
  params: [
    R('size', 'Veľkosť', 0.05, 0.4, 0.16),
    R('density', 'Hustota', 0.1, 1, 0.5),
    R('soft', 'Mäkkosť', 0.02, 0.6, 0.12),
    R('rim', 'Jasný okraj', 0, 1, 0.5),
    R('layers', 'Hĺbka (vrstvy)', 1, 3, 3, 1),
    R('bright', 'Jas', 0.3, 2, 1.0),
    R('float', 'Vznášanie', 0, 1, 0.5),
  ],
  glsl: /* glsl */ `
    vec3 tex(vec2 p, vec2 uv){
      vec3 c = u_bg + ramp(0.35) * 0.12 * tfbm(p * 1.4 + u_so, 0.7);
      for (int L = 0; L < 3; L++){
        if (float(L) >= u_layers) break;
        float fl = float(L);
        float cell = u_size * (1.9 - fl * 0.5);
        vec2 q = p / cell + vec2(fl * 7.3, fl * 3.1);
        vec2 gi = floor(q);
        for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++){
          vec2 g = gi + vec2(float(x), float(y));
          vec3 h = hash3(g + u_so * 0.1 + fl * 19.0);
          if (h.z > u_density) continue;
          vec2 ctr = g + 0.15 + 0.7 * hash2(g + 3.0 + fl) + u_float * 0.25 * vec2(cos(TT + h.x * TAU), sin(TT + h.y * TAU));
          float rad = (0.28 + 0.2 * hash(g + 9.0 + fl)) ;
          float dd = length(q - ctr) / rad;
          float disc = 1.0 - smoothstep(1.0 - u_soft, 1.0 + u_soft * 0.3, dd);
          float ring = smoothstep(1.0 - u_soft * 2.0, 1.0 - u_soft * 0.3, dd) * disc;
          float br = (0.25 + 0.75 * hash(g + 21.0 + fl)) * u_bright * (1.0 - fl * 0.2);
          vec3 col = palc(1 + int(floor(hash(g + 31.0 + fl) * 3.0)));
          c += col * (disc * 0.55 + ring * u_rim * 0.8) * br * 0.55;
        }
      }
      return c;
    }
  `,
});
