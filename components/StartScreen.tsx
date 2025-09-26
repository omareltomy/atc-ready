import Image from "next/image";
import { Settings as SettingsType } from "../lib/types";
import SettingsButton from "./SettingsButton";
import InfoTooltip from "./InfoTooltip";

interface StartScreenProps {
  onStart: () => void;
  settings: SettingsType;
  onUpdateSettings: (settings: Partial<SettingsType>) => void;
  hasProgress: boolean;
}

export default function StartScreen({ 
  onStart, 
  settings, 
  onUpdateSettings, 
  hasProgress 
}: StartScreenProps) {
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
        <div className="mb-4 flex justify-center">
          <Image 
            src="/images/logo.svg" 
            alt="ATC Ready" 
            width={240} 
            height={80}
            priority
          />
        </div>
        <div className="mb-8">
          <div className="flex items-start justify-center">
            <p className="text-lg text-gray-700">
              Practice giving traffic information with realistic radar scenarios. 
              Complete {settings.totalExercises} exercises and track your progress.
            </p>
            <InfoTooltip 
              content={`About this exercise
You'll practice giving traffic information in the standard format:
Traffic, [clock position], [distance], [direction], [level], [other information]

How to proceed:
• A radar scenario will be shown.
• Analyse the traffic and state the information out loud.
• Compare with the model answer and self-assess.

Example:
"Traffic, 10 o'clock, 4 miles, crossing left to right, 1000 feet above, A320"`}
            />
          </div>
        </div>
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