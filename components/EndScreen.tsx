import { Settings as SettingsType, ExerciseSession } from "../lib/types";
import SettingsButton from "./SettingsButton";

interface EndScreenProps {
  session: ExerciseSession;
  computed: {
    isLastExercise: boolean;
    progressPercentage: number;
    averageScore: number;
    completedExercises: number;
  };
  onRestart: () => void;
  settings: SettingsType;
  onUpdateSettings: (settings: Partial<SettingsType>) => void;
}

export default function EndScreen({ 
  session, 
  computed, 
  onRestart,
  settings,
  onUpdateSettings
}: EndScreenProps) {
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
            <div>Average Score: {computed.averageScore.toFixed(1)}%</div>
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