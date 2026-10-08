import { FINISH_GROUPS, FINISH_PARAMS } from '../finish';
import { defaultFinish } from '../defaults';
import { setFinish, update, useStore } from '../store';
import { ParamControl } from './Controls';

export function DirtTab() {
  const finish = useStore((s) => s.scene.finish);
  return (
    <div className="stack">
      <div className="row">
        <button className="btn grow" onClick={() => update((s) => ({ ...s, finish: { ...s.finish, ...Object.fromEntries(FINISH_PARAMS.filter((p) => p.type === 'range' && p.max === 100).map((p) => [p.id, 0])) } }))}>Vypnúť všetko</button>
        <button className="btn grow" onClick={() => update((s) => ({ ...s, finish: defaultFinish() }))}>Predvolené</button>
      </div>
      {FINISH_GROUPS.map((g) => (
        <section key={g.name} className="stack">
          <h4>{g.name}</h4>
          {g.params.map((p) => (
            <ParamControl key={p.id} p={p} value={finish[p.id] ?? p.default} onChange={(v) => setFinish(p.id, v)} onReset={() => setFinish(p.id, p.default)} />
          ))}
        </section>
      ))}
    </div>
  );
}
