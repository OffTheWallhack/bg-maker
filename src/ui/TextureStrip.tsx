import { useEffect, useMemo, useRef, useState } from 'react';
import { selectTexture, setState, stepTexture, useStore } from '../store';
import { CATEGORIES, TEXTURES, TEXTURE_BY_ID } from '../textures';
import { textureThumb } from '../thumbs';

function Tile({ id, name, palette, active }: { id: string; name: string; palette: string[]; active: boolean }) {
  const ref = useRef<HTMLButtonElement>(null);
  const [seen, setSeen] = useState(false);
  const [url, setUrl] = useState('');
  const key = palette.join('');
  useEffect(() => {
    const el = ref.current!;
    const io = new IntersectionObserver((e) => e.some((x) => x.isIntersecting) && setSeen(true), { rootMargin: '240px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  useEffect(() => {
    if (!seen) return;
    let ok = true;
    textureThumb(id, palette, (u) => ok && setUrl(u));
    return () => { ok = false; };
  }, [seen, id, key]);
  useEffect(() => { if (active) ref.current?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' }); }, [active]);
  return (
    <button ref={ref} className={'stile' + (active ? ' on' : '')} onClick={() => selectTexture(id)}>
      <div className="stile-img">{url ? <img src={url} alt="" draggable={false} /> : <div className="ph" />}</div>
      <span>{name}</span>
    </button>
  );
}

export function useVisibleIds() {
  const cat = useStore((s) => s.cat);
  return useMemo(() => TEXTURES.filter((t) => cat === 'all' || t.category === cat).map((t) => t.id), [cat]);
}

export function TextureStrip() {
  const scene = useStore((s) => s.scene);
  const cat = useStore((s) => s.cat);
  const ids = useVisibleIds();
  const idx = ids.indexOf(scene.textureId);
  const def = TEXTURE_BY_ID[scene.textureId];
  return (
    <section className="strip">
      <div className="strip-head">
        <div className="chips scrollx">
          <button className={'cchip' + (cat === 'all' ? ' on' : '')} onClick={() => setState({ cat: 'all' })}>Všetko</button>
          {CATEGORIES.map((c) => <button key={c.id} className={'cchip' + (cat === c.id ? ' on' : '')} onClick={() => setState({ cat: c.id })}>{c.name}</button>)}
        </div>
      </div>
      <div className="strip-row">
        <button className="arr" onClick={() => stepTexture(-1, ids)} aria-label="Predchádzajúca">‹</button>
        <div className="strip-scroll">
          {ids.map((id) => <Tile key={id} id={id} name={TEXTURE_BY_ID[id].name} palette={scene.palette} active={id === scene.textureId} />)}
        </div>
        <button className="arr" onClick={() => stepTexture(1, ids)} aria-label="Ďalšia">›</button>
      </div>
      <div className="strip-name"><b>{def.name}</b><small>{idx >= 0 ? `${idx + 1} / ${ids.length}` : ids.length}</small></div>
    </section>
  );
}
