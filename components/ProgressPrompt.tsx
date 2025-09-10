"use client";

import { SavedProgress } from '../lib/types';

interface ProgressPromptProps {
  savedProgress: SavedProgress;
  onRestore: () => void;
  onDiscard: () => void;
}

export default function ProgressPrompt({ savedProgress, onRestore, onDiscard }: ProgressPromptProps) {
  const savedDate = new Date(savedProgress.savedAt);
  const exerciseText = `Exercise ${savedProgress.session.currentExercise} of ${savedProgress.session.totalExercises}`;
  const scoreText = `${savedProgress.session.totalScore} points`;

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 z-50" style={{
      backgroundColor: 'rgba(0, 0, 0, 0.2)',
      backdropFilter: 'blur(4px)',
      WebkitBackdropFilter: 'blur(4px)'
    }}>
      <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-2xl">
        <h2 className="text-xl font-bold mb-4">Restore Progress?</h2>
        
        <div className="mb-6">
          <p className="text-gray-700 mb-3">
            You have saved progress from {savedDate.toLocaleDateString()} at {savedDate.toLocaleTimeString()}.
          </p>
          
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Progress:</span>
              <span className="text-sm font-medium">{exerciseText}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Score:</span>
              <span className="text-sm font-medium">{scoreText}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Phase:</span>
              <span className="text-sm font-medium capitalize">{savedProgress.gamePhase}</span>
            </div>
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onRestore}
            className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 font-medium"
          >
            Restore Progress
          </button>
          <button
            onClick={onDiscard}
            className="flex-1 px-4 py-2 bg-white text-black border-2 border-black rounded-lg hover:bg-gray-100 font-medium"
          >
            Start Fresh
          </button>
        </div>
      </div>
    </div>
  );
}
