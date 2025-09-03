// Core application types for the ATC training module

export type GamePhase = 'start' | 'exercise' | 'assessment' | 'end';

export type AssessmentOption = 'correct' | 'almost' | 'hard' | 'again';

export interface AssessmentScore {
  option: AssessmentOption;
  points: number;
  timestamp: Date;
}

export interface ExerciseSession {
  currentExercise: number;
  totalExercises: number;
  scores: AssessmentScore[];
  totalScore: number;
  startTime: Date;
}

export interface AppState {
  gamePhase: GamePhase;
  session: ExerciseSession;
  showAnswer: boolean;
  showDetails: boolean;
}

// Assessment scoring system
export const ASSESSMENT_POINTS: Record<AssessmentOption, number> = {
  correct: 3,
  almost: 2,
  hard: 1,
  again: 0,
} as const;

// Assessment button configurations
export interface AssessmentButton {
  option: AssessmentOption;
  label: string;
  description: string;
  color: 'green' | 'yellow' | 'orange' | 'red';
}

export const ASSESSMENT_BUTTONS: AssessmentButton[] = [
  {
    option: 'correct',
    label: 'Correct',
    description: 'Perfect answer',
    color: 'green',
  },
  {
    option: 'almost',
    label: 'Almost',
    description: 'Minor mistakes',
    color: 'yellow',
  },
  {
    option: 'hard',
    label: 'Hard',
    description: 'Difficult but completed',
    color: 'orange',
  },
  {
    option: 'again',
    label: 'Again',
    description: 'Need to retry',
    color: 'red',
  },
] as const;
