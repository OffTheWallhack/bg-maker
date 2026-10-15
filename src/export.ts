import { Renderer } from './gl/renderer';
import type { Scene } from './types';
import { makeZip } from './zip';

export const FILE_PREFIX = 'bgmaker';

let exportR: Renderer | null = null;
function getR() {
  if (!exportR) {
    const c = document.createElement('canvas');
    c.style.cssText = 'position:fixed;left:0;top:0;width:2px;height:2px;opacity:0.01;pointer-events:none';
    document.body.appendChild(c);
    exportR = new Renderer(c, { alpha: true });
  }
  return exportR;
}

/** Export size: format x scale, limited to 4096 px per side and 16 Mpx. */
export function exportSize(w: number, h: number, scale: number): [number, number] {
  const k = Math.min(scale, 4096 / Math.max(w, h), Math.sqrt(16_000_000 / (w * h)));
  return [Math.round(w * k), Math.round(h * k)];
}

function fullRender(scene: Scene, phase = 0, w = scene.format.w, h = scene.format.h, transparent = false) {
  const r = getR();
  r.setSize(w, h);
  r.render(scene, phase, { transparent });
  return r.canvas;
}

const toBlob = (c: HTMLCanvasElement, type: string, q?: number) =>
  new Promise<Blob>((res, rej) => c.toBlob((b) => (b ? res(b) : rej(new Error('Export zlyhal'))), type, q));

const isMobile = () => /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const nextTick = () => new Promise((r) => setTimeout(r, 0));

/** needsConvert: video is not H.264 (Instagram / Photos may refuse it) */
export interface OutFile { name: string; blob: Blob; needsConvert?: boolean }

function download(blob: Blob, name: string) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 60000);
}

/**
 * Hands files to the user: share sheet on phones (save to Photos), download elsewhere.
 * Returns 'tap' when the browser refused the share sheet because too much time passed since the
 * click (long exports) – the UI then shows a button so the next tap can open it.
 */
export async function deliverFiles(files: OutFile[], zipName = `${FILE_PREFIX}.zip`): Promise<'ok' | 'tap'> {
  const list = files.map((f) => new File([f.blob], f.name, { type: f.blob.type }));
  if (isMobile() && navigator.canShare?.({ files: list })) {
    try { await navigator.share({ files: list }); return 'ok'; }
    catch (e) {
      const n = (e as Error).name;
      if (n === 'AbortError') return 'ok';
      if (n === 'NotAllowedError') return 'tap';
    }
  }
  if (files.length === 1) download(files[0].blob, files[0].name);
  else download(await makeZip(files), zipName);
  return 'ok';
}
export const deliver = (blob: Blob, name: string) => deliverFiles([{ blob, name }]);

export interface ExportOpts { scale: number; transparent: boolean }

export async function renderImage(scene: Scene, kind: 'png' | 'jpg', o: ExportOpts): Promise<OutFile> {
  const [w, h] = exportSize(scene.format.w, scene.format.h, o.scale);
  const c = fullRender(scene, 0, w, h, o.transparent && kind === 'png');
  const blob = await toBlob(c, kind === 'png' ? 'image/png' : 'image/jpeg', 0.95);
  return { blob, name: `${FILE_PREFIX}-${scene.textureId}-${scene.seed}-${w}x${h}.${kind}` };
}

/** The same picture in several formats. */
export async function renderSet(scene: Scene, formats: { id: string; w: number; h: number }[], o: ExportOpts, onProgress: (p: number) => void): Promise<OutFile[]> {
  const files: OutFile[] = [];
  for (let i = 0; i < formats.length; i++) {
    const f = formats[i];
    const [w, h] = exportSize(f.w, f.h, o.scale);
    const c = fullRender({ ...scene, format: { preset: f.id, w: f.w, h: f.h } }, 0, w, h, o.transparent);
    files.push({ name: `${FILE_PREFIX}-${f.id}-${w}x${h}.png`, blob: await toBlob(c, 'image/png') });
    onProgress((i + 1) / formats.length);
    await nextTick();
  }
  return files;
}

// ---------------------------------------------------------------- video

export interface VideoOpts { quality: number; fps: number } // quality 0 = vysoká, 1 = maximálna

/** bits per second for a given frame size; grain and fine detail need a lot */
function bitrateFor(w: number, h: number, fps: number, quality: number) {
  const bpp = quality > 0 ? 0.9 : 0.45;
  return Math.round(Math.min(120_000_000, Math.max(8_000_000, w * h * fps * bpp)));
}

const AVC_CODECS = ['avc1.640034', 'avc1.640033', 'avc1.640032', 'avc1.64002A', 'avc1.4D0034', 'avc1.4D0033', 'avc1.42E034', 'avc1.42E01F'];

// VP9 only when the browser has no H.264 encoder (some Linux builds); the result is then offered for conversion.
const VP9_CODECS = ['vp09.00.41.08', 'vp09.00.40.08', 'vp09.00.31.08'];

async function pickCodec(w: number, h: number, bitrate: number, fps: number): Promise<{ cfg: VideoEncoderConfig; mux: 'avc' | 'vp9' } | null> {
  if (!('VideoEncoder' in window)) return null;
  for (const codec of AVC_CODECS) {
    const cfg: VideoEncoderConfig = { codec, width: w, height: h, bitrate, framerate: fps, latencyMode: 'quality', avc: { format: 'avc' } };
    try { if ((await VideoEncoder.isConfigSupported(cfg)).supported) return { cfg, mux: 'avc' }; } catch { /* next */ }
  }
  for (const codec of VP9_CODECS) {
    const cfg: VideoEncoderConfig = { codec, width: w, height: h, bitrate, framerate: fps, latencyMode: 'quality' };
    try { if ((await VideoEncoder.isConfigSupported(cfg)).supported) return { cfg, mux: 'vp9' }; } catch { /* next */ }
  }
  return null;
}

/**
 * Renders every frame of the loop offline and encodes H.264 MP4 with WebCodecs at a high bitrate.
 * Frame-exact (nothing dropped, timing perfect) and much sharper than real-time screen recording.
 */
async function encodeWebCodecs(scene: Scene, o: VideoOpts, onProgress: (p: number) => void): Promise<OutFile | null> {
  const w = scene.format.w - (scene.format.w % 2), h = scene.format.h - (scene.format.h % 2);
  const fps = o.fps;
  const picked = await pickCodec(w, h, bitrateFor(w, h, fps, o.quality), fps);
  if (!picked) return null;
  const { cfg, mux } = picked;
  const { Muxer, ArrayBufferTarget } = await import('mp4-muxer');
  const target = new ArrayBufferTarget();
  const muxer = new Muxer({ target, video: { codec: mux, width: w, height: h, frameRate: fps }, fastStart: 'in-memory' });
  let failure: unknown = null;
  const enc = new VideoEncoder({ output: (chunk, meta) => muxer.addVideoChunk(chunk, meta), error: (e) => { failure = e; } });
  enc.configure(cfg);
  const s: Scene = { ...scene, anim: { ...scene.anim, on: true } };
  const frames = Math.round(s.anim.loop * fps);
  const dur = Math.round(1e6 / fps);
  for (let i = 0; i < frames; i++) {
    if (failure) throw failure;
    const c = fullRender(s, i / frames, w, h);
    const vf = new VideoFrame(c, { timestamp: i * dur, duration: dur, alpha: 'discard' });
    enc.encode(vf, { keyFrame: i % (fps * 2) === 0 });
    vf.close();
    while (enc.encodeQueueSize > 4) await new Promise((r) => setTimeout(r, 4));
    onProgress((i + 1) / frames);
    if (i % 2 === 0) await nextTick();
  }
  await enc.flush();
  enc.close();
  if (failure) throw failure;
  muxer.finalize();
  return { blob: new Blob([target.buffer], { type: 'video/mp4' }), name: `${FILE_PREFIX}-${scene.textureId}-${scene.seed}-${w}x${h}.mp4`, needsConvert: mux !== 'avc' };
}

function pickMime(): string {
  const c = ['video/mp4;codecs=avc1.640028', 'video/mp4;codecs=avc1.42E01E', 'video/mp4', 'video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'];
  return c.find((m) => window.MediaRecorder?.isTypeSupported?.(m)) ?? '';
}

/** Fallback for browsers without WebCodecs: real-time recording of the canvas. */
async function recordRealtime(scene: Scene, o: VideoOpts, onProgress: (p: number) => void): Promise<OutFile> {
  if (!window.MediaRecorder) throw new Error('Tento prehliadač nevie nahrávať video. Skúste Safari 16.4+ alebo Chrome.');
  const mime = pickMime();
  const s: Scene = { ...scene, anim: { ...scene.anim, on: true } };
  const c = fullRender(s, 0);
  const fps = o.fps;
  const stream = c.captureStream(0);
  const track = stream.getVideoTracks()[0] as MediaStreamTrack & { requestFrame?: () => void };
  const rec = new MediaRecorder(stream, { mimeType: mime || undefined, videoBitsPerSecond: bitrateFor(c.width, c.height, fps, o.quality) });
  const chunks: Blob[] = [];
  rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
  const done = new Promise<void>((res) => (rec.onstop = () => res()));
  rec.start(500);
  const loopMs = s.anim.loop * 1000;
  const t0 = performance.now();
  let next = 0;
  await new Promise<void>((resolve) => {
    const tick = () => {
      const el = performance.now() - t0;
      if (el >= loopMs) return resolve();
      if (el >= next) {
        next += 1000 / fps;
        fullRender(s, el / loopMs);
        track.requestFrame?.();
        onProgress(el / loopMs);
      }
      requestAnimationFrame(tick);
    };
    tick();
  });
  rec.stop();
  await done;
  stream.getTracks().forEach((t) => t.stop());
  const type = rec.mimeType || mime || 'video/webm';
  const ext = type.includes('mp4') ? 'mp4' : 'webm';
  return { blob: new Blob(chunks, { type }), name: `${FILE_PREFIX}-${scene.textureId}-${scene.seed}-${c.width}x${c.height}.${ext}`, needsConvert: ext !== 'mp4' };
}

export async function encodeVideo(scene: Scene, o: VideoOpts, onProgress: (p: number) => void): Promise<OutFile> {
  try {
    const r = await encodeWebCodecs(scene, o, onProgress);
    if (r) return r;
  } catch (e) {
    console.warn('WebCodecs export failed, falling back to MediaRecorder', e);
  }
  return recordRealtime(scene, o, onProgress);
}

/** WebM -> H.264 MP4 using ffmpeg.wasm (only needed when the browser could not make MP4 itself). */
export async function convertToMp4(blob: Blob, onProgress: (p: number) => void): Promise<Blob> {
  const { FFmpeg } = await import('@ffmpeg/ffmpeg');
  const { fetchFile, toBlobURL } = await import('@ffmpeg/util');
  const ff = new FFmpeg();
  ff.on('progress', ({ progress }) => onProgress(Math.min(1, Math.max(0, progress))));
  const base = 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/esm';
  await ff.load({
    coreURL: await toBlobURL(`${base}/ffmpeg-core.js`, 'text/javascript'),
    wasmURL: await toBlobURL(`${base}/ffmpeg-core.wasm`, 'application/wasm'),
  });
  const inName = blob.type.includes('mp4') ? 'in.mp4' : 'in.webm';
  await ff.writeFile(inName, await fetchFile(blob));
  await ff.exec(['-i', inName, '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2', '-c:v', 'libx264', '-preset', 'medium', '-crf', '12', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-an', 'out_h264.mp4']);
  const data = (await ff.readFile('out_h264.mp4')) as Uint8Array;
  ff.terminate();
  return new Blob([data], { type: 'video/mp4' });
}
