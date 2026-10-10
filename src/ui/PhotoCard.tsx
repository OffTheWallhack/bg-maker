import { useRef } from 'react';
import { BLEND_NAMES, PHOTO_MODES } from '../defaults';
import { clearPhoto, getPhoto, loadPhotoFile, usePhotoVersion } from '../photo';
import { setPhoto, useStore } from '../store';
import { Card, Segment, Slider } from './Controls';

const R = (id: string, label: string, min: number, max: number, def: number, step = 0.01) => ({ type: 'range' as const, id, label, min, max, step, default: def });

export function PhotoCard() {
  const P = useStore((s) => s.scene.photo);
  usePhotoVersion();
  const ph = getPhoto();
  const file = useRef<HTMLInputElement>(null);
  const pick = async (f: File) => {
    try { await loadPhotoFile(f); setPhoto({ on: true }); } catch { alert('Fotku sa nepodarilo načítať.'); }
  };
  return (
    <>
    <Card title="Vlastná fotka" on={P.on && !!ph.canvas} onToggle={(v) => { if (v && !ph.canvas) file.current?.click(); else setPhoto({ on: v }); }}>
      <div className="row">
        <button className="btn grow" onClick={() => file.current?.click()}>{ph.canvas ? 'Vymeniť fotku' : 'Nahrať fotku'}</button>
        {ph.canvas && <button className="btn" onClick={() => { clearPhoto(); setPhoto({ on: false }); }}>Odstrániť</button>}
      </div>
      {ph.canvas && <p className="hint">{ph.w}×{ph.h} px · zostáva len vo vašom zariadení (neukladá sa do presetov)</p>}
      <Segment label="Spracovanie" options={PHOTO_MODES} value={P.mode} onChange={(v) => setPhoto({ mode: v })} />
      <Slider p={R('contrast', 'Kontrast fotky', 0.3, 3, 1)} value={P.contrast} onChange={(v) => setPhoto({ contrast: v }, 'c')} onReset={() => setPhoto({ contrast: 1 })} />
      <div className="ctl-h"><label>Miešanie s textúrou</label></div>
      <div className="seg">
        {BLEND_NAMES.map((n, i) => <button key={n} className={P.blend === i ? 'on' : ''} onClick={() => setPhoto({ blend: i })}>{n}</button>)}
      </div>
      <Slider p={R('opacity', 'Priehľadnosť fotky', 0, 1, 1)} value={P.opacity} onChange={(v) => setPhoto({ opacity: v }, 'o')} onReset={() => setPhoto({ opacity: 1 })} />
      <Slider p={R('zoom', 'Priblíženie', 0.5, 4, 1)} value={P.zoom} onChange={(v) => setPhoto({ zoom: v }, 'z')} onReset={() => setPhoto({ zoom: 1 })} />
      <Slider p={R('x', 'Posun X', -1, 1, 0)} value={P.x} onChange={(v) => setPhoto({ x: v }, 'x')} onReset={() => setPhoto({ x: 0 })} />
      <Slider p={R('y', 'Posun Y', -1, 1, 0)} value={P.y} onChange={(v) => setPhoto({ y: v }, 'y')} onReset={() => setPhoto({ y: 0 })} />
    </Card>
    <input ref={file} type="file" accept="image/*" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) pick(f); e.target.value = ''; }} />
    </>
  );
}
