import { R, defineTexture } from './define';

export default defineTexture({
  id: 'memphis', name: 'Memphis – hravé tvary', category: 'folk',
  params: [
    R('cells', 'Veľkosť poľa (počet)', 3, 16, 7, 0.5),
    R('density', 'Hustota tvarov', 0.2, 1, 0.65),
    R('size', 'Veľkosť tvarov', 0.2, 0.6, 0.38),
    R('outline', 'Posunutý obrys', 0, 1, 0.5),
    R('thick', 'Hrúbka čiar', 0.01, 0.08, 0.035),
    R('rot', 'Natočenie', 0, 1, 1.0),
  ],
  glsl: /* glsl */ `
    float t_shape(vec2 f, float typ, float s, float w){
      if (typ < 1.0){ vec2 q = f / (s * 1.1); const float k = 1.7320508; q.x = abs(q.x) - 1.0; q.y = q.y + 1.0 / k;
        if (q.x + k * q.y > 0.0) q = vec2(q.x - k * q.y, -k * q.x - q.y) / 2.0;
        q.x -= clamp(q.x, -2.0, 0.0); return -length(q) * sign(q.y) * s * 1.1; }
      if (typ < 2.0){ vec2 b = abs(f) - vec2(s * 0.75); return length(max(b, 0.0)) + min(max(b.x, b.y), 0.0); }
      if (typ < 3.0){ return segDist(f, vec2(-s, 0.0), vec2(s, 0.0)) - w; }
      if (typ < 4.0){ float zz = abs(mod(f.x / s * 3.0, 2.0) - 1.0) * 2.0 - 1.0; return abs(f.y - zz * s * 0.25) * 0.8 - w * 0.9 + 0.0 * step(abs(f.x), s); }
      if (typ < 5.0){ return segDist(f, vec2(-s * 0.7, 0.0), vec2(s * 0.7, 0.0)) - s * 0.28; }
      return segDist(f, vec2(0.0, -s), vec2(0.0, s)) - w * 1.2;
    }
    vec3 tex(vec2 p, vec2 uv){
      vec3 c = u_bg;
      for (int k = 0; k < 2; k++){
        vec2 q = p * u_cells + vec2(float(k) * 0.5);
        vec2 id = floor(q);
        vec3 h = hash3(id + u_so + float(k) * 13.0);
        vec3 h2 = hash3(id + u_so + 29.0 + float(k) * 7.0);
        if (h.x > u_density * (k == 0 ? 1.0 : 0.6)) continue;
        vec2 f = fract(q) - 0.5 + (h.yz - 0.5) * 0.25;
        f = rot((h2.x - 0.5) * 6.2832 * u_rot) * f;
        float typ = floor(h2.y * 6.0);
        float s = u_size * (0.6 + 0.7 * h2.z);
        float w = u_thick * u_cells * 0.12;
        float d = t_shape(f, typ, s, w);
        float aa = fwidth(d) + 0.002;
        float m = 1.0 - smoothstep(-aa, aa, d);
        vec3 col = palc(1 + int(floor(hash(id + 3.0 + float(k)) * 4.0)) % 4);
        float off = 1.0 - smoothstep(-aa, aa, t_shape(f + vec2(0.05, -0.05) * u_outline * 1.5, typ, s, w));
        c = mix(c, palc(1 + int(floor(hash(id + 11.0) * 3.0))) , off * u_outline * (1.0 - m) * 0.9);
        c = mix(c, col, m);
      }
      return c;
    }
  `,
});
