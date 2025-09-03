"use client";

import { useState, useEffect } from "react";
import { generateExercise, Exercise } from "../lib/generator";
import { useAppState } from "../lib/useAppState";
import { ASSESSMENT_BUTTONS } from "../lib/types";
import TrafficInfo from "../components/TrafficInfo";

export default function HomePage() {
  const { state, actions, computed } = useAppState();
  const [currentExercise, setCurrentExercise] = useState<Exercise>(() => generateExercise());

  // Generate new exercise when moving to next exercise or retrying
  useEffect(() => {
    if (state.gamePhase === 'exercise') {
      setCurrentExercise(generateExercise());
    }
  }, [state.session.currentExercise, state.gamePhase]);

  // Render different phases of the application
  switch (state.gamePhase) {
    case 'start':
      return <StartScreen onStart={actions.startSession} />;
    
    case 'exercise':
    case 'assessment':
      return (
        <ExerciseScreen
          exercise={currentExercise}
          state={state}
          actions={actions}
          computed={computed}
        />
      );
    
    case 'end':
      return (
        <EndScreen
          session={state.session}
          computed={computed}
          onRestart={actions.resetSession}
        />
      );
    
    default:
      return null;
  }
}

// Start Screen Component
function StartScreen({ onStart }: { onStart: () => void }) {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-custom-bg">
      <div className="text-center max-w-md">
        <h1 className="text-3xl font-bold mb-4 text-custom-fg">
          ATC Ready
        </h1>
        <p className="text-lg mb-8 text-gray-700">
          Practice giving traffic information with realistic radar scenarios. 
          Complete 10 exercises and track your progress.
        </p>
        <button
          onClick={onStart}
          className="w-full px-8 py-4 bg-black text-white rounded-[10px] font-semibold text-lg hover:bg-gray-800 transition-colors"
        >
          Start First Exercise
        </button>
      </div>
    </main>
  );
}

// Exercise Screen Component
function ExerciseScreen({ 
  exercise, 
  state, 
  actions, 
  computed 
}: {
  exercise: Exercise;
  state: any;
  actions: any;
  computed: any;
}) {
  return (
    <main className="min-h-screen flex flex-col p-4 max-w-md mx-auto">
      {/* Progress Header - Compact */}
      <div className="mb-3 text-center">
        <div className="text-sm text-gray-600 mb-1">
          Exercise {state.session.currentExercise} of {state.session.totalExercises}
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5 mb-3">
          <div 
            className="bg-black h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${computed.progressPercentage}%` }}
          />
        </div>
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

      {/* Button Section - Compact and always visible */}
      <div className="space-y-2 pb-4">
        {state.gamePhase === 'exercise' ? (
          // Show Answer Button
          <button
            onClick={actions.showAnswer}
            className="block w-full max-w-[380px] mx-auto px-5 py-3 bg-black text-white border-0 rounded-[10px] font-semibold"
          >
            Show Answer
          </button>
        ) : (
          // Assessment Buttons
          <>
            <button
              onClick={actions.toggleDetails}
              className="block w-full max-w-[380px] mx-auto px-5 py-2 bg-gray-200 text-gray-800 border-0 rounded-[10px] font-medium text-sm mb-3"
            >
              {state.showDetails ? 'Hide Details' : 'Show Details'}
            </button>
            
            <div className="grid grid-cols-2 gap-2 max-w-[380px] mx-auto">
              {ASSESSMENT_BUTTONS.map((button) => (
                <button
                  key={button.option}
                  onClick={() => actions.submitAssessment(button.option)}
                  className={`px-3 py-2.5 rounded-[10px] font-semibold text-white transition-colors ${
                    button.color === 'green' ? 'bg-green-600 hover:bg-green-700' :
                    button.color === 'yellow' ? 'bg-yellow-500 hover:bg-yellow-600' :
                    button.color === 'orange' ? 'bg-orange-500 hover:bg-orange-600' :
                    'bg-red-500 hover:bg-red-600'
                  }`}
                >
                  <div className="text-sm">{button.label}</div>
                  <div className="text-xs opacity-90">{button.description}</div>
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
  onRestart 
}: {
  session: any;
  computed: any;
  onRestart: () => void;
}) {
  const maxPossibleScore = session.totalExercises * 3; // 3 points per exercise
  const scorePercentage = (session.totalScore / maxPossibleScore) * 100;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4">
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
