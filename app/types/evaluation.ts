export type EvaluationPhase = 'content' | 'activity' | 'feedback' | 'checkpoint' | 'done';
export interface EvaluationEvidence {
  challengeId: string;
  nodeIndex: number;
  variant: number;
  response: string[];
  correct: boolean;
  hintsUsed: number;
  independence: number;
}
export interface EvaluationSession {
  version: 2;
  sessionId: string;
  nodeIndex: number;
  stepIndex: number;
  variant: number;
  phase: EvaluationPhase;
  currentChallengeId: string;
  completedChallengeIds: string[];
  recentlySeenChallengeIds: string[];
  contentCompletedNodeIds: string[];
  completedNodeIds: string[];
  masterySnapshot: Record<string, number>;
  attempts: EvaluationEvidence[];
  hintsUsed: number;
  independence: number;
  targetSkill: string;
  remediationReason?: string | undefined;
  response: string[];
  trapezoidConvention: 'exclusive' | 'inclusive';
}
