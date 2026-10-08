import { R, defineTexture } from './define';

export default defineTexture({
  id: 'glass-droplets', name: 'Kvapky vody na skle', category: 'nature',
  params: [
    R('size', 'Veľkosť kvapiek', 4, 30, 11),
    R('density', 'Hustota', 0.1, 1, 0.6),
    R('refr', 'Lom', 0, 2, 1.0),
    R('fog', 'Zarosené sklo', 0, 1, 0.5),
    R('shine', 'Odlesk', 0, 2, 1.0),
    R('blobs', 'Svetlá za sklom', 2, 6, 4, 1),
  ],
  glsl: /* glsl */ `
    vec3 t_scene(vec2 p){
      float asp = u_res.x / u_res.y;
      vec3 c = u_bg + ramp(0.3) * 0.1;
      for (int i = 0; i < 6; i++){
        if (float(i) >= u_blobs) break;
        float fi = float(i);
        vec3 h = hash3(vec2(fi, 6.0) + u_so);
        vec2 ctr = (h.xy - 0.5) * vec2(asp, 1.0) * 0.9 + 0.04 * vec2(cos(TT + fi), sin(TT + fi));
        float r = 0.1 + 0.25 * h.z;
        vec2 d = p - ctr;
        c += palc(1 + int(mod(fi, 3.0))) * exp(-dot(d, d) / (r * r));
      }
      return c;
    }
    vec3 tex(vec2 p, vec2 uv){
      vec3 c = mix(t_scene(p), vec3(luma(t_scene(p))) * 0.5 + u_bg * 0.5, u_fog * 0.6);
      c *= 1.0 - u_fog * 0.2 * vnoise(p * 300.0 + u_so);
      for (int L = 0; L < 2; L++){
        float k = u_size * (L == 0 ? 1.0 : 2.3);
        vec2 q = p * k + float(L) * 11.0;
        vec2 gi = floor(q);
        for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++){
          vec2 g = gi + vec2(float(x), float(y));
          vec3 h = hash3(g + u_so + float(L) * 7.0);
          if (h.z > u_density) continue;
          vec2 ctr = g + 0.2 + 0.6 * h.xy;
          float r = 0.18 + 0.25 * hash(g + 3.0 + float(L));
          vec2 d = (q - ctr) / vec2(1.0, 1.15);
          float rr = length(d) / r;
          if (rr < 1.0){
            vec2 n = d / r;
            vec3 inner = t_scene(p - n * r / k * u_refr * 1.2 * vec2(1.0, -1.0));
            inner *= 1.1 - 0.35 * rr * rr;
            float rim = smoothstep(0.7, 1.0, rr);
            inner *= 1.0 - rim * 0.45;
            float hl = pow(max(0.0, 1.0 - length(n - vec2(-0.35, 0.4)) * 2.2), 2.0) * u_shine;
            c = mix(c, inner + u_ink1 * hl * 0.6, smoothstep(1.0, 0.94, rr));
          }
        }
      }
      return c;
    }
  `,
});
