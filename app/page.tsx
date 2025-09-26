"use client";
import { useState, useEffect } from "react";
import { generateExercise } from "../lib/generator";
import { Exercise, SavedProgress } from "../lib/types";
import { useAppState } from "../lib/useAppState";
import { loadProgress, clearProgress, hasMeaningfulProgress } from "../lib/storage";
import ProgressPrompt from "../components/ProgressPrompt";
import StartScreen from "../components/StartScreen";
import ExerciseScreen from "../components/ExerciseScreen";
import EndScreen from "../components/EndScreen";

export default function HomePage() {
  const { state, actions, computed } = useAppState();
  const [currentExercise, setCurrentExercise] = useState<Exercise>(() => generateExercise());
  const [hasProgress, setHasProgress] = useState(false);
  const [showProgressPrompt, setShowProgressPrompt] = useState(false);
  const [savedProgressData, setSavedProgressData] = useState<SavedProgress | null>(null);

  // Check for saved progress on mount
  useEffect(() => {
    const savedProgress = loadProgress();
    if (hasMeaningfulProgress(savedProgress) &&
        state.settings.saveProgress &&
        state.gamePhase === 'start') {
      setSavedProgressData(savedProgress);
      setShowProgressPrompt(true);
    }
    setHasProgress(hasMeaningfulProgress(savedProgress));
  }, [state.settings.saveProgress, state.gamePhase]);

  // Generate new exercise when moving to next exercise, but NOT when retrying same exercise
  useEffect(() => {
    if (state.gamePhase === 'exercise') {
      // Only generate new exercise when currentExercise number changes (not when retrying)
      setCurrentExercise(generateExercise());
    }
  }, [state.session.currentExercise, state.gamePhase]); // Added state.gamePhase dependency

  // Update progress indicator
  useEffect(() => {
    setHasProgress(state.gamePhase !== 'start' && state.gamePhase !== 'end' && state.session.scores.length > 0);
  }, [state.gamePhase, state.session.scores]);

  const handleRestoreProgress = () => {
    if (savedProgressData) {
      // The restoration will happen automatically through useAppState
      setShowProgressPrompt(false);
      setSavedProgressData(null);
    }
  };

  const handleDiscardProgress = () => {
    clearProgress();
    actions.resetSession(); // Reset the session state to start
    setShowProgressPrompt(false);
    setSavedProgressData(null);
    setHasProgress(false);
  };

  // Render the current screen based on game phase
  const renderCurrentScreen = () => {
    switch (state.gamePhase) {
      case 'start':
        return (
          <StartScreen 
            onStart={actions.startSession} 
            settings={state.settings} 
            onUpdateSettings={actions.updateSettings} 
            hasProgress={hasProgress} 
          />
        );
      
      case 'exercise':
      case 'assessment':
        return (
          <ExerciseScreen
            exercise={currentExercise}
            state={state}
            actions={actions}
            computed={computed}
            settings={state.settings}
            onUpdateSettings={actions.updateSettings}
          />
        );
      
      case 'end':
        return (
          <EndScreen
            session={state.session}
            computed={computed}
            onRestart={actions.resetSession}
            settings={state.settings}
            onUpdateSettings={actions.updateSettings}
          />
        );
      
      default:
        return null;
    }
  };

  // Render different phases of the application
  return (
    <>
      {/* Progress Restoration Prompt */}
      {showProgressPrompt && savedProgressData && (
        <ProgressPrompt
          savedProgress={savedProgressData}
          onRestore={handleRestoreProgress}
          onDiscard={handleDiscardProgress}
        />
      )}

      {/* Main App Content */}
      {renderCurrentScreen()}
    </>
  );
}