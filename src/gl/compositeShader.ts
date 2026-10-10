import { HEADER, UTILS } from './glsl';

// Pass 2 (optional): combines the base texture with the second texture layer and the photo.
const BODY = /* glsl */ `
uniform sampler2D u_a, u_b, u_p;
uniform float u_layerOn, u_blend, u_opacity, u_maskMode, u_maskPos, u_maskSoft, u_maskInv;
uniform float u_pOn, u_pMode, u_pBlend, u_pOpacity, u_pZoom, u_pX, u_pY, u_pContrast, u_pAspect;

vec3 blendM(vec3 a, vec3 b, float m){
  if (m < 0.5) return b;
  if (m < 1.5) return a * b;
  if (m < 2.5) return 1.0 - (1.0 - a) * (1.0 - b);
  if (m < 3.5) return mix(2.0 * a * b, 1.0 - 2.0 * (1.0 - a) * (1.0 - b), step(0.5, a));
  if (m < 4.5) return (1.0 - 2.0 * b) * a * a + 2.0 * b * a;
  if (m < 5.5) return abs(a - b);
  if (m < 6.5) return min(a + b, 1.0);
  if (m < 7.5) return max(a, b);
  return min(a, b);
}

float maskVal(vec2 uv, vec2 p){
  if (u_maskMode < 0.5) return 1.0;
  float edge = u_maskPos * 0.01;
  float soft = u_maskSoft * 0.01 * 0.5 + 0.002;
  float m;
  if (u_maskMode < 1.5) m = smoothstep(edge - soft, edge + soft, 1.0 - uv.y);
  else if (u_maskMode < 2.5) m = smoothstep(edge - soft, edge + soft, uv.x);
  else if (u_maskMode < 3.5) m = 1.0 - smoothstep(edge * 0.9 - soft, edge * 0.9 + soft, length(p) * 1.4);
  else m = smoothstep(edge - soft, edge + soft, fbm(p * 2.2 + u_so));
  return mix(m, 1.0 - m, u_maskInv);
}

void main(){
  vec2 uv = gl_FragCoord.xy / u_res;
  vec2 p = (gl_FragCoord.xy - 0.5 * u_res) / u_res.y;
  vec3 c = texture(u_a, uv).rgb;
  if (u_layerOn > 0.5){
    vec3 b = texture(u_b, uv).rgb;
    c = mix(c, clamp(blendM(c, b, u_blend), 0.0, 1.0), maskVal(uv, p) * u_opacity);
  }
  if (u_pOn > 0.5){
    float sa = u_res.x / u_res.y;
    vec2 s = sa > u_pAspect ? vec2(1.0, u_pAspect / sa) : vec2(sa / u_pAspect, 1.0);
    vec2 q = (uv - 0.5) * s / u_pZoom + 0.5 + vec2(u_pX, u_pY) * 0.5;
    vec3 pc = texture(u_p, q).rgb;
    float l = clamp((luma(pc) - 0.5) * u_pContrast + 0.5, 0.0, 1.0);
    if (u_pMode > 0.5 && u_pMode < 1.5) pc = ramp(l);
    else if (u_pMode > 1.5 && u_pMode < 2.5) pc = vec3(l);
    else if (u_pMode > 2.5) pc = mix(u_bg, u_ink1, smoothstep(0.46, 0.54, l));
    c = mix(c, clamp(blendM(c, pc, u_pBlend), 0.0, 1.0), u_pOpacity);
  }
  outColor = vec4(c, 1.0);
}
`;

export const COMPOSITE_FRAGMENT = `${HEADER}\n${UTILS}\n${BODY}`;
