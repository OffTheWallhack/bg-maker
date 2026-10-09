import { R, defineTexture } from './define';

export default defineTexture({
  id: 'dry-brush', name: 'Suchý štetec (plagát 70.)', category: 'print',
  params: [
    R('count', 'Počet ťahov', 4, 24, 14, 1),
    R('len', 'Dĺžka', 0.2, 1.2, 0.6),
    R('width', 'Šírka', 0.02, 0.2, 0.07),
    R('dir', 'Hlavný smer', 0, 180, 55, 1),
    R('spread', 'Rozptyl smeru', 0, 180, 70, 1),
    R('dry', 'Suchosť štetca', 0, 1, 0.55),
    R('bristle', 'Jemnosť štetín', 80, 600, 260, 1),
  ],
  glsl: /* glsl */ `
    vec3 tex(vec2 p, vec2 uv){
      float asp = u_res.x / u_res.y;
      vec3 c = u_bg;
      for (int i = 0; i < 24; i++){
        if (float(i) >= u_count) break;
        float fi = float(i);
        vec3 h = hash3(vec2(fi, 51.0) + u_so);
        vec2 ctr = (h.xy - 0.5) * vec2(asp, 1.0) * 0.8;
        float ang = radians(u_dir) + (h.z - 0.5) * radians(u_spread);
        vec2 dir = vec2(cos(ang), sin(ang)), perp = vec2(-dir.y, dir.x);
        float len = u_len * (0.5 + 0.8 * hash(vec2(fi, 53.0) + u_so));
        vec2 d = p - ctr;
        float t = dot(d, dir) / len;
        float s = dot(d, perp);
        float w = u_width * (0.6 + 0.9 * hash(vec2(fi, 55.0) + u_so));
        float wob = (vnoise(vec2(t * 3.0, fi)) - 0.5) * w * 0.6;
        float body = (1.0 - smoothstep(w * 0.85, w, abs(s + wob))) * step(abs(t), 0.5);
        float n = vnoise(vec2((s + wob) * u_bristle, fi * 7.0 + t * 2.0));
        float n2 = vnoise(vec2((s + wob) * u_bristle * 0.4, t * 14.0 + fi));
        float tail = smoothstep(0.5, 0.15, abs(t));
        float m = body * step(n * 0.7 * u_dry + n2 * 0.3 * u_dry, tail + 0.4 + (1.0 - u_dry) * 0.6);
        vec3 col = palc(1 + int(mod(fi, 3.0)));
        col *= 0.8 + 0.3 * n;
        c = mix(c, col, m);
      }
      return c;
    }
  `,
});
