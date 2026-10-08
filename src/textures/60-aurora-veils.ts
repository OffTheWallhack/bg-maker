import { R, defineTexture } from './define';

export default defineTexture({
  id: 'aurora-veils', name: 'Aurora – svetelné závesy', category: 'soft',
  params: [
    R('curtains', 'Hustota závesov', 1, 10, 3.5),
    R('height', 'Výška', 0.2, 1.2, 0.7),
    R('base', 'Spodná hrana', -0.5, 0.3, -0.2),
    R('sharp', 'Ostrosť', 0.5, 5, 2.0),
    R('glow', 'Žiara', 0.2, 2, 1.0),
    R('stars', 'Hviezdy', 0, 1, 0.2),
  ],
  glsl: /* glsl */ `
    vec3 tex(vec2 p, vec2 uv){
      vec3 c = u_bg;
      float y = p.y - u_base;
      for (int i = 0; i < 3; i++){
        float fi = float(i);
        float x = p.x * u_curtains * (1.0 + fi * 0.5) + (tfbm(vec2(p.x * 0.7, y * 0.8) + u_so + fi * 5.0, 0.8) - 0.5) * 3.0;
        float v = pow(vnoise(vec2(x, fi * 7.0 + u_so.x)), u_sharp);
        float vert = smoothstep(-0.3, 0.12, y) * exp(-pow(max(y, 0.0) / (u_height * (0.5 + 0.3 * fi)), 1.5) * 2.0);
        float ray = 0.6 + 0.4 * vnoise(vec2(x * 6.0, y * 1.0 + fi));
        c += palc(1 + i) * v * vert * ray * u_glow * 0.8;
      }
      c += u_ink1 * step(1.0 - 0.012 * u_stars, hash(floor(p * 500.0) + u_so)) * u_stars * smoothstep(-0.2, 0.3, p.y);
      return c / (1.0 + c * 0.35);
    }
  `,
});
