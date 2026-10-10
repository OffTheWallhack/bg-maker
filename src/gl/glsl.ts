import type { Param } from '../types';

export const MOTIONS = ['float', 'wave', 'breathe', 'scroll', 'swirl', 'flicker', 'glitch'];

/** Declares a uniform for each param. Names: u_<prefix><id>. All numeric types are float. */
export function paramDecls(params: Param[], prefix = ''): string {
  return params
    .map((p) => `uniform ${p.type === 'color' ? 'vec3' : 'float'} u_${prefix}${p.id};`)
    .join('\n');
}

export const VERT = `#version 300 es
void main(){
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`;

/** Shared header + utilities available to every texture shader. */
export const HEADER = `#version 300 es
precision highp float;
precision highp int;
out vec4 outColor;

uniform vec2  u_res;
uniform vec2  u_so;      // seed-derived offset (use for noise coords)
uniform float u_seed;
uniform float u_phase;   // 0..1 loop phase (0 when animation is off)
uniform float u_cycles;  // integer motion cycles per loop
uniform float u_anim;    // 0/1
uniform int   u_motion;  // 0 float 1 wave 2 breathe 3 scroll 4 swirl 5 flicker 6 glitch
uniform float u_mamt;    // motion strength
uniform vec3  u_bg, u_ink1, u_ink2, u_hi, u_dirt;
uniform vec3  u_r0, u_r1, u_r2, u_r3; // bg/ink1/ink2/hi sorted dark -> light

#define PI 3.14159265359
#define TAU 6.28318530718
#define TT (u_phase * TAU * u_cycles)   // looping angle: use only inside sin/cos
#define PX (1.0 / u_res.y)
#define SOF (u_so * 0.013)
`;

export const UTILS = `
// ---------- hashing (integer PCG: identical on every GPU) ----------
uint pcg(uint v){ uint s = v * 747796405u + 2891336453u; uint w = ((s >> ((s >> 28u) + 4u)) ^ s) * 277803737u; return (w >> 22u) ^ w; }
float hash(float n){ return float(pcg(uint(int(n)))) * (1.0 / 4294967296.0); }
float hash(vec2 p){ ivec2 i = ivec2(p); return float(pcg(uint(i.x) + pcg(uint(i.y)))) * (1.0 / 4294967296.0); }
float hash(vec3 p){ ivec3 i = ivec3(p); return float(pcg(uint(i.x) + pcg(uint(i.y) + pcg(uint(i.z))))) * (1.0 / 4294967296.0); }
vec2 hash2(vec2 p){ return vec2(hash(p), hash(p + vec2(37.0, 17.0))); }
vec3 hash3(vec2 p){ return vec3(hash(p), hash(p + vec2(37.0, 17.0)), hash(p + vec2(91.0, 53.0))); }

mat2 rot(float a){ float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }
float luma(vec3 c){ return dot(c, vec3(0.299, 0.587, 0.114)); }
float sat(float x){ return clamp(x, 0.0, 1.0); }
float remap(float x, float a, float b){ return sat((x - a) / (b - a)); }

// ---------- palette ----------
vec3 palc(int i){ if (i == 0) return u_bg; if (i == 1) return u_ink1; if (i == 2) return u_ink2; if (i == 3) return u_hi; return u_dirt; }
vec3 ramp(float t){
  t = clamp(t, 0.0, 1.0) * 3.0;
  if (t < 1.0) return mix(u_r0, u_r1, t);
  if (t < 2.0) return mix(u_r1, u_r2, t - 1.0);
  return mix(u_r2, u_r3, t - 2.0);
}
// ink over base: screen on dark paper, multiply on light paper
vec3 inkOn(vec3 base, vec3 ink, float a){
  a = clamp(a, 0.0, 1.0);
  vec3 s = 1.0 - (1.0 - base) * (1.0 - ink * a);
  vec3 m = base * mix(vec3(1.0), ink, a);
  return mix(s, m, step(0.5, luma(u_bg)));
}

// ---------- noise ----------
float vnoise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  f = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
}
float vnoise(vec3 p){
  vec3 i = floor(p), f = fract(p);
  f = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  float a = mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x), mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y);
  float b = mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x), mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y);
  return mix(a, b, f.z);
}
vec2 grad2(vec2 i){ float a = hash(i) * TAU; return vec2(cos(a), sin(a)); }
float gnoise(vec2 p){ // gradient noise, ~0..1
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  float v = mix(mix(dot(grad2(i), f), dot(grad2(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0)), u.x),
                mix(dot(grad2(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)), dot(grad2(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0)), u.x), u.y);
  return 0.5 + 0.75 * v;
}
const mat2 FBM_M = mat2(0.8, -0.6, 0.6, 0.8);
float fbm(vec2 p){
  float a = 0.5, s = 0.0;
  for (int i = 0; i < 5; i++){ s += a * vnoise(p); p = FBM_M * p * 2.03 + 11.7; a *= 0.5; }
  return s / 0.96875;
}
float fbmN(vec2 p, int n){
  float a = 0.5, s = 0.0, t = 0.0;
  for (int i = 0; i < 8; i++){ if (i >= n) break; s += a * vnoise(p); t += a; p = FBM_M * p * 2.03 + 11.7; a *= 0.5; }
  return s / t;
}
// looping fbm: every octave morphs through a circle in the 3rd axis (r = amount of morph)
float tfbm(vec2 p, float r){
  float a = 0.5, s = 0.0;
  for (int i = 0; i < 5; i++){
    s += a * vnoise(vec3(p, r * cos(TT + float(i) * 1.7) + float(i) * 3.1));
    p = FBM_M * p * 2.03 + 11.7; a *= 0.5;
  }
  return s / 0.96875;
}
float tnoise(vec2 p, float r){ return vnoise(vec3(p, r * cos(TT))); }
float ridged(vec2 p){ float a = 0.5, s = 0.0; for (int i = 0; i < 5; i++){ s += a * (1.0 - abs(2.0 * gnoise(p) - 1.0)); p = FBM_M * p * 2.1 + 5.3; a *= 0.5; } return s / 0.96875; }
vec2 warp(vec2 p, float amt, float sc){ return p + amt * vec2(fbm(p * sc + 3.1) - 0.5, fbm(p * sc + 7.7) - 0.5) * 2.0; }
vec2 twarp(vec2 p, float amt, float sc, float r){ return p + amt * vec2(tfbm(p * sc + 3.1, r) - 0.5, tfbm(p * sc + 7.7, r) - 0.5) * 2.0; }
float rgrain(vec2 p, float cells){ vec2 c = p * cells; return 0.62 * hash(floor(c)) + 0.38 * vnoise(c * 1.3 + 17.0); }

// ---------- voronoi ----------
// returns (F1, F2, cell id 0..1); mv animates the feature points on a loop
vec3 voronoi(vec2 p, float mv){
  vec2 i = floor(p), f = fract(p);
  float f1 = 8.0, f2 = 8.0, id = 0.0;
  for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++){
    vec2 g = vec2(float(x), float(y));
    vec2 o = hash2(i + g);
    o = mix(o, 0.5 + 0.5 * sin(TT + TAU * o), mv);
    vec2 d = g + o - f;
    float dd = dot(d, d);
    if (dd < f1){ f2 = f1; f1 = dd; id = hash(i + g + 5.0); }
    else if (dd < f2){ f2 = dd; }
  }
  return vec3(sqrt(f1), sqrt(f2), id);
}
// distance to the nearest cell border (exact), returns (edge, id)
vec2 voronoiEdge(vec2 p, float mv){
  vec2 i = floor(p), f = fract(p);
  vec2 mg = vec2(0.0), mr = vec2(0.0); float md = 8.0; float id = 0.0;
  for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++){
    vec2 g = vec2(float(x), float(y));
    vec2 o = hash2(i + g); o = mix(o, 0.5 + 0.5 * sin(TT + TAU * o), mv);
    vec2 r = g + o - f; float d = dot(r, r);
    if (d < md){ md = d; mr = r; mg = g; id = hash(i + g + 5.0); }
  }
  md = 8.0;
  for (int y = -2; y <= 2; y++) for (int x = -2; x <= 2; x++){
    vec2 g = mg + vec2(float(x), float(y));
    vec2 o = hash2(i + g); o = mix(o, 0.5 + 0.5 * sin(TT + TAU * o), mv);
    vec2 r = g + o - f;
    if (dot(mr - r, mr - r) > 0.00001) md = min(md, dot(0.5 * (mr + r), normalize(r - mr)));
  }
  return vec2(md, id);
}

// ---------- print helpers ----------
float htDots(vec2 p, float freq, float ang, float v){ // 1 where ink
  vec2 q = rot(ang) * p * freq;
  vec2 c = fract(q) - 0.5;
  float r = sqrt(clamp(v, 0.0, 1.0)) * 0.7072;
  float fw = max(fwidth(q.x), fwidth(q.y)) * 0.7 + 1e-4;
  return 1.0 - smoothstep(-fw, fw, length(c) - r);
}
float htLines(vec2 p, float freq, float ang, float v){
  vec2 q = rot(ang) * p * freq;
  float c = abs(fract(q.y) - 0.5);
  float fw = fwidth(q.y) * 0.7 + 1e-4;
  return 1.0 - smoothstep(-fw, fw, c - clamp(v, 0.0, 1.0) * 0.5);
}
float bayer(vec2 p){ // 8x8 ordered dither threshold 0..1
  ivec2 q = ivec2(mod(floor(p), 8.0));
  int v = 0;
  for (int i = 0; i < 3; i++){
    int bx = (q.x >> i) & 1, by = (q.y >> i) & 1;
    v += (((bx ^ by) << 1) | by) << (2 * (2 - i));
  }
  return (float(v) + 0.5) / 64.0;
}
float aaLine(float d, float w){ float fw = fwidth(d) * 0.75 + 1e-5; return 1.0 - smoothstep(w - fw, w + fw, d); }
float segDist(vec2 p, vec2 a, vec2 b){ vec2 pa = p - a, ba = b - a; float h = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-9), 0.0, 1.0); return length(pa - ba * h); }
`;

export const MAIN = `
void main(){
  vec2 uv = gl_FragCoord.xy / u_res;
  vec2 p = (gl_FragCoord.xy - 0.5 * u_res) / u_res.y;
  vec3 c;
  float on = u_anim;
  float amt = u_mamt;
  if (on > 0.5 && u_motion == 3){
    float ph = fract(u_phase * u_cycles);
    vec3 a = tex(p + vec2(0.0, ph * 0.5), uv);
    vec3 b = tex(p + vec2(0.0, (ph - 1.0) * 0.5), uv);
    c = mix(a, b, smoothstep(0.0, 1.0, ph));
  } else {
    if (on > 0.5){
      if (u_motion == 0){
        // every region drifts on its own little loop
        vec2 w = vec2(vnoise(vec3(p * 1.7 + u_so * 0.05, 1.4 * cos(TT))), vnoise(vec3(p * 1.7 + 7.3 + u_so * 0.05, 1.4 * sin(TT)))) - 0.5;
        p += w * 0.24 * amt;
      } else if (u_motion == 1){
        p += amt * 0.022 * vec2(sin(p.y * 8.0 + TT + 2.0 * vnoise(p * 2.0 + u_so * 0.05)), sin(p.x * 6.0 - TT));
      } else if (u_motion == 2){
        p *= 1.0 + 0.08 * amt * sin(TT + 5.0 * vnoise(p * 1.3 + u_so * 0.05));
      } else if (u_motion == 4){
        p = rot(amt * 0.45 * sin(TT + length(p) * 4.0)) * p;
      } else if (u_motion == 6){
        float fr = floor(u_phase * u_cycles * 10.0);
        float row = floor(p.y * 34.0);
        float h = hash(vec2(row, fr));
        p.x += (hash(vec2(row, fr + 5.0)) - 0.5) * 0.3 * amt * step(0.8, h);
      }
    }
    c = tex(p, uv);
    if (on > 0.5 && u_motion == 5){
      float n = 12.0 * u_cycles;
      float k = floor(u_phase * n);
      float f = hash(vec2(k, 3.0));
      c *= 1.0 - 0.28 * amt * f * step(0.45, hash(vec2(k, 9.0)));
    }
  }
  outColor = vec4(clamp(c, 0.0, 1.0), 1.0);
}
`;

export function buildTextureFragment(params: Param[], body: string): string {
  return `${HEADER}\n${paramDecls(params)}\n${UTILS}\n${body}\n${MAIN}`;
}
