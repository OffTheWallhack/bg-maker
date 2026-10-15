import { useEffect, useRef, useState } from 'react';
import { SITE } from '../config';
import { makeScene } from '../defaults';
import { Renderer } from '../gl/renderer';
import { enterApp } from '../store';
import type { Values } from '../types';

/** Intro backgrounds – one is picked at random on every open. */
export const INTRO_LOOKS: { id: string; bg: string; texture: string; params: Values; palette: string[] }[] = [
  { id: 'heatwave', bg: '#1a0500', texture: 'flow-gradient', params: { bands: 1.3, w1: 1.0, flow: 1.2 }, palette: ['#1A0500', '#FFE7B8', '#FF3D00', '#FF9A1F', '#B0122C'] },
  { id: 'frost', bg: '#06111f', texture: 'grain-orb', params: { x: 0.05, y: 0.12, size: 0.85, fall: 1.1, dither: 0.6, second: 0.9 }, palette: ['#030B18', '#E4F8FF', '#2FA8FF', '#9FE3FF', '#15385C'] },
  { id: 'toxic', bg: '#020302', texture: 'flow-gradient', params: { bands: 1.1, w1: 1.1, flow: 1.2, soft: 1.6 }, palette: ['#020302', '#F2FFD6', '#B6FF00', '#4CFF2F', '#0E1607'] },
];

export function Intro() {
  const cv = useRef<HTMLCanvasElement>(null);
  const [leaving, setLeaving] = useState(false);
  const [look] = useState(() => {
    const forced = new URLSearchParams(location.search).get('intro');
    return INTRO_LOOKS.find((l) => l.id === forced) ?? INTRO_LOOKS[Math.floor(Math.random() * INTRO_LOOKS.length)];
  });

  useEffect(() => {
    let raf = 0, r: Renderer | null = null;
    try {
      r = new Renderer(cv.current!);
      r.setSize(360, 640);
      const s = makeScene(look.texture, look.palette);
      s.anim = { on: true, speed: 1, loop: 14, motion: 0, amount: 1.2 };
      s.params[look.texture] = look.params;
      s.finish.grain = 28;
      s.fxOn = { ...s.fxOn, glow: true };
      s.finish.glow = 30;
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
    <div className={'intro intro-' + look.id + (leaving ? ' leave' : '')} style={{ background: look.bg }}>
      <canvas ref={cv} className="intro-bg" />
      <div className="intro-shade" />
      <div className="intro-card">
        <img src="./logo.png" alt={SITE.name} className="intro-logo" />
        <h1 className="intro-name">{SITE.name}</h1>
        <p className="intro-tag">{SITE.tagline}</p>
        <button className="intro-enter" onClick={enter}>{SITE.enter} <span>→</span></button>
        {(links.length > 0 || SITE.author) && (
          <div className="intro-foot">
            <span>{SITE.author}</span>
            {links.map((l) => <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer">{l.label} ↗</a>)}
          </div>
        )}
      </div>
    </div>
  );
}
