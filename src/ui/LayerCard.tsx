import { useState } from 'react';
import { BLEND_NAMES, MASK_NAMES } from '../defaults';
import { paramValues } from '../gl/renderer';
import { resetLayerParam, setLayer, setLayerParam, useStore } from '../store';
import { CATEGORIES, TEXTURES, TEXTURE_BY_ID } from '../textures';
import { Card, ParamControl, Segment, Slider, Toggle } from './Controls';

const R = (id: string, label: string, min: number, max: number, def: number, step = 1) => ({ type: 'range' as const, id, label, min, max, step, default: def });

export function LayerCard() {
  const L = useStore((s) => s.scene.layer);
  const [showParams, setShowParams] = useState(false);
  const def = TEXTURE_BY_ID[L.textureId] ?? TEXTURES[0];
  const vals = paramValues(def, L.params);
  return (
    <Card title="Vrstva 2 – druhá textúra" on={L.on} onToggle={(v) => setLayer({ on: v })}>
      <select className="sel" value={L.textureId} onChange={(e) => setLayer({ textureId: e.target.value, params: {} })}>
        {CATEGORIES.map((c) => (
          <optgroup key={c.id} label={c.name}>
            {TEXTURES.filter((t) => t.category === c.id).map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </optgroup>
        ))}
      </select>
      <div className="ctl-h"><label>Miešanie</label></div>
      <div className="seg">
        {BLEND_NAMES.map((n, i) => <button key={n} className={L.blend === i ? 'on' : ''} onClick={() => setLayer({ blend: i })}>{n}</button>)}
      </div>
      <Slider p={R('opacity', 'Priehľadnosť vrstvy', 0, 1, 0.85, 0.01)} value={L.opacity} onChange={(v) => setLayer({ opacity: v }, 'op')} onReset={() => setLayer({ opacity: 0.85 })} />
      <Segment label="Maska" options={MASK_NAMES} value={L.maskMode} onChange={(v) => setLayer({ maskMode: v })} />
      {L.maskMode > 0 && (<>
        <Slider p={R('maskPos', 'Pozícia masky', 0, 100, 50)} value={L.maskPos} onChange={(v) => setLayer({ maskPos: v }, 'mp')} onReset={() => setLayer({ maskPos: 50 })} />
        <Slider p={R('maskSoft', 'Mäkkosť masky', 0, 100, 40)} value={L.maskSoft} onChange={(v) => setLayer({ maskSoft: v }, 'ms')} onReset={() => setLayer({ maskSoft: 40 })} />
        <Toggle label="Obrátiť masku" value={L.maskInv} onChange={(v) => setLayer({ maskInv: v })} />
      </>)}
      <button className="btn small" onClick={() => setShowParams(!showParams)}>{showParams ? 'Skryť nastavenia vrstvy' : 'Nastavenia vrstvy'}</button>
      {showParams && def.params.map((p) => (
        <ParamControl key={def.id + p.id} p={p} value={vals[p.id]} onChange={(v) => setLayerParam(p.id, v)} onReset={() => resetLayerParam(p.id)} />
      ))}
    </Card>
  );
}
