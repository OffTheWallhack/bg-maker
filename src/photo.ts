import { useSyncExternalStore } from 'react';

// The photo lives only in memory (it is too big for localStorage and presets).
let canvas: HTMLCanvasElement | null = null;
let ver = 0;
let size = { w: 0, h: 0 };
const subs = new Set<() => void>();
const notify = () => subs.forEach((f) => f());

export const getPhoto = () => ({ canvas, ver, ...size });
export const hasPhoto = () => !!canvas;

export async function loadPhotoFile(file: File) {
  const bmp = await createImageBitmap(file, { imageOrientation: 'from-image' } as ImageBitmapOptions);
  const k = Math.min(1, 2048 / Math.max(bmp.width, bmp.height));
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.round(bmp.width * k));
  c.height = Math.max(1, Math.round(bmp.height * k));
  c.getContext('2d')!.drawImage(bmp, 0, 0, c.width, c.height);
  bmp.close?.();
  canvas = c; size = { w: c.width, h: c.height }; ver++;
  notify();
}
export function clearPhoto() { canvas = null; size = { w: 0, h: 0 }; ver++; notify(); }
export function usePhotoVersion() {
  return useSyncExternalStore((f) => (subs.add(f), () => subs.delete(f)), () => ver);
}
