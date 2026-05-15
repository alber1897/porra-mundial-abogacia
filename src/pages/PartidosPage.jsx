import { useSheetData } from '../hooks/useSheetData';
import { GRUPOS, isoToFlag } from '../data/paises';

const TODOS_LOS_PAISES = GRUPOS.flatMap(g => g.paises);
const teamToFlag = new Map(TODOS_LOS_PAISES.map(p => [p.nombre, isoToFlag(p.iso)]));
function flag(team) { return teamToFlag.get(team) || '🏳'; }

const PHASE_ORDER = ['group', 'r32', 'r16', 'qf', 'sf', '3rd', 'final'];
const PHASE_LABELS = {
  group: 'Fase de grupos', r32: '1/16 de final', r16: 'Octavos de final',
  qf: 'Cuartos de final', sf: 'Semifinales', '3rd': 'Tercer puesto', final: 'Final',
};

export default function PartidosPage() {
  const { resultados, loading, error } = useSheetData();

  if (loading) return <div className="app"><main><div className="container"><p className="empty">Cargando partidos…</p></div></main></div>;
  if (error) return <div className="app"><main><div className="container"><p className="empty" style={{ color: 'var(--c-red, #e53e3e)' }}>{error}</p></div></main></div>;

  const visible = resultados.filter(m => m.status === 'FT' || m.status === 'LIVE');
  const byPhase = new Map();
  for (const m of visible) {
    if (!byPhase.has(m.round)) byPhase.set(m.round, []);
    byPhase.get(m.round).push(m);
  }
  for (const [, matches] of byPhase) {
    matches.sort((a, b) => a.date.localeCompare(b.date));
  }

  if (byPhase.size === 0) {
    return (
      <div className="app"><main><div className="container">
        <div className="empty"><div className="empty-icon">📅</div><p>Aún no hay partidos jugados.</p></div>
      </div></main></div>
    );
  }

  return (
    <div className="app">
      <main>
        <div className="container">
          {PHASE_ORDER.filter(p => byPhase.has(p)).map(phase => (
            <div key={phase} className="partidos-phase">
              <div className="partidos-phase-title">{PHASE_LABELS[phase] || phase}</div>
              {byPhase.get(phase).map(m => (
                <div key={m.matchId} className="partido-row">
                  <div className="partido-home">
                    <span>{m.homeTeam}</span>
                    <span>{flag(m.homeTeam)}</span>
                  </div>
                  <div className={`partido-score${m.status === 'LIVE' ? ' partido-score--live' : ''}`}>
                    {m.homeGoals !== null ? `${m.homeGoals}–${m.awayGoals}` : '–'}
                  </div>
                  <div className="partido-away">
                    <span>{flag(m.awayTeam)}</span>
                    <span>{m.awayTeam}</span>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
