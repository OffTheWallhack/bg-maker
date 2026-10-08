import { R, T, defineTexture } from './define';

export default defineTexture({
  id: 'asphalt', name: 'Asfalt', category: 'material',
  params: [
    R('size', 'Veľkosť kameňov', 20, 200, 90, 1),
    R('contrast', 'Kontrast', 0.5, 2.5, 1.2),
    R('tar', 'Živica', 0, 1, 0.5),
    R('wear', 'Obrúsenie', 0, 1, 0.4),
    R('cracks', 'Praskliny', 0, 1, 0.45),
    T('wet', 'Mokrý', false),
  ],
  glsl: /* glsl */ `
    vec3 tex(vec2 p, vec2 uv){
      vec2 q = p * u_size + u_so;
      vec3 v = voronoi(q, 0.0);
      float stone = hash(vec2(v.z * 91.0, 3.0));
      float tone = 0.25 + 0.6 * stone;
      tone *= 0.75 + 0.25 * vnoise(q * 6.0);
      float rim = smoothstep(0.05, 0.4, v.y - v.x);
      tone = mix(tone * 0.35, tone, mix(rim, 1.0, u_wear * 0.6));
      tone = mix(tone, tone * 0.5, u_tar * (1.0 - rim) * 0.6);
      float large = fbm(p * 3.0 + u_so);
      tone *= 0.7 + 0.6 * large;
      tone = clamp((tone - 0.4) * u_contrast + 0.4, 0.0, 1.0);
      vec3 c = ramp(tone * 0.75);
      vec2 ce = voronoiEdge(warp(p * 3.5, 0.3, 1.3) + u_so, 0.0);
      float crack = smoothstep(0.03, 0.0, ce.x - 0.02) * smoothstep(0.55, 0.75, fbm(p * 2.0 + u_so + 4.0)) * u_cracks * 1.7;
      c = mix(c, u_bg * 0.4, clamp(crack, 0.0, 1.0));
      if (u_wet > 0.5){
        float puddle = smoothstep(0.5, 0.62, fbm(p * 2.5 + u_so + 20.0));
        c = mix(c, mix(u_r0, u_r2, 0.25 + 0.3 * smoothstep(0.1, 0.9, p.y + 0.5)), puddle * 0.75);
      }
      return c;
    }
  `,
});
