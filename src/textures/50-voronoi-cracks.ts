import { R, defineTexture } from './define';

export default defineTexture({
  id: 'voronoi-cracks', name: 'Voronoi bunky / praskliny', category: 'glitch',
  params: [
    R('scale', 'Veľkosť buniek', 1, 14, 5),
    R('crack', 'Šírka prasklín', 0.002, 0.08, 0.02, 0.001),
    R('rag', 'Rozedranosť', 0, 1, 0.35),
    R('tint', 'Rozdiel tónov buniek', 0, 1, 0.6),
    R('fine', 'Jemné praskliny', 0, 1, 0.5),
    R('bevel', 'Hrana buniek', 0, 1, 0.6),
    R('move', 'Pohyb buniek', 0, 1, 0.2),
  ],
  glsl: /* glsl */ `
    vec3 tex(vec2 p, vec2 uv){
      vec2 w = p + (vec2(fbm(p * 5.0 + u_so), fbm(p * 5.0 + u_so + 4.0)) - 0.5) * u_rag * 0.12;
      vec2 s = w * u_scale + u_so;
      vec3 v = voronoi(s, u_move);
      vec2 e = voronoiEdge(s, u_move);
      float tone = hash(vec2(v.z * 77.0, 2.0));
      vec3 c = ramp(0.1 + 0.8 * mix(0.5, tone, u_tint) * (0.85 + 0.3 * fbm(p * 8.0 + u_so)));
      float bev = smoothstep(0.0, 0.3, e.x);
      c *= mix(1.0, 0.65 + 0.4 * bev, u_bevel);
      float aa = fwidth(e.x) + 0.001;
      float ck = 1.0 - smoothstep(u_crack - aa, u_crack + aa, e.x);
      vec2 e2 = voronoiEdge(s * 4.5 + 3.0 + w * 2.0, 0.0);
      float fn = (1.0 - smoothstep(0.012 - fwidth(e2.x), 0.012 + fwidth(e2.x) + 0.002, e2.x)) * step(0.55, hash(vec2(v.z * 77.0, 8.0))) * u_fine;
      c = mix(c, u_bg * 0.3, clamp(ck + fn * 0.7, 0.0, 1.0));
      c += u_ink2 * 0.0;
      return c;
    }
  `,
});
