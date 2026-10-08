import { R, defineTexture } from './define';

export default defineTexture({
  id: 'noise-static', name: 'Šum / static', category: 'glitch',
  params: [
    R('size', 'Veľkosť zrna', 1, 12, 3, 0.5),
    R('contrast', 'Kontrast', 0.4, 3, 1.4),
    R('color', 'Farebný šum', 0, 1, 0.3),
    R('vary', 'Premenlivá hustota', 0, 1.5, 0.8),
    R('vscale', 'Mierka premenlivosti', 0.5, 5, 1.6),
    R('tears', 'Horizontálne trhliny', 0, 1, 0.4),
  ],
  glsl: /* glsl */ `
    vec3 tex(vec2 p, vec2 uv){
      float frame = u_anim > 0.5 ? floor(fract(u_phase * u_cycles) * 16.0) : 0.0;
      float N = 1080.0 / u_size;
      vec2 g = floor(p * N + 2000.0);
      float row = floor(p.y * 90.0);
      float tear = step(1.0 - u_tears * 0.12, hash(vec2(row, frame + 7.0) + u_so));
      g.x += tear * floor((hash(vec2(row, frame)) - 0.5) * 80.0);
      float bias = (tfbm(p * u_vscale + u_so, 0.8) - 0.5) * u_vary;
      float n = hash(vec3(g, frame + u_so.x));
      vec3 cn = vec3(hash(vec3(g, frame + 11.0)), hash(vec3(g, frame + 23.0)), hash(vec3(g, frame + 37.0)));
      vec3 v = clamp(((vec3(n) - 0.5 + bias) * u_contrast) + 0.5, 0.0, 1.0);
      vec3 vc = clamp((cn - 0.5 + bias) * u_contrast + 0.5, 0.0, 1.0);
      vec3 c = vec3(ramp(v.r).r, ramp(mix(v.g, vc.g, u_color)).g, ramp(mix(v.b, vc.b, u_color)).b);
      c = mix(ramp(v.r), c, u_color);
      c += tear * 0.15;
      return c;
    }
  `,
});
