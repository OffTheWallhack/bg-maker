import { R, defineTexture } from './define';

export default defineTexture({
  id: 'reeded-glass', name: 'Rebrované sklo', category: 'soft',
  params: [
    R('flutes', 'Počet rebier', 6, 80, 28, 1),
    R('refr', 'Lom svetla', 0, 3, 1.4),
    R('angle', 'Natočenie', 0, 90, 0, 1),
    R('frost', 'Zmrazenie', 0, 1, 0.4),
    R('blobs', 'Svetlá za sklom', 2, 6, 4, 1),
    R('edge', 'Odlesk na hranách', 0, 1, 0.5),
  ],
  glsl: /* glsl */ `
    vec3 t_scene(vec2 p){
      float asp = u_res.x / u_res.y;
      vec3 c = u_bg + ramp(0.3) * 0.06;
      for (int i = 0; i < 6; i++){
        if (float(i) >= u_blobs) break;
        float fi = float(i);
        vec3 h = hash3(vec2(fi, 2.0) + u_so);
        vec2 ctr = (h.xy - 0.5) * vec2(asp, 1.0) * 0.9 + 0.05 * vec2(cos(TT + fi), sin(TT + fi * 1.7));
        float r = 0.12 + 0.28 * h.z;
        vec2 d = p - ctr;
        float g = exp(-dot(d, d) / (r * r));
        c += palc(1 + int(mod(fi, 3.0))) * g * 0.45;
      }
      return c;
    }
    vec3 tex(vec2 p, vec2 uv){
      vec2 q = rot(radians(u_angle)) * p;
      float N = u_flutes;
      float x = q.x * N;
      float fx = fract(x) - 0.5;
      float curve = sin(fx * PI);
      vec2 off = rot(-radians(u_angle)) * vec2(-fx * u_refr * 0.5 / N * 2.0, 0.0);
      vec3 c = t_scene(p + off);
      c = mix(c, t_scene(p + off * 1.6 + vec2(0.0, 0.01)), 0.5) ;
      c += u_ink1 * pow(max(0.0, curve), 14.0) * u_edge * 0.12;
      c *= 1.0 - u_edge * 0.25 * smoothstep(0.4, 0.5, abs(fx));
      c = mix(c, vec3(luma(c)) + 0.04, u_frost * 0.3) + (vnoise(p * 700.0 + u_so) - 0.5) * 0.06 * u_frost;
      return c;
    }
  `,
});
