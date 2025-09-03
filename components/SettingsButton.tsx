"use client";

import { useState } from 'react';
import Settings from './Settings';
import { Settings as SettingsType } from '../lib/types';

interface SettingsButtonProps {
  settings: SettingsType;
  onUpdateSettings: (settings: Partial<SettingsType>) => void;
  hasProgress?: boolean;
}

export default function SettingsButton({ settings, onUpdateSettings, hasProgress }: SettingsButtonProps) {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowSettings(true)}
        className="relative p-2 text-gray-600 hover:text-gray-800 transition-colors"
        title="Settings"
      >
        {/* Settings Icon */}
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3"/>
          <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1m4-6 1.5 1.5M20.5 4.5 19 6m1.5 12.5L19 17M5.5 19.5 4 18"/>
        </svg>
        
        {/* Progress Indicator */}
        {hasProgress && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white"></div>
        )}
      </button>

      {showSettings && (
        <Settings
          settings={settings}
          onUpdateSettings={onUpdateSettings}
          onClose={() => setShowSettings(false)}
        />
      )}
    </>
  );
}
