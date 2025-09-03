// Local storage utilities for ATC Ready app

import { Settings, SavedProgress, ExerciseSession, GamePhase } from './types';

// Storage keys
const STORAGE_KEYS = {
  SETTINGS: 'atc-ready-settings',
  PROGRESS: 'atc-ready-progress',
  STATISTICS: 'atc-ready-statistics',
  SESSION_HISTORY: 'atc-ready-session-history',
} as const;

// Default settings
export const DEFAULT_SETTINGS: Settings = {
  totalExercises: 10,
  saveProgress: true,
};

// Check if localStorage is available
function isLocalStorageAvailable(): boolean {
  try {
    const test = '__localStorage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

// Generic storage functions
function getFromStorage<T>(key: string, defaultValue: T): T {
  if (!isLocalStorageAvailable()) return defaultValue;
  
  try {
    const item = localStorage.getItem(key);
    if (item === null) return defaultValue;
    return JSON.parse(item);
  } catch (error) {
    console.warn(`Failed to parse localStorage item "${key}":`, error);
    return defaultValue;
  }
}

function setToStorage<T>(key: string, value: T): boolean {
  if (!isLocalStorageAvailable()) return false;
  
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.warn(`Failed to save to localStorage "${key}":`, error);
    return false;
  }
}

function removeFromStorage(key: string): boolean {
  if (!isLocalStorageAvailable()) return false;
  
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.warn(`Failed to remove from localStorage "${key}":`, error);
    return false;
  }
}

// Settings management
export function loadSettings(): Settings {
  return getFromStorage(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
}

export function saveSettings(settings: Settings): boolean {
  return setToStorage(STORAGE_KEYS.SETTINGS, settings);
}

// Progress management
export function loadProgress(): SavedProgress | null {
  return getFromStorage<SavedProgress | null>(STORAGE_KEYS.PROGRESS, null);
}

export function saveProgress(
  session: ExerciseSession,
  gamePhase: GamePhase,
  showAnswer: boolean,
  showDetails: boolean
): boolean {
  const progress: SavedProgress = {
    session: {
      ...session,
      startTime: session.startTime, // Ensure Date objects are handled
    },
    gamePhase,
    showAnswer,
    showDetails,
    savedAt: new Date().toISOString(),
  };
  
  return setToStorage(STORAGE_KEYS.PROGRESS, progress);
}

export function clearProgress(): boolean {
  return removeFromStorage(STORAGE_KEYS.PROGRESS);
}

// Check if saved progress is meaningful (user has actually made progress)
export function hasMeaningfulProgress(progress: SavedProgress | null): boolean {
  if (!progress) return false;
  
  return progress.gamePhase !== 'start' && 
         progress.gamePhase !== 'end' &&
         progress.session.scores.length > 0;
}

// Session history and statistics
export interface SessionStats {
  totalSessions: number;
  totalExercises: number;
  totalScore: number;
  averageScore: number;
  bestScore: number;
  bestScorePercentage: number;
  completionRate: number;
  lastPlayed: string;
}

export interface CompletedSession {
  id: string;
  totalScore: number;
  maxPossibleScore: number;
  exercisesCompleted: number;
  totalExercises: number;
  scorePercentage: number;
  duration: number; // in minutes
  completedAt: string;
  scores: Array<{
    option: string;
    points: number;
    timestamp: string;
  }>;
}

export function loadSessionHistory(): CompletedSession[] {
  return getFromStorage<CompletedSession[]>(STORAGE_KEYS.SESSION_HISTORY, []);
}

export function saveCompletedSession(session: ExerciseSession): boolean {
  const history = loadSessionHistory();
  const maxPossibleScore = session.totalExercises * 3;
  const completedExercises = session.scores.filter(s => s.option !== 'again').length;
  const duration = Math.round((new Date().getTime() - session.startTime.getTime()) / 60000);
  
  const completedSession: CompletedSession = {
    id: Date.now().toString(),
    totalScore: session.totalScore,
    maxPossibleScore,
    exercisesCompleted: completedExercises,
    totalExercises: session.totalExercises,
    scorePercentage: (session.totalScore / maxPossibleScore) * 100,
    duration,
    completedAt: new Date().toISOString(),
    scores: session.scores.map(score => ({
      option: score.option,
      points: score.points,
      timestamp: score.timestamp.toISOString(),
    })),
  };
  
  // Keep only last 50 sessions to prevent storage bloat
  const updatedHistory = [completedSession, ...history].slice(0, 50);
  
  return setToStorage(STORAGE_KEYS.SESSION_HISTORY, updatedHistory);
}

export function getSessionStatistics(): SessionStats {
  const history = loadSessionHistory();
  
  if (history.length === 0) {
    return {
      totalSessions: 0,
      totalExercises: 0,
      totalScore: 0,
      averageScore: 0,
      bestScore: 0,
      bestScorePercentage: 0,
      completionRate: 0,
      lastPlayed: '',
    };
  }
  
  const totalSessions = history.length;
  const totalExercises = history.reduce((sum, session) => sum + session.exercisesCompleted, 0);
  const totalScore = history.reduce((sum, session) => sum + session.totalScore, 0);
  const totalPossibleScore = history.reduce((sum, session) => sum + session.maxPossibleScore, 0);
  
  const bestSession = history.reduce((best, current) => 
    current.scorePercentage > best.scorePercentage ? current : best
  );
  
  const averageScore = totalSessions > 0 ? totalScore / totalSessions : 0;
  const completionRate = totalPossibleScore > 0 ? (totalScore / totalPossibleScore) * 100 : 0;
  
  return {
    totalSessions,
    totalExercises,
    totalScore,
    averageScore,
    bestScore: bestSession.totalScore,
    bestScorePercentage: bestSession.scorePercentage,
    completionRate,
    lastPlayed: history[0]?.completedAt || '',
  };
}
