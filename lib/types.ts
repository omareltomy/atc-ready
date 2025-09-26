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

export interface Settings {
  totalExercises: number;
  saveProgress: boolean;
}

export interface SavedProgress {
  session: ExerciseSession;
  gamePhase: GamePhase;
  showAnswer: boolean;
  showDetails: boolean;
  savedAt: string;
}

export interface AppState {
  gamePhase: GamePhase;
  session: ExerciseSession;
  showAnswer: boolean;
  showDetails: boolean;
  settings: Settings;
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

// =============================================================================
// GENERATOR TYPES
// =============================================================================

/**
 * Aircraft interface for aviation traffic exercises
 */
export interface Ac {
  callsign: string;
  wtc: 'L'|'M'|'H';
  type: { name: string; type: string };
  isVFR: boolean;
  flightRule: 'VFR' | 'IFR';
  isMil?: boolean; // Military flag for intruders when target is VFR
  heading: number;
  level: number;
  levelChange?: { to: number; dir: '↑'|'↓' };
  speed: number;
  position: { x: number; y: number };
  history: { x: number; y: number }[];
}

/**
 * Traffic situation interface describing the spatial relationship between aircraft
 */
export interface Situation {
  clock: number;
  distance: number;
  direction: string;
  level: string;
}

/**
 * Complete aviation exercise interface containing target, intruder, situation, and solution
 */
export interface Exercise {
  target: Ac;
  intruder: Ac;
  situation: Situation;
  solution: string;
}
