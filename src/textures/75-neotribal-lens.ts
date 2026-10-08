import { R, defineTexture } from './define';

export default defineTexture({
  id: 'neotribal-lens', name: 'Neotribal – tečúce hroty', category: 'tribal',
  params: [
    R('freq', 'Hustota prúdov', 2, 20, 8),
    R('freq2', 'Dĺžka čepelí', 0.5, 8, 2),
    R('pinch', 'Zúženie do hrotu', 0.3, 5, 2.6),
    R('warp', 'Prúdenie', 0, 1.5, 0.35),
    R('angle', 'Uhol', 0, 180, 80, 1),
    R('layers', 'Vrstvy', 1, 3, 2, 1),
    R('flow', 'Pohyb', 0, 1.5, 0.8),
  ],
  glsl: /* glsl */ `
    vec3 tex(vec2 p, vec2 uv){
      vec3 c = u_bg;
      for (int L = 0; L < 3; L++){
        if (float(L) >= u_layers) break;
        float fl = float(L);
        vec2 q = rot(radians(u_angle) + fl * 0.5) * p;
        vec2 w = q + (vec2(tfbm(q * 1.2 + u_so + fl * 7.0, u_flow), tfbm(q * 1.2 + u_so + 5.0 + fl * 7.0, u_flow)) - 0.5) * u_warp * 1.4;
        float fq = u_freq * (1.0 + fl * 0.5);
        float cx = fract(w.x * fq) - 0.5;
        float id = floor(w.x * fq);
        float ph = 0.5 + 0.5 * sin(w.y * u_freq2 * TAU * 0.5 + hash(vec2(id, fl) + u_so) * TAU);
        float width = pow(ph, u_pinch) * 0.46;
        float aa = fwidth(cx) + 0.01;
        float m = 1.0 - smoothstep(width - aa, width + aa, abs(cx));
        float lit = 0.5 + 0.5 * cx / max(width, 1e-3);
        vec3 col = ramp(0.12 + 0.88 * pow(clamp(lit, 0.0, 1.0), 1.3));
        col = mix(col, u_ink1, (1.0 - smoothstep(0.0, 0.15, abs(cx) / max(width, 1e-3))) * 0.3);
        float outline = (1.0 - smoothstep(width, width + aa * 3.0, abs(cx))) * (1.0 - m);
        
        c = mix(c, col, m);
      }
      return c;
    }
  `,
});
