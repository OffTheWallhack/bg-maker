import { useEffect, useRef, useState } from 'react';
import { Renderer } from '../gl/renderer';
import { getState, useStore } from '../store';

export function Preview({ onError }: { onError: (e: string) => void }) {
  const box = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const rend = useRef<Renderer | null>(null);
  const dirty = useRef(true);
  const [fit, setFit] = useState({ w: 0, h: 0 });
  const scene = useStore((s) => s.scene);
  const safe = useStore((s) => s.safe);
  const { w, h } = scene.format;

  useEffect(() => { dirty.current = true; }, [scene, fit]);

  useEffect(() => {
    const el = box.current!;
    const ro = new ResizeObserver(() => {
      const pad = window.innerWidth <= 820 ? 16 : 28, cw = el.clientWidth - pad, ch = el.clientHeight - pad, ar = w / h;
      const cssW = Math.max(40, Math.min(cw, ch * ar));
      setFit({ w: Math.floor(cssW), h: Math.floor(cssW / ar) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [w, h]);

  useEffect(() => {
    try { rend.current = new Renderer(canvas.current!); } catch (e) { onError(String(e)); return; }
    let raf = 0, last = 0, lastErr = '';
    const t0 = performance.now();
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const r = rend.current!;
      const sc = getState().scene;
      const animating = sc.anim.on;
      if (!animating && !dirty.current) return;
      if (animating && now - last < 33) return;
      last = now;
      dirty.current = false;
      const el = canvas.current!;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const cap = animating ? 720 : 960;
      let pw = el.clientWidth * dpr, ph = el.clientHeight * dpr;
      const k = Math.min(1, cap / Math.max(pw, ph));
      pw *= k; ph *= k;
      if (pw < 2 || ph < 2) return;
      try {
        r.setSize(pw, ph);
        r.render(sc, animating ? (((now - t0) / 1000) % sc.anim.loop) / sc.anim.loop : 0);
        if (lastErr) { lastErr = ''; onError(''); }
      } catch (e) {
        const m = String(e);
        if (m !== lastErr) { lastErr = m; onError(m); }
      }
    };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); rend.current?.dispose(); rend.current = null; };
  }, []);

  const k = Math.min(w, h) >= 0 ? (h > w ? w / 1080 : h / 1080) : 1;
  const top = (250 * k * fit.h) / h, bottom = (340 * k * fit.h) / h;
  return (
    <div className="preview" ref={box}>
      <div className="frame" style={{ width: fit.w, height: fit.h }}>
        <canvas ref={canvas} style={{ width: '100%', height: '100%' }} />
        {safe && (
          <div className="safe">
            <div style={{ height: top }}><span>horná zóna 250 px</span></div>
            <div style={{ height: bottom, marginTop: 'auto' }}><span>dolná zóna 340 px</span></div>
          </div>
        )}
      </div>
    </div>
  );
}
