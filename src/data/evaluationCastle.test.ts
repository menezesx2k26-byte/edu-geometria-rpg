import { describe, expect, it } from 'vitest';
import { skills } from './bootstrap';
import {
  EVALUATION_CASTLE_QUESTIONS,
  EVALUATION_ROOM_ORDER,
  validateEvaluationCastle,
} from './evaluationCastle';

describe('evaluation castle content', () => {
  it('keeps exactly six rooms in the approved memory-palace order', () => {
    expect(EVALUATION_CASTLE_QUESTIONS).toHaveLength(6);
    expect(EVALUATION_CASTLE_QUESTIONS.map((question) => question.room.id)).toEqual([
      'portraits',
      'diagonal-staircase',
      'four-towers-bridge',
      'room-of-requirement',
      'potions-ramp',
      'isosceles-chamber',
    ]);
    expect(EVALUATION_ROOM_ORDER).toEqual([
      'portraits',
      'diagonal-staircase',
      'four-towers-bridge',
      'room-of-requirement',
      'potions-ramp',
      'isosceles-chamber',
    ]);
  });

  it('has three progressive hints and at least one figure anchor per room', () => {
    for (const question of EVALUATION_CASTLE_QUESTIONS) {
      expect(question.hints.map((hint) => hint.tier)).toEqual([1, 2, 3]);
      expect(question.figure.anchors.length).toBeGreaterThan(0);
    }
  });

  it('binds only known skills and valid grimoire dependencies', () => {
    const knownSkills = new Set(skills.map((skill) => skill.id));
    for (const question of EVALUATION_CASTLE_QUESTIONS) {
      for (const skillId of question.skillIds) expect(knownSkills.has(skillId)).toBe(true);
      const seen = new Set<string>();
      for (const step of question.grimoire) {
        for (const dependency of step.dependsOn) expect(seen.has(dependency)).toBe(true);
        seen.add(step.id);
      }
    }
    expect(validateEvaluationCastle()).toEqual([]);
  });

  it('stores the three proof anchors required for the parallelogram diagonal room', () => {
    const question = EVALUATION_CASTLE_QUESTIONS.find((item) => item.id === 'q2-parallelogram');
    expect(question?.figure.anchors.map((anchor) => anchor.id)).toEqual(
      expect.arrayContaining(['angle-bao-dco', 'angle-abo-cdo', 'side-ab-cd']),
    );
  });

  it('does not leak eight metres as a given in the ramp figure', () => {
    const question = EVALUATION_CASTLE_QUESTIONS.find((item) => item.id === 'q5-ramp');
    expect(question?.figure.anchors.some((anchor) => /8\s*m/i.test(anchor.label))).toBe(false);
    expect(question?.explanation).toContain('2+6=8');
  });
});
