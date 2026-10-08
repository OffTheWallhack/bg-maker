import { R, defineTexture } from './define';

export default defineTexture({
  id: 'newsprint', name: 'Novinový papier', category: 'print',
  params: [
    R('freq', 'Raster', 40, 200, 96, 1),
    R('scale', 'Mierka tónov', 0.4, 5, 1.4),
    R('contrast', 'Kontrast', 0.4, 3, 1.3),
    R('gain', 'Zväčšenie bodu', 0, 1, 0.35),
    R('fiber', 'Vlákna papiera', 0, 1, 0.6),
    R('spot', 'Spot farba', 0, 1, 0.55),
    R('fold', 'Záhyby', 0, 1, 0.3),
  ],
  glsl: /* glsl */ `
    vec3 tex(vec2 p, vec2 uv){
      float fib = vnoise(vec2(p.x * 700.0, p.y * 35.0) + u_so) * 0.5 + vnoise(vec2(p.x * 45.0, p.y * 600.0) + u_so + 5.0) * 0.5;
      vec3 paper = mix(u_bg, mix(u_bg, u_dirt, 0.45), fib * u_fiber);
      float f = remap(tfbm(p * u_scale + u_so, 0.6), 0.5 - 0.5 / u_contrast, 0.5 + 0.5 / u_contrast);
      float d1 = htDots(p, u_freq, 0.7854, clamp(f + u_gain * 0.25, 0.0, 1.0));
      float f2 = remap(tfbm(p * u_scale * 1.3 + u_so + 7.0, 0.6), 0.45, 0.95);
      float d2 = htDots(p + 0.002, u_freq * 0.9, 0.2618, f2) * u_spot;
      vec3 c = inkOn(paper, u_ink1, d1 * (0.88 + 0.12 * fib));
      c = inkOn(c, u_ink2, d2 * 0.85);
      float fold = abs(p.x + 0.12 * (vnoise(vec2(p.y * 1.5, u_so.x)) - 0.5)) ;
      c *= 1.0 - u_fold * 0.35 * exp(-fold * 70.0);
      c *= 1.0 - u_fold * 0.12 * smoothstep(0.02, 0.0, abs(abs(p.y) - 0.0) ) ;
      return c;
    }
  `,
});
