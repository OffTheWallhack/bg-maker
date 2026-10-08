import { R, S, defineTexture } from './define';

export default defineTexture({
  id: 'overprint', name: 'Overprint – dvojfarebný posun', category: 'print',
  params: [
    S('shape', 'Tvar', ['Škvrny', 'Kruhy', 'Bloky'], 0),
    S('mode', 'Vrstvy', ['Rovnaký tvar', 'Rôzne tvary'], 0),
    R('scale', 'Mierka', 0.6, 6, 1.7),
    R('mis', 'Posun (misregistration)', 0, 40, 12, 0.5),
    R('misang', 'Smer posunu', 0, 360, 35, 1),
    R('rough', 'Drsnosť hrán', 0, 1, 0.35),
    R('overlap', 'Prekryv', 0, 1, 0.4),
  ],
  glsl: /* glsl */ `
    float t_field(vec2 p, float k){
      if (u_shape < 0.5) return tfbm(p * u_scale + u_so + k * 13.0, 0.6);
      if (u_shape < 1.5){
        vec2 q = p * u_scale * 2.0 + k * 0.37 + u_so * 0.1;
        vec2 id = floor(q); vec2 f = fract(q) - 0.5;
        float r = 0.14 + 0.32 * hash(id + k);
        return 0.5 + (r - length(f)) * 2.5 - 0.1 * step(0.55, hash(id + 7.0 + k));
      }
      vec2 q = p * u_scale * vec2(3.0, 2.0) + u_so * 0.1 + k;
      return hash(floor(q) + k) * 1.1 - 0.05;
    }
    vec3 tex(vec2 p, vec2 uv){
      vec2 off = vec2(cos(radians(u_misang)), sin(radians(u_misang))) * u_mis * 0.0012;
      float e = (vnoise(p * 90.0 + u_so) - 0.5) * u_rough * 0.25;
      float kb = u_mode < 0.5 ? 0.0 : 1.0;
      float fa = t_field(p, 0.0) + e;
      float fb = t_field(p - off, kb) + e;
      float a = smoothstep(0.5 - fwidth(fa) - 0.002, 0.5 + fwidth(fa) + 0.002, fa);
      float b = smoothstep(0.5 - fwidth(fb) - 0.002, 0.5 + fwidth(fb) + 0.002, fb);
      float grain = 0.88 + 0.12 * rgrain(p + SOF, 800.0);
      vec3 c = u_bg;
      c = inkOn(c, u_ink1, a * grain);
      c = inkOn(c, u_ink2, b * grain);
      c = mix(c, u_hi, a * b * u_overlap * 0.7);
      return c;
    }
  `,
});
