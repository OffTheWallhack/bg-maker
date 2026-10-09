import { R, defineTexture } from './define';

export default defineTexture({
  id: 'vintage-label', name: 'Vintage etiketa (ozdobný rám)', category: 'folk',
  params: [
    R('frames', 'Počet rámov', 2, 5, 4, 1),
    R('band', 'Šírka rámov', 0.01, 0.05, 0.026),
    R('scallop', 'Vlnky na rámoch', 0, 1, 0.6),
    R('sky', 'Mierka oblohy', 0.5, 4, 1.6),
    R('levels', 'Farebné vrstvy oblohy', 2, 5, 4, 1),
    R('mis', 'Posun tlače', 0, 14, 4, 0.5),
  ],
  glsl: /* glsl */ `
    vec3 t_sky(vec2 p){
      float f = tfbm(vec2(p.x * 0.9, p.y * 1.7) * u_sky + u_so, 0.6);
      f += (p.y) * 0.5;
      float id = floor(clamp(f, 0.0, 0.999) * u_levels);
      return palc(1 + int(mod(id, 4.0)));
    }
    vec3 tex(vec2 p, vec2 uv){
      float asp = u_res.x / u_res.y;
      vec2 e = vec2(asp * 0.5, 0.5) - abs(p);
      float de = min(e.x, e.y);
      float along = e.x < e.y ? p.y : p.x;
      float sc = u_scallop * 0.012 * abs(sin(along * 38.0));
      float dd = de + sc - 0.012;
      vec2 off = vec2(u_mis, -u_mis * 0.6) * 0.0012;
      vec3 c = t_sky(p);
      vec3 c2 = t_sky(p + off);
      c = mix(c, vec3(c.r, c2.g, c.b), 0.0);
      for (int k = 0; k < 5; k++){
        if (float(k) >= u_frames) break;
        float lo = float(k) * u_band;
        float inb = step(lo, dd) * step(dd, lo + u_band);
        vec3 bc = palc(int(mod(float(k) + 2.0, 4.0)) + 1);
        float wave = 0.5 + 0.5 * sin(along * 60.0 + float(k) * 2.0);
        c = mix(c, bc, inb);
        c = mix(c, u_bg * 0.2, smoothstep(0.003, 0.0, abs(dd - lo)) * 0.9);
      }
      float outside = step(dd, 0.0);
      c = mix(c, u_bg, outside);
      c *= 0.93 + 0.07 * rgrain(p + SOF, 600.0);
      return c;
    }
  `,
});
