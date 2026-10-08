import { R, defineTexture } from './define';

export default defineTexture({
  id: 'dusk-horizon', name: 'Súmrak – horizont a slnko', category: 'gradient',
  params: [
    R('sunx', 'Slnko X', -0.5, 0.5, 0.1),
    R('horizon', 'Horizont', -0.4, 0.4, -0.12),
    R('size', 'Veľkosť slnka', 0.05, 0.5, 0.2),
    R('glow', 'Žiara', 0, 2, 1.0),
    R('gamma', 'Tvar prechodu', 0.5, 2.5, 1.2),
    R('haze', 'Pásy hmly', 0, 1, 0.5),
  ],
  glsl: /* glsl */ `
    vec3 tex(vec2 p, vec2 uv){
      float y = p.y - u_horizon;
      float t = clamp(0.5 + y * 1.1, 0.0, 1.0);
      vec3 c = ramp(pow(1.0 - t, u_gamma) * 0.9);
      c = mix(c, u_bg, smoothstep(0.1, 1.0, t) * 0.8);
      vec2 s = vec2(u_sunx, u_horizon + u_size * 0.3 + 0.02 * sin(TT));
      float d = length(p - s);
      float disc = 1.0 - smoothstep(u_size * 0.85, u_size, d);
      float g = exp(-d / (u_size * 2.2)) * u_glow;
      c += mix(u_ink2, u_ink1, 0.5) * g * 0.6;
      c = mix(c, mix(u_ink1, u_hi, 0.3), disc * (0.8 + 0.2 * smoothstep(0.0, 0.2, y + 0.4)));
      float bands = smoothstep(0.35, 0.65, vnoise(vec2(p.x * 1.0, y * 38.0) + u_so)) * smoothstep(0.35, -0.02, abs(y + 0.05));
      c = mix(c, u_bg, bands * u_haze * 0.35 * smoothstep(0.0, -0.01, y + 0.3));
      float below = smoothstep(0.0, -0.002, y);
      vec3 water = mix(u_bg, ramp(0.35), exp(-abs(y) * 4.0) * 0.5 + 0.1 * g * exp(-abs(p.x - u_sunx) * 5.0));
      return mix(c, water * (0.8 + 0.2 * vnoise(vec2(p.x * 8.0, y * 120.0) + u_so)), below * 0.0 + 0.0);
    }
  `,
});
