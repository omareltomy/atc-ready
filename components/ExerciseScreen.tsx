import { Exercise, AppState, AssessmentOption, Settings as SettingsType } from "../lib/types";
import { ASSESSMENT_BUTTONS } from "../lib/types";
import TrafficInfo from "./TrafficInfo";
import SettingsButton from "./SettingsButton";

interface ExerciseScreenProps {
  exercise: Exercise;
  state: AppState;
  actions: {
    showAnswer: () => void;
    hideAnswer: () => void;
    toggleDetails: () => void;
    submitAssessment: (option: AssessmentOption) => void;
    nextExercise: () => void;
    retryExercise: () => void;
    endSession: () => void;
    resetSession: () => void;
    updateSettings: (settings: Partial<SettingsType>) => void;
  };
  computed: {
    isLastExercise: boolean;
    progressPercentage: number;
    averageScore: number;
    completedExercises: number;
  };
  settings: SettingsType;
  onUpdateSettings: (settings: Partial<SettingsType>) => void;
}

export default function ExerciseScreen({ 
  exercise, 
  state, 
  actions, 
  computed,
  settings,
  onUpdateSettings
}: ExerciseScreenProps) {
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
      <div className="flex items-center justify-center py-2">
        <div className="w-full max-w-[380px] aspect-square">
          <TrafficInfo exercise={exercise} />
        </div>
      </div>

      {/* Answer Section - Fixed height to prevent layout shifts */}
      <div className="text-center" style={{ minHeight: state.showAnswer ? 'auto' : '60px' }}>
        {state.showAnswer && (
          <>
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
                <div>• Clock/Distance: {exercise.situation.clock} o&apos;clock, {exercise.situation.distance} miles</div>
                {exercise.intruder.isMil && <div>• Military aircraft (10% chance when target VFR)</div>}
              </div>
            )}
          </>
        )}
      </div>

      {/* Button Section - Fixed height to prevent layout shifts */}
      <div className="space-y-2 pb-4 mt-4" style={{ minHeight: '120px' }}>
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