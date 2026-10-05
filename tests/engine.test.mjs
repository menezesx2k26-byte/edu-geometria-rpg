import test from "node:test";
import assert from "node:assert/strict";
import {
  createSession,
  shuffleOptions,
  answerSession,
  advanceSession,
} from "../app/engine/training.ts";
import {
  migrateProgress,
  studyProgress,
  recordAnswer,
  rateReview,
  initialProgress,
} from "../app/engine/progress.ts";
import { validateProofOrder } from "../app/engine/proof.ts";
const pool = Array.from({ length: 12 }, (_, i) => ({
  id: `q${i}`,
  skillId: "fundamentals",
  options: ["false", "true", "other"],
  correctIndex: 1,
}));
const now = Date.UTC(2026, 9, 5);
const fresh = () => migrateProgress(initialProgress);
test("scheduler selects ten distinct and uses remaining unseen questions next session", () => {
  let p = fresh();
  const a = createSession(pool, p, now);
  assert.equal(a.queue.length, 10);
  assert.equal(new Set(a.queue.map((q) => q.questionId)).size, 10);
  for (const entry of a.queue) {
    p = recordAnswer(p, entry.questionId, "fundamentals", true, now);
  }
  const b = createSession(pool, p, now + 1);
  assert.ok(
    b.queue
      .slice(0, 2)
      .every((q) => !a.queue.some((a) => a.questionId === q.questionId)),
  );
});
test("small and empty eligible pools terminate without early duplicate", () => {
  assert.equal(createSession([], fresh(), now).queue.length, 0);
  assert.equal(createSession(pool.slice(0, 3), fresh(), now).queue.length, 3);
});
test("due review and wrong/low confidence are pedagogical priorities", () => {
  let p = fresh();
  p = recordAnswer(p, "q11", "fundamentals", false, now - 86400000);
  p = rateReview(p, "fundamentals", "wrong", now - 1);
  const session = createSession(pool, p, now);
  assert.equal(session.queue[0].questionId, "q11");
  assert.equal(session.queue[0].reason, "due-review");
});
test("exhausted pool prefers least exposures; queues deterministic for same state and seed", () => {
  let p = fresh();
  for (const q of pool) p = recordAnswer(p, q.id, q.skillId, true, now - 1000);
  p = recordAnswer(p, "q0", "fundamentals", true, now - 100);
  const a = createSession(pool, p, now);
  assert.notEqual(a.queue[0].questionId, "q0");
  assert.deepEqual(a, createSession(pool, p, now));
});
test("Fisher–Yates options preserve correct ID through every permutation", () => {
  const seen = new Set();
  for (let seed = 0; seed < 100; seed++) {
    const options = shuffleOptions(pool[0], seed);
    assert.equal(options.length, 3);
    assert.equal(new Set(options.map((o) => o.id)).size, 3);
    assert.equal(options.find((o) => o.id === "q0:option:1").text, "true");
    seen.add(options.findIndex((o) => o.id === "q0:option:1"));
    for (const correctIndex of [0, 1, 2]) {
      const q = { ...pool[0], correctIndex };
      const p = fresh();
      p.trainingSession = createSession([q], p, now + seed);
      p.trainingSession.queue[0].options = shuffleOptions(q, seed);
      const correctId = `${q.id}:option:${correctIndex}`;
      const wrongId = `${q.id}:option:${(correctIndex + 1) % 3}`;
      assert.equal(
        answerSession(p, [q], q.id, correctId, now).trainingSession.answers[
          q.id
        ].correct,
        true,
      );
      assert.equal(
        answerSession(p, [q], q.id, wrongId, now).trainingSession.answers[q.id]
          .correct,
        false,
      );
    }
  }
  assert.equal(seen.size, 3);
});
test("answer/advance survives JSON reload and double submissions do not grant extra evidence", () => {
  let p = fresh();
  p.trainingSession = createSession(pool, p, now);
  const entry = p.trainingSession.queue[0];
  p = answerSession(
    p,
    pool,
    entry.questionId,
    `${entry.questionId}:option:1`,
    now,
  );
  const restored = migrateProgress(JSON.parse(JSON.stringify(p)));
  assert.deepEqual(restored.trainingSession, p.trainingSession);
  assert.deepEqual(
    answerSession(
      restored,
      pool,
      entry.questionId,
      `${entry.questionId}:option:1`,
      now,
    ),
    restored,
  );
  assert.equal(advanceSession(restored).trainingSession.index, 1);
  assert.equal(p.questions[entry.questionId].exposures, 1);
});
test("study and confidence cannot award mastery; repeated answer cannot farm mastery", () => {
  let p = fresh();
  p = studyProgress(p, "fundamentals", "fundamentals", now);
  assert.equal(p.mastery.fundamentals ?? 0, 0);
  for (let i = 0; i < 10; i++) p = rateReview(p, "fundamentals", "know", now);
  assert.equal(p.mastery.fundamentals ?? 0, 0);
  for (let i = 0; i < 20; i++)
    p = recordAnswer(p, "q1", "fundamentals", true, now);
  assert.equal(p.mastery.fundamentals, 10);
});
test("migration preserves compatible v1 progress, counts and maps studied skill", () => {
  const legacy = {
    mastery: { fundamentals: 45 },
    studiedSections: ["fundamentals"],
    questions: { q1: { attempts: 3, correct: 2 } },
    proofAttempts: { p1: { attempts: 1, correct: 1 } },
    lastSection: "fundamentals",
    updatedAt: "2026-01-01",
  };
  const p = migrateProgress(legacy);
  assert.equal(p.schemaVersion, 2);
  assert.equal(p.mastery.fundamentals, 45);
  assert.equal(p.questions.q1.exposures, 3);
  assert.equal(p.questions.q1.errors, 1);
  assert.ok(p.studiedSkills.includes("fundamentals"));
  assert.equal(p.proofAttempts.p1.correct, 1);
  assert.deepEqual(migrateProgress(p), p);
});
test("migration rejects invalid containers and unknown future versions", () => {
  assert.throws(() => migrateProgress({ schemaVersion: 99 }));
  assert.throws(() => migrateProgress({ questions: "broken" }));
  assert.throws(() => migrateProgress(null));
});
test("proof accepts independent hypothesis order, rejects causal jump, omission and duplicate", () => {
  const proof = {
    steps: [
      { id: "a", dependsOn: [] },
      { id: "b", dependsOn: [] },
      { id: "c", dependsOn: ["a", "b"] },
      { id: "d", dependsOn: ["c"] },
    ],
  };
  assert.ok(validateProofOrder(proof, ["b", "a", "c", "d"]));
  assert.ok(!validateProofOrder(proof, ["a", "c", "b", "d"]));
  assert.ok(!validateProofOrder(proof, ["a", "b", "d"]));
  assert.ok(!validateProofOrder(proof, ["a", "b", "c", "c"]));
});

test("review deadline at skill level prioritizes a previously successful concept", () => {
  const p = fresh();
  p.review.fundamentals = {
    confidence: "know",
    dueAt: now - 1,
    lastReviewed: now - 86400000,
  };
  const s = createSession(pool, p, now);
  assert.equal(s.queue[0].reason, "due-review");
});
test("clamps mastery after wrong answers and repeated proofs cannot farm evidence", async () => {
  const { recordProofAttempt } = await import("../app/engine/progress.ts");
  let p = fresh();
  p = recordAnswer(p, "q1", "fundamentals", false, now);
  assert.equal(p.mastery.fundamentals, 0);
  p.mastery.fundamentals = 98;
  p = recordAnswer(p, "q2", "fundamentals", true, now);
  assert.equal(p.mastery.fundamentals, 100);
  p.mastery.fundamentals = 0;
  for (let i = 0; i < 20; i++)
    p = recordProofAttempt(p, "proof", "fundamentals", true, true, now);
  assert.equal(p.mastery.fundamentals, 20);
});
test("bank IDs, classifications, all skill coverage, generated OPV answers and causal proof orders", async () => {
  const { questions, exercises } = await import("../app/content/exercises.ts");
  const { proofs } = await import("../app/content/proofs.ts");
  const { skills } = await import("../app/content/geometry.ts");
  assert.equal(new Set(questions.map((q) => q.id)).size, questions.length);
  for (const skill of skills)
    assert.ok(
      questions.some((q) => q.skillId === skill.id),
      skill.id,
    );
  for (const q of questions) {
    assert.ok(q.options[q.correctIndex]);
    assert.equal(new Set(q.options).size, q.options.length);
    assert.ok(q.category);
  }
  for (const q of questions.filter((q) => q.id.startsWith("q-opv-variant"))) {
    const [, a, b, c] = q.prompt.match(
      /\((\d+)x \+ (\d+)\)° e ∠COD mede (\d+)°/,
    );
    assert.equal(
      Number(q.options[q.correctIndex]),
      (Number(c) - Number(b)) / Number(a),
    );
  }
  for (const proof of proofs) {
    assert.ok(
      validateProofOrder(
        proof,
        proof.steps.map((s) => s.id),
      ),
      proof.id,
    );
    assert.ok(
      !validateProofOrder(proof, proof.steps.map((s) => s.id).reverse()),
      proof.id,
    );
  }
  for (const exercise of exercises)
    for (const step of exercise.steps)
      assert.ok(step.options[step.correctIndex]);
});

test("spaced retrieval can improve mastery without immediate-repeat farming or stretching deadlines", () => {
  let p = fresh();
  p = recordAnswer(p, "q1", "fundamentals", true, now);
  const firstDue = p.questions.q1.dueAt;
  p = recordAnswer(p, "q1", "fundamentals", true, now + 1);
  assert.equal(p.mastery.fundamentals, 10);
  assert.equal(p.questions.q1.dueAt, firstDue);
  p = recordAnswer(p, "q1", "fundamentals", true, firstDue + 1);
  assert.equal(p.mastery.fundamentals, 15);
  assert.ok(p.questions.q1.dueAt > firstDue + 86400000);
});

test("large numeric variant families do not crowd out other skills and reasoning forms", async () => {
  const { questions } = await import("../app/content/exercises.ts");
  const { skills } = await import("../app/content/geometry.ts");
  const p = fresh();
  p.studiedSkills = skills.map((s) => s.id);
  const s = createSession(questions, p, now);
  assert.ok(new Set(s.queue.map((e) => e.skillId)).size >= 6);
  assert.ok(
    s.queue.filter((e) => e.questionId.startsWith("q-opv")).length <= 2,
  );
});

test("migration rejects sessions that would freeze training or contain unrelated answers", () => {
  const p = fresh();
  p.trainingSession = createSession(pool, p, now);
  const bad = [
    {
      ...p.trainingSession,
      index: p.trainingSession.queue.length,
      completed: false,
    },
    { ...p.trainingSession, queue: [], index: 0, completed: false },
    {
      ...p.trainingSession,
      answers: {
        unrelated: {
          optionId: "other:option:0",
          correct: true,
          timestamp: now,
        },
      },
    },
  ];
  for (const session of bad)
    assert.throws(() => migrateProgress({ ...p, trainingSession: session }));
});
