// =============================================================================
// 💾 STORAGE MANAGER - The App's Memory Bank!
// =============================================================================

/**
 * 🧠 WHAT THIS FILE DOES:
 * This file is like the "memory bank" of our aviation training app. It handles
 * saving and loading information to/from the browser's storage, such as:
 * - User settings and preferences (like how many ex  // 📊 Return comprehensive statistics
  return {
    totalSessions,            // 🎯 How many sessions they've completed
    totalExercises,           // 📊 How many exercises they've attempted
    totalScore,               // 🏆 Total points earned across all sessions
    averageScore,             // 📈 Average performance percentage
    bestScore: bestSession.totalScore,        // 🌟 Highest raw score ever achieved
    bestScorePercentage: bestSession.scorePercentage, // 🎖️ Best percentage ever
    completionRate,           // ✅ Overall success rate across all training
    lastPlayed: history[0]?.completedAt || '', // 📅 When they last completed a session
  };
}; want)
 * - Progress in current training session (so they can continue where they left off)
 * - Completed session statistics (to track their improvement over time)
 * - Session history (a record of all their past training sessions)
 * 
 * Think of it like a really smart filing cabinet that remembers everything!
 */

import { Settings, SavedProgress, ExerciseSession, GamePhase } from './types';

// =============================================================================
// 🗂️ STORAGE KEYS - The Labels on Our Filing Cabinet Drawers
// =============================================================================

/**
 * 🔑 STORAGE KEYS EXPLAINED:
 * These are like labels on filing cabinet drawers. Each one tells the browser
 * where to store different types of information:
 * 
 * 📁 SETTINGS = Where we keep user preferences (like how many exercises they want)
 * 📁 PROGRESS = Where we keep their current session (so they can continue later)
 * 📁 STATISTICS = Where we keep overall performance stats (averages, bests, etc.)
 * 📁 SESSION_HISTORY = Where we keep records of all their completed sessions
 */

// Storage keys - like labels on filing cabinet drawers
const STORAGE_KEYS = {
  SETTINGS: 'atc-ready-settings',           // 🎛️ User preferences and settings
  PROGRESS: 'atc-ready-progress',           // 💾 Current session progress  
  STATISTICS: 'atc-ready-statistics',       // 📊 Overall performance statistics
  SESSION_HISTORY: 'atc-ready-session-history', // 📚 History of completed sessions
} as const;

// =============================================================================
// 🎛️ DEFAULT SETTINGS - Starting Values for New Users
// =============================================================================

/**
 * ⚙️ DEFAULT SETTINGS EXPLAINED:
 * When someone uses our app for the first time, we need to give them some
 * reasonable starting settings. These are like the "factory defaults":
 * 
 * 📊 totalExercises: 10 = A good number for a training session (not too short, not too long)
 * 💾 saveProgress: true = Most people want their progress saved automatically
 */

// Default settings for new users (like "factory defaults")
export const DEFAULT_SETTINGS: Settings = {
  totalExercises: 10,    // 📊 Default to 10 exercises per session (good balance)
  saveProgress: true,    // 💾 Save progress by default (most users want this)
};

// =============================================================================
// 🔍 STORAGE AVAILABILITY CHECKER - Does This Browser Support Storage?
// =============================================================================

/**
 * 🕵️ STORAGE AVAILABILITY CHECK EXPLAINED:
 * Not all browsers or situations support localStorage (like private/incognito mode).
 * This function checks if we can actually save things before we try to!
 * 
 * It works by:
 * 1️⃣ Trying to save a test message
 * 2️⃣ Trying to remove the test message  
 * 3️⃣ If both work, storage is available! ✅
 * 4️⃣ If either fails, storage is not available ❌
 */

// Check if localStorage is available (some browsers/modes don't support it)
function isLocalStorageAvailable(): boolean {
  try {
    const test = '__localStorage_test__';  // 🧪 Test message to try saving
    localStorage.setItem(test, test);      // 💾 Try to save it
    localStorage.removeItem(test);         // 🗑️ Try to remove it
    return true;                          // ✅ Both worked! Storage is available
  } catch {
    return false;                         // ❌ Something failed! Storage not available
  }
}

// =============================================================================
// 🔧 GENERIC STORAGE FUNCTIONS - The Basic Tools for Saving/Loading
// =============================================================================

/**
 * 📖 GET FROM STORAGE FUNCTION EXPLAINED:
 * This function tries to load saved data from browser storage. It's like
 * opening a filing cabinet drawer and looking for a specific document:
 * 
 * 1️⃣ First check if the filing cabinet is available (storage works)
 * 2️⃣ Try to open the drawer and look for the document (get the item)
 * 3️⃣ If we find it, try to read it (parse the JSON)
 * 4️⃣ If anything goes wrong, just use the default value
 * 
 * It's very safe - if anything fails, we always return something sensible!
 */

// Generic function to get data from storage (with safe error handling)
function getFromStorage<T>(key: string, defaultValue: T): T {
  if (!isLocalStorageAvailable()) return defaultValue;  // 🚫 No storage? Use default
  
  try {
    const item = localStorage.getItem(key);              // 🔍 Look for the saved data
    if (item === null) return defaultValue;             // 📭 Nothing found? Use default
    return JSON.parse(item);                            // 📄 Found it! Read and return it
  } catch (error) {
    console.warn(`Failed to parse localStorage item "${key}":`, error); // 🚨 Log the problem
    return defaultValue;                                // 🛡️ Something went wrong? Use default
  }
}

/**
 * 💾 SET TO STORAGE FUNCTION EXPLAINED:
 * This function tries to save data to browser storage. It's like writing
 * on a document and putting it in a filing cabinet drawer:
 * 
 * 1️⃣ First check if the filing cabinet is available (storage works)
 * 2️⃣ Try to write the document (convert data to JSON)
 * 3️⃣ Try to put it in the drawer (save to localStorage)
 * 4️⃣ Return true if it worked, false if it didn't
 * 
 * It returns true/false so the calling code knows if the save worked!
 */

// Generic function to save data to storage (with safe error handling)
function setToStorage<T>(key: string, value: T): boolean {
  if (!isLocalStorageAvailable()) return false;        // 🚫 No storage? Can't save
  
  try {
    localStorage.setItem(key, JSON.stringify(value));   // 💾 Convert to text and save
    return true;                                        // ✅ Success!
  } catch (error) {
    console.warn(`Failed to save to localStorage "${key}":`, error); // 🚨 Log the problem
    return false;                                       // ❌ Something went wrong
  }
}

/**
 * 🗑️ REMOVE FROM STORAGE FUNCTION EXPLAINED:
 * This function tries to delete saved data from browser storage. It's like
 * throwing away a document from the filing cabinet:
 * 
 * 1️⃣ First check if the filing cabinet is available (storage works)
 * 2️⃣ Try to remove the document from the drawer
 * 3️⃣ Return true if it worked, false if it didn't
 * 
 * Even if the document wasn't there, we still return true (successfully "removed")!
 */

// Generic function to remove data from storage (with safe error handling)
function removeFromStorage(key: string): boolean {
  if (!isLocalStorageAvailable()) return false;        // 🚫 No storage? Can't remove
  
  try {
    localStorage.removeItem(key);                       // 🗑️ Remove the saved data
    return true;                                        // ✅ Success (even if it wasn't there)
  } catch (error) {
    console.warn(`Failed to remove from localStorage "${key}":`, error); // 🚨 Log the problem
    return false;                                       // ❌ Something went wrong
  }
}

// =============================================================================
// ⚙️ SETTINGS MANAGEMENT - User Preferences and Configuration  
// =============================================================================

/**
 * 📥 LOAD SETTINGS FUNCTION EXPLAINED:
 * This function gets the user's saved preferences from storage. It's like
 * opening their personal settings file to see how they like things set up:
 * 
 * 🔍 Look for their saved settings in the SETTINGS drawer
 * 📋 If nothing is found, use the default settings instead
 * 
 * This way, new users get good defaults, and returning users get their preferences!
 */

// Load user settings from storage (or use defaults for new users)
export function loadSettings(): Settings {
  return getFromStorage(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS); // 📥 Get settings or defaults
}

/**
 * 💾 SAVE SETTINGS FUNCTION EXPLAINED:
 * This function saves the user's preferences to storage so they're remembered
 * next time they use the app. It's like updating their personal settings file:
 * 
 * 💾 Save their preferences in the SETTINGS drawer
 * ✅ Return true if it worked, false if it didn't
 */

// Save user settings to storage 
export function saveSettings(settings: Settings): boolean {
  return setToStorage(STORAGE_KEYS.SETTINGS, settings); // 💾 Save settings to storage
}

// =============================================================================
// 💾 PROGRESS MANAGEMENT - Saving and Loading Current Training Session
// =============================================================================

/**
 * 📥 LOAD PROGRESS FUNCTION EXPLAINED:
 * This function checks if the user has a training session in progress that
 * they can continue. It's like looking for a bookmark in a book:
 * 
 * 🔍 Look for saved progress in the PROGRESS drawer
 * 📭 If nothing is found, return null (no progress to restore)
 * 📚 If found, return their saved session state
 * 
 * This lets users pick up where they left off if they close the app mid-session!
 */

// Load any saved in-progress session (or null if none exists)
export function loadProgress(): SavedProgress | null {
  return getFromStorage<SavedProgress | null>(STORAGE_KEYS.PROGRESS, null); // 📥 Get progress or null
}

/**
 * 💾 SAVE PROGRESS FUNCTION EXPLAINED:
 * This function saves the user's current training session so they can continue
 * later if they close the app. It's like putting a bookmark in their book:
 * 
 * 📊 Bundle up all their current session information:
 *     - Which exercise they're on
 *     - Their scores so far  
 *     - What screen they're looking at
 *     - Whether answers/details are showing
 * 💾 Save it all in the PROGRESS drawer
 * 
 * Next time they open the app, they can continue right where they left off!
 */

// Save current session progress so user can continue later
export function saveProgress(
  session: ExerciseSession,        // 📊 Their current training session
  gamePhase: GamePhase,           // 🎮 What screen they're on
  showAnswer: boolean,            // 👁️ Whether answer is showing
  showDetails: boolean            // 📖 Whether details are showing
): boolean {
  const progress: SavedProgress = {
    session: {
      ...session,                 // 📋 Copy all session info
      startTime: session.startTime, // ⏰ Ensure Date objects are handled properly
    },
    gamePhase,                    // 🎮 What screen they were on
    showAnswer,                   // 👁️ Whether answer was showing
    showDetails,                  // 📖 Whether details were showing
    savedAt: new Date().toISOString(), // 📅 When we saved this (for debugging)
  };
  
  return setToStorage(STORAGE_KEYS.PROGRESS, progress); // 💾 Save the progress bundle
}

/**
 * 🗑️ CLEAR PROGRESS FUNCTION EXPLAINED:
 * This function removes any saved training session progress. It's like
 * removing the bookmark from their book:
 * 
 * 🗑️ Delete whatever is in the PROGRESS drawer
 * ✅ Return true if it worked, false if it didn't
 * 
 * We do this when they finish a session or start a completely new one!
 */

// Remove any saved progress (when session ends or user starts fresh)
export function clearProgress(): boolean {
  return removeFromStorage(STORAGE_KEYS.PROGRESS); // 🗑️ Remove saved progress
}

/**
 * 🔍 MEANINGFUL PROGRESS CHECKER EXPLAINED:
 * This function decides if saved progress is worth restoring. It's like
 * checking if a bookmark is actually useful:
 * 
 * 🚫 If no progress is saved → Not meaningful
 * 🚦 If they're still on start screen → Not meaningful (they just opened the app)
 * 🏁 If they're on end screen → Not meaningful (they already finished)
 * 📝 If they haven't scored anything → Not meaningful (no real progress)
 * ✅ Otherwise → Meaningful! They were in the middle of training
 * 
 * This prevents us from "restoring" progress when someone just opened the app!
 */

// Check if saved progress is worth restoring (user actually made progress)
export function hasMeaningfulProgress(progress: SavedProgress | null): boolean {
  if (!progress) return false;                     // 🚫 No progress saved
  
  return progress.gamePhase !== 'start' &&        // 🚦 Not just on start screen
         progress.gamePhase !== 'end' &&          // 🏁 Not already finished
         progress.session.scores.length > 0;      // 📝 Actually attempted some exercises
}

// =============================================================================
// 📊 SESSION HISTORY AND STATISTICS - Tracking Long-Term Performance
// =============================================================================

/**
 * 📈 STATISTICS INTERFACES EXPLAINED:
 * These define the shape of data we track about user performance over time:
 * 
 * 📊 SessionStats = Overall statistics across all sessions
 * 📝 CompletedSession = Record of one finished training session
 * 
 * It's like keeping a gradebook with both individual test scores
 * and overall class performance!
 */

// Overall statistics across all completed sessions
export interface SessionStats {
  totalSessions: number;        // 🎯 How many training sessions completed
  totalExercises: number;       // 📊 How many individual exercises attempted
  totalScore: number;           // 🏆 Sum of all points earned
  averageScore: number;         // 📈 Average performance percentage  
  bestScore: number;            // 🌟 Highest raw score achieved
  bestScorePercentage: number;  // 🎖️ Best performance percentage
  completionRate: number;       // ✅ Overall success rate percentage
  lastPlayed: string;           // 📅 When they last completed a session
}

// Record of one completed training session
export interface CompletedSession {
  id: string;                   // 🆔 Unique identifier for this session
  totalScore: number;           // 🏆 Points earned in this session
  maxPossibleScore: number;     // 🎯 Maximum points possible
  exercisesCompleted: number;   // ✅ How many exercises they finished
  totalExercises: number;       // 📊 How many exercises were in the session
  scorePercentage: number;      // 📈 Performance percentage for this session
  duration: number; // in minutes // ⏱️ How long the session took
  completedAt: string;          // 📅 When they finished this session
  scores: Array<{              // 📝 Detailed record of each exercise:
    option: string;             //   What they rated themselves (Perfect/Good/etc.)
    points: number;             //   How many points they earned  
    timestamp: string;          //   When they submitted this answer
  }>;
}

/**
 * 📥 LOAD SESSION HISTORY EXPLAINED:
 * This function gets the list of all completed training sessions. It's like
 * opening a gradebook to see all past test scores:
 * 
 * 🔍 Look in the SESSION_HISTORY drawer for saved sessions
 * 📚 If nothing found, return empty list (new user, no history yet)
 * 📊 If found, return the complete history of their training
 */

// Load complete history of finished training sessions
export function loadSessionHistory(): CompletedSession[] {
  return getFromStorage<CompletedSession[]>(STORAGE_KEYS.SESSION_HISTORY, []); // 📥 Get history or empty list
}

/**
 * 💾 SAVE COMPLETED SESSION EXPLAINED:
 * When a user finishes a training session, we save a detailed record of their
 * performance. It's like recording a test score in the gradebook:
 * 
 * 📊 Calculate important statistics:
 *     - How long the session took
 *     - What percentage they scored
 *     - How many exercises they completed
 * 📝 Create a detailed session record with all their scores
 * 📚 Add it to their history (keeping only last 50 to save space)
 * 💾 Save the updated history
 * 
 * This creates a permanent record they can look back on to track improvement!
 */

// Save a completed training session to the user's permanent history
export function saveCompletedSession(session: ExerciseSession): boolean {
  const history = loadSessionHistory();                    // 📚 Get existing history
  const maxPossibleScore = session.totalExercises * 3;    // 🎯 Calculate max possible (3 points per exercise)
  const completedExercises = session.scores.filter(s => s.option !== 'again').length; // ✅ Count non-retries
  const duration = Math.round((new Date().getTime() - session.startTime.getTime()) / 60000); // ⏱️ Calculate minutes
  
  // 📝 Create detailed record of this completed session
  const completedSession: CompletedSession = {
    id: Date.now().toString(),                            // 🆔 Unique ID based on timestamp
    totalScore: session.totalScore,                       // 🏆 Points they earned
    maxPossibleScore,                                     // 🎯 Maximum points possible
    exercisesCompleted: completedExercises,               // ✅ Exercises they completed
    totalExercises: session.totalExercises,               // 📊 Total exercises in session
    scorePercentage: (session.totalScore / maxPossibleScore) * 100, // 📈 Performance percentage
    duration,                                             // ⏱️ How long it took (minutes)
    completedAt: new Date().toISOString(),                // 📅 When they finished
    scores: session.scores.map(score => ({               // 📝 Convert scores to saveable format
      option: score.option,                               //   Their self-assessment
      points: score.points,                               //   Points earned
      timestamp: score.timestamp.toISOString(),           //   When they submitted it
    })),
  };
  
  // 📚 Add to history but keep storage manageable (last 50 sessions only)
  const updatedHistory = [completedSession, ...history].slice(0, 50);
  
  return setToStorage(STORAGE_KEYS.SESSION_HISTORY, updatedHistory); // 💾 Save updated history
}

/**
 * 📊 GET SESSION STATISTICS EXPLAINED:
 * This function calculates overall performance statistics across all completed
 * sessions. It's like calculating a semester grade from all test scores:
 * 
 * 📚 Load the complete session history
 * 🔢 If no history exists, return zeros for everything
 * 🧮 Otherwise, calculate:
 *     - Total sessions completed
 *     - Average performance
 *     - Best performance ever
 *     - Overall completion rate
 *     - When they last played
 * 
 * This gives users insight into their long-term progress and improvement!
 */

// Calculate comprehensive statistics across all completed sessions
export function getSessionStatistics(): SessionStats {
  const history = loadSessionHistory();                    // 📚 Get complete session history
  
  // 🚫 If no sessions completed yet, return empty statistics
  if (history.length === 0) {
    return {
      totalSessions: 0,         // 🎯 No sessions yet
      totalExercises: 0,        // 📊 No exercises attempted
      totalScore: 0,            // 🏆 No points earned
      averageScore: 0,          // 📈 No average yet
      bestScore: 0,             // 🌟 No best score yet
      bestScorePercentage: 0,   // 🎖️ No best percentage yet
      completionRate: 0,        // ✅ No completion rate yet
      lastPlayed: '',           // 📅 Never played before
    };
  }
  
  // 🧮 Calculate statistics from all sessions
  const totalSessions = history.length;                    // 🎯 Count of completed sessions
  const totalExercises = history.reduce((sum, session) => sum + session.exercisesCompleted, 0); // 📊 Total exercises
  const totalScore = history.reduce((sum, session) => sum + session.totalScore, 0); // 🏆 Total points earned
  const totalPossibleScore = history.reduce((sum, session) => sum + session.maxPossibleScore, 0); // 🎯 Total possible points
  
  // 🌟 Find their best session ever
  const bestSession = history.reduce((best, current) => 
    current.scorePercentage > best.scorePercentage ? current : best
  );
  
  // 📈 Calculate averages and rates
  const averageScore = totalSessions > 0 ? (totalScore / totalSessions / (totalPossibleScore / totalSessions)) * 100 : 0;
  const completionRate = totalPossibleScore > 0 ? (totalScore / totalPossibleScore) * 100 : 0;
  
  // 📊 Return comprehensive statistics
  return {
    totalSessions,            // 🎯 How many sessions they've completed
    totalExercises,           // 📊 How many exercises they've attempted
    totalScore,
    averageScore,
    bestScore: bestSession.totalScore,
    bestScorePercentage: bestSession.scorePercentage,
    completionRate,
    lastPlayed: history[0]?.completedAt || '',
  };
}
