import { useEffect, useState } from 'react';
import { randomAll, redo, setState, stepTexture, undo, useStore } from './store';
import type { Tab } from './store';
import { AnimTab } from './ui/AnimTab';
import { ColorTab } from './ui/ColorTab';
import { EffectsTab } from './ui/EffectsTab';
import { Intro } from './ui/Intro';
import { ExportTab } from './ui/ExportTab';
import { FormatMenu } from './ui/FormatMenu';
import { Preview } from './ui/Preview';
import { TextureStrip, useVisibleIds } from './ui/TextureStrip';
import { TextureTab } from './ui/TextureTab';

const TABS: [Tab, string][] = [['texture', 'Textúra'], ['colors', 'Farby'], ['effects', 'Efekty'], ['anim', 'Animácia'], ['export', 'Export']];

export function App() {
  const [error, setError] = useState('');
  const tab = useStore((s) => s.tab);
  const sheet = useStore((s) => s.sheet);
  const safe = useStore((s) => s.safe);
  const canUndo = useStore((s) => s.past.length > 0);
  const canRedo = useStore((s) => s.future.length > 0);
  const ids = useVisibleIds();
  const intro = useStore((s) => s.intro);

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t?.tagName === 'INPUT' && (t as HTMLInputElement).type !== 'range') return;
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); e.shiftKey ? redo() : undo(); }
      else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'y') { e.preventDefault(); redo(); }
      else if (e.key === 'ArrowLeft' && t?.tagName !== 'INPUT') stepTexture(-1, ids);
      else if (e.key === 'ArrowRight' && t?.tagName !== 'INPUT') stepTexture(1, ids);
    };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [ids]);

  const pickTab = (t: Tab) => setState({ tab: t, sheet: sheet === 'peek' ? 'half' : sheet });

  return (
    <div className={'app sheet-' + sheet}>
      {intro && <Intro />}
      <header className="top">
        <FormatMenu />
        <div className="tools">
          <button onClick={() => setState({ intro: true })} title="O projekte">ⓘ</button>
          <button onClick={randomAll} title="Všetko náhodne">🎲</button>
          <button onClick={undo} disabled={!canUndo} title="Späť">↶</button>
          <button onClick={redo} disabled={!canRedo} title="Znova">↷</button>
          <button className={safe ? 'on' : ''} onClick={() => setState({ safe: !safe })} title="Bezpečné zóny">▭</button>
        </div>
      </header>
      <main className="stage">
        <Preview onError={setError} />
        {error && <div className="err">{error}</div>}
      </main>
      <TextureStrip />
      <aside className="panel">
        <button className="handle" onClick={() => setState({ sheet: sheet === 'full' ? 'half' : sheet === 'half' ? 'peek' : 'half' })} aria-label="Panel"><i /></button>
        <nav className="tabs">
          {TABS.map(([id, n]) => <button key={id} className={tab === id ? 'on' : ''} onClick={() => pickTab(id)}>{n}</button>)}
        </nav>
        <div className="body">
          {tab === 'texture' && <TextureTab />}
          {tab === 'colors' && <ColorTab />}
          {tab === 'effects' && <EffectsTab />}
          {tab === 'anim' && <AnimTab />}
          {tab === 'export' && <ExportTab />}
        </div>
      </aside>
    </div>
  );
}
