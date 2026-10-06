export const EVALUATION_SESSION_STORAGE_KEY = 'geometria-rpg:avaliacao-ifsp:v2';
export const LEGACY_EVALUATION_SESSION_STORAGE_KEY = 'geometria-rpg:avaliacao-ifsp:v1';
export const MAX_EVALUATION_ROUNDS = 3;

export interface EvaluationSessionState {
  queue: string[];
  index: number;
  round: number;
  missedThisRound: string[];
  attempts: Record<string, number>;
  done: boolean;
  unresolved: string[];
}

export function createEvaluationSession(questionIds: string[]): EvaluationSessionState {
  return {
    queue: [...questionIds],
    index: 0,
    round: 1,
    missedThisRound: [],
    attempts: {},
    done: false,
    unresolved: [],
  };
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function isAttemptMap(value: unknown): value is Record<string, number> {
  return Boolean(value)
    && typeof value === 'object'
    && !Array.isArray(value)
    && Object.values(value as Record<string, unknown>).every(
      (count) => typeof count === 'number' && Number.isFinite(count) && count >= 0,
    );
}

function isValidPersistedState(
  value: unknown,
  questionIds: string[],
): value is EvaluationSessionState {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const state = value as Partial<EvaluationSessionState>;
  const known = new Set(questionIds);

  if (!isStringArray(state.queue) || !isStringArray(state.missedThisRound) || !isStringArray(state.unresolved)) return false;
  if (!state.queue.every((id) => known.has(id))) return false;
  if (!state.missedThisRound.every((id) => known.has(id))) return false;
  if (!state.unresolved.every((id) => known.has(id))) return false;
  if (new Set(state.queue).size !== state.queue.length) return false;
  if (new Set(state.missedThisRound).size !== state.missedThisRound.length) return false;
  if (new Set(state.unresolved).size !== state.unresolved.length) return false;

  if (typeof state.index !== 'number' || !Number.isInteger(state.index) || state.index < 0) return false;
  if (typeof state.round !== 'number' || !Number.isInteger(state.round) || state.round < 1 || state.round > MAX_EVALUATION_ROUNDS) return false;
  if (typeof state.done !== 'boolean' || !isAttemptMap(state.attempts)) return false;

  if (!state.done) {
    if (state.queue.length === 0 || state.index >= state.queue.length) return false;
  } else if (state.queue.length > 0 && state.index >= state.queue.length) {
    return false;
  }

  for (const id of Object.keys(state.attempts)) {
    if (!known.has(id)) return false;
  }

  return true;
}

export function restoreEvaluationSession(
  raw: string | null,
  questionIds: string[],
): EvaluationSessionState {
  const fresh = createEvaluationSession(questionIds);
  if (!raw) return fresh;

  try {
    const parsed: unknown = JSON.parse(raw);
    return isValidPersistedState(parsed, questionIds) ? parsed : fresh;
  } catch {
    return fresh;
  }
}

export function markEvaluationResult(
  state: EvaluationSessionState,
  questionId: string,
  correct: boolean,
): EvaluationSessionState {
  if (state.done || !state.queue.includes(questionId)) return state;

  const missedThisRound = correct
    ? state.missedThisRound
    : [...new Set([...state.missedThisRound, questionId])];

  return {
    ...state,
    attempts: {
      ...state.attempts,
      [questionId]: (state.attempts[questionId] ?? 0) + 1,
    },
    missedThisRound,
  };
}

export function advanceEvaluationSession(
  state: EvaluationSessionState,
): EvaluationSessionState {
  if (state.done) return state;

  const atEnd = state.index >= state.queue.length - 1;
  if (!atEnd) return { ...state, index: state.index + 1 };

  if (state.missedThisRound.length > 0 && state.round < MAX_EVALUATION_ROUNDS) {
    return {
      ...state,
      queue: [...state.missedThisRound],
      index: 0,
      round: state.round + 1,
      missedThisRound: [],
    };
  }

  return {
    ...state,
    done: true,
    unresolved: [...state.missedThisRound],
  };
}
