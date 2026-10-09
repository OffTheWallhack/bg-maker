import { R, defineTexture } from './define';

export default defineTexture({
  id: 'misty-ridges', name: 'Hmlisté hrebene', category: 'nature',
  params: [
    R('layers', 'Počet vrstiev', 3, 9, 6, 1),
    R('amp', 'Výška hrebeňov', 0.05, 0.4, 0.18),
    R('freq', 'Členitosť', 0.5, 6, 2.0),
    R('fog', 'Hmla', 0, 1, 0.65),
    R('glow', 'Žiara za horami', 0, 1.5, 0.9),
    R('gx', 'Žiara X', -0.5, 0.5, 0.15),
  ],
  glsl: /* glsl */ `
    vec3 tex(vec2 p, vec2 uv){
      vec3 sky = mix(ramp(0.2), u_bg, smoothstep(-0.2, 0.6, p.y));
      float gd = length((p - vec2(u_gx, 0.05)) * vec2(1.0, 1.5));
      sky += mix(u_ink2, u_ink1, 0.5) * exp(-gd * 3.0) * u_glow * 0.6;
      vec3 c = sky;
      vec3 fogc = mix(sky, ramp(0.55), 0.5);
      for (int i = 0; i < 9; i++){
        if (float(i) >= u_layers) break;
        float fi = float(i);
        float t = fi / max(u_layers - 1.0, 1.0);
        float base = mix(0.12, -0.38, t);
        float h = (fbm(vec2(p.x * u_freq * (1.0 + t * 0.8) + fi * 9.0 + u_so.x, fi * 3.0)) - 0.4) * u_amp * (1.0 + t * 0.6);
        float y = base + h;
        float aa = fwidth(p.y) + 0.001;
        float m = 1.0 - smoothstep(-aa, aa, p.y - y);
        vec3 col = mix(fogc, u_bg * 0.4, pow(t, 0.8) * 0.95);
        float mist = smoothstep(0.0, 0.25, y - p.y);
        col = mix(fogc, col, mix(1.0, mist, u_fog * (1.0 - t * 0.5)));
        c = mix(c, col, m);
      }
      return c;
    }
  `,
});
