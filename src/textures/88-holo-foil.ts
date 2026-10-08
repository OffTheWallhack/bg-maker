import { R, defineTexture } from './define';

export default defineTexture({
  id: 'holo-foil', name: 'Holografická fólia', category: 'gradient',
  params: [
    R('facets', 'Veľkosť fazet', 1, 12, 4),
    R('bands', 'Farebné pásy', 0.5, 5, 1.6),
    R('rainbow', 'Dúhovosť', 0, 1, 0.45),
    R('edge', 'Hrany fazet', 0, 1, 0.35),
    R('sparkle', 'Trblietky', 0, 1, 0.4),
    R('move', 'Pohyb', 0, 1, 0.3),
  ],
  glsl: /* glsl */ `
    vec3 tex(vec2 p, vec2 uv){
      vec2 s = p * u_facets + u_so * 0.1;
      vec3 v = voronoi(s, u_move);
      vec2 e = voronoiEdge(s, u_move);
      float a = hash(vec2(v.z * 91.0, 1.0)) * TAU;
      vec2 dir = vec2(cos(a), sin(a));
      float t = dot(p, dir) * u_bands + hash(vec2(v.z * 91.0, 2.0)) * 3.0 + 0.4 * sin(TT + v.z * 6.0);
      float f = 0.5 + 0.5 * sin(t * TAU);
      vec3 c = ramp(f);
      vec3 rb = 0.5 + 0.5 * cos(TAU * (t + vec3(0.0, 0.33, 0.67)));
      c = mix(c, rb * (0.4 + 0.6 * f), u_rainbow);
      c *= 0.8 + 0.2 * smoothstep(0.0, 0.4, e.x);
      c = mix(c, u_ink1, (1.0 - smoothstep(0.0, 0.03, e.x)) * u_edge * 0.5);
      float sp = pow(vnoise(p * 380.0 + u_so), 14.0) * u_sparkle * 3.0;
      return c + sp;
    }
  `,
});
