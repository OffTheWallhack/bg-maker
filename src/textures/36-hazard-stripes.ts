import { R, T, defineTexture } from './define';

export default defineTexture({
  id: 'hazard-stripes', name: 'Diagonálne pruhy (hazard)', category: 'geometry',
  params: [
    R('angle', 'Uhol pruhov', 0, 180, 45, 1),
    R('freq', 'Hustota', 3, 80, 22, 0.5),
    R('duty', 'Pomer pruhu', 0.15, 0.85, 0.5),
    T('band', 'Len pás (páska)', true),
    R('bandang', 'Uhol pásu', -90, 90, -8, 1),
    R('bw', 'Šírka pásu', 0.05, 1, 0.22),
    R('wear', 'Opotrebenie', 0, 1, 0.45),
    R('second', 'Druhá farba v medzerách', 0, 1, 0.0),
  ],
  glsl: /* glsl */ `
    vec3 tex(vec2 p, vec2 uv){
      vec3 base = u_bg + ramp(0.5) * 0.06 * fbm(p * 3.0 + u_so);
      vec2 q = rot(radians(u_angle)) * p;
      float x = q.x * u_freq;
      float t = fract(x);
      float fw = fwidth(x) * 1.2 + 1e-4;
      float s = smoothstep(u_duty - fw, u_duty, t) ;
      float stripe = 1.0 - smoothstep(u_duty - fw, u_duty + fw, t);
      vec2 b = rot(radians(u_bandang)) * p;
      float tornE = (vnoise(vec2(b.x * 70.0, 1.0) + u_so) - 0.5) * 0.006 * u_wear + (vnoise(vec2(b.x * 6.0, 3.0) + u_so) - 0.5) * 0.01 * u_wear;
      float bd = abs(b.y + tornE) - u_bw * 0.5;
      float aa = fwidth(bd) + 0.0008;
      float inband = u_band > 0.5 ? 1.0 - smoothstep(-aa, aa, bd) : 1.0;
      float shadow = u_band > 0.5 ? smoothstep(0.04, 0.0, bd) * (1.0 - inband) * 0.5 : 0.0;
      float wearM = 1.0 - u_wear * smoothstep(0.45, 0.8, fbm(p * 11.0 + u_so) + 0.25 * vnoise(p * 140.0 + u_so));
      vec3 gapc = mix(u_bg * 0.7, u_ink2, u_second);
      vec3 tape = mix(gapc, u_ink1, stripe * wearM);
      tape *= 0.93 + 0.07 * rgrain(p + SOF, 700.0);
      vec3 c = base * (1.0 - shadow);
      c = mix(c, tape, inband);
      return c;
    }
  `,
});
