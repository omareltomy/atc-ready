"use client";

import { useState, useEffect, useRef } from 'react';
import { Settings as SettingsType } from '../lib/types';
import { getSessionStatistics } from '../lib/storage';

interface SettingsProps {
  settings: SettingsType;
  onUpdateSettings: (settings: Partial<SettingsType>) => void;
  onClose: () => void;
}

export default function Settings({ settings, onUpdateSettings, onClose }: SettingsProps) {
  const [activeTab, setActiveTab] = useState<'general' | 'stats'>('general');
  const modalRef = useRef<HTMLDivElement>(null);

  const stats = getSessionStatistics();

  // Handle click outside to close modal
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Never';
    
    const lastPlayed = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - lastPlayed.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return '1 day ago';
    return `${diffDays} days ago`;
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 z-50" style={{
      backgroundColor: 'rgba(0, 0, 0, 0.2)',
      backdropFilter: 'blur(4px)',
      WebkitBackdropFilter: 'blur(4px)'
    }}>
      <div className="bg-white rounded-lg max-w-md w-full shadow-2xl max-h-[90vh] flex flex-col" ref={modalRef}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b flex-shrink-0">
          <h2 className="text-xl font-bold">Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b flex-shrink-0">
          {[
            { id: 'general', label: 'General' },
            { id: 'stats', label: 'Statistics' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-3 px-4 text-sm font-medium ${
                activeTab === tab.id
                  ? 'text-black border-b-2 border-black'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-4 flex-1 overflow-y-auto min-h-0">
          {/* General Settings */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              {/* Exercises per session */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Exercises per session
                </label>
                <select
                  value={settings.totalExercises}
                  onChange={(e) => onUpdateSettings({ totalExercises: parseInt(e.target.value) })}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value={5}>5 exercises</option>
                  <option value={10}>10 exercises</option>
                  <option value={15}>15 exercises</option>
                  <option value={20}>20 exercises</option>
                </select>
              </div>

              {/* Save Progress */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Save Progress</label>
                  <p className="text-xs text-gray-500">Automatically save your progress</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.saveProgress}
                    onChange={(e) => onUpdateSettings({ saveProgress: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                </label>
              </div>
            </div>
          )}

          {/* Statistics */}
          {activeTab === 'stats' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-2xl font-bold text-black">{stats.totalSessions}</div>
                  <div className="text-sm text-gray-600">Total Sessions</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-2xl font-bold text-black">{stats.totalExercises}</div>
                  <div className="text-sm text-gray-600">Exercises Completed</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-2xl font-bold text-black">{stats.averageScore.toFixed(1)}</div>
                  <div className="text-sm text-gray-600">Average Score</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-2xl font-bold text-black">{stats.bestScorePercentage.toFixed(1)}%</div>
                  <div className="text-sm text-gray-600">Best Session</div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Completion Rate</span>
                  <span className="font-medium">{stats.completionRate.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Best Score</span>
                  <span className="font-medium">{stats.bestScore} points</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Last Played</span>
                  <span className="font-medium">{formatDate(stats.lastPlayed)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
