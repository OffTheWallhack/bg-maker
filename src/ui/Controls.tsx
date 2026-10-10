import { useRef } from 'react';
import type { Param, ParamValue } from '../types';
import { normHex } from '../color';
import { useState, useEffect } from 'react';

const decimals = (step: number) => (step >= 1 ? 0 : Math.min(4, Math.ceil(-Math.log10(step))));

export function Slider({ p, value, onChange, onReset }: { p: Extract<Param, { type: 'range' }>; value: number; onChange: (v: number) => void; onReset: () => void }) {
  const last = useRef(0);
  const down = () => {
    const now = Date.now();
    if (now - last.current < 320) onReset();
    last.current = now;
  };
  const d = decimals(p.step);
  const changed = Math.abs(value - p.default) > p.step / 2;
  return (
    <div className="ctl">
      <div className="ctl-h">
        <label onDoubleClick={onReset}>{p.label}</label>
        <span className={'val' + (changed ? ' ch' : '')} onDoubleClick={onReset}>{value.toFixed(d)}</span>
      </div>
      <input type="range" min={p.min} max={p.max} step={p.step} value={value} onPointerDown={down} onChange={(e) => onChange(+e.target.value)} onDoubleClick={onReset} />
    </div>
  );
}

export function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button className={'tog' + (value ? ' on' : '')} onClick={() => onChange(!value)} role="switch" aria-checked={value}>
      <span>{label}</span><i />
    </button>
  );
}

export function Segment({ label, options, value, onChange }: { label?: string; options: string[]; value: number; onChange: (v: number) => void }) {
  return (
    <div className="ctl">
      {label && <div className="ctl-h"><label>{label}</label></div>}
      <div className="seg">
        {options.map((o, i) => <button key={o} className={i === value ? 'on' : ''} onClick={() => onChange(i)}>{o}</button>)}
      </div>
    </div>
  );
}

export function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const [txt, setTxt] = useState(value);
  useEffect(() => setTxt(value), [value]);
  return (
    <div className="color">
      <input type="color" value={normHex(value) ?? '#000000'} onChange={(e) => onChange(e.target.value)} aria-label={label} />
      <div className="color-t">
        <label>{label}</label>
        <input type="text" value={txt} spellCheck={false} maxLength={7} onChange={(e) => { setTxt(e.target.value); const h = normHex(e.target.value); if (h) onChange(h); }} onBlur={() => setTxt(value)} />
      </div>
    </div>
  );
}

export function ParamControl({ p, value, onChange, onReset }: { p: Param; value: ParamValue; onChange: (v: ParamValue) => void; onReset: () => void }) {
  switch (p.type) {
    case 'range': return <Slider p={p} value={Number(value)} onChange={onChange} onReset={onReset} />;
    case 'toggle': return <Toggle label={p.label} value={!!value} onChange={onChange} />;
    case 'select': return <Segment label={p.label} options={p.options} value={Number(value)} onChange={onChange} />;
    case 'color': return <ColorField label={p.label} value={String(value)} onChange={onChange} />;
  }
}

export function Switch({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return <button className={'sw-btn' + (on ? ' on' : '')} role="switch" aria-checked={on} onClick={() => onChange(!on)}><i /></button>;
}

export function Card({ title, on, onToggle, children }: { title: string; on: boolean; onToggle: (v: boolean) => void; children?: React.ReactNode }) {
  return (
    <div className={'fx' + (on ? ' on' : '')}>
      <div className="fx-h" onClick={() => onToggle(!on)}>
        <span>{title}</span>
        <span onClick={(e) => e.stopPropagation()}><Switch on={on} onChange={onToggle} /></span>
      </div>
      {on && <div className="fx-b">{children}</div>}
    </div>
  );
}
