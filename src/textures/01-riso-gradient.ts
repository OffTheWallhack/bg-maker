import { R, defineTexture } from './define';

export default defineTexture({
  id: 'riso-gradient', name: 'Risograf – zrnitý prechod', category: 'print',
  params: [
    R('scale', 'Dĺžka prechodu', 0.5, 4, 1.6),
    R('angle', 'Uhol', 0, 360, 28, 1),
    R('grit', 'Veľkosť zrna', 0.4, 3, 1.0),
    R('contrast', 'Kontrast', 0.4, 3, 1.3),
    R('warp', 'Zvlnenie', 0, 1, 0.45),
    R('second', 'Druhá farba', 0, 1, 0.8),
    R('offset', 'Posun vrstiev', 0, 30, 6, 0.5),
  ],
  glsl: /* glsl */ `
    vec3 tex(vec2 p, vec2 uv){
      vec2 q = rot(radians(u_angle)) * p;
      float w = (tfbm(p * 1.3 + u_so, 0.9) - 0.5) * u_warp * 1.6;
      float f1 = clamp(0.5 + q.y * u_scale * 0.9 + w, 0.0, 1.0);
      float f2 = clamp(0.5 - q.y * u_scale * 0.7 + q.x * 0.25 + (tfbm(p * 2.1 + u_so + 9.0, 0.9) - 0.5) * u_warp * 2.0, 0.0, 1.0);
      float cells = 900.0 / u_grit;
      float n1 = rgrain(p + SOF, cells);
      float n2 = rgrain(p + vec2(u_offset * 0.001) + SOF + 0.37, cells);
      float c1 = clamp((f1 - n1) * u_contrast * 3.0 + 0.5, 0.0, 1.0);
      float c2 = clamp((f2 - n2) * u_contrast * 3.0 + 0.5, 0.0, 1.0) * u_second;
      vec3 c = u_bg;
      c = inkOn(c, u_ink1, c1 * 0.95);
      c = inkOn(c, u_ink2, c2 * 0.9);
      return c;
    }
  `,
});
