import type {
  Question,
  TrainingSession,
  UserProgress,
} from "../types/geometry";
import { exposeQuestion, recordAnswer, skillAvailable } from "./progress.ts";

function hash(text: string, seed: number) {
  let value = seed >>> 0;
  for (const char of text)
    value = Math.imul(value ^ char.charCodeAt(0), 16777619) >>> 0;
  return value;
}
export function shuffleOptions(q: Question, seed: number) {
  const options = q.options.map((text, i) => ({
    id: `${q.id}:option:${i}`,
    text,
  }));
  let state = hash(q.id, seed) || 1;
  for (let i = options.length - 1; i > 0; i--) {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    const j = (state >>> 0) % (i + 1);
    [options[i], options[j]] = [options[j], options[i]];
  }
  return options;
}
export function createSession(
  pool: Question[],
  p: UserProgress,
  now: number,
): TrainingSession {
  const seed = hash(String(p.sessionCount + 1), now >>> 0);
  const candidates = pool
    .filter((q) => skillAvailable(q.skillId, p))
    .map((q) => {
      const record = p.questions[q.id];
      const review = p.review[q.skillId];
      const due =
        (record?.dueAt != null && record.dueAt <= now) ||
        (review &&
          review.dueAt <= now &&
          (record?.lastSeen ?? 0) < review.dueAt);
      const repair =
        record?.lastResult === false ||
        (review &&
          review.confidence !== "know" &&
          (record?.lastSeen ?? 0) < review.lastReviewed);
      const reason = due
        ? "due-review"
        : repair
          ? "repair"
          : !record?.exposures
            ? "unseen"
            : "least-seen";
      // An explicit educational reason may outrank a novel item. Never duplicate inside a queue.
      const urgent = due
        ? record?.dueAt != null && record.dueAt <= now
          ? 3
          : 2
        : repair
          ? 1
          : 0;
      return {
        question: q,
        urgent,
        exposures: record?.exposures ?? 0,
        lastSeen: record?.lastSeen ?? 0,
        reason,
        priority: urgent * 1000 + (100 - (p.mastery[q.skillId] ?? 0)),
        tie: hash(q.id, seed),
      };
    });
  const used = new Set<string>();
  const skillCounts = new Map<string, number>();
  const familyCounts = new Map<string, number>();
  const family = (q: Question) =>
    q.id.startsWith("q-opv") ? "opv-calculation" : `${q.skillId}:${q.kind}`;
  const queue: TrainingSession["queue"] = [];
  while (candidates.length && queue.length < 10) {
    // Within the same urgency/exposure tier, alternate skills and reasoning families.
    candidates.sort(
      (a, b) =>
        b.urgent - a.urgent ||
        a.exposures - b.exposures ||
        (skillCounts.get(a.question.skillId) ?? 0) -
          (skillCounts.get(b.question.skillId) ?? 0) ||
        (familyCounts.get(family(a.question)) ?? 0) -
          (familyCounts.get(family(b.question)) ?? 0) ||
        a.lastSeen - b.lastSeen ||
        b.priority - a.priority ||
        a.tie - b.tie,
    );
    const c = candidates.shift()!;
    if (used.has(c.question.id)) continue;
    used.add(c.question.id);
    skillCounts.set(
      c.question.skillId,
      (skillCounts.get(c.question.skillId) ?? 0) + 1,
    );
    familyCounts.set(
      family(c.question),
      (familyCounts.get(family(c.question)) ?? 0) + 1,
    );
    queue.push({
      questionId: c.question.id,
      skillId: c.question.skillId,
      reason: c.reason as TrainingSession["queue"][number]["reason"],
      priority: c.priority,
      options: shuffleOptions(c.question, seed),
    });
  }
  return {
    id: `training-${now}-${p.sessionCount + 1}`,
    seed,
    createdAt: now,
    queue,
    index: 0,
    answers: {},
    completed: queue.length === 0,
  };
}
export function startSession(
  p: UserProgress,
  pool: Question[],
  now: number,
): UserProgress {
  if (p.trainingSession && !p.trainingSession.completed) return p;
  const session = createSession(pool, p, now);
  let next: UserProgress = {
    ...p,
    trainingSession: session,
    sessionCount: p.sessionCount + 1,
  };
  const first = session.queue[0];
  if (first) next = exposeQuestion(next, first.questionId, first.skillId, now);
  return next;
}
export function answerSession(
  p: UserProgress,
  pool: Question[],
  questionId: string,
  optionId: string,
  now: number,
): UserProgress {
  const s = p.trainingSession,
    entry = s?.queue[s.index];
  if (
    !s ||
    s.completed ||
    entry?.questionId !== questionId ||
    s.answers[questionId] ||
    !entry.options.some((o) => o.id === optionId)
  )
    return p;
  const q = pool.find((q) => q.id === questionId);
  if (!q) return p;
  const correct = optionId === `${q.id}:option:${q.correctIndex}`;
  const next = recordAnswer(
    p,
    q.id,
    q.skillId,
    correct,
    now,
    (p.questions[q.id]?.exposures ?? 0) > (p.questions[q.id]?.attempts ?? 0),
  );
  return {
    ...next,
    trainingSession: {
      ...s,
      answers: { ...s.answers, [q.id]: { optionId, correct, timestamp: now } },
    },
  };
}
export function advanceSession(
  p: UserProgress,
  now = Date.now(),
): UserProgress {
  const s = p.trainingSession;
  if (!s || s.completed || !s.answers[s.queue[s.index]?.questionId]) return p;
  const index = s.index + 1;
  let next: UserProgress = {
    ...p,
    trainingSession: { ...s, index, completed: index === s.queue.length },
  };
  if (index < s.queue.length)
    next = exposeQuestion(
      next,
      s.queue[index].questionId,
      s.queue[index].skillId,
      now,
    );
  return next;
}
