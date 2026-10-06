import { describe, expect, it } from 'vitest';
import {
  MAX_EVALUATION_ROUNDS,
  advanceEvaluationSession,
  createEvaluationSession,
  markEvaluationResult,
  restoreEvaluationSession,
} from './evaluationSession';

const ids = ['q1', 'q2', 'q3'];

describe('evaluation session engine', () => {
  it('creates a clean first round', () => {
    expect(createEvaluationSession(ids)).toEqual({
      queue: ids,
      index: 0,
      round: 1,
      missedThisRound: [],
      attempts: {},
      done: false,
      unresolved: [],
    });
  });

  it('records misses once and leaves correct answers out of remediation', () => {
    let state = createEvaluationSession(ids);
    state = markEvaluationResult(state, 'q1', false);
    state = markEvaluationResult(state, 'q1', false);
    state = markEvaluationResult(state, 'q2', true);
    expect(state.missedThisRound).toEqual(['q1']);
    expect(state.attempts).toEqual({ q1: 2, q2: 1 });
  });

  it('advances inside a round without mutating its queue', () => {
    const next = advanceEvaluationSession(createEvaluationSession(ids));
    expect(next.index).toBe(1);
    expect(next.queue).toEqual(ids);
    expect(next.round).toBe(1);
  });

  it('starts a remediation round with only missed ids', () => {
    let state = createEvaluationSession(ids);
    state = markEvaluationResult(state, 'q1', false);
    state = { ...state, index: 2 };
    state = advanceEvaluationSession(state);
    expect(state).toMatchObject({ queue: ['q1'], index: 0, round: 2, missedThisRound: [], done: false });
  });

  it('finishes immediately when the round has no misses', () => {
    const state = advanceEvaluationSession({ ...createEvaluationSession(ids), index: 2 });
    expect(state.done).toBe(true);
    expect(state.unresolved).toEqual([]);
  });

  it('stops after the third round and exposes unresolved ids', () => {
    const state = advanceEvaluationSession({
      ...createEvaluationSession(ids),
      queue: ['q1'],
      index: 0,
      round: MAX_EVALUATION_ROUNDS,
      missedThisRound: ['q1'],
    });
    expect(state.done).toBe(true);
    expect(state.unresolved).toEqual(['q1']);
    expect(state.round).toBe(MAX_EVALUATION_ROUNDS);
  });

  it('restores valid persisted state unchanged', () => {
    const state = { ...createEvaluationSession(ids), index: 1, attempts: { q1: 1 } };
    expect(restoreEvaluationSession(JSON.stringify(state), ids)).toEqual(state);
  });

  it.each([
    ['broken json', '{not-json'],
    ['unknown id', JSON.stringify({ ...createEvaluationSession(ids), queue: ['wat'] })],
    ['invalid index', JSON.stringify({ ...createEvaluationSession(ids), index: 9 })],
    ['invalid round', JSON.stringify({ ...createEvaluationSession(ids), round: 4 })],
    ['empty active queue', JSON.stringify({ ...createEvaluationSession(ids), queue: [], done: false })],
  ])('recovers a fresh session from %s', (_label, raw) => {
    expect(restoreEvaluationSession(raw, ids)).toEqual(createEvaluationSession(ids));
  });
});
