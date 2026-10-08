import { R, defineTexture } from './define';

export default defineTexture({
  id: 'scanner-bar', name: 'Skenerová svetelná lišta', category: 'light',
  params: [
    R('pos', 'Pozícia', -0.5, 0.5, 0.05),
    R('angle', 'Uhol', -30, 30, 0, 0.5),
    R('thick', 'Hrúbka', 0.002, 0.06, 0.012),
    R('glow', 'Žiara', 0, 2, 1.0),
    R('falloff', 'Dosah svetla', 0.1, 1.5, 0.55),
    R('trail', 'Stopa', 0, 1, 0.5),
    R('sweep', 'Pohyb', 0, 0.4, 0.15),
  ],
  glsl: /* glsl */ `
    vec3 tex(vec2 p, vec2 uv){
      vec2 q = rot(radians(u_angle)) * p;
      float y0 = u_pos + u_sweep * sin(TT);
      float d = q.y - y0;
      float ad = abs(d);
      float bar = smoothstep(u_thick, u_thick * 0.3, ad);
      float halo = exp(-ad * 22.0 / (0.4 + u_glow * 0.6)) * u_glow;
      float below = d < 0.0 ? exp(-ad / u_falloff * 2.2) : exp(-ad / (u_falloff * 0.3) * 2.2);
      float trail = d < 0.0 ? u_trail * exp(-ad * 3.0) : 0.0;
      float surf = 0.5 + 0.5 * fbm(vec2(p.x * 3.0, p.y * 30.0) + u_so);
      vec3 c = u_bg;
      c += ramp(0.6) * below * (0.25 + 0.5 * surf) * 0.6;
      c += ramp(0.7) * trail * 0.25 * (0.6 + 0.4 * vnoise(vec2(p.x * 600.0, d * 4.0) + u_so));
      c += u_ink2 * halo * 0.55;
      c += mix(u_ink1, vec3(1.0), 0.5) * bar * 1.1;
      float edge = smoothstep(u_thick * 3.0, u_thick, ad) * (1.0 - bar);
      c += vec3(0.8, 0.1, 0.3) * 0.0 + u_ink2 * edge * (d > 0.0 ? 0.5 : 0.0);
      return c;
    }
  `,
});
