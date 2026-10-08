import { R, T, defineTexture } from './define';

export default defineTexture({
  id: 'waveform-stack', name: 'Zásobník vĺn (waveform stack)', category: 'geometry',
  params: [
    R('rows', 'Počet riadkov', 8, 64, 34, 1),
    R('amp', 'Amplitúda', 0.02, 0.4, 0.17),
    R('freq', 'Frekvencia', 2, 40, 14),
    R('envw', 'Šírka stredu', 0.1, 1.2, 0.42),
    R('cx', 'Stred', 0.2, 0.8, 0.5),
    R('thick', 'Hrúbka čiary', 0.0008, 0.008, 0.0028, 0.0002),
    R('top', 'Začiatok', 0, 0.45, 0.3),
    R('bottom', 'Koniec', 0, 0.45, 0.3),
    T('fill', 'Zakrývať spodné riadky', true),
  ],
  glsl: /* glsl */ `
    vec3 tex(vec2 p, vec2 uv){
      float asp = u_res.x / u_res.y;
      float x = p.x / asp + 0.5;
      float env = exp(-pow((x - u_cx) / u_envw, 2.0));
      vec3 c = u_bg;
      for (int i = 0; i < 64; i++){
        if (float(i) >= u_rows) break;
        float fi = float(i);
        float t = fi / max(u_rows - 1.0, 1.0);
        float base = mix(0.5 - u_top * 0.5 - 0.02 , -0.5 + u_bottom * 0.5 + 0.02, t);
        float n = vnoise(vec3(x * u_freq + u_so.x, fi * 0.37 + u_so.y, 2.2 * cos(TT + fi * 0.13)));
        n = n * 0.7 + 0.3 * vnoise(vec3(x * u_freq * 2.7, fi * 0.9, 1.5 * sin(TT * 1.0 + fi * 0.2)));
        float h = (n - 0.3) * env * u_amp * 2.0;
        float y = base + h;
        float dd = p.y - y;
        if (u_fill > 0.5) c = mix(c, u_bg, smoothstep(0.0008, -0.0008, dd));
        float ln = aaLine(abs(dd), u_thick);
        float a = 0.45 + 0.55 * t;
        vec3 col = mix(u_ink1, u_ink2, smoothstep(0.55, 1.0, env * n * 1.7) * 0.8);
        c = mix(c, col, ln * a);
      }
      return c;
    }
  `,
});
