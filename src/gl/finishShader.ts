import { FINISH_PARAMS } from '../finish';
import { HEADER, UTILS, paramDecls } from './glsl';

// Pass 2: global grade + dirt/finish layer. Reads the texture render (u_tex).
const BODY = /* glsl */ `
uniform sampler2D u_tex;
uniform float u_gframes;   // grain frames per loop
uniform float u_hue, u_contrast, u_brightness, u_saturation, u_invert, u_duo;
uniform vec3 u_duoA, u_duoB;


vec2 RPX; // one 1920-reference pixel in uv units

vec3 fetch(vec2 uv){ return texture(u_tex, uv).rgb; }

vec3 blurAt(vec2 uv, float rad, float jit){
  vec3 s = fetch(uv);
  float tot = 1.0;
  for (int i = 1; i < 13; i++){
    float fi = float(i);
    float a = fi * 2.399963 + jit * TAU;
    float r = sqrt(fi / 12.0) * rad;
    s += fetch(uv + vec2(cos(a), sin(a)) * r * RPX);
    tot += 1.0;
  }
  return s / tot;
}

vec3 hueRot(vec3 c, float a){
  const mat3 toYIQ = mat3(0.299, 0.596, 0.211, 0.587, -0.274, -0.523, 0.114, -0.322, 0.312);
  const mat3 toRGB = mat3(1.0, 1.0, 1.0, 0.956, -0.272, -1.106, 0.621, -0.647, 1.703);
  vec3 y = toYIQ * c;
  float cs = cos(a), sn = sin(a);
  y.yz = vec2(y.y * cs - y.z * sn, y.y * sn + y.z * cs);
  return toRGB * y;
}

float dustField(vec2 rp, float seed){
  float acc = 0.0;
  vec2 g = floor(rp / 90.0);
  vec2 f = fract(rp / 90.0);
  vec3 h = hash3(g + seed);
  if (h.x > 0.72){
    vec2 c = 0.15 + 0.7 * h.yz;
    float s = (0.3 + 3.2 * pow(hash(g + seed + 9.0), 3.0)) / 90.0;
    acc += smoothstep(s, s * 0.35, length(f - c));
  }
  return acc;
}
float scratchField(vec2 rp, float seed){
  vec2 cell = vec2(floor(rp.x / 260.0), 0.0);
  vec2 f = vec2(fract(rp.x / 260.0), rp.y);
  vec3 h = hash3(cell + seed);
  if (h.x < 0.86) return 0.0;
  float x = 0.1 + 0.8 * h.y + 0.02 * sin(rp.y * 0.01 + h.z * 20.0);
  float y0 = h.z * 1920.0, len = 150.0 + 900.0 * hash(cell + seed + 4.0);
  float inside = step(y0, rp.y) * step(rp.y, y0 + len) * smoothstep(0.0, 60.0, rp.y - y0) * smoothstep(0.0, 60.0, y0 + len - rp.y);
  return (1.0 - smoothstep(0.0, 1.6 / 260.0, abs(f.x - x))) * inside;
}
float hairField(vec2 rp, float seed){
  float acc = 0.0;
  vec2 g0 = floor(rp / 620.0);
  for (int j = -1; j <= 1; j++) for (int i = -1; i <= 1; i++){
    vec2 g = g0 + vec2(float(i), float(j));
    vec3 h = hash3(g + seed);
    if (h.x < 0.5) continue;
    vec2 o = (g + 0.1 + 0.8 * h.yz) * 620.0;
    float a = hash(g + seed + 3.0) * TAU;
    float len = 70.0 + 220.0 * hash(g + seed + 6.0);
    vec2 d = rp - o;
    vec2 dir = vec2(cos(a), sin(a));
    float u = dot(d, dir), v = dot(d, vec2(-dir.y, dir.x));
    float bow = (hash(g + seed + 8.0) - 0.5) * len * 0.5;
    float t = clamp(u / len, 0.0, 1.0);
    float cur = bow * sin(t * PI) + (hash(g + seed + 12.0) - 0.5) * 8.0 * sin(t * 9.0);
    float dist = abs(v - cur);
    acc = max(acc, (1.0 - smoothstep(0.35, 1.4, dist)) * step(0.0, u) * step(u, len));
  }
  return acc;
}

void main(){
  vec2 uv = gl_FragCoord.xy / u_res;
  float K = 1920.0 / max(u_res.x, u_res.y);
  vec2 rp = gl_FragCoord.xy * K;
  RPX = vec2(max(u_res.x, u_res.y)) / (1920.0 * u_res);
  float gf = u_anim > 0.5 ? floor(fract(u_phase * u_cycles) * u_gframes) : 0.0;
  float seed = u_seed * 1.37;

  // --- calm zone (soften) ---
  float cy = u_f_calmPos < 0.5 ? 0.86 : (u_f_calmPos < 1.5 ? 0.5 : 0.14);
  float cw = u_f_calmSize * 0.01 * 0.5;
  float calmM = (1.0 - smoothstep(cw * 0.55, cw * 1.25, abs(uv.y - cy))) * (u_f_calm * 0.01);

  // --- sampling with misregistration / CA / blur ---
  vec2 mis = vec2(u_f_misX, u_f_misY) * RPX;
  vec2 ca = (uv - 0.5) * (u_f_ca * 0.01) * 0.03 * vec2(1.0, u_res.x / u_res.y);
  float blurR = (u_f_blur * 0.01) * 16.0 + (u_f_bleed * 0.01) * 3.0 + calmM * 18.0;
  float jit = fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715))));
  vec2 uvs = uv;
  float jp = (u_f_jpeg * 0.01);
  if (jp > 0.001){
    vec2 bl = floor(rp / mix(2.0, 22.0, jp));
    vec2 bc = (bl + 0.5) * mix(2.0, 22.0, jp) / K / u_res;
    float msk = step(hash(bl + seed) , 0.25 + 0.7 * jp);
    uvs = mix(uv, bc, msk * 0.85);
  }
  vec3 c;
  if (blurR > 0.05){
    c = vec3(blurAt(uvs + mis + ca, blurR, jit).r, blurAt(uvs, blurR, jit).g, blurAt(uvs - mis - ca, blurR, jit).b);
  } else {
    c = vec3(fetch(uvs + mis + ca).r, fetch(uvs).g, fetch(uvs - mis - ca).b);
  }
  if (jp > 0.001){
    vec2 bl = floor(rp / mix(2.0, 22.0, jp));
    float l = luma(c);
    c += (hash(bl + seed + 3.0) - 0.5) * 0.08 * jp;
    float q = mix(48.0, 5.0, jp);
    c = vec3(l) + floor((c - vec3(l)) * q + 0.5) / q;
    c = floor(c * mix(64.0, 10.0, jp) + 0.5) / mix(64.0, 10.0, jp);
  }

  // --- ink bleed: rounded, wobbly edges ---
  if ((u_f_bleed * 0.01) > 0.001){
    float n = vnoise(rp / 7.0 + seed) - 0.5;
    vec3 b = blurAt(uv + vec2(n) * RPX * 5.0 * (u_f_bleed * 0.01), 2.0 + (u_f_bleed * 0.01) * 5.0, jit);
    vec3 sharp = clamp((b - 0.5) * (1.0 + (u_f_bleed * 0.01) * 1.6) + 0.5, 0.0, 1.0);
    c = mix(c, sharp, (u_f_bleed * 0.01) * 0.85);
  }

  // --- glow ---
  if ((u_f_glow * 0.01) > 0.001){
    vec3 g = blurAt(uv, 14.0 + 40.0 * (u_f_glow * 0.01), jit);
    vec3 g2 = blurAt(uv, 5.0, jit);
    vec3 bright = max(g - 0.35, 0.0) + max(g2 - 0.5, 0.0) * 0.5;
    c = 1.0 - (1.0 - c) * (1.0 - bright * (u_f_glow * 0.01) * 1.4);
  }

  // --- global grade ---
  c = (c - 0.5) * u_contrast + 0.5 + u_brightness;
  if (u_duo > 0.5){
    float l = clamp(luma(c), 0.0, 1.0);
    c = mix(u_duoA, u_duoB, smoothstep(0.0, 1.0, l));
  }
  if (abs(u_hue) > 0.001) c = hueRot(c, u_hue);
  float lm = luma(c);
  c = mix(vec3(lm), c, u_saturation);
  c = mix(c, 1.0 - c, u_invert);
  c = clamp(c, 0.0, 1.0);

  // --- calm zone (darken) ---
  c = mix(c, c * 0.38 + u_bg * 0.2, calmM * 0.85);

  // --- paper tooth ---
  if ((u_f_paper * 0.01) > 0.001){
    float fib = vnoise(vec2(rp.x * 0.9, rp.y * 0.07) + seed) * 0.5 + vnoise(vec2(rp.x * 0.07, rp.y * 0.9) + seed + 3.0) * 0.5;
    float pit = vnoise(rp * 0.45 + seed);
    float t = (fib * 0.55 + pit * 0.45) - 0.5;
    c += t * (u_f_paper * 0.01) * 0.22 * (0.5 + 0.5 * (1.0 - abs(2.0 * lm - 1.0)));
    c *= 1.0 - (u_f_paper * 0.01) * 0.06 * smoothstep(0.6, 0.9, pit);
  }
  // --- xerox toner speckle ---
  if ((u_f_toner * 0.01) > 0.001){
    float mask = smoothstep(0.35, 0.75, fbm(rp / 260.0 + seed));
    float s1 = step(1.0 - 0.06 * (u_f_toner * 0.01) * (0.3 + mask), hash(floor(rp / 1.5) + seed));
    float s2 = step(1.0 - 0.02 * (u_f_toner * 0.01) * (0.2 + mask), hash(floor(rp / 3.0) + seed + 7.0));
    c = mix(c, mix(u_dirt, vec3(0.02), 0.5), clamp(s1 + s2, 0.0, 1.0) * 0.8);
    c = mix(c, c * 0.8 + u_dirt * 0.2, smoothstep(0.5, 0.9, mask) * (u_f_toner * 0.01) * 0.25);
  }
  // --- photocopy streaks ---
  if ((u_f_streaks * 0.01) > 0.001){
    float cols = pow(vnoise(vec2(rp.x * 0.33 + seed, rp.y * 0.004)), 3.0);
    float thin = step(0.965, hash(vec2(floor(rp.x / 2.0), floor(rp.y / 400.0) + seed)));
    float st = clamp(cols * 1.4 + thin * 0.7, 0.0, 1.0) * (u_f_streaks * 0.01);
    c = mix(c, mix(c, u_dirt, 0.65), st * 0.6);
    c *= 1.0 - st * 0.15;
  }
  // --- dust & scratches & hairs (animated per grain frame) ---
  if ((u_f_dust * 0.01) > 0.001){
    float sd = seed + gf * 13.0;
    float d = dustField(rp, sd) * step(0.0, (u_f_dust * 0.01) - hash(floor(rp / 90.0) + sd + 21.0) * 0.9);
    float sc = scratchField(rp, sd) * step(hash(vec2(floor(rp.x / 260.0), sd)), 0.35 + (u_f_dust * 0.01) * 0.65 + 0.2);
    c = mix(c, mix(c, vec3(0.94), 0.8), clamp(d, 0.0, 1.0) * 0.8);
    c = mix(c, vec3(0.92), clamp(sc, 0.0, 1.0) * (u_f_dust * 0.01) * 0.55);
    float dark = dustField(rp + 400.0, sd + 5.0) * step(hash(floor((rp + 400.0) / 90.0) + sd), (u_f_dust * 0.01) * 0.7);
    c = mix(c, vec3(0.02), dark * 0.6);
  }
  if ((u_f_hairs * 0.01) > 0.001){
    float h = hairField(rp, seed + 33.0);
    float keep = step(hash(floor(rp / 620.0) + seed + 2.0), 0.15 + 0.85 * (u_f_hairs * 0.01));
    c = mix(c, mix(vec3(0.03), vec3(0.9), step(0.5, hash(floor(rp / 620.0) + seed + 1.0))), h * keep * 0.8);
  }
  // --- scan lines ---
  if ((u_f_scan * 0.01) > 0.001){
    float s = 0.5 + 0.5 * sin(rp.y / u_f_scanSize * TAU);
    c *= 1.0 - (u_f_scan * 0.01) * 0.5 * s;
  }
  // --- vignette & edge burn ---
  vec2 vd = uv - 0.5;
  float vg = smoothstep(0.25, 0.85, length(vd * vec2(1.0, 0.85)) * 1.25);
  c *= 1.0 - (u_f_vignette * 0.01) * 0.85 * vg;
  if ((u_f_edge * 0.01) > 0.001){
    float n = fbm(rp / 120.0 + seed) - 0.5;
    float d = min(min(uv.x, 1.0 - uv.x), min(uv.y, 1.0 - uv.y)) + n * 0.1;
    float burn = smoothstep(0.16 * (u_f_edge * 0.01) + 0.05, 0.0, d);
    c = mix(c, c * 0.22 + u_dirt * 0.06 + vec3(0.06, 0.02, 0.0), burn * (0.5 + 0.5 * (u_f_edge * 0.01)));
  }
  // --- light leak ---
  if ((u_f_leak * 0.01) > 0.001){
    vec2 lp = vec2(u_f_leakX, u_f_leakY) * 0.01;
    vec2 d = (uv - lp) * vec2(u_res.x / u_res.y, 1.0);
    float sz = u_f_leakSize * 0.01 * 0.9 + 0.05;
    float n = fbm(rp / 300.0 + seed + vec2(cos(TT), sin(TT)) * 0.3);
    float r = length(d) / sz * (0.8 + 0.4 * n);
    float core = exp(-r * r * 2.2), halo = exp(-r * 1.3) * 0.5;
    float band = pow(vnoise(vec2(uv.y * 5.0 + seed, 1.0)), 2.0) * exp(-abs(d.x) / sz * 0.8) * 0.5;
    vec3 lc = u_f_leakColor;
    vec3 hot = mix(lc, vec3(1.0, 0.95, 0.85), 0.55);
    vec3 add = lc * (halo + band) + hot * core;
    c = 1.0 - (1.0 - c) * (1.0 - clamp(add * (u_f_leak * 0.01) * 0.95, 0.0, 1.0));
  }
  // --- film grain (last) ---
  if ((u_f_grain * 0.01) > 0.001){
    vec2 gp = rp / u_f_grainSize + gf * 17.3 + seed;
    vec2 gc = floor(gp);
    float g = hash(gc) + hash(gc + 71.0) - 1.0;
    float gs = vnoise(gp * 0.9 + 5.0) - 0.5;
    g = g * 0.8 + gs * 0.5;
    vec3 gcol = vec3(g) + 0.3 * vec3(hash(gc + 11.0) - 0.5, hash(gc + 23.0) - 0.5, hash(gc + 37.0) - 0.5);
    float lw = 0.55 + 0.45 * (1.0 - abs(2.0 * luma(c) - 1.0));
    c += gcol * (u_f_grain * 0.01) * 0.42 * lw;
  }
  c += (jit - 0.5) / 255.0; // anti-banding dither
  outColor = vec4(clamp(c, 0.0, 1.0), 1.0);
}
`;

export const FINISH_FRAGMENT = `${HEADER}\n${paramDecls(FINISH_PARAMS, 'f_')}\n${UTILS}\n${BODY}`;
