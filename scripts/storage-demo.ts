// Demonstration script for local storage functionality
// This file shows how the local storage system works

import { 
  loadSettings, 
  saveSettings, 
  loadProgress, 
  saveProgress, 
  saveCompletedSession,
  getSessionStatistics,
  loadSessionHistory,
  DEFAULT_SETTINGS 
} from '../lib/storage';
import { AssessmentOption } from '../lib/types';

// Example: Testing settings
console.log('=== SETTINGS DEMO ===');

// Load default settings
const currentSettings = loadSettings();
console.log('Current settings:', currentSettings);

// Update settings
const newSettings = {
  ...currentSettings,
  totalExercises: 15,
  soundEnabled: false,
  saveProgress: true
};
const saved = saveSettings(newSettings);
console.log('Settings saved:', saved);

// Verify settings were saved
const loadedSettings = loadSettings();
console.log('Loaded settings after save:', loadedSettings);

// Example: Testing progress
console.log('\n=== PROGRESS DEMO ===');

// Create example session data
const exampleSession = {
  currentExercise: 3,
  totalExercises: 10,
  scores: [
    { option: 'correct' as AssessmentOption, points: 3, timestamp: new Date() },
    { option: 'almost' as AssessmentOption, points: 2, timestamp: new Date() },
  ],
  totalScore: 5,
  startTime: new Date(Date.now() - 300000), // 5 minutes ago
};

// Save progress
const progressSaved = saveProgress(exampleSession, 'exercise', false, false);
console.log('Progress saved:', progressSaved);

// Load progress
const loadedProgress = loadProgress();
console.log('Loaded progress:', loadedProgress);

// Example: Testing session completion
console.log('\n=== SESSION COMPLETION DEMO ===');

// Complete the session
const completedSession = {
  ...exampleSession,
  currentExercise: 10,
  scores: [
    ...exampleSession.scores,
    { option: 'hard' as AssessmentOption, points: 1, timestamp: new Date() },
    { option: 'correct' as AssessmentOption, points: 3, timestamp: new Date() },
    { option: 'almost' as AssessmentOption, points: 2, timestamp: new Date() },
    { option: 'correct' as AssessmentOption, points: 3, timestamp: new Date() },
    { option: 'again' as AssessmentOption, points: 0, timestamp: new Date() },
    { option: 'correct' as AssessmentOption, points: 3, timestamp: new Date() },
    { option: 'almost' as AssessmentOption, points: 2, timestamp: new Date() },
    { option: 'hard' as AssessmentOption, points: 1, timestamp: new Date() },
  ],
  totalScore: 20,
};

// Save completed session
const sessionSaved = saveCompletedSession(completedSession);
console.log('Completed session saved:', sessionSaved);

// Get statistics
const stats = getSessionStatistics();
console.log('Session statistics:', stats);

// Get session history
const history = loadSessionHistory();
console.log('Session history:', history);

// Example: Feature descriptions
console.log('\n=== FEATURES OVERVIEW ===');
console.log(`
✅ Local Storage Features Implemented:

📊 SETTINGS MANAGEMENT:
- Exercises per session (5, 10, 15, 20)
- Save progress toggle
- Show hints toggle
- Auto advance toggle
- Sound effects toggle
- Dark mode toggle (prepared for future)

💾 PROGRESS SAVING:
- Automatic save during exercises
- Restore progress on app restart
- Progress prompt for user choice
- Clear progress when session ends

📈 SESSION TRACKING:
- Complete session history (last 50 sessions)
- Detailed statistics:
  - Total sessions completed
  - Total exercises completed
  - Average score per session
  - Best score and percentage
  - Overall completion rate
  - Last played date

🔧 DATA MANAGEMENT:
- Export all user data as JSON
- Import user data from backup
- Reset all data functionality
- Automatic localStorage availability detection

🎨 USER INTERFACE:
- Settings modal with tabs (General, Statistics, Data)
- Progress restoration prompt
- Settings button with progress indicator
- Statistics dashboard with visual metrics

🛡️ ERROR HANDLING:
- Graceful fallback when localStorage unavailable
- JSON parsing error handling
- Storage quota exceeded handling
- Data validation and sanitization

The system automatically:
- Saves settings immediately when changed
- Saves progress after each action (if enabled)
- Saves completed sessions for statistics
- Loads saved data on app startup
- Handles Date object serialization/deserialization
- Maintains storage size by limiting session history
`);

export {};
