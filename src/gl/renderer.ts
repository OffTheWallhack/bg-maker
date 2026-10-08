import { hexToRgb, lumaOf, mulberry32 } from '../color';
import { FINISH_PARAMS } from '../finish';
import { TEXTURE_BY_ID } from '../textures';
import type { Param, Scene, TextureDef, Values } from '../types';
import { FINISH_FRAGMENT } from './finishShader';
import { VERT, buildTextureFragment } from './glsl';

interface Prog { program: WebGLProgram; locs: Map<string, WebGLUniformLocation | null> }

export function seedOffset(seed: number): [number, number] {
  const r = mulberry32(Math.floor(seed) * 7919 + 13);
  return [r() * 100, r() * 100];
}

export function paramValues(def: { params: Param[] }, overrides?: Values): Values {
  const v: Values = {};
  for (const p of def.params) v[p.id] = overrides && p.id in overrides ? overrides[p.id] : p.default;
  return v;
}

export class Renderer {
  readonly canvas: HTMLCanvasElement;
  private gl: WebGL2RenderingContext;
  private programs = new Map<string, Prog>();
  private finish: Prog | null = null;
  private vs: WebGLShader;
  private fbo: WebGLFramebuffer;
  private tex: WebGLTexture;
  private fw = 0;
  private fh = 0;
  private floatFbo = false;
  w = 0;
  h = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const gl = canvas.getContext('webgl2', { antialias: false, alpha: false, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
    if (!gl) throw new Error('WebGL2 nie je dostupné v tomto prehliadači.');
    this.gl = gl;
    gl.getExtension('EXT_color_buffer_float');
    gl.getExtension('EXT_color_buffer_half_float');
    this.vs = this.compile(gl.VERTEX_SHADER, VERT);
    this.fbo = gl.createFramebuffer()!;
    this.tex = gl.createTexture()!;
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

  setSize(w: number, h: number) {
    w = Math.max(2, Math.round(w)); h = Math.max(2, Math.round(h));
    if (w === this.w && h === this.h) return;
    this.w = w; this.h = h;
    this.canvas.width = w; this.canvas.height = h;
    this.ensureFbo(w, h);
  }

  private ensureFbo(w: number, h: number) {
    if (w === this.fw && h === this.fh) return;
    const gl = this.gl;
    gl.bindTexture(gl.TEXTURE_2D, this.tex);
    const tryFmt = (internal: number, type: number) => {
      gl.texImage2D(gl.TEXTURE_2D, 0, internal, w, h, 0, gl.RGBA, type, null);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.tex, 0);
      return gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
    };
    this.floatFbo = tryFmt(gl.RGBA16F, gl.HALF_FLOAT) || false;
    if (!this.floatFbo) tryFmt(gl.RGBA8, gl.UNSIGNED_BYTE);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    this.fw = w; this.fh = h;
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

  private commonUniforms(p: Prog, scene: Scene, phase: number) {
    const gl = this.gl;
    const [sx, sy] = seedOffset(scene.seed);
    const a = scene.anim;
    const l = (n: string) => this.loc(p, n);
    const lr = l('u_res'); if (lr) gl.uniform2f(lr, this.w, this.h);
    const ls = l('u_so'); if (ls) gl.uniform2f(ls, sx, sy);
    this.uni1(p, 'u_seed', scene.seed);
    this.uni1(p, 'u_phase', a.on ? phase : 0);
    this.uni1(p, 'u_cycles', Math.max(1, Math.round(a.speed)));
    this.uni1(p, 'u_anim', a.on ? 1 : 0);
    const lm = l('u_motion'); if (lm) gl.uniform1i(lm, a.motion);
    const [bg, i1, i2, hi, dirt] = scene.palette;
    this.uni3(p, 'u_bg', hexToRgb(bg)); this.uni3(p, 'u_ink1', hexToRgb(i1)); this.uni3(p, 'u_ink2', hexToRgb(i2));
    this.uni3(p, 'u_hi', hexToRgb(hi)); this.uni3(p, 'u_dirt', hexToRgb(dirt));
    const ramp = [bg, i1, i2, hi].sort((x, y) => lumaOf(x) - lumaOf(y));
    ramp.forEach((c, i) => this.uni3(p, `u_r${i}`, hexToRgb(c)));
  }

  /** Renders the scene at the current canvas size. phase: 0..1 position inside the loop. */
  render(scene: Scene, phase = 0) {
    const gl = this.gl;
    const def = TEXTURE_BY_ID[scene.textureId];
    const tp = this.ensureTexture(def);
    if (!this.finish) this.finish = this.link(FINISH_FRAGMENT);
    const fp = this.finish;

    // pass 1: texture -> offscreen
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
    gl.viewport(0, 0, this.w, this.h);
    gl.useProgram(tp.program);
    this.commonUniforms(tp, scene, phase);
    this.setParams(tp, def.params, paramValues(def, scene.params[def.id]), '');
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    // pass 2: finish -> canvas
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, this.w, this.h);
    gl.useProgram(fp.program);
    this.commonUniforms(fp, scene, phase);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.tex);
    const lt = this.loc(fp, 'u_tex'); if (lt) gl.uniform1i(lt, 0);
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
    this.setParams(fp, FINISH_PARAMS, scene.finish, 'f_');
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  dispose() {
    const gl = this.gl;
    this.programs.forEach((p) => gl.deleteProgram(p.program));
    this.finish && gl.deleteProgram(this.finish.program);
    gl.deleteFramebuffer(this.fbo);
    gl.deleteTexture(this.tex);
    gl.getExtension('WEBGL_lose_context')?.loseContext();
  }
}
