"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { UserProgress } from "../types/geometry";
import { skills } from "../content/geometry";
import {
  initialProgress,
  migrateProgress,
  recordAnswer,
  recordProofAttempt,
  studyProgress,
  rateReview,
} from "../engine/progress";
import {
  answerSession,
  advanceSession,
  startSession,
} from "../engine/training";
import { questions } from "../content/exercises";
import type { EvaluationSession } from '../types/evaluation';
import { recordEvaluationResponse } from '../engine/evaluation';

export const STORAGE_KEY = "geometria-rpg-progress-v2";
const LEGACY_KEY = "geometria-rpg-progress-v1";
export function useProgress() {
  const [progress, setProgress] = useState<UserProgress>(initialProgress);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState("");
  const current = useRef(initialProgress);
  const writable = useRef(false);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      let next = initialProgress;
      let canSave = true;
      try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        const legacy = window.localStorage.getItem(LEGACY_KEY);
        try {
          if (stored || legacy) {
            const parsed = JSON.parse((stored ?? legacy)!);
            if (
              parsed &&
              typeof parsed === "object" &&
              Number(parsed.schemaVersion) > 2
            ) {
              canSave = false;
              throw new Error("Future schema");
            }
            next = migrateProgress(parsed);
          }
        } catch {
          // Keep the old key intact. Back up malformed v2 before permitting a fresh save.
          if (stored)
            window.localStorage.setItem(
              `${STORAGE_KEY}-backup-${Date.now()}`,
              stored,
            );
          if (canSave && (stored || legacy)) {
            try {
              const parsed = JSON.parse((stored ?? legacy)!);
              if (
                parsed &&
                typeof parsed === "object" &&
                !Array.isArray(parsed)
              ) {
                // An invalid queue must not discard otherwise compatible learning evidence.
                next = migrateProgress({ ...parsed, trainingSession: null, evaluationSession: undefined });
              }
            } catch {
              /* The original data remains in the backup or legacy key. */
            }
          }
          setStorageError(
            canSave
              ? "Não foi possível ler o progresso salvo. O conteúdo original foi preservado para recuperação."
              : "O progresso pertence a uma versão mais recente. O registro foi preservado; esta aba não substituirá seus dados.",
          );
        }
        writable.current = canSave;
      } catch {
        setStorageError(
          "O armazenamento está indisponível. Seu treino funciona nesta aba, mas pode não ser salvo.",
        );
      }
      current.current = next;
      setProgress(next);
      setReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  const update = useCallback((transform: (p: UserProgress) => UserProgress) => {
    const next = transform(current.current);
    if (next === current.current) return;
    current.current = next;
    setProgress(next);
    if (writable.current) {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        setStorageError(
          "Não foi possível salvar. Mantenha esta aba aberta para preservar a sessão atual.",
        );
      }
    }
  }, []);
  const studySection = useCallback(
    (section: string, skill: string) =>
      update((p) => studyProgress(p, section, skill, Date.now())),
    [update],
  );
  const saveEvaluationSession = useCallback((session: EvaluationSession) =>
    update(p => ({ ...p, evaluationSession: session })), [update]);
  const submitEvaluationResponse = useCallback((response: string[]) =>
    update(p => recordEvaluationResponse(p, response, Date.now())), [update]);
  const recordQuestion = useCallback(
    (id: string, skill: string, correct: boolean) =>
      update((p) => recordAnswer(p, id, skill, correct, Date.now())),
    [update],
  );
  const recordProof = useCallback(
    (id: string, skill: string, correct: boolean, withoutHelp = false) =>
      update((p) =>
        recordProofAttempt(p, id, skill, correct, withoutHelp, Date.now()),
      ),
    [update],
  );
  const reviewSkill = useCallback(
    (skill: string, rating: "know" | "unsure" | "wrong") =>
      update((p) => rateReview(p, skill, rating, Date.now())),
    [update],
  );
  const beginTraining = useCallback(
    () => update((p) => startSession(p, questions, Date.now())),
    [update],
  );
  const answerTraining = useCallback(
    (id: string, optionId: string) =>
      update((p) => answerSession(p, questions, id, optionId, Date.now())),
    [update],
  );
  const advanceTraining = useCallback(
    () => update((p) => advanceSession(p, Date.now())),
    [update],
  );
  const overallMastery = useMemo(
    () =>
      Math.round(
        skills.reduce((sum, s) => sum + (progress.mastery[s.id] ?? 0), 0) /
          skills.length,
      ),
    [progress.mastery],
  );
  return {
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
    saveEvaluationSession,
    submitEvaluationResponse,
  };
}
