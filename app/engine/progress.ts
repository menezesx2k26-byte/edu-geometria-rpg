import type { QuestionRecord, UserProgress } from "../types/geometry";
import { lessons, skills } from "../content/geometry.ts";

export const initialProgress: UserProgress = {
  schemaVersion: 2,
  mastery: {},
  studiedSections: [],
  studiedSkills: [],
  questions: {},
  proofAttempts: {},
  review: {},
  trainingSession: null,
  sessionCount: 0,
  lastSection: "fundamentals",
  updatedAt: new Date(0).toISOString(),
};
export const clamp = (n: number) => Math.max(0, Math.min(100, n));
export const emptyRecord = (): QuestionRecord => ({
  attempts: 0,
  correct: 0,
  errors: 0,
  exposures: 0,
  intervalDays: 0,
  lastSeen: null,
  lastResult: null,
  dueAt: null,
});
const object = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === "object" && !Array.isArray(v);
const count = (v: unknown) =>
  typeof v === "number" && Number.isFinite(v) ? Math.max(0, Math.floor(v)) : 0;
const time = (v: unknown) =>
  typeof v === "number" && Number.isFinite(v) && v >= 0 ? v : null;
export function migrateProgress(raw: unknown): UserProgress {
  if (!object(raw)) throw new Error("Formato de progresso inválido");
  if (
    raw.schemaVersion !== undefined &&
    raw.schemaVersion !== 1 &&
    raw.schemaVersion !== 2
  )
    throw new Error("Versão de progresso não suportada");
  for (const key of ["mastery", "questions", "proofAttempts", "review"])
    if (raw[key] !== undefined && !object(raw[key]))
      throw new Error(`Campo inválido: ${key}`);
  for (const key of ["studiedSections", "studiedSkills"])
    if (
      raw[key] !== undefined &&
      (!Array.isArray(raw[key]) ||
        !(raw[key] as unknown[]).every((v) => typeof v === "string"))
    )
      throw new Error(`Campo inválido: ${key}`);
  const records = (value: unknown) =>
    Object.fromEntries(
      Object.entries(object(value) ? value : {}).map(([id, record]) => {
        if (!object(record)) throw new Error(`Registro inválido: ${id}`);
        const attempts = count(record.attempts),
          correct = Math.min(attempts, count(record.correct));
        return [
          id,
          {
            ...record,
            attempts,
            correct,
            exposures: Math.max(attempts, count(record.exposures)),
            intervalDays: Math.min(30, count(record.intervalDays)),
            errors: attempts - correct,
            lastSeen: time(record.lastSeen),
            lastResult:
              typeof record.lastResult === "boolean" ? record.lastResult : null,
            dueAt: time(record.dueAt),
          },
        ];
      }),
    );
  const studiedSections = (raw.studiedSections ?? []) as string[];
  const studiedSkills = (raw.studiedSkills ??
    lessons
      .filter((l) => studiedSections.includes(l.id))
      .map((l) => l.skillId)) as string[];
  const result: UserProgress = {
    ...initialProgress,
    ...raw,
    schemaVersion: 2,
    studiedSections,
    studiedSkills,
    mastery: Object.fromEntries(
      Object.entries(object(raw.mastery) ? raw.mastery : {}).map(([id, v]) => [
        id,
        clamp(typeof v === "number" && Number.isFinite(v) ? v : 0),
      ]),
    ),
    questions: records(raw.questions),
    proofAttempts: records(raw.proofAttempts),
    review: {},
    trainingSession: null,
    sessionCount: count(raw.sessionCount),
    lastSection:
      typeof raw.lastSection === "string" ? raw.lastSection : "fundamentals",
    updatedAt:
      typeof raw.updatedAt === "string"
        ? raw.updatedAt
        : initialProgress.updatedAt,
  };
  if (object(raw.review))
    for (const [id, r] of Object.entries(raw.review)) {
      if (
        !object(r) ||
        !["know", "unsure", "wrong"].includes(String(r.confidence)) ||
        time(r.dueAt) === null ||
        time(r.lastReviewed) === null
      )
        throw new Error("Revisão inválida");
      result.review[id] = r as UserProgress["review"][string];
    }
  if (raw.trainingSession != null) {
    const s = raw.trainingSession;
    if (
      !object(s) ||
      typeof s.id !== "string" ||
      !Number.isInteger(s.index) ||
      !Array.isArray(s.queue) ||
      !object(s.answers) ||
      typeof s.completed !== "boolean" ||
      time(s.createdAt) === null ||
      !Number.isInteger(s.seed)
    )
      throw new Error("Sessão inválida");
    if (
      (s.index as number) < 0 ||
      (s.index as number) > s.queue.length ||
      new Set(s.queue.map((e) => e.questionId)).size !== s.queue.length
    )
      throw new Error("Fila inválida");
    if (s.completed !== ((s.index as number) === s.queue.length))
      throw new Error("Estado de conclusão inválido");
    for (let i = 0; i < (s.index as number); i++)
      if (!s.answers[s.queue[i].questionId])
        throw new Error("Resposta anterior ausente");
    for (const e of s.queue)
      if (
        !object(e) ||
        typeof e.questionId !== "string" ||
        typeof e.skillId !== "string" ||
        !Array.isArray(e.options) ||
        e.options.length === 0 ||
        new Set(e.options.map((o) => o.id)).size !== e.options.length ||
        !e.options.every(
          (o) =>
            object(o) && typeof o.id === "string" && typeof o.text === "string",
        )
      )
        throw new Error("Questão da sessão inválida");
    for (const [questionId, a] of Object.entries(s.answers)) {
      const entryIndex = s.queue.findIndex((e) => e.questionId === questionId);
      if (
        !object(a) ||
        typeof a.optionId !== "string" ||
        typeof a.correct !== "boolean" ||
        time(a.timestamp) === null ||
        entryIndex < 0 ||
        entryIndex > (s.index as number) ||
        !s.queue[entryIndex].options.some((o: { id: string }) => o.id === a.optionId)
      )
        throw new Error("Resposta inválida");
    }
    result.trainingSession = s as UserProgress["trainingSession"];
  }
  return result;
}
export function skillAvailable(id: string, p: UserProgress) {
  const skill = skills.find((s) => s.id === id);
  return (
    !!skill &&
    skill.prerequisites.every(
      (prerequisite) =>
        p.studiedSkills.includes(prerequisite) ||
        (p.mastery[prerequisite] ?? 0) >= 20,
    )
  );
}
export function studyProgress(
  p: UserProgress,
  sectionId: string,
  skillId: string,
  now: number,
): UserProgress {
  return {
    ...p,
    studiedSections: [...new Set([...p.studiedSections, sectionId])],
    studiedSkills: [...new Set([...p.studiedSkills, skillId])],
    lastSection: sectionId,
    updatedAt: new Date(now).toISOString(),
  };
}
export function exposeQuestion(
  p: UserProgress,
  id: string,
  skillId: string,
  now: number,
): UserProgress {
  const record = p.questions[id] ?? emptyRecord();
  return {
    ...p,
    questions: {
      ...p.questions,
      [id]: {
        ...record,
        skillId,
        exposures: record.exposures + 1,
        lastSeen: now,
      },
    },
    updatedAt: new Date(now).toISOString(),
  };
}
export function recordAnswer(
  p: UserProgress,
  id: string,
  skillId: string,
  correct: boolean,
  now: number,
  alreadyExposed = false,
): UserProgress {
  const r = p.questions[id] ?? emptyRecord();
  const due = r.dueAt !== null && r.dueAt <= now;
  const delta = correct
    ? r.correct === 0
      ? 10
      : r.lastResult === false || due
        ? 5
        : 0
    : -5;
  // Immediate repeats cannot lengthen the spacing interval or reward position memory.
  const intervalDays = correct
    ? r.lastResult === true && !due
      ? r.intervalDays
      : Math.min(30, Math.max(1, r.intervalDays * 2))
    : 0;
  const dueAt = correct
    ? r.lastResult === true && !due && r.dueAt !== null
      ? r.dueAt
      : now + 86400000 * intervalDays
    : now + 600000;
  return {
    ...p,
    questions: {
      ...p.questions,
      [id]: {
        ...r,
        skillId,
        attempts: r.attempts + 1,
        correct: r.correct + Number(correct),
        errors: r.errors + Number(!correct),
        exposures: r.exposures + Number(!alreadyExposed),
        lastSeen: now,
        lastResult: correct,
        dueAt,
        intervalDays,
      },
    },
    mastery: {
      ...p.mastery,
      [skillId]: clamp((p.mastery[skillId] ?? 0) + delta),
    },
    updatedAt: new Date(now).toISOString(),
  };
}
export function rateReview(
  p: UserProgress,
  skillId: string,
  rating: "know" | "unsure" | "wrong",
  now: number,
): UserProgress {
  return {
    ...p,
    review: {
      ...p.review,
      [skillId]: {
        confidence: rating,
        lastReviewed: now,
        dueAt:
          now +
          (rating === "know" ? 86400000 : rating === "unsure" ? 3600000 : 0),
      },
    },
    updatedAt: new Date(now).toISOString(),
  };
}
export function recordProofAttempt(
  p: UserProgress,
  id: string,
  skillId: string,
  correct: boolean,
  withoutHelp: boolean,
  now: number,
): UserProgress {
  const r = p.proofAttempts[id] ?? emptyRecord();
  const delta = correct
    ? r.correct === 0
      ? withoutHelp
        ? 20
        : 10
      : r.lastResult === false
        ? 5
        : 0
    : -5;
  return {
    ...p,
    proofAttempts: {
      ...p.proofAttempts,
      [id]: {
        ...r,
        skillId,
        attempts: r.attempts + 1,
        correct: r.correct + Number(correct),
        errors: r.errors + Number(!correct),
        exposures: r.exposures + 1,
        lastSeen: now,
        lastResult: correct,
      },
    },
    mastery: {
      ...p.mastery,
      [skillId]: clamp((p.mastery[skillId] ?? 0) + delta),
    },
    updatedAt: new Date(now).toISOString(),
  };
}
