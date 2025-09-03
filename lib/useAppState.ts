import { useReducer, useCallback } from 'react';
import { 
  AppState, 
  GamePhase, 
  AssessmentOption, 
  ASSESSMENT_POINTS,
  ExerciseSession 
} from './types';

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
  | { type: 'RESET_SESSION' };

// Initial state factory
const createInitialSession = (): ExerciseSession => ({
  currentExercise: 1,
  totalExercises: 10,
  scores: [],
  totalScore: 0,
  startTime: new Date(),
});

const initialState: AppState = {
  gamePhase: 'start',
  session: createInitialSession(),
  showAnswer: false,
  showDetails: false,
};

// State reducer with comprehensive action handling
function appStateReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'START_SESSION':
      return {
        ...state,
        gamePhase: 'exercise',
        session: createInitialSession(),
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

    default:
      return state;
  }
}

// Custom hook for application state management
export function useAppState() {
  const [state, dispatch] = useReducer(appStateReducer, initialState);

  // Action creators with proper typing
  const actions = {
    startSession: useCallback(() => dispatch({ type: 'START_SESSION' }), []),
    showAnswer: useCallback(() => dispatch({ type: 'SHOW_ANSWER' }), []),
    hideAnswer: useCallback(() => dispatch({ type: 'HIDE_ANSWER' }), []),
    toggleDetails: useCallback(() => dispatch({ type: 'TOGGLE_DETAILS' }), []),
    submitAssessment: useCallback((option: AssessmentOption) => 
      dispatch({ type: 'SUBMIT_ASSESSMENT', payload: option }), []),
    nextExercise: useCallback(() => dispatch({ type: 'NEXT_EXERCISE' }), []),
    retryExercise: useCallback(() => dispatch({ type: 'RETRY_EXERCISE' }), []),
    endSession: useCallback(() => dispatch({ type: 'END_SESSION' }), []),
    resetSession: useCallback(() => dispatch({ type: 'RESET_SESSION' }), []),
  };

  // Computed values for easier component consumption
  const computed = {
    isLastExercise: state.session.currentExercise >= state.session.totalExercises,
    progressPercentage: (state.session.currentExercise / state.session.totalExercises) * 100,
    averageScore: state.session.scores.length > 0 
      ? state.session.totalScore / state.session.scores.length 
      : 0,
    completedExercises: state.session.scores.filter(s => s.option !== 'again').length,
  };

  return {
    state,
    actions,
    computed,
  };
}
