import { hexToRgb, lumaOf, mulberry32 } from '../color';
import { EFFECTS, FINISH_PARAMS } from '../finish';
import { getPhoto } from '../photo';
import { TEXTURE_BY_ID } from '../textures';
import type { Param, Scene, TextureDef, Values } from '../types';
import { COMPOSITE_FRAGMENT } from './compositeShader';
import { FINISH_FRAGMENT } from './finishShader';
import { VERT, buildTextureFragment } from './glsl';

interface Prog { program: WebGLProgram; locs: Map<string, WebGLUniformLocation | null> }
interface Target { tex: WebGLTexture; fbo: WebGLFramebuffer; w: number; h: number }

export function seedOffset(seed: number): [number, number] {
  const r = mulberry32(Math.floor(seed) * 7919 + 13);
  return [r() * 100, r() * 100];
}

export function paramValues(def: { params: Param[] }, overrides?: Values): Values {
  const v: Values = {};
  for (const p of def.params) v[p.id] = overrides && p.id in overrides ? overrides[p.id] : p.default;
  return v;
}

export interface RenderOpts { transparent?: boolean }

export class Renderer {
  readonly canvas: HTMLCanvasElement;
  private gl: WebGL2RenderingContext;
  private programs = new Map<string, Prog>();
  private finish: Prog | null = null;
  private composite: Prog | null = null;
  private vs: WebGLShader;
  private tA: Target;
  private tB: Target | null = null;
  private tC: Target | null = null;
  private fmt: { internal: number; type: number } | null = null;
  private photoTex: WebGLTexture | null = null;
  private photoVer = -1;
  w = 0;
  h = 0;

  constructor(canvas: HTMLCanvasElement, opts: { alpha?: boolean } = {}) {
    this.canvas = canvas;
    const gl = canvas.getContext('webgl2', { antialias: false, alpha: !!opts.alpha, premultipliedAlpha: false, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
    if (!gl) throw new Error('WebGL2 nie je dostupné v tomto prehliadači.');
    this.gl = gl;
    gl.getExtension('EXT_color_buffer_float');
    gl.getExtension('EXT_color_buffer_half_float');
    this.vs = this.compile(gl.VERTEX_SHADER, VERT);
    this.tA = this.makeTarget();
  }

  private compile(type: number, src: string): WebGLShader {
    const gl = this.gl;
    const sh = gl.createShader(type)!;
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      const log = gl.getShaderInfoLog(sh) ?? '';
      gl.deleteShader(sh);
      throw new Error('Shader: ' + log);
    }
    return sh;
  }

  private link(fragSrc: string): Prog {
    const gl = this.gl;
    const fs = this.compile(gl.FRAGMENT_SHADER, fragSrc);
    const program = gl.createProgram()!;
    gl.attachShader(program, this.vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    gl.deleteShader(fs);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error('Link: ' + gl.getProgramInfoLog(program));
    return { program, locs: new Map() };
  }

  /** Compiles (and caches) a texture program. Throws with the GLSL log on error. */
  ensureTexture(def: TextureDef): Prog {
    let p = this.programs.get(def.id);
    if (!p) {
      p = this.link(buildTextureFragment(def.params, def.glsl));
      this.programs.set(def.id, p);
    }
    return p;
  }

  private loc(p: Prog, name: string) {
    let l = p.locs.get(name);
    if (l === undefined) {
      l = this.gl.getUniformLocation(p.program, name);
      p.locs.set(name, l);
    }
    return l;
  }

  private makeTarget(): Target {
    const gl = this.gl;
    return { tex: gl.createTexture()!, fbo: gl.createFramebuffer()!, w: 0, h: 0 };
  }

  private sizeTarget(t: Target, w: number, h: number) {
    if (t.w === w && t.h === h) return;
    const gl = this.gl;
    gl.bindTexture(gl.TEXTURE_2D, t.tex);
    const tryFmt = (internal: number, type: number) => {
      gl.texImage2D(gl.TEXTURE_2D, 0, internal, w, h, 0, gl.RGBA, type, null);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.bindFramebuffer(gl.FRAMEBUFFER, t.fbo);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t.tex, 0);
      return gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
    };
    if (!this.fmt) {
      this.fmt = tryFmt(gl.RGBA16F, gl.HALF_FLOAT) ? { internal: gl.RGBA16F, type: gl.HALF_FLOAT } : { internal: gl.RGBA8, type: gl.UNSIGNED_BYTE };
      if (this.fmt.internal === gl.RGBA8) tryFmt(gl.RGBA8, gl.UNSIGNED_BYTE);
    } else tryFmt(this.fmt.internal, this.fmt.type);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    t.w = w; t.h = h;
  }

  setSize(w: number, h: number) {
    w = Math.max(2, Math.round(w)); h = Math.max(2, Math.round(h));
    if (w === this.w && h === this.h) return;
    this.w = w; this.h = h;
    this.canvas.width = w; this.canvas.height = h;
    this.sizeTarget(this.tA, w, h);
    if (this.tB) this.sizeTarget(this.tB, w, h);
    if (this.tC) this.sizeTarget(this.tC, w, h);
  }

  private target(which: 'B' | 'C'): Target {
    let t = which === 'B' ? this.tB : this.tC;
    if (!t) { t = this.makeTarget(); if (which === 'B') this.tB = t; else this.tC = t; }
    this.sizeTarget(t, this.w, this.h);
    return t;
  }

  private uploadPhoto() {
    const gl = this.gl;
    const ph = getPhoto();
    if (!ph.canvas) return;
    if (!this.photoTex) this.photoTex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.photoTex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, ph.canvas);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);
    this.photoVer = ph.ver;
  }

  private setParams(p: Prog, params: Param[], vals: Values, prefix: string) {
    const gl = this.gl;
    for (const d of params) {
      const l = this.loc(p, `u_${prefix}${d.id}`);
      if (!l) continue;
      const v = vals[d.id] ?? d.default;
      if (d.type === 'color') gl.uniform3fv(l, hexToRgb(String(v)));
      else gl.uniform1f(l, typeof v === 'boolean' ? (v ? 1 : 0) : Number(v));
    }
  }

  private uni1(p: Prog, n: string, v: number) { const l = this.loc(p, n); if (l) this.gl.uniform1f(l, v); }
  private uni3(p: Prog, n: string, v: [number, number, number]) { const l = this.loc(p, n); if (l) this.gl.uniform3fv(l, v); }

  private commonUniforms(p: Prog, scene: Scene, phase: number, seedAdd = 0) {
    const gl = this.gl;
    const seed = scene.seed + seedAdd;
    const [sx, sy] = seedOffset(seed);
    const a = scene.anim;
    const l = (n: string) => this.loc(p, n);
    const lr = l('u_res'); if (lr) gl.uniform2f(lr, this.w, this.h);
    const ls = l('u_so'); if (ls) gl.uniform2f(ls, sx, sy);
    this.uni1(p, 'u_seed', seed);
    this.uni1(p, 'u_phase', a.on ? phase : 0);
    this.uni1(p, 'u_cycles', Math.max(1, Math.round(a.speed)));
    this.uni1(p, 'u_anim', a.on ? 1 : 0);
    const lm = l('u_motion'); if (lm) gl.uniform1i(lm, a.motion);
    this.uni1(p, 'u_mamt', a.amount ?? 1);
    const [bg, i1, i2, hi, dirt] = scene.palette;
    this.uni3(p, 'u_bg', hexToRgb(bg)); this.uni3(p, 'u_ink1', hexToRgb(i1)); this.uni3(p, 'u_ink2', hexToRgb(i2));
    this.uni3(p, 'u_hi', hexToRgb(hi)); this.uni3(p, 'u_dirt', hexToRgb(dirt));
    const ramp = [bg, i1, i2, hi].sort((x, y) => lumaOf(x) - lumaOf(y));
    ramp.forEach((c, i) => this.uni3(p, `u_r${i}`, hexToRgb(c)));
  }

  private drawTexture(def: TextureDef, scene: Scene, phase: number, t: Target, seedAdd: number, overrides?: Values) {
    const gl = this.gl;
    const tp = this.ensureTexture(def);
    gl.bindFramebuffer(gl.FRAMEBUFFER, t.fbo);
    gl.viewport(0, 0, this.w, this.h);
    gl.useProgram(tp.program);
    this.commonUniforms(tp, scene, phase, seedAdd);
    this.setParams(tp, def.params, paramValues(def, overrides), '');
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  private bindTex(unit: number, tex: WebGLTexture | null) {
    const gl = this.gl;
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, tex);
  }

  /** Renders the scene at the current canvas size. phase: 0..1 position inside the loop. */
  render(scene: Scene, phase = 0, opts: RenderOpts = {}) {
    const gl = this.gl;
    const def = TEXTURE_BY_ID[scene.textureId];
    const L = scene.layer;
    const layerDef = L.on ? TEXTURE_BY_ID[L.textureId] : undefined;
    const ph = getPhoto();
    const usePhoto = scene.photo.on && !!ph.canvas;
    if (!this.finish) this.finish = this.link(FINISH_FRAGMENT);
    const fp = this.finish;

    // pass 1: base texture (and the optional second texture) -> offscreen
    this.drawTexture(def, scene, phase, this.tA, 0, scene.params[def.id]);
    let src = this.tA;
    if (layerDef) this.drawTexture(layerDef, scene, phase, this.target('B'), 777, L.params);

    // pass 2: combine layers + photo
    if (layerDef || usePhoto) {
      if (usePhoto && this.photoVer !== ph.ver) this.uploadPhoto();
      if (!this.composite) this.composite = this.link(COMPOSITE_FRAGMENT);
      const cp = this.composite;
      const tc = this.target('C');
      gl.bindFramebuffer(gl.FRAMEBUFFER, tc.fbo);
      gl.viewport(0, 0, this.w, this.h);
      gl.useProgram(cp.program);
      this.commonUniforms(cp, scene, phase);
      this.bindTex(0, this.tA.tex); this.bindTex(1, (this.tB ?? this.tA).tex); this.bindTex(2, this.photoTex ?? this.tA.tex);
      for (const [n, u] of [['u_a', 0], ['u_b', 1], ['u_p', 2]] as const) { const lo = this.loc(cp, n); if (lo) gl.uniform1i(lo, u); }
      this.uni1(cp, 'u_layerOn', layerDef ? 1 : 0);
      this.uni1(cp, 'u_blend', L.blend); this.uni1(cp, 'u_opacity', L.opacity);
      this.uni1(cp, 'u_maskMode', L.maskMode); this.uni1(cp, 'u_maskPos', L.maskPos); this.uni1(cp, 'u_maskSoft', L.maskSoft); this.uni1(cp, 'u_maskInv', L.maskInv ? 1 : 0);
      const P = scene.photo;
      this.uni1(cp, 'u_pOn', usePhoto ? 1 : 0); this.uni1(cp, 'u_pMode', P.mode); this.uni1(cp, 'u_pBlend', P.blend); this.uni1(cp, 'u_pOpacity', P.opacity);
      this.uni1(cp, 'u_pZoom', P.zoom); this.uni1(cp, 'u_pX', P.x); this.uni1(cp, 'u_pY', P.y); this.uni1(cp, 'u_pContrast', P.contrast);
      this.uni1(cp, 'u_pAspect', ph.canvas ? ph.w / ph.h : 1);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      src = tc;
    }

    // pass 3: finish -> canvas
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, this.w, this.h);
    gl.useProgram(fp.program);
    this.commonUniforms(fp, scene, phase);
    this.bindTex(0, src.tex);
    const lt = this.loc(fp, 'u_tex'); if (lt) gl.uniform1i(lt, 0);
    this.uni1(fp, 'u_key', opts.transparent ? 1 : 0);
    const g = scene.grade;
    this.uni1(fp, 'u_hue', (g.hue * Math.PI) / 180);
    this.uni1(fp, 'u_contrast', g.contrast);
    this.uni1(fp, 'u_brightness', g.brightness);
    this.uni1(fp, 'u_saturation', g.saturation);
    this.uni1(fp, 'u_invert', g.invert ? 1 : 0);
    this.uni1(fp, 'u_duo', g.duotone ? 1 : 0);
    this.uni3(fp, 'u_duoA', hexToRgb(scene.palette[g.duoA] ?? scene.palette[0]));
    this.uni3(fp, 'u_duoB', hexToRgb(scene.palette[g.duoB] ?? scene.palette[1]));
    const frames = Math.max(2, Math.round((12 * scene.anim.loop) / Math.max(1, Math.round(scene.anim.speed))));
    this.uni1(fp, 'u_gframes', frames);
    const fv: Values = { ...scene.finish };
    for (const e of EFFECTS) if (!scene.fxOn[e.id]) for (const z of e.zero) fv[z] = 0;
    this.setParams(fp, FINISH_PARAMS, fv, 'f_');
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  dispose() {
    const gl = this.gl;
    this.programs.forEach((p) => gl.deleteProgram(p.program));
    this.finish && gl.deleteProgram(this.finish.program);
    this.composite && gl.deleteProgram(this.composite.program);
    gl.getExtension('WEBGL_lose_context')?.loseContext();
  }
}
