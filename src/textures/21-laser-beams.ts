import { R, S, defineTexture } from './define';

export default defineTexture({
  id: 'laser-beams', name: 'Laserové lúče v hmle', category: 'light',
  params: [
    R('count', 'Počet lúčov', 2, 24, 9, 1),
    R('spread', 'Rozptyl', 0.3, 3, 1.5),
    R('width', 'Hrúbka lúča', 0.2, 4, 1.0),
    R('haze', 'Hmla', 0, 1.5, 0.8),
    R('sx', 'Zdroj X', -0.6, 0.6, 0),
    R('sy', 'Zdroj Y', -0.2, 1.0, 0.62),
    R('sway', 'Kyvanie', 0, 1, 0.5),
    S('color', 'Farba', ['Striedavo', 'Ink 1', 'Ink 2'], 0),
  ],
  glsl: /* glsl */ `
    vec3 tex(vec2 p, vec2 uv){
      vec2 s = vec2(u_sx, u_sy);
      vec2 d = p - s;
      float ang = atan(d.x, -d.y);
      float r = length(d);
      float haze = tfbm(p * 2.2 + u_so, 0.8);
      haze = 0.25 + 0.75 * haze;
      vec3 c = u_bg;
      float beams = 0.0; vec3 bc = vec3(0.0);
      for (int i = 0; i < 24; i++){
        if (float(i) >= u_count) break;
        float fi = float(i);
        float t = (fi + 0.5) / u_count - 0.5;
        float a0 = t * u_spread + (hash(vec2(fi, 8.0) + u_so) - 0.5) * 0.12;
        float a = a0 + u_sway * 0.35 * sin(TT + fi * 1.7) * (0.4 + 0.6 * hash(vec2(fi, 2.0)));
        float da = ang - a;
        float w = (0.004 + 0.003 * u_width) * u_width * (0.6 + 0.8 * hash(vec2(fi, 5.0))) ;
        float core = exp(-pow(da / (w * 1.0 + 0.0008), 2.0));
        float soft = exp(-pow(da / (w * 7.0 + 0.004), 2.0)) * 0.25;
        float br = (core + soft) * (0.35 + 0.65 * hash(vec2(fi, 11.0)));
        vec3 col = u_color < 0.5 ? (mod(fi, 2.0) < 0.5 ? u_ink1 : u_ink2) : (u_color < 1.5 ? u_ink1 : u_ink2);
        beams += br; bc += col * br;
      }
      bc /= max(beams, 1e-3);
      float fall = exp(-r * 0.9) * smoothstep(0.0, 0.06, r);
      c += bc * beams * fall * (0.5 + haze * u_haze);
      c += mix(u_ink2, u_ink1, 0.3) * 0.08 * u_haze * haze * exp(-r * 1.3);
      float src = exp(-r * 40.0);
      c += u_hi * src * 0.6;
      return c;
    }
  `,
});
