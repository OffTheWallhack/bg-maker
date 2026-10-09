import { R, defineTexture } from './define';

export default defineTexture({
  id: 'gel-blobs', name: 'Tekutý gél (priesvitné fľaky)', category: 'soft',
  params: [
    R('count', 'Počet fľakov', 2, 9, 7, 1),
    R('size', 'Veľkosť', 0.04, 0.4, 0.11),
    R('smooth', 'Splývanie', 0.5, 4, 1.6),
    R('gloss', 'Lesk', 4, 120, 50, 1),
    R('refr', 'Lom svetla', 0, 2, 1.0),
    R('shadow', 'Tieň na podklade', 0, 1, 0.6),
    R('warp', 'Zvlnenie', 0, 1, 0.4),
  ],
  glsl: /* glsl */ `
    float t_f(vec2 p){
      float asp = u_res.x / u_res.y;
      vec2 q = p + (vec2(fbm(p * 2.0 + u_so), fbm(p * 2.0 + u_so + 4.0)) - 0.5) * u_warp * 0.12;
      float f = 0.0;
      for (int i = 0; i < 9; i++){
        if (float(i) >= u_count) break;
        float fi = float(i);
        vec3 h = hash3(vec2(fi, 61.0) + u_so);
        vec2 ctr = (h.xy - 0.5) * vec2(asp, 1.0) * 0.85 + 0.05 * vec2(cos(TT + fi * 1.3), sin(TT + fi * 2.1));
        float r = u_size * (0.5 + 0.9 * h.z);
        vec2 d = (q - ctr) * vec2(1.0, 1.0 + 0.5 * (h.x - 0.5));
        float k = r * r / (dot(d, d) + 1e-4); f += k * k;
      }
      return f;
    }
    vec3 t_floor(vec2 p){ return mix(ramp(0.85), ramp(0.55), smoothstep(-0.5, 0.5, p.y)) * 0.6 + u_bg * 0.4; }
    vec3 tex(vec2 p, vec2 uv){
      float f = t_f(p);
      float e = 0.003;
      vec2 g = vec2(t_f(p + vec2(e, 0.0)) - f, t_f(p + vec2(0.0, e)) - f) / e;
      float edge = 1.0;
      float inside = smoothstep(edge - 0.04, edge + 0.04, f);
      float hgt = clamp(1.0 - 1.0 / (f + 0.001), 0.0, 1.0);
      hgt = pow(hgt, 0.6);
      vec2 n2 = -g * 0.012 / u_smooth;
      vec3 n = normalize(vec3(n2, 0.35 + 0.4 * hgt));
      vec3 L = normalize(vec3(-0.4, 0.6, 0.7));
      float spec = pow(max(dot(reflect(-L, n), vec3(0.0, 0.0, 1.0)), 0.0), u_gloss);
      float fres = pow(1.0 - n.z, 2.0);
      vec3 bgc = t_floor(p);
      vec3 under = t_floor(p + n2 * 0.25 * u_refr);
      vec3 body = mix(under * u_ink2, u_ink2 * 0.8, 0.5);
      body = mix(body, u_hi, fres * 0.5) * (0.55 + 0.7 * hgt);
      vec3 gel = body + vec3(1.0) * spec * 1.2 + u_ink1 * fres * 0.35;
      float sh = smoothstep(1.0, 0.25, t_f(p - vec2(0.03, 0.05))) * (1.0 - inside);
      vec3 floorc = bgc * (1.0 - sh * u_shadow * 0.45);
      return mix(floorc, gel, inside);
    }
  `,
});
