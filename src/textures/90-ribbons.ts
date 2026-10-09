import { R, defineTexture } from './define';

export default defineTexture({
  id: 'ribbons', name: 'Zvlnené stuhy', category: 'gradient',
  params: [
    R('count', 'Počet stúh', 2, 10, 6, 1),
    R('amp', 'Výška vĺn', 0.03, 0.4, 0.16),
    R('freq', 'Dĺžka vĺn', 0.4, 4, 1.2),
    R('width', 'Šírka stuhy', 0.03, 0.3, 0.1),
    R('twist', 'Skrúcanie', 0, 3, 1.2),
    R('shadow', 'Tieň', 0, 1, 0.6),
  ],
  glsl: /* glsl */ `
    vec3 tex(vec2 p, vec2 uv){
      vec3 c = mix(u_bg, ramp(0.18), 0.5 * smoothstep(0.8, -0.3, p.y));
      for (int i = 0; i < 10; i++){
        if (float(i) >= u_count) break;
        float fi = float(i);
        vec3 h = hash3(vec2(fi, 31.0) + u_so);
        float x = p.x * u_freq * 3.0;
        float yc = mix(-0.4, 0.4, (fi + 0.5) / u_count) + (h.x - 0.5) * 0.12
                 + u_amp * sin(x + h.y * 6.28 + TT) + u_amp * 0.5 * sin(x * 2.1 + h.z * 6.28 - TT);
        float tw = cos(x * u_twist * 0.5 + h.z * 6.28 + TT);
        float hw = u_width * (0.25 + 0.75 * abs(tw)) * (0.7 + 0.6 * h.y);
        float d = p.y - yc;
        float aa = fwidth(d) + 0.0008;
        float m = 1.0 - smoothstep(hw - aa, hw + aa, abs(d));
        float sh = smoothstep(hw + 0.1, hw, abs(d + 0.03)) * (1.0 - m);
        c *= 1.0 - sh * u_shadow * 0.4;
        float v = clamp(d / max(hw, 1e-3), -1.0, 1.0);
        float face = sign(tw);
        vec3 col = ramp(0.12 + 0.8 * (0.5 + 0.5 * v * face));
        col = mix(col, u_ink1, smoothstep(0.85, 1.0, abs(tw)) * 0.2);
        c = mix(c, col, m);
      }
      return c;
    }
  `,
});
