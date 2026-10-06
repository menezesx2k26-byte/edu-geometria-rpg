import { evaluationNodes, getEvaluationSteps, type EvaluationStep } from '../content/evaluationTrail.ts';
import type { EvaluationSession } from '../types/evaluation.ts';
import type { UserProgress } from '../types/geometry.ts';
import { recordAnswer } from './progress.ts';

export function createEvaluationSession(sessionId: string): EvaluationSession {
  return { version: 2, sessionId, nodeIndex: 0, stepIndex: 0, variant: 0, phase: 'content', currentChallengeId: '',
    completedChallengeIds: [], recentlySeenChallengeIds: [], contentCompletedNodeIds: [], completedNodeIds: [],
    masterySnapshot: {}, attempts: [], hintsUsed: 0, independence: 1, targetSkill: evaluationNodes[0]!.id,
    response: [], trapezoidConvention: 'exclusive' };
}

function atStep(session: EvaluationSession, variant: number, stepIndex: number): EvaluationSession {
  return { ...session, variant, stepIndex, phase: 'activity', response: [], hintsUsed: 0, independence: 1,
    currentChallengeId: getEvaluationSteps(session.nodeIndex, variant)[stepIndex]!.id };
}

export function startEvaluationNode(session: EvaluationSession): EvaluationSession {
  if (session.phase !== 'content') return session;
  return atStep({ ...session, contentCompletedNodeIds: [...new Set([...session.contentCompletedNodeIds, session.targetSkill])] }, 0, 0);
}

export function answerEvaluation(session: EvaluationSession, step: EvaluationStep, response: string[]): EvaluationSession {
  if (session.phase !== 'activity' || session.currentChallengeId !== step.id || session.completedChallengeIds.includes(step.id)) return session;
  const normalized = step.kind === 'number' ? response.map(value => String(Number(value.trim().replace(',', '.')))) : response;
  const correct = normalized.length === step.answer.length && normalized.every((value, index) => value === step.answer[index]);
  return { ...session, phase: 'feedback', response, independence: session.hintsUsed ? 0.7 : 1,
    completedChallengeIds: [...session.completedChallengeIds, step.id],
    recentlySeenChallengeIds: [...session.recentlySeenChallengeIds.filter(id => id !== step.id), step.id].slice(-5),
    attempts: [...session.attempts, { challengeId: step.id, nodeIndex: session.nodeIndex, variant: session.variant,
      response, correct, hintsUsed: session.hintsUsed, independence: session.hintsUsed ? 0.7 : 1 }],
  };
}

export function advanceEvaluation(session: EvaluationSession): EvaluationSession {
  if (session.phase === 'checkpoint') {
    const completedNodeIds = [...new Set([...session.completedNodeIds, session.targetSkill])];
    const nextNode = evaluationNodes[session.nodeIndex + 1];
    if (!nextNode) return { ...session, phase: 'done', currentChallengeId: '', completedNodeIds };
    return { ...session, completedNodeIds, nodeIndex: session.nodeIndex + 1, targetSkill: nextNode.id,
      phase: 'content', currentChallengeId: '', variant: 0, stepIndex: 0, hintsUsed: 0, independence: 1, response: [], remediationReason: undefined };
  }
  if (session.phase !== 'feedback') return session;
  const steps = getEvaluationSteps(session.nodeIndex, session.variant);
  if (session.stepIndex + 1 < steps.length) return atStep(session, session.variant, session.stepIndex + 1);
  if (session.variant === 0) return atStep(session, 1, 0);
  const needsRemediation = session.attempts.some(attempt => attempt.nodeIndex === session.nodeIndex && (!attempt.correct || attempt.hintsUsed > 0));
  if (session.variant === 1 && needsRemediation) return atStep({ ...session,
    remediationReason: 'Uma decisão ou justificativa precisou de apoio. Vamos testar a mesma habilidade com outra configuração, sem repetir a questão.' }, 2, 0);
  return { ...session, phase: 'checkpoint', currentChallengeId: '', response: [], hintsUsed: 0 };
}

export function nodeMetrics(session: EvaluationSession, nodeIndex: number) {
  const attempts = session.attempts.filter(attempt => attempt.nodeIndex === nodeIndex);
  const independent = attempts.filter(attempt => attempt.correct && attempt.hintsUsed === 0);
  const lastVariant = attempts.some(attempt => attempt.variant === 2) ? 2 : 1;
  const transferSteps = getEvaluationSteps(nodeIndex, lastVariant);
  const transferPassed = transferSteps.every(step => independent.some(attempt => attempt.challengeId === step.id));
  const baseSteps = getEvaluationSteps(nodeIndex, 0);
  const basePassed = baseSteps.every(step => independent.some(attempt => attempt.challengeId === step.id));
  const mastered = transferPassed && (basePassed || lastVariant === 2);
  const expected = baseSteps.length + transferSteps.length;
  const mastery = mastered ? 100 : Math.min(99, Math.round(independent.length / expected * 100));
  return { practiced: attempts.length > 0, mastery, mastered, transferPassed };
}

export function evaluationMetrics(session: EvaluationSession) {
  const nodes = evaluationNodes.map((_, index) => nodeMetrics(session, index));
  return { content: Math.round(session.contentCompletedNodeIds.length / evaluationNodes.length * 100),
    practiced: Math.round(nodes.filter(node => node.practiced).length / nodes.length * 100),
    mastery: Math.round(nodes.reduce((sum, node) => sum + node.mastery, 0) / nodes.length),
    mastered: nodes.filter(node => node.mastered).length,
    completion: Math.round(session.completedNodeIds.length / evaluationNodes.length * 100) };
}

// Reuse the published progress transaction and question evidence. Save answer,
// mastery and runner position together; a replayed submit produces no evidence.
export function recordEvaluationResponse(progress: UserProgress, response: string[], now: number): UserProgress {
  const session = progress.evaluationSession;
  if (!session || session.phase !== 'activity') return progress;
  const step = getEvaluationSteps(session.nodeIndex, session.variant)[session.stepIndex];
  if (!step) return progress;
  const next = answerEvaluation(session, step, response);
  if (next === session) return progress;
  const attempt = next.attempts.at(-1)!;
  const skillId = evaluationNodes[session.nodeIndex].skillIds[0];
  const questionId = `${session.sessionId}:${step.id}`;
  const evidence = recordAnswer(progress, questionId, skillId, attempt.correct, now);
  // Guided reading is not mastery. Only independent, justified performance and
  // transfer contribute; preserve stronger compatible pre-existing evidence.
  const mastery = { ...evidence.mastery, [skillId]: Math.max(progress.mastery[skillId] ?? 0, nodeMetrics(next,session.nodeIndex).mastery) };
  return { ...evidence, mastery, evaluationSession: { ...next, masterySnapshot: mastery } };
}

export function validateEvaluationSession(raw: unknown): raw is EvaluationSession {
  if (!raw || typeof raw !== 'object') return false;
  const s = raw as EvaluationSession;
  if (s.version !== 2 || typeof s.sessionId !== 'string' || !s.sessionId || !Number.isInteger(s.nodeIndex) || s.nodeIndex < 0 || s.nodeIndex >= evaluationNodes.length
    || !Number.isInteger(s.variant) || s.variant < 0 || s.variant > 2 || !Number.isInteger(s.stepIndex) || s.stepIndex < 0
    || !['content','activity','feedback','checkpoint','done'].includes(s.phase)
    || !['inclusive','exclusive'].includes(s.trapezoidConvention) || ![0,1].includes(s.hintsUsed)
    || ![s.completedChallengeIds,s.recentlySeenChallengeIds,s.completedNodeIds,s.contentCompletedNodeIds,s.response].every(array=>Array.isArray(array)&&array.every(value=>typeof value==='string'))
    || !Array.isArray(s.attempts) || s.attempts.some(attempt=>!attempt || typeof attempt.correct!=='boolean' || !Array.isArray(attempt.response) || ![0,1].includes(attempt.hintsUsed))) return false;
  const steps = getEvaluationSteps(s.nodeIndex,s.variant);
  if ((s.phase==='activity'||s.phase==='feedback') && (steps[s.stepIndex]?.id!==s.currentChallengeId)) return false;
  if (s.phase==='feedback' && !s.attempts.some(attempt=>attempt.challengeId===s.currentChallengeId)) return false;
  return true;
}
