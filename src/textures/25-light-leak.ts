import { R, S, defineTexture } from './define';

export default defineTexture({
  id: 'light-leak', name: 'Light leak – film burn', category: 'light',
  params: [
    S('edge', 'Strana', ['Ľavá', 'Pravá', 'Horná', 'Dolná', 'Roh'], 1),
    R('size', 'Veľkosť', 0.2, 2, 0.9),
    R('intensity', 'Intenzita', 0.2, 2, 1.0),
    R('streak', 'Pruhy filmu', 0, 1, 0.45),
    R('warp', 'Deformácia', 0, 1, 0.6),
    R('spread', 'Farebný rozptyl', 0, 1, 0.6),
    R('burn', 'Prepal do bielej', 0, 1, 0.4),
  ],
  glsl: /* glsl */ `
    vec3 tex(vec2 p, vec2 uv){
      vec2 o;
      float e = u_edge;
      if (e < 0.5) o = vec2(-0.55, 0.0); else if (e < 1.5) o = vec2(0.55, 0.0); else if (e < 2.5) o = vec2(0.0, 0.55);
      else if (e < 3.5) o = vec2(0.0, -0.55); else o = vec2(0.45, 0.5);
      vec2 w = twarp(p, u_warp * 0.3, 1.5, 0.7);
      vec2 d = (w - o) * vec2(1.0, 0.8);
      float r = length(d) / u_size;
      float core = exp(-r * r * 3.2);
      float mid = exp(-r * r * 1.1);
      float streak = vnoise(vec2((e < 2.5 ? p.y : p.x) * 6.0, 1.0) + u_so) ;
      streak = pow(streak, 2.0) * u_streak;
      float n = tfbm(w * 3.0 + u_so, 0.8);
      float m = (core * 1.2 + mid * 0.6 + streak * mid * 0.8) * (0.7 + 0.5 * n) * u_intensity;
      vec3 c = u_bg;
      vec3 c1 = mix(u_ink1, u_ink2, u_spread * smoothstep(0.0, 1.0, r));
      vec3 c2 = mix(c1, u_hi, 0.6);
      c += c2 * mid * m * 0.65;
      c += c1 * core * m * 0.9;
      c = mix(c, vec3(1.0, 0.96, 0.9), clamp((core * m - 0.5) * 1.5, 0.0, 1.0) * u_burn);
      return c;
    }
  `,
});
