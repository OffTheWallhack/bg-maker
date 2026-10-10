import { EFFECTS, SECTIONS } from '../finish';
import { defaultFxOn, defaultFinish } from '../defaults';
import { setFinish, setFx, update, useStore } from '../store';
import { ParamControl, Switch } from './Controls';

export function EffectsTab() {
  const finish = useStore((s) => s.scene.finish);
  const fxOn = useStore((s) => s.scene.fxOn);
  const active = EFFECTS.filter((e) => fxOn[e.id]).length;
  return (
    <div className="stack">
      <div className="row between">
        <span className="hint">{active} zapnutých</span>
        <div className="row">
          <button className="btn small" onClick={() => update((s) => ({ ...s, fxOn: Object.fromEntries(EFFECTS.map((e) => [e.id, false])) }))}>Vypnúť všetko</button>
          <button className="btn small" onClick={() => update((s) => ({ ...s, fxOn: defaultFxOn(), finish: defaultFinish() }))}>Predvolené</button>
        </div>
      </div>
      {SECTIONS.map((sec) => (
        <section key={sec} className="stack">
          <h4>{sec}</h4>
          {EFFECTS.filter((e) => e.section === sec).map((e) => {
            const on = !!fxOn[e.id];
            return (
              <div key={e.id} className={'fx' + (on ? ' on' : '')}>
                <div className="fx-h" onClick={() => setFx(e.id, !on)}>
                  <span>{e.name}</span>
                  <span onClick={(ev) => ev.stopPropagation()}><Switch on={on} onChange={(v) => setFx(e.id, v)} /></span>
                </div>
                {on && (
                  <div className="fx-b">
                    {e.params.map((p) => (
                      <ParamControl key={p.id} p={p} value={finish[p.id] ?? p.default} onChange={(v) => setFinish(p.id, v)} onReset={() => setFinish(p.id, p.default)} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </section>
      ))}
    </div>
  );
}
