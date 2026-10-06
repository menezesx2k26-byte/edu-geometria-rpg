"use client";

import {
  ArrowRight,
  BookOpen,
  Brain,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  Clock3,
  Crown,
  Footprints,
  Home,
  LockKeyhole,
  Map,
  RotateCcw,
  ScrollText,
  Shield,
  Sparkles,
  Swords,
  X,
  Zap,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { exercises } from "../content/exercises";
import {
  getLesson,
  getSkill,
  lessons,
  reviewCards,
  skills,
} from "../content/geometry";
import { proofs } from "../content/proofs";
import { useProgress } from "../hooks/useProgress";
import { getAsset } from "../lib/assets";
import type { AppView, Exercise, Skill } from "../types/geometry";
import { TrainingPage } from "./TrainingPage";
import { EvaluationTrainingPage } from './EvaluationTrainingPage';
import { GeometryFigure } from "./GeometryFigure";
import { shuffleOptions } from "../engine/training";
import { skillAvailable } from "../engine/progress";
import { LessonCard } from "./LessonCards";
import { Math as MathFormula } from "./Math";
import { ProofBlock } from "./ProofBlock";
import {
  Checkpoint,
  MasteryBar,
  SectionTitle,
  SkillBadge,
  UnlockBanner,
} from "./RPG";

const navItems: { id: AppView; label: string; icon: typeof Home }[] = [
  { id: "map", label: "Mapa", icon: Map },
  { id: "lesson", label: "Aula", icon: BookOpen },
  { id: "training", label: "Treino", icon: Brain },
  { id: "proofs", label: "Provas", icon: ScrollText },
  { id: "exercises", label: "Exercícios", icon: Swords },
  { id: "review", label: "Revisão", icon: Zap },
];

function skillState(
  skill: Skill,
  mastery: Record<string, number>,
  studiedSkills: string[],
) {
  const value = mastery[skill.id] ?? 0;
  const locked = skill.prerequisites.some(
    (id) => (mastery[id] ?? 0) < 20 && !studiedSkills.includes(id),
  );
  if (locked) return "locked" as const;
  if (value >= 80) return "mastered" as const;
  if (value >= 20 || studiedSkills.includes(skill.id))
    return "studied" as const;
  return "available" as const;
}

function RPGHeader({ overall, onMap }: { overall: number; onMap: () => void }) {
  return (
    <header className="app-header">
      <button
        className="brand"
        onClick={onMap}
        aria-label="Ir para o mapa de conhecimento"
      >
        <span className="brand__sigil">△</span>
        <span>
          <strong>GEOMETRIA RPG</strong>
          <small>Academia Euclidiana</small>
        </span>
      </button>
      <div className="header-mastery">
        <span>Domínio geral</span>
        <strong>{overall}%</strong>
      </div>
    </header>
  );
}

function BottomNav({
  ready,
  view,
  onChange,
}: {
  ready: boolean;
  view: AppView;
  onChange: (view: AppView) => void;
}) {
  return (
    <nav className="bottom-nav" aria-label="Navegação principal">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            disabled={!ready}
            className={view === item.id || (view === 'avaliacao-ifsp' && item.id === 'training') ? "is-active" : ""}
            onClick={() => onChange(item.id)}
            aria-current={view === item.id ? "page" : undefined}
          >
            <Icon aria-hidden="true" />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

type HomePageProps = {
  onEvaluation: () => void;
  studiedSkills: string[];
  mastery: Record<string, number>;
  overall: number;
  lastSection: string;
  onOpenSkill: (skill: Skill) => void;
  onContinue: () => void;
};

function HomePage({
  onEvaluation,
  mastery,
  studiedSkills,
  overall,
  lastSection,
  onOpenSkill,
  onContinue,
}: HomePageProps) {
  const studied = skills.filter(
    (skill) => (mastery[skill.id] ?? 0) >= 20,
  ).length;
  const next =
    skills.find(
      (skill) => skillState(skill, mastery, studiedSkills) === "available",
    ) ??
    skills.find((skill) => (mastery[skill.id] ?? 0) < 80) ??
    skills.at(-1)!;
  const last =
    lessons.find((lesson) => lesson.id === lastSection) ?? lessons[0];

  return (
    <div className="page home-page">
      <a href="#avaliacao-ifsp" className="evaluation-entry" onClick={(event)=>{ event.preventDefault(); onEvaluation(); }}><span><small>1ª Avaliação · IFSP</small><strong>Treino da avaliação — trilha única</strong></span><ArrowRight/></a>
      <section className="hero">
        <div className="hero__runes" aria-hidden="true">
          △ ◇ ∠ ≅ ⟂ △
        </div>
        <div className="hero__copy">
          <p className="eyebrow">
            <Sparkles size={14} /> Sistema de aprendizagem interativo
          </p>
          <h1>
            Construa a teoria.
            <br />
            <span>Prove os resultados.</span>
            <br />
            Domine a geometria.
          </h1>
          <p>
            Uma jornada rigorosa por congruência, demonstrações e geometria
            euclidiana — organizada como uma árvore de habilidades.
          </p>
          <button className="button button--hero" onClick={onContinue}>
            Continuar jornada <ArrowRight />
          </button>
        </div>
        <div className="hero__emblem">
          <SkillBadge asset="lal" title="LAL" type="postulate" size="large" />
          <span className="hero__orbit hero__orbit--one" aria-hidden="true">
            ∠
          </span>
          <span className="hero__orbit hero__orbit--two" aria-hidden="true">
            ≅
          </span>
        </div>
      </section>

      <section className="journey-status" aria-label="Resumo da jornada">
        <div className="status-primary">
          <span className="status-primary__icon">
            <Crown />
          </span>
          <div>
            <small>Nível atual</small>
            <strong>
              {studied < 4
                ? "Aprendiz dos Fundamentos"
                : studied < 8
                  ? "Guardião da Congruência"
                  : "Mestre das Demonstrações"}
            </strong>
          </div>
        </div>
        <div>
          <small>Domínio geral</small>
          <strong>{overall}%</strong>
          <MasteryBar value={overall} label="Progresso" />
        </div>
        <div>
          <small>Última habilidade</small>
          <strong>{last.title}</strong>
          <span>{last.estimatedMinutes} min · retomada rápida</span>
        </div>
        <div>
          <small>Próximo desbloqueio</small>
          <strong>{next.shortTitle}</strong>
          <span>{next.description}</span>
        </div>
      </section>

      <section className="map-section">
        <SectionTitle
          eyebrow="Mapa do conhecimento"
          title="A teoria tem uma ordem"
          description="Cada resultado depende do que já foi construído. Estude um nó para liberar os próximos caminhos."
        />
        <div className="skill-tree">
          {skills.map((skill, index) => {
            const state = skillState(skill, mastery, studiedSkills);
            const value = mastery[skill.id] ?? 0;
            const prerequisites = skill.prerequisites
              .map((id) => getSkill(id).shortTitle)
              .join(" · ");
            return (
              <div
                className={`skill-node-wrap skill-node-wrap--${index % 2 ? "right" : "left"}`}
                key={skill.id}
              >
                <button
                  className={`skill-node skill-node--${state}`}
                  disabled={state === "locked"}
                  onClick={() => onOpenSkill(skill)}
                >
                  <SkillBadge
                    asset={skill.asset}
                    title={skill.title}
                    type={skill.type}
                    locked={state === "locked"}
                    size="small"
                  />
                  <span className="skill-node__body">
                    <span className="skill-node__meta">
                      <em>
                        {skill.type === "definition"
                          ? "Definição"
                          : skill.type === "postulate"
                            ? "Postulado"
                            : skill.type === "theorem"
                              ? "Teorema"
                              : "Corolário"}
                      </em>
                      <i className={`state-pill state-pill--${state}`}>
                        {state === "locked" ? (
                          <LockKeyhole />
                        ) : state === "mastered" ? (
                          <Crown />
                        ) : state === "studied" ? (
                          <Check />
                        ) : (
                          <Sparkles />
                        )}
                        {state === "locked"
                          ? "Bloqueado"
                          : state === "mastered"
                            ? "Dominado"
                            : state === "studied"
                              ? "Estudado"
                              : "Disponível"}
                      </i>
                    </span>
                    <strong>{skill.title}</strong>
                    <span>{skill.description}</span>
                    <MasteryBar value={value} />
                    {prerequisites && (
                      <small>Pré-requisitos: {prerequisites}</small>
                    )}
                  </span>
                  <ChevronRight
                    className="skill-node__arrow"
                    aria-hidden="true"
                  />
                </button>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function LessonPage({
  selectedSkillId,
  mastery,
  studiedSkills,
  onSelect,
  onStudy,
  onNext,
}: {
  selectedSkillId: string;
  mastery: Record<string, number>;
  studiedSkills: string[];
  onSelect: (skill: Skill) => void;
  onStudy: (sectionId: string, skillId: string) => void;
  onNext: () => void;
}) {
  const skill = getSkill(selectedSkillId);
  const lesson = getLesson(skill.lessonId);
  const availableSkills = skills.filter(
    (item) => skillState(item, mastery, studiedSkills) !== "locked",
  );
  const complete = studiedSkills.includes(skill.id);

  return (
    <div className="page lesson-page">
      <div
        className="chapter-tabs"
        role="navigation"
        aria-label="Capítulos disponíveis"
      >
        {availableSkills.map((item) => (
          <button
            key={item.id}
            className={item.id === skill.id ? "is-active" : ""}
            onClick={() => onSelect(item)}
          >
            {item.shortTitle}
          </button>
        ))}
      </div>
      <section className="lesson-hero">
        <div>
          <p className="eyebrow">{lesson.eyebrow}</p>
          <h1>{lesson.title}</h1>
          <p>{lesson.summary}</p>
          <span>
            <Clock3 /> {lesson.estimatedMinutes} min de estudo
          </span>
        </div>
        <SkillBadge
          asset={skill.asset}
          title={skill.title}
          type={skill.type}
          size="medium"
        />
      </section>
      <div className="lesson-flow">
        {lesson.blocks.map((block) => (
          <LessonCard key={block.id} block={block} />
        ))}
      </div>
      <Checkpoint
        complete={complete}
        onComplete={() => onStudy(lesson.id, skill.id)}
      >
        <h2>Consolide este capítulo</h2>
        <p>
          Marcar a seção registra o estudo e libera a leitura das dependências
          seguintes. O domínio aumenta ao resolver questões e provas.
        </p>
      </Checkpoint>
      <button className="button button--continue" onClick={onNext}>
        Continuar para o treino <ArrowRight />
      </button>
    </div>
  );
}

function ProofsPage({
  onRecord,
}: {
  onRecord: (
    proofId: string,
    skillId: string,
    correct: boolean,
    withoutHelp?: boolean,
  ) => void;
}) {
  const [selected, setSelected] = useState(proofs[0].id);
  const proof = proofs.find((item) => item.id === selected)!;
  return (
    <div className="page proofs-page">
      <SectionTitle
        eyebrow="Caderno de demonstrações"
        title="Uma conclusão por vez"
        description="Revele a cadeia lógica, oculte justificativas ou reconstrua a prova sem ajuda."
      />
      <div className="proof-selector">
        {proofs.map((item) => (
          <button
            key={item.id}
            className={item.id === selected ? "is-active" : ""}
            onClick={() => setSelected(item.id)}
          >
            <Shield />{" "}
            <span>
              <small>
                {item.badge === "theorem" ? "Teorema" : "Proposição"}
              </small>
              {item.title}
            </span>
          </button>
        ))}
      </div>
      <ProofBlock
        key={proof.id}
        proof={proof}
        onAttempt={(correct, withoutHelp) =>
          onRecord(proof.id, proof.skillId, correct, withoutHelp)
        }
      />
    </div>
  );
}

function QuestRunner({
  exercise,
  onRecord,
}: {
  exercise: Exercise;
  onRecord: (questionId: string, skillId: string, correct: boolean) => void;
}) {
  const [stepIndex, setStepIndex] = useState(0);
  const [choice, setChoice] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);
  const [optionSeed] = useState(() => Date.now());
  const step = exercise.steps[stepIndex];
  const options = useMemo(
    () =>
      shuffleOptions(
        { ...step, skillId: exercise.skillId, kind: "hypothesis" },
        optionSeed,
      ),
    [step, exercise.skillId, optionSeed],
  );
  const correct = choice === `${step?.id}:option:${step?.correctIndex}`;

  function answer(optionId: string) {
    if (choice !== null || !step) return;
    setChoice(optionId);
    onRecord(
      `${exercise.id}:${step.id}`,
      exercise.skillId,
      optionId === `${step.id}:option:${step.correctIndex}`,
    );
  }

  function advance() {
    if (stepIndex === exercise.steps.length - 1) setFinished(true);
    else setStepIndex((value) => value + 1);
    setChoice(null);
  }

  function restart() {
    setStepIndex(0);
    setChoice(null);
    setFinished(false);
  }

  return (
    <article
      className={`quest-runner quest-runner--${exercise.difficulty === "Boss Proof" ? "boss" : "quest"}`}
    >
      <div className="quest-runner__banner">
        <Image
          src={getAsset(
            exercise.difficulty === "Boss Proof" ? "boss" : "quest",
          )!}
          width={exercise.difficulty === "Boss Proof" ? 410 : 776}
          height={exercise.difficulty === "Boss Proof" ? 294 : 305}
          alt={exercise.difficulty}
        />
        <div>
          <p className="eyebrow">{exercise.subtitle}</p>
          <h2>{exercise.title}</h2>
          <p>{exercise.introduction}</p>
        </div>
      </div>
      <GeometryFigure kind={exercise.figure} />
      <div
        className="quest-progress"
        aria-label={`${stepIndex + 1} de ${exercise.steps.length} etapas`}
      >
        <span
          style={{
            width: `${finished ? 100 : ((stepIndex + 1) / exercise.steps.length) * 100}%`,
          }}
        />
      </div>
      {finished ? (
        <div className="quest-complete">
          <UnlockBanner title="Quest concluída" />
          <h3>Resposta final</h3>
          <p>{exercise.finalAnswer}</p>
          <button className="button button--ghost" onClick={restart}>
            <RotateCcw /> Resolver novamente
          </button>
        </div>
      ) : (
        <div className="quest-step">
          <p className="question-kind">
            Etapa {stepIndex + 1} · não revele antes de tentar
          </p>
          <h3>{step.prompt}</h3>
          {step.formula && <MathFormula display>{step.formula}</MathFormula>}
          <div className="options options--compact">
            {options.map((option, index) => {
              const state =
                choice === null
                  ? "idle"
                  : option.id === `${step.id}:option:${step.correctIndex}`
                    ? "correct"
                    : option.id === choice
                      ? "wrong"
                      : "muted";
              return (
                <button
                  key={option.id}
                  data-option-id={option.id}
                  className={`option option--${state}`}
                  onClick={() => answer(option.id)}
                  disabled={choice !== null}
                >
                  <span>{String.fromCharCode(65 + index)}</span>
                  {option.text}
                  {state === "correct" && <Check />}
                  {state === "wrong" && <X />}
                </button>
              );
            })}
          </div>
          {choice !== null && (
            <div
              className={`feedback feedback--${correct ? "correct" : "wrong"}`}
            >
              <strong>
                {correct
                  ? "Etapa validada."
                  : "A justificativa ainda não fecha."}
              </strong>
              <p>{step.explanation}</p>
            </div>
          )}
          {choice !== null && (
            <button
              className="button button--primary button--wide"
              onClick={advance}
            >
              {stepIndex === exercise.steps.length - 1
                ? "Concluir Quest"
                : "Liberar próxima etapa"}
              <ArrowRight />
            </button>
          )}
        </div>
      )}
    </article>
  );
}

const commonErrors = [
  [
    "Segmento ≠ medida",
    "Use a barra para o objeto e AB ou m(‾AB) para a medida.",
  ],
  ["Ordem trocada", "Em △ABC ≅ △DEF, A ↔ D, B ↔ E e C ↔ F."],
  [
    "LAL sem ângulo compreendido",
    "O ângulo precisa estar entre os dois lados conhecidos.",
  ],
  ["Mediana sempre perpendicular", "Mediana garante ponto médio, não 90°."],
  [
    "Bissetriz divide o lado ao meio",
    "Bissetriz garante ângulos iguais, não segmentos iguais.",
  ],
  [
    "Altura sempre interna",
    "No obtusângulo, alturas podem encontrar a reta suporte fora do lado.",
  ],
  [
    "Congruência = semelhança",
    "Congruência preserva também o tamanho; semelhança pode escalar.",
  ],
  ["Parece, então é", "O desenho auxilia; as marcas e hipóteses justificam."],
];

function ExercisesPage({
  onRecord,
}: {
  onRecord: (questionId: string, skillId: string, correct: boolean) => void;
}) {
  const [selected, setSelected] = useState(exercises[0].id);
  const exercise = exercises.find((item) => item.id === selected)!;
  return (
    <div className="page exercises-page">
      <SectionTitle
        eyebrow="Quadro de missões"
        title="Exercícios da lousa"
        description="A solução é construída em etapas: reconheça a geometria, só depois resolva as equações."
      />
      <div className="exercise-tabs">
        {exercises.map((item) => (
          <button
            key={item.id}
            className={selected === item.id ? "is-active" : ""}
            onClick={() => setSelected(item.id)}
          >
            <Swords />
            {item.title}
            <small>{item.difficulty}</small>
          </button>
        ))}
      </div>
      <QuestRunner key={exercise.id} exercise={exercise} onRecord={onRecord} />
      <section className="common-errors">
        <div className="common-errors__intro">
          <CircleAlert />
          <p className="eyebrow">Bestiário de enganos</p>
          <h2>Erros comuns</h2>
          <p>
            Reconhecer uma inferência inválida é parte do domínio matemático.
          </p>
        </div>
        <div className="error-grid">
          {commonErrors.map(([title, text], index) => (
            <article key={title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function ReviewPage({
  progress,
  onRate,
}: {
  progress: import("../types/geometry").UserProgress;
  onRate: (skillId: string, rating: "know" | "unsure" | "wrong") => void;
}) {
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const touchStart = useRef<number | null>(null);
  const [reviewQueue] = useState(() =>
    [...reviewCards].sort(
      (a, b) =>
        (progress.review[a.skillId]?.dueAt ?? 0) -
        (progress.review[b.skillId]?.dueAt ?? 0),
    ),
  );
  const card = reviewQueue[index];

  function go(delta: number) {
    setIndex(
      (current) => (current + delta + reviewCards.length) % reviewCards.length,
    );
    setRevealed(false);
  }
  function rate(value: "know" | "unsure" | "wrong") {
    onRate(card.skillId, value);
    go(1);
  }

  return (
    <div className="page review-page">
      <SectionTitle
        eyebrow="Revisão rápida"
        title="Um conceito por tela"
        description="Ideal para o celular: tente responder, revele e classifique sua lembrança com honestidade."
      />
      <div className="review-shell">
        <div className="review-progress">
          <span>
            {index + 1} / {reviewCards.length}
          </span>
          <div>
            <i
              style={{ width: `${((index + 1) / reviewCards.length) * 100}%` }}
            />
          </div>
        </div>
        <article
          className="review-card"
          onTouchStart={(event) => {
            touchStart.current = event.touches[0].clientX;
          }}
          onTouchEnd={(event) => {
            if (touchStart.current === null) return;
            const delta = event.changedTouches[0].clientX - touchStart.current;
            if (Math.abs(delta) > 60) go(delta > 0 ? -1 : 1);
            touchStart.current = null;
          }}
        >
          <div className="review-card__ornament" aria-hidden="true">
            ◇
          </div>
          <p className="eyebrow">Conceito</p>
          <h2>{card.concept}</h2>
          <p className="review-card__definition">{card.definition}</p>
          <MathFormula display>{card.formula}</MathFormula>
          <aside>
            <CircleAlert />
            <span>
              <small>Erro comum</small>
              {card.commonError}
            </span>
          </aside>
          <div className="mini-question">
            <small>Mini questão</small>
            <strong>{card.question}</strong>
            {revealed ? (
              <p>{card.answer}</p>
            ) : (
              <button
                className="button button--ghost"
                onClick={() => setRevealed(true)}
              >
                Revelar resposta
              </button>
            )}
          </div>
        </article>
        <div className="review-arrows">
          <button onClick={() => go(-1)} aria-label="Cartão anterior">
            <ChevronLeft />
          </button>
          <span>deslize ou use as setas</span>
          <button onClick={() => go(1)} aria-label="Próximo cartão">
            <ChevronRight />
          </button>
        </div>
        <div className="rating-buttons">
          <button
            className="rating rating--know"
            disabled={!revealed}
            onClick={() => rate("know")}
          >
            <Check />
            Sei
          </button>
          <button
            className="rating rating--unsure"
            disabled={!revealed}
            onClick={() => rate("unsure")}
          >
            <Footprints />
            Mais ou menos
          </button>
          <button
            className="rating rating--wrong"
            disabled={!revealed}
            onClick={() => rate("wrong")}
          >
            <X />
            Errei
          </button>
        </div>
      </div>
    </div>
  );
}

export default function GeometryApp() {
  const controller = useProgress();
  const {
    progress,
    ready,
    storageError,
    overallMastery,
    studySection,
    recordQuestion,
    recordProof,
    reviewSkill,
    beginTraining,
    answerTraining,
    advanceTraining,
  } = controller;
  const [view, setView] = useState<AppView>("map");
  const lastSkillId = useMemo(
    () =>
      lessons.find((lesson) => lesson.id === progress.lastSection)?.skillId ??
      "fundamentals",
    [progress.lastSection],
  );
  const [selectedSkillId, setSelectedSkillId] = useState("fundamentals");
  const scrollPositions = useRef<Record<string, number>>({});
  useEffect(() => {
    if (!ready) return;
    const readRoute = (restoreScroll = false) => {
      const [area, query] = window.location.hash.slice(1).split("?");
      const next = area === 'avaliacao-ifsp' ? 'avaliacao-ifsp' : navItems.find((item) => item.id === area)?.id ?? "map";
      const skill = new URLSearchParams(query).get("skill");
      if (skill && skillAvailable(skill, progress)) setSelectedSkillId(skill);
      setView(next);
      if (restoreScroll)
        requestAnimationFrame(() =>
          window.scrollTo(0, scrollPositions.current[next] ?? 0),
        );
    };
    readRoute();
    const onHashChange = () => readRoute(true);
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, [ready, progress]);
  function changeView(next: AppView, skillId = selectedSkillId) {
    scrollPositions.current[view] = window.scrollY;
    setView(next);
    window.location.hash = next === "lesson" ? `lesson?skill=${skillId}` : next;
    window.scrollTo({ top: scrollPositions.current[next] ?? 0 });
  }
  function openSkill(skill: Skill) {
    setSelectedSkillId(skill.id);
    changeView("lesson", skill.id);
  }
  const content =
    view === "map" ? (
      <HomePage
        onEvaluation={() => changeView('avaliacao-ifsp')}
        mastery={progress.mastery}
        studiedSkills={progress.studiedSkills}
        overall={overallMastery}
        lastSection={progress.lastSection}
        onOpenSkill={openSkill}
        onContinue={() => {
          setSelectedSkillId(lastSkillId);
          changeView("lesson", lastSkillId);
        }}
      />
    ) : view === 'avaliacao-ifsp' ? (
      <EvaluationTrainingPage controller={controller} onMap={()=>changeView('map')}/>
    ) : view === "lesson" ? (
      <LessonPage
        selectedSkillId={selectedSkillId}
        mastery={progress.mastery}
        studiedSkills={progress.studiedSkills}
        onSelect={openSkill}
        onStudy={studySection}
        onNext={() => changeView("training")}
      />
    ) : view === "training" ? (
      <TrainingPage
        progress={progress}
        onBegin={beginTraining}
        onAnswer={answerTraining}
        onNext={advanceTraining}
      />
    ) : view === "proofs" ? (
      <ProofsPage onRecord={recordProof} />
    ) : view === "exercises" ? (
      <ExercisesPage onRecord={recordQuestion} />
    ) : (
      <ReviewPage progress={progress} onRate={reviewSkill} />
    );
  return (
    <div className="app-shell" data-progress-ready={ready}>
      <RPGHeader overall={overallMastery} onMap={() => changeView("map")} />
      {storageError && (
        <p className="storage-warning" role="alert">
          {storageError}
        </p>
      )}
      <main id="main-content" inert={!ready} aria-busy={!ready}>
        {content}
      </main>
      <BottomNav
        ready={ready}
        view={view}
        onChange={(next) => changeView(next)}
      />
    </div>
  );
}
