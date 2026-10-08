import { R, T, defineTexture } from './define';

export default defineTexture({
  id: 'subwoofer-rings', name: 'Subwoofer – sústredné kruhy', category: 'geometry',
  params: [
    R('cx', 'Stred X', -0.5, 0.5, 0),
    R('cy', 'Stred Y', -0.5, 0.5, -0.05),
    R('density', 'Hustota kruhov', 3, 60, 22, 0.5),
    R('thick', 'Hrúbka čiary', 0.05, 0.95, 0.4),
    R('decay', 'Útlm do strán', 0, 3, 0.9),
    R('wobble', 'Deformácia', 0, 1, 0.35),
    R('cap', 'Stredový kužeľ', 0, 0.3, 0.09),
    T('dual', 'Druhý stred (interferencia)', false),
  ],
  glsl: /* glsl */ `
    float t_rings(vec2 p, vec2 c0, out float rid){
      vec2 d = p - c0;
      float a = atan(d.y, d.x);
      float wob = vnoise(vec2(cos(a), sin(a)) * 2.5 + u_so) - 0.5;
      float r = length(d) * (1.0 + wob * u_wobble * 0.25);
      float x = r * u_density - TT / TAU;
      rid = floor(x);
      float fw = fwidth(x) * 0.8 + 1e-4;
      float cd = abs(fract(x) - 0.5);
      float ring = 1.0 - smoothstep(u_thick * 0.5 - fw, u_thick * 0.5 + fw, cd);
      return ring * exp(-length(d) * u_decay);
    }
    vec3 tex(vec2 p, vec2 uv){
      vec2 c0 = vec2(u_cx, u_cy);
      float id1, id2 = 0.0;
      float ring = t_rings(p, c0, id1);
      vec3 c = u_bg;
      vec3 col = mix(u_ink1, u_ink2, step(0.7, hash(id1 + u_so.x)));
      c = inkOn(c, col, ring);
      if (u_dual > 0.5){
        float r2 = t_rings(p, vec2(-u_cx * 1.0 - 0.15, u_cy * 0.0 + 0.2), id2);
        c = inkOn(c, mix(u_ink2, u_hi, 0.3), r2 * 0.8);
      }
      float d = length(p - c0);
      float dome = 1.0 - smoothstep(u_cap - 0.004, u_cap + 0.004, d);
      float shade = 0.2 + 0.7 * smoothstep(u_cap, 0.0, d) + 0.25 * dot(normalize(p - c0 + 1e-5), vec2(-0.7, 0.7));
      c = mix(c, ramp(clamp(shade, 0.0, 1.0)), dome * step(0.001, u_cap));
      return c;
    }
  `,
});
