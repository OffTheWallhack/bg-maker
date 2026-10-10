import { useEffect, useRef, useState } from 'react';
import { RECIPES } from '../recipes';
import type { Recipe } from '../recipes';
import { loadScene, useStore } from '../store';
import { lazySceneThumb } from '../thumbs';

function RTile({ r, onPick }: { r: Recipe; onPick: () => void }) {
  const ref = useRef<HTMLButtonElement>(null);
  const [seen, setSeen] = useState(false);
  const [url, setUrl] = useState('');
  useEffect(() => {
    const io = new IntersectionObserver((e) => e.some((x) => x.isIntersecting) && setSeen(true), { rootMargin: '200px' });
    io.observe(ref.current!);
    return () => io.disconnect();
  }, []);
  useEffect(() => { if (seen) lazySceneThumb(r.id, () => ({ ...r.build(), format: { preset: 'post', w: 128, h: 160 } }), setUrl); }, [seen, r]);
  return (
    <button ref={ref} className="rtile" onClick={onPick}>
      <div className="stile-img">{url ? <img src={url} alt="" draggable={false} /> : <div className="ph" />}</div>
      <span>{r.name}</span>
    </button>
  );
}

export function RecipeRow() {
  const fmt = useStore((s) => s.scene.format);
  return (
    <div className="rrow">
      {RECIPES.map((r) => <RTile key={r.id} r={r} onPick={() => loadScene({ ...r.build(), format: fmt })} />)}
    </div>
  );
}
