import { R, T, defineTexture } from './define';

export default defineTexture({
  id: 'ink-blot', name: 'Atramentová škvrna (Rorschach)', category: 'nature',
  params: [
    R('scale', 'Mierka', 0.4, 4, 1.3),
    R('thr', 'Prah', 0.3, 0.85, 0.74),
    R('warp', 'Zvlnenie', 0, 2, 1.0),
    R('halo', 'Presiaknutie', 0, 1, 0.5),
    R('splat', 'Odstrek', 0, 1, 0.4),
    T('mirror', 'Zrkadlo', true),
  ],
  glsl: /* glsl */ `
    float t_f(vec2 p){
      vec2 q = vec2(u_mirror > 0.5 ? abs(p.x) : p.x, p.y) * u_scale + u_so;
      vec2 w = vec2(fbm(q * 1.5), fbm(q * 1.5 + 4.0));
      float f = tfbm(q + u_warp * 1.2 * (w - 0.5), 0.5);
      return f + 0.12 * smoothstep(0.6, 0.0, length(p));
    }
    vec3 tex(vec2 p, vec2 uv){
      float f = t_f(p);
      float m = smoothstep(u_thr - 0.015, u_thr + 0.015, f);
      float haloM = smoothstep(u_thr - 0.2, u_thr, f) * (1.0 - m);
      float edge = smoothstep(0.1, 0.0, abs(f - u_thr)) ;
      vec3 paper = u_bg * (0.95 + 0.05 * fbm(p * 10.0 + u_so));
      vec3 c = paper;
      c = mix(c, mix(paper, u_ink1, 0.35), haloM * u_halo);
      float sp = step(1.0 - 0.02 * u_splat, hash(floor((p + SOF) * 220.0))) * smoothstep(0.35, 0.6, f) * (1.0 - m);
      c = mix(c, u_ink1, clamp(m + sp, 0.0, 1.0) * 0.96);
      c = mix(c, u_ink2, edge * m * 0.25);
      return c;
    }
  `,
});
