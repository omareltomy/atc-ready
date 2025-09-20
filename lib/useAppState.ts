import { useReducer, useCallback, useEffect } from 'react';
import { 
  AppState, 
  GamePhase, 
  AssessmentOption, 
  ASSESSMENT_POINTS,
  ExerciseSession,
  Settings 
} from './types';
import { 
  loadSettings, 
  saveSettings, 
  loadProgress, 
  saveProgress, 
  clearProgress,
  saveCompletedSession,
  hasMeaningfulProgress,
  DEFAULT_SETTINGS 
} from './storage';

// Action types for the state reducer
type AppAction =
  | { type: 'START_SESSION' }
  | { type: 'SHOW_ANSWER' }
  | { type: 'HIDE_ANSWER' }
  | { type: 'TOGGLE_DETAILS' }
  | { type: 'SUBMIT_ASSESSMENT'; payload: AssessmentOption }
  | { type: 'NEXT_EXERCISE' }
  | { type: 'RETRY_EXERCISE' }
  | { type: 'END_SESSION' }
  | { type: 'RESET_SESSION' }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<Settings> }
  | { type: 'RESTORE_PROGRESS'; payload: { session: ExerciseSession; gamePhase: GamePhase; showAnswer: boolean; showDetails: boolean } }
  | { type: 'LOAD_SETTINGS'; payload: Settings };

// Initial state factory
const createInitialSession = (): ExerciseSession => ({
  currentExercise: 1,
  totalExercises: 10,
  scores: [],
  totalScore: 0,
  startTime: new Date(),
});

const createInitialState = (): AppState => ({
  gamePhase: 'start',
  session: createInitialSession(),
  showAnswer: false,
  showDetails: false,
  settings: DEFAULT_SETTINGS,
});

// State reducer with comprehensive action handling
function appStateReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'START_SESSION':
      const newSession = createInitialSession();
      newSession.totalExercises = state.settings.totalExercises;
      return {
        ...state,
        gamePhase: 'exercise',
        session: newSession,
        showAnswer: false,
        showDetails: false,
      };

    case 'SHOW_ANSWER':
      return {
        ...state,
        gamePhase: 'assessment',
        showAnswer: true,
      };

    case 'HIDE_ANSWER':
      return {
        ...state,
        showAnswer: false,
        showDetails: false,
      };

    case 'TOGGLE_DETAILS':
      return {
        ...state,
        showDetails: !state.showDetails,
      };

    case 'SUBMIT_ASSESSMENT': {
      const assessment = action.payload;
      const points = ASSESSMENT_POINTS[assessment];
      const newScore = {
        option: assessment,
        points,
        timestamp: new Date(),
      };

      // Handle "Again" option - retry same exercise
      if (assessment === 'again') {
        return {
          ...state,
          gamePhase: 'exercise',
          showAnswer: false,
          showDetails: false,
          session: {
            ...state.session,
            scores: [...state.session.scores, newScore],
          },
        };
      }

      // Handle other assessments - proceed to next exercise or end
      const updatedSession: ExerciseSession = {
        ...state.session,
        scores: [...state.session.scores, newScore],
        totalScore: state.session.totalScore + points,
      };

      // Check if this was the last exercise
      if (state.session.currentExercise >= state.session.totalExercises) {
        return {
          ...state,
          gamePhase: 'end',
          session: updatedSession,
          showAnswer: false,
          showDetails: false,
        };
      }

      // Move to next exercise
      return {
        ...state,
        gamePhase: 'exercise',
        session: {
          ...updatedSession,
          currentExercise: state.session.currentExercise + 1,
        },
        showAnswer: false,
        showDetails: false,
      };
    }

    case 'NEXT_EXERCISE':
      if (state.session.currentExercise >= state.session.totalExercises) {
        return {
          ...state,
          gamePhase: 'end',
        };
      }
      return {
        ...state,
        gamePhase: 'exercise',
        session: {
          ...state.session,
          currentExercise: state.session.currentExercise + 1,
        },
        showAnswer: false,
        showDetails: false,
      };

    case 'RETRY_EXERCISE':
      return {
        ...state,
        gamePhase: 'exercise',
        showAnswer: false,
        showDetails: false,
      };

    case 'END_SESSION':
      return {
        ...state,
        gamePhase: 'end',
      };

    case 'RESET_SESSION':
      return {
        ...state,
        gamePhase: 'start',
        session: createInitialSession(),
        showAnswer: false,
        showDetails: false,
      };

    case 'UPDATE_SETTINGS':
      const updatedSettings = { ...state.settings, ...action.payload };
      // Auto-save settings when they change
      saveSettings(updatedSettings);
      return {
        ...state,
        settings: updatedSettings,
      };

    case 'LOAD_SETTINGS':
      return {
        ...state,
        settings: action.payload,
      };

    case 'RESTORE_PROGRESS':
      const { session, gamePhase, showAnswer, showDetails } = action.payload;
      return {
        ...state,
        session: {
          ...session,
          startTime: new Date(session.startTime), // Ensure Date object
        },
        gamePhase,
        showAnswer,
        showDetails,
      };

    default:
      return state;
  }
}

// Custom hook for application state management
export function useAppState() {
  const [state, dispatch] = useReducer(appStateReducer, createInitialState());

  // Load settings and progress on mount
  useEffect(() => {
    // Load settings
    const savedSettings = loadSettings();
    dispatch({ type: 'LOAD_SETTINGS', payload: savedSettings });

    // Load progress if available and user has enabled progress saving
    if (savedSettings.saveProgress) {
      const savedProgress = loadProgress();
      if (hasMeaningfulProgress(savedProgress)) {
        dispatch({
          type: 'RESTORE_PROGRESS',
          payload: {
            session: savedProgress!.session,
            gamePhase: savedProgress!.gamePhase,
            showAnswer: savedProgress!.showAnswer,
            showDetails: savedProgress!.showDetails,
          },
        });
      }
    }
  }, []);

  // Auto-save progress when state changes (if enabled and user has made progress)
  useEffect(() => {
    if (state.settings.saveProgress && 
        state.gamePhase !== 'start' && 
        state.gamePhase !== 'end' &&
        state.session.scores.length > 0) { // Only save if user has attempted at least one exercise
      saveProgress(state.session, state.gamePhase, state.showAnswer, state.showDetails);
    }
  }, [state.session, state.gamePhase, state.showAnswer, state.showDetails, state.settings.saveProgress]);

  // Save completed session and clear progress when session ends (only if saveProgress is enabled)
  useEffect(() => {
    if (state.gamePhase === 'end' && state.settings.saveProgress) {
      saveCompletedSession(state.session);
      clearProgress();
    } else if (state.gamePhase === 'end') {
      // Just clear any existing progress, but don't save the session to statistics
      clearProgress();
    }
  }, [state.gamePhase, state.session, state.settings.saveProgress]);

  // Action creators with proper typing
  const actions = {
    startSession: useCallback(() => {
      // Clear any existing progress that doesn't have actual scores
      const existingProgress = loadProgress();
      if (existingProgress && existingProgress.session.scores.length === 0) {
        clearProgress();
      }
      
      // Create session with user's preferred total exercises
      const newSession = {
        ...createInitialSession(),
        totalExercises: state.settings.totalExercises,
      };
      dispatch({ type: 'START_SESSION' });
    }, [state.settings.totalExercises]),
    showAnswer: useCallback(() => dispatch({ type: 'SHOW_ANSWER' }), []),
    hideAnswer: useCallback(() => dispatch({ type: 'HIDE_ANSWER' }), []),
    toggleDetails: useCallback(() => dispatch({ type: 'TOGGLE_DETAILS' }), []),
    submitAssessment: useCallback((option: AssessmentOption) => 
      dispatch({ type: 'SUBMIT_ASSESSMENT', payload: option }), []),
    nextExercise: useCallback(() => dispatch({ type: 'NEXT_EXERCISE' }), []),
    retryExercise: useCallback(() => dispatch({ type: 'RETRY_EXERCISE' }), []),
    endSession: useCallback(() => dispatch({ type: 'END_SESSION' }), []),
    resetSession: useCallback(() => {
      clearProgress();
      dispatch({ type: 'RESET_SESSION' });
    }, []),
    updateSettings: useCallback((settings: Partial<Settings>) => 
      dispatch({ type: 'UPDATE_SETTINGS', payload: settings }), []),
  };

  // Computed values for easier component consumption
  const computed = {
    isLastExercise: state.session.currentExercise >= state.session.totalExercises,
    progressPercentage: (state.session.currentExercise / state.session.totalExercises) * 100,
    averageScore: state.session.scores.length > 0 
      ? (state.session.totalScore / state.session.scores.length / 3) * 100 
      : 0,
    completedExercises: state.session.scores.filter(s => s.option !== 'again').length,
  };

  return {
    state,
    actions,
    computed,
  };
}
