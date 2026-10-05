"use client";
import { useEffect } from "react";
import { ArrowRight, Brain, Check, Flame, Target, X } from "lucide-react";
import { questions } from "../content/exercises";
import type { UserProgress } from "../types/geometry";
import { MasteryBar, SectionTitle } from "./RPG";
import { GeometryFigure } from "./GeometryFigure";
import { Math as MathFormula } from "./Math";

type Props = {
  progress: UserProgress;
  onBegin: () => void;
  onAnswer: (id: string, optionId: string) => void;
  onNext: () => void;
};
export function TrainingPage({ progress, onBegin, onAnswer, onNext }: Props) {
  const session = progress.trainingSession;
  useEffect(() => {
    if (!session) onBegin();
  }, [session, onBegin]);
  const entry = session?.queue[session.index];
  const question = questions.find((q) => q.id === entry?.questionId);
  const answer = question && session?.answers[question.id];
  return (
    <div className="page training-page">
      <SectionTitle
        eyebrow="Salão de treino"
        title="Recordar antes de reler"
        description="Responda com base nas hipóteses. Questões novas e revisões orientam sua jornada."
      />
      {!session ? (
        <p role="status">Preparando treino…</p>
      ) : session.completed ? (
        <article className="recall-card" data-testid="training-complete">
          <h2>Sessão concluída</h2>
          <p>
            {Object.values(session.answers).filter((a) => a.correct).length}{" "}
            acertos em {session.queue.length} perguntas. Seu histórico orienta a
            próxima sessão.
          </p>
          <button className="button button--primary" onClick={onBegin}>
            Iniciar nova sessão
          </button>
        </article>
      ) : question && entry ? (
        <div className="training-layout">
          <aside className="training-sidebar">
            <div className="training-sigil">
              <Target />
              <span>
                <small>Série atual</small>
                <strong>
                  {session.index + 1} de {session.queue.length}
                </strong>
              </span>
            </div>
            <MasteryBar
              value={Math.round(
                (Object.keys(session.answers).length / session.queue.length) *
                  100,
              )}
              label="Sessão"
            />
            <p>
              <Flame /> Regra de ouro
            </p>
            <blockquote>
              O desenho auxilia; as marcas e hipóteses justificam.
            </blockquote>
          </aside>
          <article
            className="recall-card"
            data-testid="training-question"
            data-question-id={question.id}
            data-skill-id={question.skillId}
          >
            <div className="recall-card__top">
              <span>
                <Brain /> Active recall
              </span>
              <small>
                {session.index + 1} / {session.queue.length}
              </small>
            </div>
            <div className="question-kind">
              {question.kind
                .replace("true-false", "verdadeiro ou falso")
                .replace("logical-error", "erro lógico")}
            </div>
            <h2>{question.prompt}</h2>
            {question.formula && (
              <MathFormula display>{question.formula}</MathFormula>
            )}
            <GeometryFigure kind={question.figure} labels={question.labels} />
            <div className="options">
              {entry.options.map((option, i) => {
                const state = !answer
                  ? "idle"
                  : option.id ===
                      `${question.id}:option:${question.correctIndex}`
                    ? "correct"
                    : option.id === answer.optionId
                      ? "wrong"
                      : "muted";
                return (
                  <button
                    key={option.id}
                    data-option-id={option.id}
                    className={`option option--${state}`}
                    disabled={!!answer}
                    onClick={() => onAnswer(question.id, option.id)}
                  >
                    <span>{String.fromCharCode(65 + i)}</span>
                    {option.text}
                    {state === "correct" && <Check />}
                    {state === "wrong" && <X />}
                  </button>
                );
              })}
            </div>
            {answer && (
              <>
                <div
                  className={`feedback feedback--${answer.correct ? "correct" : "wrong"}`}
                  role="status"
                >
                  <strong>
                    {answer.correct ? "Passagem válida." : "Revise a hipótese."}
                  </strong>
                  <p>{question.explanation}</p>
                </div>
                <button
                  data-testid="training-next"
                  className="button button--primary button--wide"
                  onClick={onNext}
                >
                  {session.index === session.queue.length - 1
                    ? "Concluir treino"
                    : "Próxima questão"}
                  <ArrowRight />
                </button>
              </>
            )}
            {import.meta.env.DEV && (
              <details className="scheduler-diagnostics">
                <summary>Diagnóstico do treino (dev)</summary>
                <pre>
                  {JSON.stringify(
                    {
                      question: question.id,
                      skill: question.skillId,
                      reason: entry.reason,
                      lastSeen: progress.questions[question.id]?.lastSeen,
                      exposures: progress.questions[question.id]?.exposures,
                      priority: entry.priority,
                    },
                    null,
                    2,
                  )}
                </pre>
              </details>
            )}
          </article>
        </div>
      ) : (
        <p role="alert">
          A questão salva não está disponível nesta versão. Seu progresso foi
          preservado.
        </p>
      )}
    </div>
  );
}
