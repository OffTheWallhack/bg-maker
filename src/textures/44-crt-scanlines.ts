import { R, defineTexture } from './define';

export default defineTexture({
  id: 'crt-scanlines', name: 'CRT scanlines', category: 'glitch',
  params: [
    R('scale', 'Mierka obrazu', 0.5, 5, 1.4),
    R('curve', 'Zakrivenie', 0, 1, 0.5),
    R('lines', 'Počet riadkov', 80, 700, 280, 1),
    R('scan', 'Sila riadkov', 0, 1, 0.65),
    R('mask', 'Fosforová maska', 0, 1, 0.5),
    R('bloom', 'Žiara', 0, 1.5, 0.7),
    R('roll', 'Rolujúci pás', 0, 1, 0.5),
  ],
  glsl: /* glsl */ `
    float t_base(vec2 p){
      float f = tfbm(p * u_scale + u_so, 0.8);
      return clamp(f * 1.1 - 0.05, 0.0, 1.0);
    }
    vec3 tex(vec2 p, vec2 uv){
      vec2 c = uv * 2.0 - 1.0;
      c *= vec2(1.0 + c.y * c.y * u_curve * 0.16, 1.0 + c.x * c.x * u_curve * 0.22);
      vec2 u2 = c * 0.5 + 0.5;
      if (u2.x < 0.0 || u2.x > 1.0 || u2.y < 0.0 || u2.y > 1.0) return vec3(0.0);
      float asp = u_res.x / u_res.y;
      vec2 pp = (u2 - 0.5) * vec2(asp, 1.0);
      float f = t_base(pp);
      float fb = 0.25 * (t_base(pp + vec2(0.02, 0.0)) + t_base(pp - vec2(0.02, 0.0)) + t_base(pp + vec2(0.0, 0.02)) + t_base(pp - vec2(0.0, 0.02)));
      vec3 col = ramp(f) + ramp(fb) * u_bloom * 0.35;
      float scan = 0.5 + 0.5 * cos(u2.y * u_lines * TAU);
      col *= mix(1.0, 0.35 + 0.65 * scan, u_scan);
      float mx = floor(fract(u2.x * u_lines * 0.9 * asp / 3.0 * 1.0) * 3.0);
      vec3 mk = vec3(mx < 0.5 ? 1.0 : 0.55, (mx > 0.5 && mx < 1.5) ? 1.0 : 0.55, mx > 1.5 ? 1.0 : 0.55);
      col *= mix(vec3(1.0), mk, u_mask * 0.7);
      float roll = fract(uv.y - u_phase * u_cycles);
      col *= 1.0 + u_roll * 0.35 * smoothstep(0.15, 0.0, roll) ;
      col *= 1.0 - u_roll * 0.2 * smoothstep(0.3, 0.15, abs(roll - 0.2));
      vec2 vg = c * 0.5;
      col *= 1.0 - dot(vg, vg) * 1.3;
      return col;
    }
  `,
});
