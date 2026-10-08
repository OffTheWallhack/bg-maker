import { R, defineTexture } from './define';

export default defineTexture({
  id: 'water-ripples', name: 'Voda – kruhy na hladine', category: 'nature',
  params: [
    R('count', 'Počet zdrojov', 1, 6, 4, 1),
    R('freq', 'Hustota vĺn', 6, 60, 24),
    R('decay', 'Útlm', 0.5, 6, 2.2),
    R('strength', 'Hĺbka vĺn', 0.2, 3, 1.2),
    R('light', 'Smer svetla', 0, 360, 130, 1),
    R('gloss', 'Lesk', 4, 120, 40, 1),
    R('calm', 'Pokojná vlna', 0, 1, 0.4),
  ],
  glsl: /* glsl */ `
    float t_h(vec2 p){
      float h = 0.0;
      for (int i = 0; i < 6; i++){
        if (float(i) >= u_count) break;
        float fi = float(i);
        vec2 c = (hash2(vec2(fi, 3.0) + u_so) - 0.5) * vec2(0.9, 1.1);
        float d = length(p - c);
        h += sin(d * u_freq - TT) * exp(-d * u_decay) / (1.0 + d * 4.0);
      }
      h += u_calm * 0.25 * (fbm(p * 5.0 + u_so + vec2(cos(TT), sin(TT)) * 0.5) - 0.5);
      return h * u_strength;
    }
    vec3 tex(vec2 p, vec2 uv){
      float e = 0.002;
      float h = t_h(p);
      vec2 g = vec2(t_h(p + vec2(e, 0.0)) - h, t_h(p + vec2(0.0, e)) - h) / e;
      vec3 n = normalize(vec3(-g * 0.12, 1.0));
      float a = radians(u_light);
      vec3 L = normalize(vec3(cos(a) * 0.6, sin(a) * 0.6, 0.7));
      float diff = dot(n, L);
      float spec = pow(max(dot(reflect(-L, n), vec3(0.0, 0.0, 1.0)), 0.0), u_gloss);
      vec3 c = ramp(0.08 + 0.4 * clamp(diff * 0.9 - 0.1 + h * 0.4, 0.0, 1.0));
      c += u_ink1 * spec * 1.2;
      c += u_ink2 * 0.12 * smoothstep(0.0, 1.0, n.x * 0.5 + 0.5);
      return c;
    }
  `,
});
