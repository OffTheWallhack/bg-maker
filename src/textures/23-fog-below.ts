import { R, defineTexture } from './define';

export default defineTexture({
  id: 'fog-below', name: 'Hmla osvetlená zospodu', category: 'light',
  params: [
    R('scale', 'Mierka hmly', 0.6, 5, 1.8),
    R('rise', 'Výška svetla', 0.1, 1.5, 0.75),
    R('density', 'Hustota', 0.2, 2, 1.0),
    R('warp', 'Zvlnenie', 0, 1, 0.6),
    R('lx', 'Svetlo X', -0.5, 0.5, 0),
    R('colormix', 'Farebnosť', 0, 1, 0.55),
    R('contrast', 'Kontrast', 0.5, 2.5, 1.3),
  ],
  glsl: /* glsl */ `
    vec3 tex(vec2 p, vec2 uv){
      vec2 w = twarp(p, u_warp * 0.35, 1.3, 0.9);
      float f = tfbm(w * u_scale * vec2(1.0, 1.7) + vec2(0.0, 0.0) + u_so, 0.9);
      float f2 = tfbm(w * u_scale * 2.7 + u_so + 5.0, 0.9);
      float dens = clamp(f * 0.75 + f2 * 0.35, 0.0, 1.0);
      float h = (p.y + 0.5);
      float lightFall = exp(-pow(h / u_rise, 1.6) * 1.8);
      float lat = exp(-pow((p.x - u_lx) * 1.3, 2.0));
      float li = lightFall * (0.35 + 0.65 * lat);
      float v = pow(dens, 1.4) * u_density * li;
      v = remap(v, 0.5 - 0.5 / u_contrast, 0.5 + 0.5 / u_contrast) * 0.0 + clamp((v - 0.12) * u_contrast, 0.0, 1.0);
      vec3 c = u_bg + (ramp(0.55 + 0.45 * v) - u_bg) * clamp(v * 1.3, 0.0, 1.0) * (0.5 + 0.5 * u_colormix);
      c = mix(c, ramp(0.2 + 0.8 * v), u_colormix * v * 0.6);
      return c;
    }
  `,
});
