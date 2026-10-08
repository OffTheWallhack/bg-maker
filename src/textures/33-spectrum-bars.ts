import { R, T, defineTexture } from './define';

export default defineTexture({
  id: 'spectrum-bars', name: 'Spektrum – stĺpce', category: 'geometry',
  params: [
    R('bars', 'Počet stĺpcov', 8, 80, 32, 1),
    R('seg', 'Výška segmentu', 0.008, 0.06, 0.022, 0.001),
    R('gap', 'Medzera segmentov', 0.05, 0.6, 0.25),
    R('bw', 'Šírka stĺpca', 0.2, 1, 0.72),
    R('amp', 'Výška', 0.2, 1.4, 0.85),
    R('bell', 'Tvar (zvon)', 0.3, 3, 1.4),
    R('ghost', 'Neaktívne segmenty', 0, 0.4, 0.09),
    T('mirror', 'Zrkadlo od stredu', false),
  ],
  glsl: /* glsl */ `
    vec3 tex(vec2 p, vec2 uv){
      float asp = u_res.x / u_res.y;
      float x = (p.x / asp + 0.5) * u_bars;
      float id = floor(x);
      float fx = fract(x) - 0.5;
      float yy = u_mirror > 0.5 ? abs(p.y) : p.y + 0.46;
      float N = u_bars;
      float env = 0.3 + 0.7 * exp(-pow((id / N - 0.5) * 2.0 / u_bell, 2.0));
      float n = vnoise(vec2(id * 0.42 + u_so.x, 2.5 * cos(TT + id * 0.35)));
      n = 0.6 * n + 0.4 * vnoise(vec2(id * 1.3 + u_so.y, 2.0 * sin(TT + id * 0.9)));
      float h = clamp(n * env * u_amp * 1.5, 0.02, 0.95) * (u_mirror > 0.5 ? 0.5 : 1.0);
      float sidx = floor(yy / u_seg);
      float fy = fract(yy / u_seg);
      float segOK = step(u_gap, fy) * (1.0 - step(u_bw * 0.5, abs(fx)));
      float lit = step(sidx * u_seg, h);
      float peakIdx = floor((h + 0.04 + 0.05 * hash(id + u_so.x)) / u_seg);
      float isPeak = step(abs(sidx - peakIdx), 0.5);
      float t = clamp(yy / (u_mirror > 0.5 ? 0.5 : 0.95), 0.0, 1.0);
      vec3 col = ramp(0.35 + 0.65 * t);
      vec3 c = u_bg;
      c = inkOn(c, u_ink1 * 0.5, segOK * u_ghost);
      c = mix(c, col, segOK * lit);
      c = mix(c, u_hi, segOK * isPeak * (1.0 - lit) * 0.9);
      return c;
    }
  `,
});
