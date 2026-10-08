import { R, defineTexture } from './define';

export default defineTexture({
  id: 'liquid-chrome', name: 'Tekutý chróm', category: 'soft',
  params: [
    R('scale', 'Mierka', 0.3, 3, 0.9),
    R('warp', 'Skreslenie', 0, 1.5, 0.8),
    R('bands', 'Počet pásov odrazu', 1, 10, 3.5, 0.1),
    R('hard', 'Tvrdosť odrazu', 0.3, 4, 1.6),
    R('gain', 'Sklon', 0.5, 6, 2.8),
    R('flow', 'Prúdenie', 0, 2, 1.0),
    R('tint', 'Farebnosť', 0, 1, 0.5),
  ],
  glsl: /* glsl */ `
    float t_h(vec2 p){
      vec2 s = p * u_scale + u_so;
      vec2 q = vec2(tfbm(s, u_flow), tfbm(s + 5.2, u_flow));
      return tfbm(s + u_warp * 2.5 * q, u_flow);
    }
    vec3 tex(vec2 p, vec2 uv){
      float e = 0.003;
      float h = t_h(p);
      vec2 g = vec2(t_h(p + vec2(e, 0.0)) - h, t_h(p + vec2(0.0, e)) - h) / e * 0.1 * u_gain;
      float t = dot(g, vec2(0.6, 0.8)) + h * 0.8;
      float v = 0.5 + 0.5 * sin(t * u_bands * 3.0 + 0.5);
      v = pow(clamp(v, 0.0, 1.0), u_hard);
      float sp = pow(max(0.0, 0.5 + 0.5 * sin(g.x * 6.0 - g.y * 4.0 + 1.0)), 12.0);
      vec3 c = ramp(v);
      c = mix(vec3(luma(c)), c, u_tint);
      c += u_ink1 * sp * 0.5;
      return c;
    }
  `,
});
