import { useEffect, useRef, useState } from 'react';
import { SITE } from '../config';
import { makeScene } from '../defaults';
import { Renderer } from '../gl/renderer';
import { enterApp } from '../store';

export function Intro() {
  const cv = useRef<HTMLCanvasElement>(null);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    let raf = 0, r: Renderer | null = null;
    try {
      r = new Renderer(cv.current!);
      r.setSize(360, 640);
      const s = makeScene('mesh-gradient', ['#0A0714', '#EDE7FF', '#7C3AED', '#FF4FD8', '#6C6A8A']);
      s.anim = { on: true, speed: 1, loop: 14, motion: 0, amount: 1.3 };
      s.params['mesh-gradient'] = { drift: 1, warp: 0.9 };
      s.finish.grain = 30;
      const t0 = performance.now();
      let last = 0;
      const loop = (now: number) => {
        raf = requestAnimationFrame(loop);
        if (now - last < 40) return;
        last = now;
        r!.render(s, (((now - t0) / 1000) % 14) / 14);
      };
      raf = requestAnimationFrame(loop);
    } catch { /* WebGL unavailable: the gradient CSS fallback stays */ }
    return () => { cancelAnimationFrame(raf); r?.dispose(); };
  }, []);

  const enter = () => { setLeaving(true); setTimeout(enterApp, 450); };
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === 'Enter') enter(); };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, []);

  const links = SITE.links.filter((l) => l.url);
  return (
    <div className={'intro' + (leaving ? ' leave' : '')}>
      <canvas ref={cv} className="intro-bg" />
      <div className="intro-shade" />
      <div className="intro-card">
        <img src="./logo.png" alt="BG Maker" className="intro-logo" />
        <p className="intro-tag">{SITE.tagline}</p>
        <button className="intro-enter" onClick={enter}>{SITE.enter} <span>→</span></button>
        <div className="intro-news">
          <small>{SITE.news.title}</small>
          <p>{SITE.news.text}</p>
        </div>
        <div className="intro-foot">
          <span>od {SITE.author}</span>
          {links.map((l) => <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer">{l.label} ↗</a>)}
        </div>
      </div>
    </div>
  );
}
