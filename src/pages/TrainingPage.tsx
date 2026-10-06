import { ArrowRight, FlaskConical, Route, ShieldAlert, SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { proofs } from '../data/proofs';
import { useProgress } from '../state/progress';
import type { DiagnosticTag } from '../types/domain';

type Discipline = 'all' | 'euclidean' | 'analytical' | 'hybrid';
type Activity = 'all' | 'proof' | 'modeling' | 'calculation';

interface TrainingItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  route: string;
  examRoute?: string;
  discipline: Exclude<Discipline, 'all'>;
  activity: Exclude<Activity, 'all'>;
  source: 'official' | 'complementary';
  skill: string;
  errorTags: DiagnosticTag[];
}

const journeyItems: TrainingItem[] = [
  { id: 'congruence', title: 'Fortaleza da Congruência', subtitle: 'Lista Euclidiana 1', description: 'Correspondência, OPV, LAL e consequências.', route: '/vertical-slice#congruence-route', discipline: 'euclidean', activity: 'proof', source: 'official', skill: 'Congruência', errorTags: ['ordered-correspondence', 'opv-recognition', 'proof-gap'] },
  { id: 'parallelism', title: 'Passagem das Paralelas', subtitle: 'Lista Euclidiana 2', description: 'Famílias angulares, conversa e paralelogramo.', route: '/lab/parallelism', discipline: 'euclidean', activity: 'proof', source: 'official', skill: 'Paralelismo', errorTags: ['parallel-angle-family', 'parallel-converse', 'parallelogram-characterization'] },
  { id: 'line-forge', title: 'Forja das Retas', subtitle: 'Lista Analítica 2', description: 'Ponto, colinearidade, equação, sistema e posição.', route: '/lab/line-forge', discipline: 'analytical', activity: 'modeling', source: 'official', skill: 'Retas e sistemas', errorTags: ['collinearity-determinant', 'wrong-line-equation', 'system-classification-confusion'] },
  { id: 'exercise-48', title: 'Modelagem Métrica 48', subtitle: 'Chefe analítico', description: 'Figura → pontos → retas → sistema → prova exata.', route: '/lab/exercise-48', discipline: 'analytical', activity: 'calculation', source: 'official', skill: 'Modelagem métrica', errorTags: ['fails-to-build-system', 'radical-simplification', 'metric-proof-gap'] },
  { id: 'crossover', title: 'Ponte das Duas Linguagens', subtitle: 'Rota alternativa', description: 'Mediana, interseção e mediatriz em duas representações.', route: '/lab/crossover', discipline: 'hybrid', activity: 'modeling', source: 'complementary', skill: 'Transferência', errorTags: ['system-vs-intersection', 'perpendicularity'] },
  { id: 'coordinates', title: 'Cartografia de Sinais', subtitle: 'Lista Analítica 1', description: 'Quadrantes, eixos e diagonais do plano.', route: '/lab/coordinates', discipline: 'analytical', activity: 'calculation', source: 'official', skill: 'Coordenadas', errorTags: ['wrong-point-read-from-axis'] },
];

const proofItems: TrainingItem[] = proofs.map((proof) => ({
  id: `proof-${proof.id}`,
  title: proof.title,
  subtitle: proof.subtitle,
  description: `Tese: ${proof.thesis}`,
  route: `/proof/${proof.id}?mode=training`,
  examRoute: `/proof/${proof.id}?mode=exam`,
  discipline: 'euclidean',
  activity: 'proof',
  source: proof.source.origin === 'Complemento' ? 'complementary' : 'official',
  skill: proof.unlockSkillIds.join(' · ') || 'Demonstração',
  errorTags: ['proof-gap'],
}));

const labels: Record<Discipline | Activity, string> = {
  all: 'Todos', euclidean: 'Euclidiana', analytical: 'Analítica', hybrid: 'Híbrida',
  proof: 'Prova', modeling: 'Modelagem', calculation: 'Cálculo',
};

export function TrainingPage() {
  const { progress } = useProgress();
  const [discipline, setDiscipline] = useState<Discipline>('all');
  const [activity, setActivity] = useState<Activity>('all');
  const [source, setSource] = useState<'all' | 'official' | 'complementary'>('all');
  const [onlyMyErrors, setOnlyMyErrors] = useState(false);
  const activeErrorTags = new Set(Object.entries(progress.errorTagCounts).filter(([, count]) => (count ?? 0) > 0).map(([tag]) => tag));
  const items = [...journeyItems, ...proofItems].filter((item) =>
    (discipline === 'all' || item.discipline === discipline)
    && (activity === 'all' || item.activity === activity)
    && (source === 'all' || item.source === source)
    && (!onlyMyErrors || item.errorTags.some((tag) => activeErrorTags.has(tag))),
  );

  return (
    <section className="page training-page">
      <div className="page-heading">
        <span className="eyebrow">Oficina de argumentos · active recall</span>
        <h1>Provas não se assistem. Elas se constroem.</h1>
        <p>Filtre por disciplina, atividade, origem e pelos seus erros. Abrir teoria não aumenta domínio; somente decisões matemáticas registradas contam.</p>
      </div>

      <article className="training-card" style={{ marginTop: 22 }}>
        <small>Prioridade agora · 1ª Avaliação IFSP</small>
        <h2>Treino da avaliação — trilha única</h2>
        <p>Seis famílias da prova antiga em sequência fixa. Você nunca fica preso numa questão: as erradas voltam apenas no fechamento da rodada.</p>
        <span className="training-skill">V/F · paralelogramo · desigualdade · cevianas · semelhança · isósceles</span>
        <div>
          <Link className="primary-action" to="/avaliacao-ifsp"><FlaskConical size={16} /> Começar agora <ArrowRight size={16} /></Link>
        </div>
      </article>

      <section className="training-filters" aria-label="Filtros de treino">
        <header><SlidersHorizontal size={18} /><strong>Filtros</strong><span>{items.length} atividades</span></header>
        <div><small>Disciplina</small>{(['all','euclidean','analytical','hybrid'] as Discipline[]).map((value) => <button type="button" key={value} className={discipline === value ? 'is-active' : ''} onClick={() => setDiscipline(value)}>{labels[value]}</button>)}</div>
        <div><small>Competência</small>{(['all','proof','modeling','calculation'] as Activity[]).map((value) => <button type="button" key={value} className={activity === value ? 'is-active' : ''} onClick={() => setActivity(value)}>{labels[value]}</button>)}</div>
        <div><small>Origem</small>{(['all','official','complementary'] as const).map((value) => <button type="button" key={value} className={source === value ? 'is-active' : ''} onClick={() => setSource(value)}>{value === 'all' ? 'Todas' : value === 'official' ? 'Oficial' : 'Complementar'}</button>)}</div>
        <label><input type="checkbox" checked={onlyMyErrors} onChange={(event) => setOnlyMyErrors(event.target.checked)} /> Meus erros</label>
      </section>

      {items.length ? <div className="training-grid">
        {items.map((item) => (
          <article className="training-card" key={item.id}>
            <small>{item.subtitle} · {labels[item.discipline]}</small>
            <h2>{item.title}</h2>
            <p>{item.description}</p>
            <span className="training-skill">{item.skill}</span>
            <div>
              <Link className="primary-action" to={item.route}>{item.examRoute ? <FlaskConical size={16} /> : <Route size={16} />} {item.examRoute ? 'Treino' : 'Iniciar'} <ArrowRight size={16} /></Link>
              {item.examRoute && <Link className="secondary-action" to={item.examRoute}><ShieldAlert size={16} /> Exame</Link>}
            </div>
          </article>
        ))}
      </div> : <div className="empty-page"><ShieldAlert /><h2>Nenhuma atividade combina com os filtros.</h2><p>Desative “Meus erros” ou amplie disciplina e competência.</p></div>}
    </section>
  );
}
