import { useEffect, useRef, useState } from 'react';
import { FORMATS } from '../defaults';
import { setFormat, useStore } from '../store';

export function FormatMenu() {
  const fmt = useStore((s) => s.scene.format);
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const h = (e: PointerEvent) => { if (!box.current?.contains(e.target as Node)) setOpen(false); };
    window.addEventListener('pointerdown', h);
    return () => window.removeEventListener('pointerdown', h);
  }, [open]);
  const cur = FORMATS.find((f) => f.id === fmt.preset) ?? { name: 'Vlastný' };
  return (
    <div className="fmtwrap" ref={box}>
      <button className="fmtbtn" onClick={() => setOpen(!open)}>
        <b>{cur.name}</b><span>{fmt.w}×{fmt.h}</span><i>▾</i>
      </button>
      {open && (
        <div className="pop">
          {(['social', 'wall'] as const).map((g) => (
            <div key={g}>
              <div className="pop-h">{g === 'social' ? 'Sociálne siete' : 'Tapety a bannery'}</div>
              {FORMATS.filter((f) => f.group === g).map((f) => {
                const k = 22 / Math.max(f.w, f.h);
                return (
                  <button key={f.id} className={'fmtitem' + (fmt.preset === f.id ? ' on' : '')} onClick={() => { setFormat(f.id, f.w, f.h); setOpen(false); }}>
                    <span className="ar"><i style={{ width: Math.max(3, f.w * k), height: Math.max(3, f.h * k) }} /></span>
                    <b>{f.name}</b><small>{f.w}×{f.h}</small>
                  </button>
                );
              })}
            </div>
          ))}
          <div className={'fmtitem custom' + (fmt.preset === 'custom' ? ' on' : '')}>
            <b>Vlastný</b>
            <input type="number" inputMode="numeric" value={fmt.w} onChange={(e) => setFormat('custom', +e.target.value, fmt.h)} />×
            <input type="number" inputMode="numeric" value={fmt.h} onChange={(e) => setFormat('custom', fmt.w, +e.target.value)} />
          </div>
        </div>
      )}
    </div>
  );
}
