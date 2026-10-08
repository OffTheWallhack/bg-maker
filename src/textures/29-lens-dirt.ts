import { R, defineTexture } from './define';

export default defineTexture({
  id: 'lens-dirt', name: 'Špinavá šošovka + žiara', category: 'light',
  params: [
    R('lx', 'Zdroj X', -0.6, 0.6, 0.25),
    R('ly', 'Zdroj Y', -0.5, 0.5, 0.2),
    R('glow', 'Veľkosť žiary', 0.1, 1.5, 0.6),
    R('dirtamt', 'Špina na šošovke', 0, 1.5, 0.9),
    R('smudge', 'Šmuhy', 0.5, 5, 2.0),
    R('specks', 'Škvrnky', 0, 1, 0.6),
    R('flare', 'Pruh (flare)', 0, 1, 0.4),
  ],
  glsl: /* glsl */ `
    vec3 tex(vec2 p, vec2 uv){
      vec2 L = vec2(u_lx, u_ly);
      vec2 d = p - L;
      float r = length(d);
      float glow = exp(-r / (u_glow * 0.35)) ;
      float wide = exp(-r / (u_glow * 1.1));
      float smudge = pow(tfbm(p * u_smudge + u_so, 0.8), 2.2) * 2.0;
      vec2 sp = p * 55.0 + u_so;
      vec2 id = floor(sp);
      float spk = 0.0;
      vec3 h = hash3(id);
      if (h.x > 1.0 - u_specks * 0.35){
        vec2 cp = id + 0.2 + 0.6 * h.yz;
        float rr = length(sp - cp);
        float s = 0.12 + 0.3 * hash(id + 5.0);
        spk = (smoothstep(s, s * 0.6, rr) * 0.8 + smoothstep(s * 1.4, s, rr) * smoothstep(s * 0.7, s, rr)) ;
      }
      float scat = (smudge * 0.7 + spk * 1.2) * u_dirtamt;
      float lit = wide * (0.25 + scat) + glow * 0.9;
      vec3 c = u_bg + ramp(0.5 + 0.4 * lit) * lit * 0.8;
      float streak = exp(-abs(d.y) * 90.0) * exp(-abs(d.x) * 1.4) * u_flare;
      c += mix(u_ink2, u_ink1, 0.4) * streak * 0.8;
      c += vec3(1.0, 0.9, 0.85) * exp(-r * 38.0 / (0.3 + u_glow)) * 0.8;
      return c;
    }
  `,
});
