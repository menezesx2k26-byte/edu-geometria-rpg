import { AlertTriangle, CheckCircle2, ChevronRight, Clock3, RotateCcw, ShieldCheck, XCircle } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CastleRouteMap } from '../components/evaluation/CastleRouteMap';
import { EvaluationCastleFigure } from '../components/evaluation/EvaluationCastleFigure';
import { HintLadder } from '../components/evaluation/HintLadder';
import { ProofGrimoire } from '../components/evaluation/ProofGrimoire';
import { EVALUATION_CASTLE_QUESTIONS } from '../data/evaluationCastle';
import {
  EVALUATION_SESSION_STORAGE_KEY,
  LEGACY_EVALUATION_SESSION_STORAGE_KEY,
  MAX_EVALUATION_ROUNDS,
  advanceEvaluationSession,
  createEvaluationSession,
  markEvaluationResult,
  restoreEvaluationSession,
} from '../engine/evaluationSession';
import { useProgress } from '../state/progress';
import './evaluation-training.css';

type AnswerMap = Record<string, string>;
type OpenedHintTier = 0 | 1 | 2 | 3;

const QUESTION_IDS = EVALUATION_CASTLE_QUESTIONS.map((question) => question.id);

function readSession() {
  if (typeof window === 'undefined') return createEvaluationSession(QUESTION_IDS);
  const current = window.localStorage.getItem(EVALUATION_SESSION_STORAGE_KEY);
  const legacy = current ? null : window.localStorage.getItem(LEGACY_EVALUATION_SESSION_STORAGE_KEY);
  return restoreEvaluationSession(current ?? legacy, QUESTION_IDS);
}

export function EvaluationTrainingPage() {
  const { recordAttempt } = useProgress();
  const [session, setSession] = useState(readSession);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [feedback, setFeedback] = useState<{ correct: boolean; explanation: string }>();
  const [openedHintTier, setOpenedHintTier] = useState<OpenedHintTier>(0);
  const [selectedAnchorIds, setSelectedAnchorIds] = useState<string[]>([]);

  useEffect(() => {
    window.localStorage.setItem(EVALUATION_SESSION_STORAGE_KEY, JSON.stringify(session));
  }, [session]);

  const question = useMemo(
    () => EVALUATION_CASTLE_QUESTIONS.find((item) => item.id === session.queue[session.index]),
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

  const toggleAnchor = (anchorId: string) => {
    setSelectedAnchorIds((current) => (
      current.includes(anchorId)
        ? current.filter((id) => id !== anchorId)
        : [...current, anchorId]
    ));
  };

  const openHint = (tier: 1 | 2 | 3) => {
    setOpenedHintTier((current) => Math.max(current, tier) as OpenedHintTier);
  };

  const submit = () => {
    if (!question || feedback) return;
    const correct = question.kind === 'single'
      ? answers[question.id] === question.correctId
      : question.statements.every((statement) => answers[statement.id] === statement.answer);
    const explanation = question.kind === 'single'
      ? question.explanation
      : question.statements.map((statement) => statement.explanation).join(' ');

    const selectedIds = question.kind === 'single'
      ? [answers[question.id] ?? '']
      : question.statements.map((statement) => `${statement.id}:${answers[statement.id] ?? ''}`);

    recordAttempt(
      'assessment-ifsp-2026',
      question.id,
      selectedIds,
      correct,
      [],
      {
        skillIds: question.skillIds,
        masteryDimensions: question.masteryDimensions,
        hintsUsed: openedHintTier,
        hintTier: openedHintTier > 0 ? openedHintTier : undefined,
        position: '/avaliacao-ifsp',
      },
    );

    setSession((current) => markEvaluationResult(current, question.id, correct));
    setFeedback({ correct, explanation });
  };

  const advance = () => {
    if (!question || !feedback) return;
    setSession((current) => advanceEvaluationSession(current));
    setAnswers({});
    setFeedback(undefined);
    setOpenedHintTier(0);
    setSelectedAnchorIds([]);
  };

  const reset = () => {
    const next = createEvaluationSession(QUESTION_IDS);
    setSession(next);
    setAnswers({});
    setFeedback(undefined);
    setOpenedHintTier(0);
    setSelectedAnchorIds([]);
    window.localStorage.setItem(EVALUATION_SESSION_STORAGE_KEY, JSON.stringify(next));
    window.localStorage.removeItem(LEGACY_EVALUATION_SESSION_STORAGE_KEY);
  };

  if (session.done) {
    const solved = EVALUATION_CASTLE_QUESTIONS.length - session.unresolved.length;
    return (
      <section className="page evaluation-page">
        <header className="evaluation-hero evaluation-hero--done">
          <span className="eyebrow">Castelo Mental · 1ª Avaliação IFSP</span>
          <ShieldCheck size={42} />
          <h1>Ciclo encerrado.</h1>
          <p>Você percorreu as seis salas sem ficar preso numa questão. O que ainda falhou ficou separado para revisão consciente.</p>
        </header>
        <div className="evaluation-result">
          <strong>{solved}/{EVALUATION_CASTLE_QUESTIONS.length}</strong>
          <span>salas fechadas no último ciclo</span>
        </div>
        {session.unresolved.length > 0 ? (
          <section className="evaluation-unresolved">
            <AlertTriangle />
            <div>
              <h2>Revisar antes da prova</h2>
              <p>{session.unresolved.map((id) => EVALUATION_CASTLE_QUESTIONS.find((item) => item.id === id)?.title).filter(Boolean).join(' · ')}</p>
            </div>
          </section>
        ) : (
          <section className="evaluation-unresolved is-clear">
            <CheckCircle2 />
            <div><h2>Sem pendências neste ciclo</h2><p>Agora vale percorrer mentalmente as seis salas e reconstruir as justificativas.</p></div>
          </section>
        )}
        <div className="evaluation-actions">
          <button type="button" className="primary-action" onClick={reset}><RotateCcw size={17} /> Recomeçar castelo</button>
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
          <span className="eyebrow">Castelo Mental · 1ª Avaliação</span>
          <h1>Hogwarts da Geometria</h1>
          <p>Uma rota fixa, seis salas, seis famílias da prova. A narrativa ajuda a lembrar; quem prova é a geometria.</p>
        </div>
        <div className="evaluation-clock"><Clock3 size={18} /><span>Rodada {session.round}/{MAX_EVALUATION_ROUNDS}</span></div>
      </header>

      <CastleRouteMap questions={EVALUATION_CASTLE_QUESTIONS} activeQuestionId={question.id} />

      <div className="evaluation-progress" aria-label={`Progresso da rodada: ${progressPercent}%`}>
        <span style={{ width: `${progressPercent}%` }} />
        <strong>{session.index + 1}/{session.queue.length}</strong>
      </div>

      <article className="evaluation-card">
        <header className="evaluation-room-heading">
          <span>{question.room.name}</span>
          <strong>{question.room.mnemonic}</strong>
        </header>

        <div className="evaluation-card__heading">
          <span>{question.subtitle}</span>
          <h2>{question.title}</h2>
          <p>{question.prompt}</p>
        </div>

        <EvaluationCastleFigure
          kind={question.figure.kind}
          anchors={question.figure.anchors}
          selectedAnchorIds={selectedAnchorIds}
          onToggleAnchor={toggleAnchor}
        />

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
                        aria-pressed={selected === value}
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
                  aria-pressed={selected}
                  onClick={() => !feedback && setAnswers({ [question.id]: option.id })}
                  disabled={Boolean(feedback)}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        )}

        <ProofGrimoire steps={question.grimoire} />

        {!feedback && (
          <HintLadder
            hints={question.hints}
            openedTier={openedHintTier}
            onOpenTier={openHint}
          />
        )}

        {feedback && (
          <div className={feedback.correct ? 'evaluation-feedback is-correct' : 'evaluation-feedback is-wrong'}>
            {feedback.correct ? <CheckCircle2 /> : <XCircle />}
            <div>
              <strong>{feedback.correct ? 'Boa. A porta abriu.' : 'Errou, mas o castelo não te prende.'}</strong>
              <p>{feedback.explanation}</p>
            </div>
          </div>
        )}

        <div className="evaluation-footer">
          {!feedback ? (
            <button type="button" className="primary-action" disabled={!canSubmit} onClick={submit}>Corrigir</button>
          ) : (
            <button type="button" className="primary-action" onClick={advance}>
              {session.index >= session.queue.length - 1 ? 'Fechar rodada' : 'Próxima sala'} <ChevronRight size={17} />
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
