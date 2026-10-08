import { Renderer } from './gl/renderer';
import type { Scene } from './types';

let exportR: Renderer | null = null;
function getR() {
  if (!exportR) {
    const c = document.createElement('canvas');
    c.style.cssText = 'position:fixed;left:0;top:0;width:2px;height:2px;opacity:0.01;pointer-events:none';
    document.body.appendChild(c);
    exportR = new Renderer(c);
  }
  return exportR;
}

function fullRender(scene: Scene, phase = 0) {
  const r = getR();
  r.setSize(scene.format.w, scene.format.h);
  r.render(scene, phase);
  return r.canvas;
}

const isMobile = () => /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

export async function deliver(blob: Blob, name: string) {
  const file = new File([blob], name, { type: blob.type });
  if (isMobile() && navigator.canShare?.({ files: [file] })) {
    try { await navigator.share({ files: [file] }); return; } catch (e) { if ((e as Error).name === 'AbortError') return; }
  }
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 30000);
}

const baseName = (s: Scene) => `bglab-${s.textureId}-${s.seed}-${s.format.w}x${s.format.h}`;

export async function saveImage(scene: Scene, kind: 'png' | 'jpg') {
  const c = fullRender(scene, 0);
  const blob: Blob = await new Promise((res, rej) =>
    c.toBlob((b) => (b ? res(b) : rej(new Error('Export zlyhal'))), kind === 'png' ? 'image/png' : 'image/jpeg', 0.95));
  await deliver(blob, `${baseName(scene)}.${kind}`);
}

export function pickMime(): string {
  const c = ['video/mp4;codecs=avc1.42E01E', 'video/mp4', 'video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'];
  return c.find((m) => window.MediaRecorder?.isTypeSupported?.(m)) ?? '';
}

/** Records one seamless loop in real time at full resolution. */
export async function recordLoop(scene: Scene, onProgress: (p: number) => void): Promise<{ blob: Blob; ext: string }> {
  if (!window.MediaRecorder) throw new Error('Tento prehliadač nepodporuje nahrávanie videa.');
  const mime = pickMime();
  const s: Scene = { ...scene, anim: { ...scene.anim, on: true } };
  const c = fullRender(s, 0);
  const fps = 30;
  const stream = c.captureStream(0);
  const track = stream.getVideoTracks()[0] as MediaStreamTrack & { requestFrame?: () => void };
  const rec = new MediaRecorder(stream, { mimeType: mime || undefined, videoBitsPerSecond: 16_000_000 });
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
  return { blob: new Blob(chunks, { type }), ext: type.includes('mp4') ? 'mp4' : 'webm' };
}

/** WebM -> H.264 MP4 (Instagram friendly) using ffmpeg.wasm, loaded on demand. */
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
  await ff.exec(['-i', inName, '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2', '-r', '30', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '18', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-an', 'out.mp4']);
  const data = (await ff.readFile('out.mp4')) as Uint8Array;
  ff.terminate();
  return new Blob([data], { type: 'video/mp4' });
}
