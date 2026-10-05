"use client";

import {
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  GripVertical,
  Lightbulb,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";
import { useMemo, useState } from "react";
import { validateProofOrder } from "../engine/proof";
import type { Proof, ProofStepKind } from "../types/geometry";
import { Math } from "./Math";
import { RPGDivider, UnlockBanner } from "./RPG";

const kindLabel: Record<ProofStepKind, string> = {
  hypothesis: "Hipótese",
  construction: "Construção",
  "known-result": "Resultado anterior",
  inference: "Inferência",
  conclusion: "Conclusão",
};

type ProofBlockProps = {
  proof: Proof;
  onAttempt: (correct: boolean, withoutHelp?: boolean) => void;
};

export function ProofBlock({ proof, onAttempt }: ProofBlockProps) {
  const [visible, setVisible] = useState(1);
  const [showReasons, setShowReasons] = useState(true);
  const [training, setTraining] = useState(false);
  const [order, setOrder] = useState(() =>
    proof.steps.map((step) => step.id).reverse(),
  );
  const [helpUsed, setHelpUsed] = useState(false);
  const [result, setResult] = useState<"idle" | "correct" | "wrong">("idle");

  const orderedSteps = useMemo(
    () =>
      order
        .map((id) => proof.steps.find((step) => step.id === id)!)
        .filter(Boolean),
    [order, proof.steps],
  );

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= order.length) return;
    setOrder((current) => {
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
    setResult("idle");
  }

  function checkOrder() {
    if (result !== "idle") return;
    const correct = validateProofOrder(proof, order);
    setResult(correct ? "correct" : "wrong");
    onAttempt(correct, correct && !helpUsed);
  }

  if (training) {
    return (
      <article className="proof proof--training">
        <div className="proof__topline">
          <span>Modo prova</span>
          <button
            className="icon-button"
            onClick={() => setTraining(false)}
            aria-label="Sair do modo prova"
          >
            <Eye size={19} />
          </button>
        </div>
        <h2>{proof.title}</h2>
        <p className="proof__statement">
          Ordene os passos até formar uma cadeia lógica. Use os botões; eles
          funcionam também no teclado e no celular.
        </p>
        <ol className="proof-order">
          {orderedSteps.map((step, index) => (
            <li key={step.id} data-step-id={step.id}>
              <GripVertical aria-hidden="true" />
              <div>
                <small>{step.label}</small>
                {step.formula ? (
                  <Math display>{step.formula}</Math>
                ) : (
                  <p>{step.explanation}</p>
                )}
              </div>
              <span className="proof-order__actions">
                <button
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                  aria-label={`Mover ${step.label} para cima`}
                >
                  <ChevronUp />
                </button>
                <button
                  onClick={() => move(index, 1)}
                  disabled={index === order.length - 1}
                  aria-label={`Mover ${step.label} para baixo`}
                >
                  <ChevronDown />
                </button>
              </span>
            </li>
          ))}
        </ol>
        {result !== "idle" && (
          <div className={`feedback feedback--${result}`} role="status">
            {result === "correct"
              ? "Demonstração reconstruída. A cadeia é válida."
              : "Ainda há uma passagem fora de ordem. Procure hipótese → justificativa → conclusão."}
          </div>
        )}
        <div className="button-row">
          <button
            className="button button--primary"
            onClick={checkOrder}
            disabled={result !== "idle"}
          >
            Verificar prova
          </button>
          <button
            className="button button--ghost"
            onClick={() => {
              setOrder(proof.steps.map((s) => s.id).reverse());
              setResult("idle");
            }}
          >
            <RotateCcw size={17} />
            Recomeçar
          </button>
        </div>
      </article>
    );
  }

  return (
    <article className="proof">
      <div className="proof__topline">
        <span>
          {proof.badge === "theorem"
            ? "Teorema"
            : proof.badge === "corollary"
              ? "Corolário"
              : "Proposição"}
        </span>
        {proof.complementary && <em>Demonstração complementar clássica</em>}
      </div>
      <h2>{proof.title}</h2>
      <p className="proof__statement">{proof.statement}</p>
      {proof.formula && <Math display>{proof.formula}</Math>}
      <RPGDivider />
      <div className="proof__controls">
        <button
          className="button button--ghost"
          onClick={() => {
            setHelpUsed(true);
            setVisible(visible === proof.steps.length ? 0 : proof.steps.length);
          }}
        >
          {visible === proof.steps.length ? (
            <EyeOff size={17} />
          ) : (
            <Eye size={17} />
          )}
          {visible === proof.steps.length ? "Ocultar prova" : "Mostrar tudo"}
        </button>
        <button
          className="button button--ghost"
          onClick={() => setShowReasons((value) => !value)}
        >
          <Lightbulb size={17} />
          {showReasons ? "Ocultar justificativas" : "Exibir justificativas"}
        </button>
        <button
          className="button button--secondary"
          onClick={() => setTraining(true)}
        >
          <ShieldCheck size={17} />
          Treinar prova
        </button>
      </div>
      <ol className="proof-path">
        {proof.steps.slice(0, visible).map((step, index) => (
          <li
            className={`proof-step proof-step--${step.kind}`}
            key={step.id}
            data-step-id={step.id}
          >
            <span className="proof-step__number">{index + 1}</span>
            <div>
              <small>
                {kindLabel[step.kind]} · {step.label}
              </small>
              {step.formula && <Math display>{step.formula}</Math>}
              {showReasons && <p>{step.explanation}</p>}
            </div>
          </li>
        ))}
      </ol>
      {visible < proof.steps.length ? (
        <button
          className="button button--reveal"
          onClick={() => {
            setHelpUsed(true);
            setVisible((value) => value + 1);
          }}
        >
          Qual é o próximo passo?
          <ChevronDown size={17} />
        </button>
      ) : (
        <UnlockBanner
          title={proof.steps.at(-1)?.label ?? "Resultado"}
          type="Resultado demonstrado"
        />
      )}
    </article>
  );
}
