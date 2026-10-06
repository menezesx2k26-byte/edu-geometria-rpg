import { AlertTriangle, CheckCircle2, ChevronRight, Clock3, Lightbulb, RotateCcw, ShieldCheck, XCircle } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useProgress } from '../state/progress';
import type { MasteryDimension } from '../types/domain';
import './evaluation-training.css';

type AnswerMap = Record<string, string>;

interface BaseQuestion {
  id: string;
  title: string;
  subtitle: string;
  prompt: string;
  hint: string;
  skillIds: string[];
  masteryDimensions: MasteryDimension[];
}

interface SingleQuestion extends BaseQuestion {
  kind: 'single';
  options: Array<{ id: string; label: string }>;
  correctId: string;
  explanation: string;
}

interface MultiQuestion extends BaseQuestion {
  kind: 'multi';
  statements: Array<{
    id: string;
    text: string;
    answer: 'V' | 'F';
    explanation: string;
  }>;
}

type EvaluationQuestion = SingleQuestion | MultiQuestion;

const QUESTIONS: EvaluationQuestion[] = [
  {
    id: 'q1-vf',
    kind: 'multi',
    title: 'Questão 1 · Verdadeiro ou falso',
    subtitle: 'Definições e propriedades',
    prompt: 'Classifique cada afirmação. Na prova, a letra sozinha não basta: pense na justificativa ou num contraexemplo.',
    hint: 'Teste a definição antes de confiar no desenho. Para refutar “todo”, basta um contraexemplo.',
    skillIds: ['triangles', 'parallelogram-characterization'],
    masteryDimensions: ['recognition', 'justification'],
    statements: [
      { id: 'square', text: 'Todo quadrado é um paralelogramo.', answer: 'V', explanation: 'V. Um quadrado tem os dois pares de lados opostos paralelos.' },
      { id: 'parallelogram', text: 'Todo paralelogramo é um quadrado.', answer: 'F', explanation: 'F. Um retângulo não quadrado já é contraexemplo.' },
      { id: 'equilateral', text: 'Todo triângulo equilátero é isósceles.', answer: 'V', explanation: 'V, usando isósceles = triângulo com pelo menos dois lados congruentes.' },
      { id: 'trapezoid', text: 'Todo trapézio é um paralelogramo.', answer: 'F', explanation: 'F. Um trapézio com apenas um par de lados paralelos não é paralelogramo.' },
      { id: 'rhombus', text: 'Em um losango, as diagonais são perpendiculares.', answer: 'V', explanation: 'V. As diagonais de um losango se cruzam perpendicularmente.' },
    ],
  },
  {
    id: 'q2-parallelogram',
    kind: 'single',
    title: 'Questão 2 · Diagonais do paralelogramo',
    subtitle: 'Demonstração',
    prompt: 'ABCD é um paralelogramo e as diagonais AC e BD se cruzam em O. Qual roteiro prova que O é ponto médio das duas diagonais?',
    hint: 'Procure dois triângulos opostos pelo vértice e use o paralelismo para obter ângulos correspondentes.',
    skillIds: ['parallelogram-characterization'],
    masteryDimensions: ['application', 'justification', 'reproduction'],
    options: [
      { id: 'correct', label: 'Comparar △AOB e △COD: usar ângulos vindos das paralelas + lado oposto congruente para provar congruência; então AO=OC e BO=OD.' },
      { id: 'visual', label: 'Como as diagonais parecem se cortar no meio, concluir diretamente que O é ponto médio.' },
      { id: 'opv-only', label: 'Usar apenas ângulos opostos pelo vértice em O; isso já torna os quatro segmentos iguais.' },
      { id: 'circular', label: 'Assumir AO=OC e BO=OD e, depois, usar essas igualdades para provar que O é ponto médio.' },
    ],
    correctId: 'correct',
    explanation: 'O ponto médio precisa ser concluído, não assumido. A congruência de triângulos fornece AO=OC e BO=OD; como O pertence às diagonais, ele é ponto médio de ambas.',
  },
  {
    id: 'q3-inequality',
    kind: 'single',
    title: 'Questão 3 · Diagonais menores que o perímetro',
    subtitle: 'Desigualdade triangular',
    prompt: 'Para um quadrilátero ABCD, qual encadeamento prova AC + BD < AB + BC + CD + DA?',
    hint: 'Aplique a desigualdade triangular duas vezes para cada diagonal e depois some tudo.',
    skillIds: ['triangle-inequality'],
    masteryDimensions: ['application', 'justification', 'transfer'],
    options: [
      { id: 'correct', label: 'Usar AC<AB+BC e AC<AD+DC; BD<BA+AD e BD<BC+CD. Somar as quatro desigualdades e dividir por 2.' },
      { id: 'intersection', label: 'Somar as quatro desigualdades dos triângulos formados pelo ponto de interseção das diagonais; isso dá diretamente o resultado pedido.' },
      { id: 'largest', label: 'Afirmar que cada diagonal é menor que qualquer lado do quadrilátero e somar.' },
      { id: 'pythagoras', label: 'Aplicar Pitágoras em cada triângulo, mesmo sem ângulos retos indicados.' },
    ],
    correctId: 'correct',
    explanation: 'Somando: 2AC + 2BD < 2(AB+BC+CD+DA). Dividindo por 2, obtemos exatamente AC+BD < perímetro.',
  },
  {
    id: 'q4-constructions',
    kind: 'single',
    title: 'Questão 4 · Mediana e altura',
    subtitle: 'Régua e compasso',
    prompt: 'No △ABC, qual descrição constrói corretamente a mediana relativa a C e a altura relativa a A?',
    hint: 'Mediana procura ponto médio. Altura procura perpendicularidade com a reta do lado oposto.',
    skillIds: ['median', 'altitude'],
    masteryDimensions: ['recognition', 'application', 'reproduction'],
    options: [
      { id: 'correct', label: 'Mediana de C: construir o ponto médio M de AB e traçar CM. Altura de A: construir por A a perpendicular à reta BC.' },
      { id: 'swap', label: 'Mediana de C: perpendicular a AB. Altura de A: ligar A ao ponto médio de BC.' },
      { id: 'bisectors', label: 'Nas duas construções, basta construir uma bissetriz angular no vértice indicado.' },
      { id: 'midpoints', label: 'Nas duas construções, basta ligar o vértice ao ponto médio do lado oposto.' },
    ],
    correctId: 'correct',
    explanation: 'Mediana é vértice → ponto médio do lado oposto. Altura é vértice → reta perpendicular ao lado oposto (ou ao seu prolongamento).',
  },
  {
    id: 'q5-ramp',
    kind: 'single',
    title: 'Questão 5 · O erro de Gimli',
    subtitle: 'Semelhança de triângulos',
    prompt: 'Após 2 m de rampa, a altura é 1 m. Desse ponto até o topo ainda faltam 6 m de rampa. Por que 2/1 = 6/h está errado e qual é h?',
    hint: 'Os lados correspondentes precisam pertencer aos dois triângulos semelhantes completos.',
    skillIds: ['triangles'],
    masteryDimensions: ['application', 'justification', 'transfer'],
    options: [
      { id: 'correct', label: 'Os 6 m são só o trecho restante. A hipotenusa do triângulo grande mede 2+6=8 m. Logo 2/1 = 8/h e h=4 m.' },
      { id: 'three', label: 'A proporção 2/1 = 6/h está correta; portanto h=3 m.' },
      { id: 'seven', label: 'A rampa grande mede 7 m porque somamos 6 m com a altura de 1 m; então h=3,5 m.' },
      { id: 'angle', label: 'Não é possível resolver sem conhecer numericamente o ângulo θ.' },
    ],
    correctId: 'correct',
    explanation: 'Gimli comparou a hipotenusa do triângulo pequeno com apenas o pedaço final da hipotenusa maior. O correspondente de 2 m é a rampa inteira, 8 m. Assim, 2/8 = 1/h e h=4.',
  },
  {
    id: 'q6-isosceles',
    kind: 'single',
    title: 'Questão 6 · Isósceles com paralelas',
    subtitle: 'Boss da avaliação',
    prompt: 'No isósceles ABC, AB=AC e P está no interior de BC. Por P traçam-se paralelas a AB e AC, encontrando AC em D e AB em E. Qual fechamento prova que o paralelogramo AEPD tem perímetro AB+AC?',
    hint: 'Primeiro use as paralelas para reconhecer o paralelogramo. Depois compare os triângulos pequenos com o triângulo original.',
    skillIds: ['parallelogram-characterization', 'isosceles-theorem'],
    masteryDimensions: ['application', 'justification', 'reproduction', 'transfer'],
    options: [
      { id: 'correct', label: 'AEPD é paralelogramo, então P=2(AE+AD). Pelas semelhanças geradas pelas paralelas, AD=BE; logo AE+AD=AE+BE=AB. Como AB=AC, P=2AB=AB+AC.' },
      { id: 'appearance', label: 'Como o desenho é simétrico, AE=AD automaticamente; então o perímetro é AB+AC.' },
      { id: 'all-equal', label: 'Todo paralelogramo formado dentro de um isósceles é um losango, portanto todos os lados são iguais.' },
      { id: 'base', label: 'O perímetro do paralelogramo é sempre igual a 2·BC, independentemente da posição de P.' },
    ],
    correctId: 'correct',
    explanation: 'O ponto-chave é provar AD=BE (por semelhança, usando as paralelas). Assim, AE+AD=AB e o perímetro do paralelogramo vale 2AB=AB+AC.',
  },
];

const STORAGE_KEY = 'geometria-rpg:avaliacao-ifsp:v1';
const MAX_ROUNDS = 3;

interface SessionState {
  queue: string[];
  index: number;
  round: number;
  missedThisRound: string[];
  attempts: Record<string, number>;
  done: boolean;
  unresolved: string[];
}

function initialSession(): SessionState {
  return {
    queue: QUESTIONS.map((question) => question.id),
    index: 0,
    round: 1,
    missedThisRound: [],
    attempts: {},
    done: false,
    unresolved: [],
  };
}

function readSession(): SessionState {
  if (typeof window === 'undefined') return initialSession();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialSession();
    const parsed = JSON.parse(raw) as SessionState;
    if (!Array.isArray(parsed.queue) || typeof parsed.index !== 'number') return initialSession();
    return parsed;
  } catch {
    return initialSession();
  }
}

export function EvaluationTrainingPage() {
  const { recordAttempt } = useProgress();
  const [session, setSession] = useState<SessionState>(readSession);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [feedback, setFeedback] = useState<{ correct: boolean; explanation: string }>();
  const [hintUsed, setHintUsed] = useState(false);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  }, [session]);

  const question = useMemo(
    () => QUESTIONS.find((item) => item.id === session.queue[session.index]),
    [session.index, session.queue],
  );

  const progressPercent = session.done
    ? 100
    : Math.round(((session.index + (feedback ? 1 : 0)) / Math.max(1, session.queue.length)) * 100);

  const canSubmit = Boolean(question && (
    question.kind === 'single'
      ? answers[question.id]
      : question.statements.every((statement) => answers[statement.id])
  ));

  const submit = () => {
    if (!question || feedback) return;
    const correct = question.kind === 'single'
      ? answers[question.id] === question.correctId
      : question.statements.every((statement) => answers[statement.id] === statement.answer);
    const explanation = question.kind === 'single'
      ? question.explanation
      : question.statements.map((statement) => statement.explanation).join(' ');

    recordAttempt(
      'assessment-ifsp-2026',
      question.id,
      question.kind === 'single'
        ? [answers[question.id] ?? '']
        : question.statements.map((statement) => `${statement.id}:${answers[statement.id] ?? ''}`),
      correct,
      [],
      {
        skillIds: question.skillIds,
        masteryDimensions: question.masteryDimensions,
        hintsUsed: hintUsed ? 1 : 0,
        hintTier: hintUsed ? 1 : undefined,
        position: '/avaliacao-ifsp',
      },
    );

    setSession((current) => ({
      ...current,
      attempts: { ...current.attempts, [question.id]: (current.attempts[question.id] ?? 0) + 1 },
      missedThisRound: correct
        ? current.missedThisRound
        : [...new Set([...current.missedThisRound, question.id])],
    }));
    setFeedback({ correct, explanation });
  };

  const advance = () => {
    if (!question || !feedback) return;
    const atEnd = session.index >= session.queue.length - 1;

    if (!atEnd) {
      setSession((current) => ({ ...current, index: current.index + 1 }));
    } else if (session.missedThisRound.length > 0 && session.round < MAX_ROUNDS) {
      setSession((current) => ({
        ...current,
        queue: current.missedThisRound,
        index: 0,
        round: current.round + 1,
        missedThisRound: [],
      }));
    } else {
      setSession((current) => ({
        ...current,
        done: true,
        unresolved: current.missedThisRound,
      }));
    }

    setAnswers({});
    setFeedback(undefined);
    setHintUsed(false);
  };

  const reset = () => {
    const next = initialSession();
    setSession(next);
    setAnswers({});
    setFeedback(undefined);
    setHintUsed(false);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  if (session.done) {
    const solved = QUESTIONS.length - session.unresolved.length;
    return (
      <section className="page evaluation-page">
        <header className="evaluation-hero evaluation-hero--done">
          <span className="eyebrow">Treino da avaliação · IFSP Cubatão</span>
          <ShieldCheck size={42} />
          <h1>Ciclo encerrado.</h1>
          <p>Você percorreu as seis famílias da prova sem ficar preso numa questão. O que ainda falhou ficou separado para revisão consciente.</p>
        </header>
        <div className="evaluation-result">
          <strong>{solved}/{QUESTIONS.length}</strong>
          <span>famílias fechadas no último ciclo</span>
        </div>
        {session.unresolved.length > 0 ? (
          <section className="evaluation-unresolved">
            <AlertTriangle />
            <div>
              <h2>Revisar antes da prova</h2>
              <p>{session.unresolved.map((id) => QUESTIONS.find((item) => item.id === id)?.title).filter(Boolean).join(' · ')}</p>
            </div>
          </section>
        ) : (
          <section className="evaluation-unresolved is-clear">
            <CheckCircle2 />
            <div><h2>Sem pendências neste ciclo</h2><p>Agora vale uma passada rápida nas justificativas, não outra maratona.</p></div>
          </section>
        )}
        <div className="evaluation-actions">
          <button type="button" className="primary-action" onClick={reset}><RotateCcw size={17} /> Recomeçar trilha</button>
          <Link className="secondary-action" to="/map">Voltar ao mapa</Link>
        </div>
      </section>
    );
  }

  if (!question) return null;

  return (
    <section className="page evaluation-page">
      <header className="evaluation-hero">
        <div>
          <span className="eyebrow">Modo guerra · 1ª Avaliação</span>
          <h1>Treino da avaliação — IFSP</h1>
          <p>Seis famílias da prova antiga, uma única trilha. Errou? Você continua. No fim, volta apenas o que falhou — no máximo por três rodadas.</p>
        </div>
        <div className="evaluation-clock"><Clock3 size={18} /><span>Rodada {session.round}/{MAX_ROUNDS}</span></div>
      </header>

      <div className="evaluation-progress" aria-label={`Progresso da rodada: ${progressPercent}%`}>
        <span style={{ width: `${progressPercent}%` }} />
        <strong>{session.index + 1}/{session.queue.length}</strong>
      </div>

      <article className="evaluation-card">
        <div className="evaluation-card__heading">
          <span>{question.subtitle}</span>
          <h2>{question.title}</h2>
          <p>{question.prompt}</p>
        </div>

        {question.kind === 'multi' ? (
          <div className="evaluation-statements">
            {question.statements.map((statement) => {
              const selected = answers[statement.id];
              const resultClass = feedback
                ? selected === statement.answer ? 'is-correct' : 'is-wrong'
                : '';
              return (
                <fieldset key={statement.id} className={resultClass}>
                  <legend>{statement.text}</legend>
                  <div>
                    {(['V', 'F'] as const).map((value) => (
                      <button
                        type="button"
                        key={value}
                        className={selected === value ? 'is-selected' : ''}
                        onClick={() => !feedback && setAnswers((current) => ({ ...current, [statement.id]: value }))}
                        disabled={Boolean(feedback)}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                  {feedback && <small>{statement.explanation}</small>}
                </fieldset>
              );
            })}
          </div>
        ) : (
          <div className="evaluation-options">
            {question.options.map((option) => {
              const selected = answers[question.id] === option.id;
              const resultClass = feedback
                ? option.id === question.correctId ? 'is-correct' : selected ? 'is-wrong' : ''
                : '';
              return (
                <button
                  type="button"
                  key={option.id}
                  className={`${selected ? 'is-selected ' : ''}${resultClass}`.trim()}
                  onClick={() => !feedback && setAnswers({ [question.id]: option.id })}
                  disabled={Boolean(feedback)}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        )}

        {!feedback && (
          <button type="button" className="evaluation-hint" onClick={() => setHintUsed(true)}>
            <Lightbulb size={16} /> {hintUsed ? question.hint : 'Mostrar uma pista'}
          </button>
        )}

        {feedback && (
          <div className={feedback.correct ? 'evaluation-feedback is-correct' : 'evaluation-feedback is-wrong'}>
            {feedback.correct ? <CheckCircle2 /> : <XCircle />}
            <div>
              <strong>{feedback.correct ? 'Boa. Segue.' : 'Errou, mas não trava a trilha.'}</strong>
              <p>{feedback.explanation}</p>
            </div>
          </div>
        )}

        <div className="evaluation-footer">
          {!feedback ? (
            <button type="button" className="primary-action" disabled={!canSubmit} onClick={submit}>Corrigir</button>
          ) : (
            <button type="button" className="primary-action" onClick={advance}>
              {session.index >= session.queue.length - 1 ? 'Fechar rodada' : 'Próxima'} <ChevronRight size={17} />
            </button>
          )}
          <span>{session.attempts[question.id] ? `${session.attempts[question.id]} tentativa(s) anterior(es)` : 'Primeira tentativa'}</span>
        </div>
      </article>

      <footer className="evaluation-source">
        <strong>Fonte de treino</strong>
        <span>1ª Avaliação — Geometria Euclidiana Plana · Prof. Leandro Albino Mosca Rodrigues · IFSP Cubatão.</span>
      </footer>
    </section>
  );
}
