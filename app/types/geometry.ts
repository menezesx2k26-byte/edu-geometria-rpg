export type SkillType = "definition" | "postulate" | "theorem" | "corollary";

export type Skill = {
  id: string;
  title: string;
  shortTitle: string;
  type: SkillType;
  prerequisites: string[];
  description: string;
  asset?: string;
  lessonId: string;
};

export type LessonBlockType =
  | "definition"
  | "postulate"
  | "theorem"
  | "corollary"
  | "proposition"
  | "example"
  | "warning"
  | "comparison";

export type LessonBlock = {
  id: string;
  type: LessonBlockType;
  title: string;
  body: string[];
  formulas?: string[];
  callout?: string;
  asset?: string;
};

export type LessonSection = {
  id: string;
  skillId: string;
  eyebrow: string;
  title: string;
  summary: string;
  estimatedMinutes: number;
  blocks: LessonBlock[];
};

export type ProofStepKind =
  "hypothesis" | "construction" | "known-result" | "inference" | "conclusion";

export type ProofStep = {
  id: string;
  kind: ProofStepKind;
  label: string;
  formula?: string;
  explanation: string;
  dependsOn: string[];
};

export type Proof = {
  id: string;
  title: string;
  skillId: string;
  statement: string;
  formula?: string;
  badge: "proposition" | "theorem" | "corollary";
  complementary?: boolean;
  steps: ProofStep[];
};

export type QuestionKind =
  | "criterion"
  | "hypothesis"
  | "conclusion"
  | "correspondence"
  | "true-false"
  | "logical-error"
  | "calculation"
  | "comparison";

export type Question = {
  id: string;
  skillId: string;
  kind: QuestionKind;
  prompt: string;
  formula?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  category?: "A" | "B" | "C" | "D" | "E" | "F" | "G";
  figure?: "triangle" | "isosceles" | "median" | "opv" | "ala" | "lal";
  labels?: string[];
};

export type ExerciseStep = {
  id: string;
  prompt: string;
  formula?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

export type Exercise = {
  id: string;
  title: string;
  subtitle: string;
  skillId: string;
  difficulty: "Quest" | "Boss Proof" | "Exercício resolvido";
  introduction: string;
  steps: ExerciseStep[];
  finalAnswer: string;
  figure?: Question["figure"];
};

export type ReviewCard = {
  id: string;
  skillId: string;
  concept: string;
  definition: string;
  formula: string;
  commonError: string;
  question: string;
  answer: string;
};

export type QuestionRecord = {
  attempts: number;
  correct: number;
  errors: number;
  exposures: number;
  intervalDays: number;
  skillId?: string;
  lastSeen: number | null;
  lastResult: boolean | null;
  dueAt: number | null;
};

export type SessionEntry = {
  questionId: string;
  skillId: string;
  reason: "due-review" | "repair" | "unseen" | "least-seen";
  priority: number;
  options: { id: string; text: string }[];
};
export type TrainingSession = {
  id: string;
  seed: number;
  createdAt: number;
  queue: SessionEntry[];
  index: number;
  answers: Record<
    string,
    { optionId: string; correct: boolean; timestamp: number }
  >;
  completed: boolean;
};

export type UserProgress = {
  evaluationSession?: import('./evaluation').EvaluationSession;
  schemaVersion: 2;
  studiedSkills: string[];
  review: Record<
    string,
    {
      confidence: "know" | "unsure" | "wrong";
      dueAt: number;
      lastReviewed: number;
    }
  >;
  trainingSession: TrainingSession | null;
  sessionCount: number;
  mastery: Record<string, number>;
  studiedSections: string[];
  questions: Record<string, QuestionRecord>;
  proofAttempts: Record<string, QuestionRecord>;
  lastSection: string;
  updatedAt: string;
};

export type AppView =
  "map" | "lesson" | "training" | "proofs" | "exercises" | "review" | "avaliacao-ifsp";
