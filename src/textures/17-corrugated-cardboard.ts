import { R, defineTexture } from './define';

export default defineTexture({
  id: 'corrugated-cardboard', name: 'Vlnitá lepenka', category: 'material',
  params: [
    R('freq', 'Počet vĺn', 10, 90, 36, 1),
    R('angle', 'Uhol', 0, 180, 90, 1),
    R('tear', 'Odtrhnutá vrstva', 0, 1, 0.55),
    R('fiber', 'Vlákna', 0, 1, 0.5),
    R('depth', 'Hĺbka vĺn', 0.2, 2, 1.0),
    R('stain', 'Špina', 0, 1, 0.35),
    R('contrast', 'Kontrast', 0.5, 2.5, 1.2),
  ],
  glsl: /* glsl */ `
    vec3 tex(vec2 p, vec2 uv){
      vec2 q = rot(radians(u_angle)) * p;
      float wave = sin(q.x * u_freq * TAU + 0.6 * sin(q.y * 3.0 + u_so.x));
      float slope = cos(q.x * u_freq * TAU);
      float lit = 0.5 + 0.45 * slope * u_depth - 0.2 * (1.0 - wave * wave) * 0.0;
      float fib = vnoise(vec2(q.x * u_freq * 3.0, q.y * 18.0) + u_so) * 0.5 + vnoise(vec2(q.x * 700.0, q.y * 30.0) + u_so) * 0.5;
      float flute = lit * 0.75 + (fib - 0.5) * u_fiber * 0.5 + 0.12;
      float liner = 0.62 + (fbm(p * 30.0 + u_so) - 0.5) * 0.28 * u_fiber + (fib - 0.5) * 0.08;
      float torn = smoothstep(0.5 - 0.02, 0.5 + 0.02, fbm(p * 2.2 + u_so + 4.0) + (vnoise(p * 140.0 + u_so) - 0.5) * 0.08 + (0.5 - u_tear) * 0.9 - 0.0);
      float edge = smoothstep(0.03, 0.0, abs(fbm(p * 2.2 + u_so + 4.0) + (vnoise(p * 140.0 + u_so) - 0.5) * 0.08 + (0.5 - u_tear) * 0.9 - 0.5));
      float v = mix(flute, liner, torn);
      v -= edge * 0.12;
      v -= u_stain * 0.35 * smoothstep(0.55, 0.9, fbm(p * 3.0 + u_so + 12.0));
      v = clamp((v - 0.45) * u_contrast + 0.5, 0.0, 1.0);
      return ramp(v * 0.85);
    }
  `,
});
