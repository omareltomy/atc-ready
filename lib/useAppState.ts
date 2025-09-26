// =============================================================================
// 🏠 APP STATE MANAGER - The Brain of Our Aviation Training App!
// =============================================================================

/**
 * 🧠 WHAT THIS FILE DOES:
 * This file is like the "brain" of our aviation training app. It manages all the important
 * information like:
 * - Which screen we're showing (start, exercise, end)  
 * - How many points the student has earned
 * - What exercise they're currently on
 * - Whether to show answers or not
 * - User settings and preferences
 * 
 * Think of it like a really smart notebook that remembers everything!
 */

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

// =============================================================================
// 📝 ACTION TYPES - All the Things Our App Can Do
// =============================================================================

/**
 * 🎬 APP ACTIONS EXPLAINED:
 * These are like "commands" we can give to our app. Each one tells the app
 * to change something specific:
 * 
 * 🎯 START_SESSION = "Start a new training session!"
 * 👁️ SHOW_ANSWER = "Show me the correct answer!"  
 * 🙈 HIDE_ANSWER = "Hide the answer again!"
 * 📖 TOGGLE_DETAILS = "Show/hide extra details!"
 * ⭐ SUBMIT_ASSESSMENT = "I think my answer was: Perfect/Good/Okay/Again"
 * ➡️ NEXT_EXERCISE = "Move to the next exercise!"
 * 🔄 RETRY_EXERCISE = "Let me try this one again!"
 * 🏁 END_SESSION = "Finish the training session!"
 * 🔄 RESET_SESSION = "Start completely over!"
 * ⚙️ UPDATE_SETTINGS = "Change my preferences!"
 * 📚 RESTORE_PROGRESS = "Continue where I left off!"
 * 💾 LOAD_SETTINGS = "Load my saved settings!"
 */

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

// =============================================================================
// 🏗️ INITIAL STATE FACTORIES - Setting Up Our App's Starting Values
// =============================================================================

/**
 * 📚 SESSION CREATOR FUNCTION:
 * This function creates a brand new training session. It's like setting up
 * a new test paper with:
 * - Starting at exercise #1
 * - Default 10 exercises total (can be changed in settings)
 * - Empty scores list (no answers yet!)
 * - Zero total score
 * - Recording when we started (like writing the date on your test paper)
 */
// Initial state factory
const createInitialSession = (): ExerciseSession => ({
  currentExercise: 1,        // 🎯 Always start with exercise #1
  totalExercises: 10,        // 📊 Default number of exercises (changeable)
  scores: [],               // 📝 Empty list - no scores yet!
  totalScore: 0,            // 🏆 Starting score is zero
  startTime: new Date(),    // ⏰ Remember when we started
});

/**
 * 🎮 APP STATE CREATOR FUNCTION:
 * This sets up the entire app when it first loads. Like preparing
 * a classroom before students arrive:
 * - Show the start screen first
 * - Create a fresh training session
 * - Don't show answers initially
 * - Don't show details initially  
 * - Use default settings
 */
const createInitialState = (): AppState => ({
  gamePhase: 'start',           // 🚦 Start on the welcome screen
  session: createInitialSession(), // 📚 Create a new training session
  showAnswer: false,            // 🙈 Don't show answers yet
  showDetails: false,           // 📖 Don't show extra details yet
  settings: DEFAULT_SETTINGS,   // ⚙️ Use the default user preferences
});

// =============================================================================
// 🔄 STATE REDUCER - The App's Command Center!  
// =============================================================================

/**
 * 🎮 THE STATE REDUCER EXPLAINED:
 * This is like the "command center" of our app. When someone clicks a button
 * or does something, it creates an "action" (like a command). This function
 * looks at that command and decides how to change the app's state.
 * 
 * Think of it like a really smart remote control for our app:
 * - Someone presses "start" → Switch to exercise screen
 * - Someone presses "show answer" → Reveal the correct answer
 * - Someone rates their answer → Add points and maybe go to next exercise
 * 
 * It's called a "reducer" because it takes the current state + an action,
 * and "reduces" them down to a new state!
 */

// State reducer with comprehensive action handling
function appStateReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    
    // 🎯 START A NEW TRAINING SESSION
    case 'START_SESSION':
      // Create a brand new session with the user's preferred number of exercises
      const newSession = createInitialSession();
      newSession.totalExercises = state.settings.totalExercises;
      return {
        ...state,                // Keep everything else the same
        gamePhase: 'exercise',   // 🎮 Switch to exercise screen  
        session: newSession,     // 📚 Use the new session
        showAnswer: false,       // 🙈 Don't show answers
        showDetails: false,      // 📖 Don't show details
      };

    // 👁️ SHOW THE CORRECT ANSWER
    case 'SHOW_ANSWER':
      return {
        ...state,                // Keep everything else the same
        gamePhase: 'assessment', // 🎯 Switch to assessment screen
        showAnswer: true,        // 👁️ Now show the answer!
      };

    // 🙈 HIDE THE ANSWER AGAIN  
    case 'HIDE_ANSWER':
      return {
        ...state,                // Keep everything else the same
        showAnswer: false,       // 🙈 Hide the answer
        showDetails: false,      // 📖 Also hide details
      };

    // 📖 TOGGLE SHOWING EXTRA DETAILS
    case 'TOGGLE_DETAILS':
      return {
        ...state,                    // Keep everything else the same
        showDetails: !state.showDetails, // 🔄 Flip the details on/off
      };

    // ⭐ STUDENT SUBMITTED THEIR SELF-ASSESSMENT
    case 'SUBMIT_ASSESSMENT': {
      // Get the assessment (Perfect, Good, Okay, or Again)
      const assessment = action.payload;
      
      // Look up how many points this assessment is worth
      // Perfect = 3 points, Good = 2 points, Okay = 1 point, Again = 0 points
      const points = ASSESSMENT_POINTS[assessment];
      
      // Create a score record with the assessment and points
      const newScore = {
        option: assessment,      // What they chose (Perfect/Good/Okay/Again)
        points,                 // How many points they earned
        timestamp: new Date(),   // When they submitted it
      };

      // 🔄 SPECIAL CASE: "Again" means retry the same exercise
      if (assessment === 'again') {
        return {
          ...state,                // Keep everything else the same
          gamePhase: 'exercise',   // 🎮 Go back to exercise screen
          showAnswer: false,       // 🙈 Hide the answer
          showDetails: false,      // 📖 Hide details
          session: {
            ...state.session,      // Keep session info the same
            scores: [...state.session.scores, newScore], // But add this score
          },
        };
      }

      // 📊 FOR OTHER ASSESSMENTS: Add points and move forward
      const updatedSession: ExerciseSession = {
        ...state.session,          // Keep session info
        scores: [...state.session.scores, newScore],           // Add the new score
        totalScore: state.session.totalScore + points,         // Add points to total
      };

      // 🏁 CHECK: Was this the last exercise?
      if (state.session.currentExercise >= state.session.totalExercises) {
        return {
          ...state,                // Keep everything else the same
          gamePhase: 'end',        // 🏁 Go to end/results screen
          session: updatedSession, // Use the updated session with new score
          showAnswer: false,       // 🙈 Hide answer
          showDetails: false,      // 📖 Hide details
        };
      }

      // ➡️ NOT THE LAST EXERCISE: Move to next exercise
      return {
        ...state,                    // Keep everything else the same
        gamePhase: 'exercise',       // 🎮 Stay on exercise screen
        session: {
          ...updatedSession,         // Use updated session
          currentExercise: state.session.currentExercise + 1, // Go to next exercise number
        },
        showAnswer: false,           // 🙈 Hide answer for new exercise
        showDetails: false,          // 📖 Hide details for new exercise
      };
    }

    // ➡️ MANUALLY MOVE TO NEXT EXERCISE (without assessment)
    case 'NEXT_EXERCISE':
      // 🏁 CHECK: Are we already at the last exercise?
      if (state.session.currentExercise >= state.session.totalExercises) {
        return {
          ...state,           // Keep everything else the same  
          gamePhase: 'end',   // 🏁 Go to end screen
        };
      }
      // ➡️ NOT THE LAST: Move to next exercise
      return {
        ...state,               // Keep everything else the same
        gamePhase: 'exercise',  // 🎮 Stay on exercise screen
        session: {
          ...state.session,     // Keep session info
          currentExercise: state.session.currentExercise + 1, // Increment exercise number
        },
        showAnswer: false,      // 🙈 Hide answer for new exercise
        showDetails: false,     // 📖 Hide details for new exercise
      };

    // 🔄 RETRY THE CURRENT EXERCISE (without changing exercise number)
    case 'RETRY_EXERCISE':
      return {
        ...state,               // Keep everything else the same
        gamePhase: 'exercise',  // 🎮 Go to exercise screen
        showAnswer: false,      // 🙈 Hide the answer
        showDetails: false,     // 📖 Hide details
      };

    // 🏁 MANUALLY END THE SESSION EARLY
    case 'END_SESSION':
      return {
        ...state,           // Keep everything else the same
        gamePhase: 'end',   // 🏁 Go to end/results screen
      };

    // 🔄 COMPLETELY RESET - Start over from the beginning
    case 'RESET_SESSION':
      return {
        ...state,                    // Keep user settings
        gamePhase: 'start',          // 🚦 Go back to start screen
        session: createInitialSession(), // 📚 Create brand new session
        showAnswer: false,           // 🙈 Hide answer
        showDetails: false,          // 📖 Hide details
      };

    // ⚙️ UPDATE USER SETTINGS/PREFERENCES
    case 'UPDATE_SETTINGS':
      // Merge the new settings with existing ones (like updating a preferences form)
      const updatedSettings = { ...state.settings, ...action.payload };
      
      // 💾 AUTOMATICALLY SAVE: Save settings to browser storage immediately
      // This way if the user closes the browser, their preferences are remembered!
      saveSettings(updatedSettings);
      
      return {
        ...state,                  // Keep everything else the same
        settings: updatedSettings, // Use the new settings
      };

    // 💾 LOAD SAVED SETTINGS (usually when app first starts)
    case 'LOAD_SETTINGS':
      return {
        ...state,               // Keep everything else the same
        settings: action.payload, // Use the loaded settings
      };

    // 📚 RESTORE SAVED PROGRESS (continue where user left off)
    case 'RESTORE_PROGRESS':
      // Extract all the saved information
      const { session, gamePhase, showAnswer, showDetails } = action.payload;
      
      return {
        ...state,               // Keep user settings
        session: {
          ...session,           // Use the saved session info
          startTime: new Date(session.startTime), // Make sure startTime is a proper Date object
        },
        gamePhase,             // Go to the screen they were on
        showAnswer,            // Show/hide answer as they had it
        showDetails,           // Show/hide details as they had it  
      };

    // 🤷 UNKNOWN ACTION: Don't change anything
    default:
      return state; // If we don't recognize the action, just return the current state
  }
}

// =============================================================================
// 🪝 MAIN HOOK - The App State Manager Everyone Uses!
// =============================================================================

/**
 * 🎯 THE useAppState HOOK EXPLAINED:
 * This is the main function that React components use to manage app state.
 * It's like a "control panel" that any part of our app can use to:
 * - See what's happening (current exercise, scores, settings)
 * - Make things happen (start session, submit answers, change settings)
 * - Get useful calculations (progress percentage, average score)
 * 
 * Components just call this hook and get back everything they need!
 */

// Custom hook for application state management  
export function useAppState() {
  // 🧠 SET UP THE STATE MANAGER
  // This creates our state and gives us a way to change it
  const [state, dispatch] = useReducer(appStateReducer, createInitialState());

  // 🚀 WHEN THE APP FIRST LOADS: Set up settings and restore progress
  useEffect(() => {
    // 💾 STEP 1: Load the user's saved settings from browser storage
    const savedSettings = loadSettings();
    dispatch({ type: 'LOAD_SETTINGS', payload: savedSettings });

    // 📚 STEP 2: If progress saving is enabled, try to restore where they left off
    if (savedSettings.saveProgress) {
      const savedProgress = loadProgress();
      
      // Only restore if they actually made meaningful progress
      // (we don't want to restore if they just opened the app and left)
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
  }, []); // Empty array = only run this when component first mounts

  // 💾 AUTO-SAVE PROGRESS: Automatically save user's progress as they work
  useEffect(() => {
    // Only save if ALL these conditions are true:
    // ✅ User has progress saving enabled in settings
    // ✅ They're not on the start screen (haven't started yet)  
    // ✅ They're not on the end screen (already finished)
    // ✅ They've actually attempted at least one exercise (made some progress)
    if (state.settings.saveProgress && 
        state.gamePhase !== 'start' && 
        state.gamePhase !== 'end' &&
        state.session.scores.length > 0) {
      
      // 💾 SAVE: Store their current progress in browser storage
      saveProgress(state.session, state.gamePhase, state.showAnswer, state.showDetails);
    }
  }, [state.session, state.gamePhase, state.showAnswer, state.showDetails, state.settings.saveProgress]);
  // ↑ This effect runs whenever any of these values change

  // 🏁 WHEN SESSION ENDS: Save final results and clean up
  useEffect(() => {
    if (state.gamePhase === 'end' && state.settings.saveProgress) {
      // 📊 SAVE RESULTS: If progress saving is enabled, save their final session to statistics
      saveCompletedSession(state.session);
      
      // 🧹 CLEAN UP: Clear the "in progress" data since they finished
      clearProgress();
    } else if (state.gamePhase === 'end') {
      // 🧹 CLEAN UP ONLY: If progress saving is disabled, just clear any leftover progress data
      clearProgress();
    }
  }, [state.gamePhase, state.session, state.settings.saveProgress]);
  // ↑ This runs when gamePhase, session, or saveProgress setting changes

  // Action creators with proper typing
  const actions = {
    startSession: useCallback(() => {
      // Clear any existing progress that doesn't have actual scores
      const existingProgress = loadProgress();
      if (existingProgress && existingProgress.session.scores.length === 0) {
        clearProgress();
      }
      
      // Start new session (session details will be created by the reducer)
      dispatch({ type: 'START_SESSION' });
    }, []),
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

  // 🧮 COMPUTED VALUES: Calculate helpful numbers that components need
  // (Instead of making components do math, we do it here once)
  const computed = {
    // 🔚 ARE WE DONE?: Check if this is the last exercise in the session
    isLastExercise: state.session.currentExercise >= state.session.totalExercises,
    
    // 📊 HOW FAR ALONG?: Calculate percentage complete (for progress bars)
    progressPercentage: (state.session.currentExercise / state.session.totalExercises) * 100,
    
    // 🌟 AVERAGE SCORE: Calculate overall performance as a percentage
    // (Divide total points by max possible points, then convert to percentage)
    averageScore: state.session.scores.length > 0 
      ? (state.session.totalScore / state.session.scores.length / 3) * 100 
      : 0,
    
    // ✅ HOW MANY COMPLETED?: Count exercises that weren't marked "again"
    // (Because "again" means they want to retry, so it doesn't count as completed)
    completedExercises: state.session.scores.filter(s => s.option !== 'again').length,
  };

  // 🎁 RETURN EVERYTHING: Give components all the tools they need!
  // This hook returns three main things:
  // 📋 state: Current state (what screen, progress, settings, etc.)
  // 🎮 actions: Action functions (startSession, submitAnswer, etc.)  
  // 🧮 computed: Calculated values (percentages, totals, etc.)
  return {
    state,
    actions,
    computed,
  };
}
