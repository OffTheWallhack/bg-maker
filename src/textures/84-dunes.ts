import { R, defineTexture } from './define';

export default defineTexture({
  id: 'dunes', name: 'Piesočné duny', category: 'nature',
  params: [
    R('scale', 'Veľkosť dún', 0.3, 3, 0.9),
    R('ripple', 'Hustota vlniek', 10, 160, 70, 1),
    R('angle', 'Smer vetra', 0, 180, 25, 1),
    R('warp', 'Zvlnenie', 0, 2, 1.0),
    R('light', 'Smer svetla', 0, 360, 200, 1),
    R('contrast', 'Kontrast', 0.5, 2.5, 1.3),
  ],
  glsl: /* glsl */ `
    float t_h(vec2 p){
      vec2 q = rot(radians(u_angle)) * p * u_scale;
      float dunes = tfbm(q * 1.1 + u_so, 0.5) * 1.2;
      float r = sin((q.x + dunes * u_warp * 1.4) * u_ripple * 0.35 + tfbm(q * 4.0 + u_so, 0.4) * 3.0);
      return dunes * 1.0 + r * 0.02;
    }
    vec3 tex(vec2 p, vec2 uv){
      float e = 0.0015;
      float h = t_h(p);
      vec2 g = vec2(t_h(p + vec2(e, 0.0)) - h, t_h(p + vec2(0.0, e)) - h) / e;
      float a = radians(u_light);
      float s = 0.5 + dot(g, vec2(cos(a), sin(a))) * 0.35;
      s = clamp((s - 0.5) * u_contrast + 0.5, 0.0, 1.0);
      return ramp(0.1 + 0.8 * s);
    }
  `,
});
