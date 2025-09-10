"use client";

import { useState, useEffect } from "react";
import { generateExercise, Exercise } from "../lib/generator";
import { useAppState } from "../lib/useAppState";
import { ASSESSMENT_BUTTONS, Settings as SettingsType } from "../lib/types";
import { loadProgress, clearProgress, hasMeaningfulProgress } from "../lib/storage";
import TrafficInfo from "../components/TrafficInfo";
import SettingsButton from "../components/SettingsButton";
import ProgressPrompt from "../components/ProgressPrompt";

export default function HomePage() {
  const { state, actions, computed } = useAppState();
  const [currentExercise, setCurrentExercise] = useState<Exercise>(() => generateExercise());
  const [hasProgress, setHasProgress] = useState(false);
  const [showProgressPrompt, setShowProgressPrompt] = useState(false);
  const [savedProgressData, setSavedProgressData] = useState<any>(null);

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
  }, [state.session.currentExercise]); // Removed state.gamePhase dependency

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
      {(() => {
        switch (state.gamePhase) {
          case 'start':
            return <StartScreen onStart={actions.startSession} settings={state.settings} onUpdateSettings={actions.updateSettings} hasProgress={hasProgress} />;
          
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
      })()}
    </>
  );
}

// Start Screen Component
function StartScreen({ onStart, settings, onUpdateSettings, hasProgress }: { 
  onStart: () => void;
  settings: SettingsType;
  onUpdateSettings: (settings: Partial<SettingsType>) => void;
  hasProgress: boolean;
}) {
  return (
    <main className="h-[100dvh] flex flex-col items-center justify-center p-4 bg-custom-bg">
      {/* Settings Button */}
      <div className="absolute top-4 right-4">
        <SettingsButton 
          settings={settings} 
          onUpdateSettings={onUpdateSettings}
          hasProgress={hasProgress}
        />
      </div>

      <div className="text-center max-w-md">
        <h1 className="text-3xl font-bold mb-4 text-custom-fg">
          ATC Ready
        </h1>
        <p className="text-lg mb-8 text-gray-700">
          Practice giving traffic information with realistic radar scenarios. 
          Complete {settings.totalExercises} exercises and track your progress.
        </p>
        <button
          onClick={onStart}
          className="w-full px-8 py-4 bg-black text-white rounded-[10px] font-semibold text-lg hover:bg-gray-800 transition-colors"
        >
          Start First Exercise
        </button>
        
        {hasProgress && settings.saveProgress && (
          <p className="text-sm text-gray-600 mt-3">
            You have saved progress that will be restored
          </p>
        )}
      </div>
    </main>
  );
}

// Exercise Screen Component
function ExerciseScreen({ 
  exercise, 
  state, 
  actions, 
  computed,
  settings,
  onUpdateSettings
}: {
  exercise: Exercise;
  state: any;
  actions: any;
  computed: any;
  settings: SettingsType;
  onUpdateSettings: (settings: Partial<SettingsType>) => void;
}) {
  return (
    <main className="h-[100dvh] flex flex-col p-4 max-w-md mx-auto">
      {/* Header with Settings */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex-1">
          <div className="text-sm text-gray-600 mb-1">
            Exercise {state.session.currentExercise} of {state.session.totalExercises}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div 
              className="bg-black h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${computed.progressPercentage}%` }}
            />
          </div>
        </div>
        <div className="ml-4">
          <SettingsButton 
            settings={settings} 
            onUpdateSettings={onUpdateSettings}
            hasProgress={true}
          />
        </div>
      </div>

      {/* Exercise Title */}
      <div className="text-center mb-3">
        <h3 className="text-lg font-medium">
          Give traffic information to {exercise.target.callsign}
        </h3>
      </div>

      {/* Radar Display - More compact */}
      <div className="flex-1 flex items-center justify-center py-2">
        <div className="w-full max-w-[380px] aspect-square">
          <TrafficInfo exercise={exercise} />
        </div>
      </div>

      {/* Answer Section - Compact */}
      {state.showAnswer && (
        <div className="mb-3 text-center">
          <div className="font-semibold mb-2 text-base">
            {exercise.solution}
          </div>
          
          {state.showDetails && (
            <div className="text-sm text-gray-600 text-left max-w-[380px] mx-auto p-3 bg-gray-100 rounded-lg">
              <div><strong>Scenario Details:</strong></div>
              <div>• Target: {exercise.target.callsign} ({exercise.target.flightRule}) - {exercise.target.type.name}</div>
              <div>• Level: {exercise.target.level}ft, Speed: {exercise.target.speed}kts, Heading: {exercise.target.heading}°</div>
              <div>• Intruder: {exercise.intruder.callsign} ({exercise.intruder.flightRule}) - {exercise.intruder.type.name}</div>
              <div>• Level: {exercise.intruder.level}ft{exercise.intruder.levelChange ? ` → ${exercise.intruder.levelChange.dir}${exercise.intruder.levelChange.to}ft` : ''}</div>
              <div>• Speed: {exercise.intruder.speed}kts, Heading: {exercise.intruder.heading}°</div>
              <div>• Direction: {exercise.situation.direction}</div>
              <div>• Clock/Distance: {exercise.situation.clock} o'clock, {exercise.situation.distance} miles</div>
              {exercise.intruder.isMil && <div>• Military aircraft (10% chance when target VFR)</div>}
            </div>
          )}
        </div>
      )}

      {/* Button Section - Fixed height to prevent layout shifts */}
      <div className="space-y-2 pb-4" style={{ minHeight: '120px' }}>
        {state.gamePhase === 'exercise' ? (
          // Show Answer and Next Exercise Buttons
          <div className="space-y-2">
            <button
              onClick={actions.showAnswer}
              className="block w-full max-w-[380px] mx-auto px-5 py-3 bg-black text-white border-0 rounded-[10px] font-semibold"
            >
              Show Answer
            </button>
            
            <button
              onClick={actions.nextExercise}
              className="block w-full max-w-[380px] mx-auto px-5 py-2 bg-white text-black border-2 border-black rounded-[10px] font-medium hover:bg-gray-100 transition-colors"
            >
              Next Exercise
            </button>
          </div>
        ) : (
          // Assessment Buttons only
          <>
            <div className="grid grid-cols-2 gap-2 max-w-[380px] mx-auto mb-3">
              {ASSESSMENT_BUTTONS.map((button) => (
                <button
                  key={button.option}
                  onClick={() => actions.submitAssessment(button.option)}
                  className={`px-3 py-2.5 rounded-[10px] font-medium text-white transition-colors ${
                    button.color === 'green' ? 'hover:bg-green-600' :
                    button.color === 'yellow' ? 'hover:bg-yellow-600' :
                    button.color === 'orange' ? 'hover:bg-orange-600' :
                    'hover:bg-red-500'
                  }`}
                  style={{
                    backgroundColor: button.color === 'green' ? '#4CAF50' :
                                   button.color === 'yellow' ? '#FFC107' :
                                   button.color === 'orange' ? '#FF9800' :
                                   '#F44336'
                  }}
                >
                  <div className="text-sm font-medium">{button.label}</div>
                  <div className="text-xs opacity-90 font-light">{button.description}</div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}

// End Screen Component
function EndScreen({ 
  session, 
  computed, 
  onRestart,
  settings,
  onUpdateSettings
}: {
  session: any;
  computed: any;
  onRestart: () => void;
  settings: SettingsType;
  onUpdateSettings: (settings: Partial<SettingsType>) => void;
}) {
  const maxPossibleScore = session.totalExercises * 3; // 3 points per exercise
  const scorePercentage = (session.totalScore / maxPossibleScore) * 100;

  return (
    <main className="h-[100dvh] flex flex-col items-center justify-center p-4">
      {/* Settings Button */}
      <div className="absolute top-4 right-4">
        <SettingsButton 
          settings={settings} 
          onUpdateSettings={onUpdateSettings}
          hasProgress={false}
        />
      </div>

      <div className="text-center max-w-md">
        <h1 className="text-3xl font-bold mb-6">Session Complete!</h1>
        
        <div className="bg-gray-100 rounded-lg p-6 mb-6">
          <div className="text-4xl font-bold mb-2">{session.totalScore}/{maxPossibleScore}</div>
          <div className="text-lg text-gray-600 mb-4">{scorePercentage.toFixed(1)}% Score</div>
          
          <div className="space-y-2 text-sm">
            <div>Exercises Completed: {computed.completedExercises}/{session.totalExercises}</div>
            <div>Average Score: {computed.averageScore.toFixed(1)} points</div>
            <div>Session Duration: {Math.round((new Date().getTime() - session.startTime.getTime()) / 60000)} minutes</div>
          </div>
        </div>

        <button
          onClick={onRestart}
          className="w-full px-8 py-4 bg-black text-white rounded-[10px] font-semibold text-lg hover:bg-gray-800 transition-colors"
        >
          Start Over
        </button>
      </div>
    </main>
  );
}
