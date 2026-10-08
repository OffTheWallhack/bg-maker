import { R, defineTexture } from './define';

export default defineTexture({
  id: 'rusty-metal', name: 'Hrdzavý kov', category: 'material',
  params: [
    R('amount', 'Množstvo hrdze', 0, 1, 0.55),
    R('scale', 'Mierka', 0.6, 6, 2.0),
    R('drip', 'Stekanie', 0, 1, 0.5),
    R('pit', 'Dierky', 0, 1, 0.5),
    R('warm', 'Teplota', 0, 1, 0.5),
    R('contrast', 'Kontrast', 0.5, 2.5, 1.2),
  ],
  glsl: /* glsl */ `
    vec3 tex(vec2 p, vec2 uv){
      vec2 w = warp(p * u_scale, 0.3, 1.0) + u_so;
      float m = fbm(w * 1.4) * 0.7 + fbm(w * 5.0) * 0.3;
      float drips = vnoise(vec2(p.x * 40.0, p.y * 2.2 + u_so.y)) * vnoise(vec2(p.x * 9.0, p.y * 1.0 + u_so.x));
      m += drips * u_drip * 0.45 * smoothstep(0.1, 0.6, m);
      float rust = smoothstep(1.0 - u_amount * 0.85 - 0.12, 1.0 - u_amount * 0.85 + 0.12, m);
      float pit = smoothstep(0.72, 0.9, vnoise(p * 130.0 + u_so)) * u_pit;
      float metal = 0.25 + 0.2 * vnoise(vec2(p.x * 600.0, p.y * 20.0) + u_so) + 0.1 * fbm(p * 6.0 + u_so);
      vec3 base = ramp(clamp((metal - 0.3) * u_contrast + 0.3, 0.0, 1.0) * 0.6);
      float t = fbm(w * 3.0 + 5.0);
      vec3 rc = mix(mix(u_r1, u_r2, t), mix(u_dirt, u_r3, t), u_warm);
      rc *= 0.45 + 0.8 * fbm(w * 8.0 + 2.0);
      vec3 c = mix(base, rc, rust);
      c *= 1.0 - pit * 0.6;
      return c;
    }
  `,
});
