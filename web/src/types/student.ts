export type ContentStatus = 'RASCUNHO' | 'PUBLICADO';
export type ContentType = 'VIDEO' | 'TEXTO' | 'PDF' | 'QUIZ';
export type Difficulty = 'FACIL' | 'MEDIO' | 'DIFICIL';

export interface Course {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  status: ContentStatus;
  order: number;
}

export interface ModuleWithProgress {
  id: string;
  courseId: string;
  title: string;
  description: string | null;
  order: number;
  totalContents: number;
  completedContents: number;
  progressPercent: number;
}

export interface Content {
  id: string;
  moduleId: string;
  title: string;
  description: string | null;
  type: ContentType;
  body: string | null;
  videoUrl: string | null;
  materialUrl: string | null;
  order: number;
  status: ContentStatus;
}

export interface ProgressRecord {
  id: string;
  userId: string;
  contentId: string;
  percent: number;
  completed: boolean;
}

export interface Alternative {
  id: string;
  text: string;
  order: number;
  correct?: boolean; // nunca vem preenchido antes da resposta
}

export interface Question {
  id: string;
  moduleId: string;
  statement: string;
  explanation: string | null;
  difficulty: Difficulty;
  subject: string;
  examBoard: string | null;
  year: number | null;
  active: boolean;
  alternatives?: Alternative[];
}

export interface QuestionListResponse {
  rows: Question[];
  total: number;
}

export interface AnswerResult {
  correct: boolean;
  correctAlternativeId: string;
  explanation: string | null;
  xpGained: number;
}

export interface SubjectPerformance {
  subject: string;
  total: number;
  correct: number;
  percent: number;
}

export interface Simulation {
  id: string;
  title: string;
  description: string | null;
  questionCount: number;
  timeLimitMinutes: number;
  active: boolean;
}

export interface SimulationQuestion extends Question {
  alternatives: Alternative[];
}

export interface SimulationStartResponse {
  simulation: Simulation;
  questions: SimulationQuestion[];
}

export interface SimulationFinishResult {
  result: {
    id: string;
    correctCount: number;
    wrongCount: number;
    percent: number;
    timeSpentSeconds: number;
    createdAt: string;
  };
  performanceBySubject: SubjectPerformance[];
  wrongQuestionIds: string[];
}

export interface SimulationResultSummary {
  id: string;
  simulationId: string;
  correctCount: number;
  wrongCount: number;
  percent: number;
  timeSpentSeconds: number;
  createdAt: string;
}

export interface Achievement {
  id: string;
  code: string;
  title: string;
  description: string | null;
  icon: string | null;
  unlockedAt: string;
}

export interface GamificationSummary {
  xp: number;
  level: number;
  streakDays: number;
  achievements: Achievement[];
}

export interface RankingEntry {
  userId: string;
  name: string;
  photoUrl: string | null;
  xp: number;
  level: number;
}

export interface Tip {
  id: string;
  title: string;
  content: string;
  category: string | null;
}

export interface FullProfile {
  id: string;
  name: string;
  email: string;
  photoUrl: string | null;
  role: string;
  createdAt: string;
  profile: {
    goal: string | null;
    publicRanking: boolean;
    accessibilitySettings: Record<string, unknown> | null;
  } | null;
  gamification: GamificationSummary | null;
  performanceBySubject: SubjectPerformance[];
}
