import { R, defineTexture } from './define';

export default defineTexture({
  id: 'mesh-gradient', name: 'Mesh gradient', category: 'gradient',
  params: [
    R('points', 'Počet farebných bodov', 3, 6, 5, 1),
    R('warp', 'Zvlnenie', 0, 1.5, 0.7),
    R('power', 'Mäkkosť prechodov', 0.8, 5, 2.2),
    R('spread', 'Rozptyl', 0.3, 1.4, 0.9),
    R('drift', 'Pohyb', 0, 1, 0.5),
    R('dark', 'Stmavenie', 0, 1, 0.15),
  ],
  glsl: /* glsl */ `
    vec3 tex(vec2 p, vec2 uv){
      float asp = u_res.x / u_res.y;
      vec2 q = twarp(p, u_warp * 0.22, 1.1, 0.6);
      vec3 acc = vec3(0.0); float ws = 0.0;
      for (int i = 0; i < 6; i++){
        if (float(i) >= u_points) break;
        float fi = float(i);
        vec3 h = hash3(vec2(fi, 3.0) + u_so);
        vec2 ctr = (h.xy - 0.5) * vec2(asp, 1.0) * u_spread + u_drift * 0.12 * vec2(cos(TT + fi * 1.7), sin(TT + fi * 2.3));
        float d = length(q - ctr);
        float w = 1.0 / pow(d + 0.03, u_power);
        int k = int(mod(fi, 4.0));
        vec3 col = k == 0 ? u_ink2 : (k == 1 ? u_ink1 : (k == 2 ? u_hi : u_bg));
        acc += col * w; ws += w;
      }
      vec3 c = acc / ws;
      return c * (1.0 - u_dark * 0.5 * smoothstep(0.2, 0.9, length(p)));
    }
  `,
});
