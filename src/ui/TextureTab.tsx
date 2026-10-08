import { useEffect, useMemo, useState } from 'react';
import { CATEGORIES, TEXTURES, TEXTURE_BY_ID } from '../textures';
import { paramValues } from '../gl/renderer';
import { randomAll, randomize, remix, resetParam, selectTexture, setParam, setSeed, texParams, update, useStore } from '../store';
import { textureThumb } from '../thumbs';
import { ParamControl } from './Controls';

function Tile({ id, palette, active, onPick, name }: { id: string; palette: string[]; active: boolean; onPick: () => void; name: string }) {
  const [url, setUrl] = useState('');
  const key = palette.join('');
  useEffect(() => { let ok = true; textureThumb(id, palette, (u) => ok && setUrl(u)); return () => { ok = false; }; }, [id, key]);
  return (
    <button className={'tile' + (active ? ' on' : '')} onClick={onPick}>
      <div className="tile-img">{url ? <img src={url} alt="" /> : <div className="ph" />}</div>
      <span>{name}</span>
    </button>
  );
}

export function TextureTab() {
  const scene = useStore((s) => s.scene);
  const [open, setOpen] = useState(() => window.innerWidth > 820);
  const [q, setQ] = useState('');
  const def = TEXTURE_BY_ID[scene.textureId];
  const vals = paramValues(def, texParams(scene));
  const groups = useMemo(() => {
    const n = q.trim().toLowerCase();
    return CATEGORIES.map((c) => ({ ...c, items: TEXTURES.filter((t) => t.category === c.id && (!n || t.name.toLowerCase().includes(n) || t.id.includes(n))) })).filter((g) => g.items.length);
  }, [q]);
  const cat = CATEGORIES.find((c) => c.id === def.category)?.name;

  return (
    <div className="stack">
      <button className="btn acc" onClick={randomAll}>🎲 Všetko náhodne (textúra + farby + špina)</button>
      <div className="row">
        <button className="btn grow" onClick={randomize}>Náhodná textúra</button>
        <button className="btn grow" onClick={remix}>↻ Remix</button>
      </div>
      <div className="row seedrow">
        <label>Seed</label>
        <input className="num" type="number" min={0} value={scene.seed} onChange={(e) => setSeed(+e.target.value)} />
        <button className="btn" onClick={() => setSeed(Math.floor(Math.random() * 99999))}>nové</button>
      </div>
      <button className="current" onClick={() => setOpen(!open)}>
        <div><small>{cat}</small><b>{def.name}</b></div><span>{open ? '▲ zavrieť' : '▼ zmeniť'}</span>
      </button>
      {open && (
        <div className="picker">
          <input className="search" placeholder="Hľadať textúru…" value={q} onChange={(e) => setQ(e.target.value)} />
          {groups.map((g) => (
            <section key={g.id}>
              <h4>{g.name}</h4>
              <div className="grid">
                {g.items.map((t) => (
                  <Tile key={t.id} id={t.id} name={t.name} palette={scene.palette} active={t.id === scene.textureId}
                    onPick={() => { selectTexture(t.id); if (window.innerWidth <= 820) setOpen(false); }} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
      <h4>Parametre</h4>
      {def.params.map((p) => (
        <ParamControl key={def.id + p.id} p={p} value={vals[p.id]} onChange={(v) => setParam(p.id, v)} onReset={() => resetParam(p)} />
      ))}
      <button className="btn ghost" onClick={() => update((s) => ({ ...s, params: { ...s.params, [s.textureId]: {} } }))}>Obnoviť predvolené parametre</button>
    </div>
  );
}
