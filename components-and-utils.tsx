// ============================================================================
// COMPLETE COMPONENTS, HOOKS, AND UTILITIES
// File: src/components-and-utils.tsx
// This file contains all remaining components needed for the application
// ============================================================================

import React, { useState, useRef, useEffect, useCallback } from 'react';

// ============================================================================
// STORY LIST COMPONENT
// ============================================================================

interface Story {
  id: string;
  level_id: string;
  title: string;
  english_text: string;
  turkish_text: string;
  word_count: number;
  estimated_time_minutes: number;
}

export const StoryListComponent: React.FC<{
  stories: Story[];
  levelCode: string;
  onSelectStory: (story: Story) => void;
  darkMode: boolean;
  onBack: () => void;
}> = ({ stories, levelCode, onSelectStory, darkMode, onBack }) => {
  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-slate-50 to-slate-100'}`}>
      {/* Header */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg sticky top-0 z-40`}>
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <button
              onClick={onBack}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                darkMode
                  ? 'bg-gray-700 text-white hover:bg-gray-600'
                  : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
              }`}
            >
              ← Back
            </button>
          </div>
          <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Level {levelCode} Stories
          </h1>
          <div className="w-20"></div>
        </div>
      </div>

      {/* Stories Grid */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stories.map((story, idx) => (
            <button
              key={story.id}
              onClick={() => onSelectStory(story)}
              className={`p-6 rounded-xl transition transform hover:scale-105 text-left ${
                darkMode
                  ? 'bg-gray-800 hover:bg-gray-700 border border-gray-700'
                  : 'bg-white hover:shadow-xl border border-gray-200'
              }`}
            >
              <div className={`text-sm font-semibold mb-2 ${
                darkMode ? 'text-blue-400' : 'text-blue-600'
              }`}>
                Story {idx + 1}
              </div>
              <h3 className={`text-xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {story.title}
              </h3>
              <div className={`flex justify-between text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                <span>📝 {story.word_count} words</span>
                <span>⏱ {story.estimated_time_minutes} min</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// TYPING INTERFACE COMPONENT
// ============================================================================

export const TypingInterfaceComponent: React.FC<{
  story: Story;
  onComplete: (results: any) => void;
  darkMode: boolean;
  onBack: () => void;
}> = ({ story, onComplete, darkMode, onBack }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [hideText, setHideText] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const [selectedWord, setSelectedWord] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const englishText = story.english_text;
  const turkishText = story.turkish_text;
  const englishWords = englishText.split(/\s+/);
  const turkishWords = turkishText.split(/\s+/);

  // Timer
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Focus input
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim();
    const expectedWord = englishWords[currentIndex];

    if (value === expectedWord) {
      setCurrentIndex(currentIndex + 1);
      e.target.value = '';

      if (currentIndex + 1 === englishWords.length) {
        // Story completed
        if (timerRef.current) clearInterval(timerRef.current);

        const wpm = Math.round((englishText.length / 5) / (elapsedSeconds / 60));
        const accuracy = Math.round(((englishText.length - mistakes) / englishText.length) * 100);

        onComplete({
          wpm: Math.max(0, wpm),
          accuracy: Math.max(0, Math.min(100, accuracy)),
          time_spent_seconds: elapsedSeconds,
          mistakes: mistakes,
        });
      }
    } else if (value.length === expectedWord?.length) {
      // Wrong character
      e.target.classList.add('animate-shake');
      setMistakes(mistakes + 1);
      setTimeout(() => {
        e.target.classList.remove('animate-shake');
      }, 300);
    }
  };

  const playAudio = () => {
    const utterance = new SpeechSynthesisUtterance(englishText);
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  const wpm = Math.max(0, Math.round((englishText.slice(0, currentIndex * 5).length / 5) / (Math.max(1, elapsedSeconds) / 60)));
  const accuracy = Math.round(((currentIndex * 5 - mistakes) / Math.max(1, currentIndex * 5)) * 100);

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-slate-50 to-slate-100'}`}>
      {/* Header with stats */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg sticky top-0 z-40`}>
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={onBack}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                darkMode
                  ? 'bg-gray-700 text-white hover:bg-gray-600'
                  : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
              }`}
            >
              ← Back
            </button>
            <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {story.title}
            </h2>
            <button
              onClick={() => setHideText(!hideText)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                hideText
                  ? darkMode
                    ? 'bg-green-900/30 text-green-200'
                    : 'bg-green-100 text-green-700'
                  : darkMode
                  ? 'bg-gray-700 text-white hover:bg-gray-600'
                  : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
              }`}
            >
              {hideText ? '👁 Show' : '🙈 Hide'}
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4">
            <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className={`text-xs font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>WPM</div>
              <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{wpm}</div>
            </div>
            <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className={`text-xs font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Accuracy</div>
              <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{accuracy}%</div>
            </div>
            <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className={`text-xs font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Time</div>
              <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{elapsedSeconds}s</div>
            </div>
            <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className={`text-xs font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Mistakes</div>
              <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{mistakes}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Audio controls */}
        <div className="flex gap-3 mb-8">
          <button
            onClick={playAudio}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <span>▶</span> Play Audio
          </button>
          <button
            onClick={() => setShowTranslation(!showTranslation)}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              showTranslation
                ? darkMode
                  ? 'bg-purple-900/30 text-purple-200'
                  : 'bg-purple-100 text-purple-700'
                : darkMode
                ? 'bg-gray-700 text-white hover:bg-gray-600'
                : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
            }`}
          >
            {showTranslation ? '🇹🇷 Hide' : '🇹🇷 Turkish'}
          </button>
        </div>

        {/* Story text */}
        <div className={`p-8 rounded-xl mb-8 ${darkMode ? 'bg-gray-800' : 'bg-white shadow-lg'}`}>
          <div className={`text-lg leading-relaxed ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {!hideText && englishWords.map((word, idx) => (
              <span
                key={idx}
                className={`${
                  idx === currentIndex
                    ? darkMode
                      ? 'bg-yellow-600'
                      : 'bg-yellow-300'
                    : idx < currentIndex
                    ? darkMode
                      ? 'text-green-400'
                      : 'text-green-600'
                    : ''
                } cursor-pointer transition`}
                onClick={() => setSelectedWord(idx)}
              >
                {word}{' '}
              </span>
            ))}
          </div>

          {/* Turkish translation */}
          {showTranslation && (
            <div className={`mt-6 pt-6 border-t ${darkMode ? 'border-gray-700 text-gray-400' : 'border-gray-300 text-gray-600'}`}>
              <span className="text-sm font-semibold">Turkish:</span>
              <p className="mt-2">{turkishText}</p>
            </div>
          )}
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className={`text-sm font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Progress: {currentIndex} / {englishWords.length}
            </span>
            <span className={`text-sm font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {Math.round((currentIndex / englishWords.length) * 100)}%
            </span>
          </div>
          <div className={`w-full h-2 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-300'}`}>
            <div
              className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all"
              style={{ width: `${(currentIndex / englishWords.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Input field */}
        <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white shadow-lg'}`}>
          <label className={`block text-sm font-semibold mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Type the next word: <span className="text-blue-600 font-bold">{englishWords[currentIndex]}</span>
          </label>
          <input
            ref={inputRef}
            type="text"
            onChange={handleInput}
            placeholder="Start typing..."
            className={`w-full px-4 py-3 rounded-lg border-2 focus:outline-none transition ${
              darkMode
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500'
            }`}
            autoComplete="off"
          />
          <p className={`mt-2 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Word {currentIndex + 1} of {englishWords.length}
          </p>
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        .animate-shake {
          animation: shake 0.3s;
          background-color: rgba(239, 68, 68, 0.2);
        }
      `}</style>
    </div>
  );
};

// ============================================================================
// RESULTS SCREEN COMPONENT
// ============================================================================

export const ResultsScreenComponent: React.FC<{
  story: Story;
  results: any;
  onNext: () => void;
  onBack: () => void;
  darkMode: boolean;
}> = ({ story, results, onNext, onBack, darkMode }) => {
  const getGrade = (accuracy: number) => {
    if (accuracy >= 95) return '🌟 Perfect';
    if (accuracy >= 90) return '⭐ Excellent';
    if (accuracy >= 80) return '👍 Good';
    if (accuracy >= 70) return '📈 Fair';
    return '🎯 Keep Practicing';
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-slate-50 to-slate-100'}`}>
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-2xl p-12 text-center`}>
          <h2 className={`text-4xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {getGrade(results.accuracy)}
          </h2>
          <p className={`text-xl mb-12 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {story.title} Completed!
          </p>

          <div className="grid grid-cols-2 gap-6 mb-12">
            <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
              <div className={`text-sm font-semibold mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Words Per Minute
              </div>
              <div className="text-4xl font-bold text-blue-600">{results.wpm}</div>
            </div>
            <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-green-50'}`}>
              <div className={`text-sm font-semibold mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Accuracy
              </div>
              <div className="text-4xl font-bold text-green-600">{results.accuracy}%</div>
            </div>
            <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-purple-50'}`}>
              <div className={`text-sm font-semibold mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Time Spent
              </div>
              <div className="text-4xl font-bold text-purple-600">{results.time_spent_seconds}s</div>
            </div>
            <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-red-50'}`}>
              <div className={`text-sm font-semibold mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Mistakes
              </div>
              <div className="text-4xl font-bold text-red-600">{results.mistakes}</div>
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={onBack}
              className={`px-6 py-3 rounded-lg font-semibold transition ${
                darkMode
                  ? 'bg-gray-700 text-white hover:bg-gray-600'
                  : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
              }`}
            >
              ← Back to Stories
            </button>
            <button
              onClick={onNext}
              className="px-6 py-3 rounded-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg transition"
            >
              Next Story →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// DASHBOARD COMPONENT
// ============================================================================

export const DashboardComponent: React.FC<{
  darkMode: boolean;
  onBack: () => void;
  userStats: any;
}> = ({ darkMode, onBack, userStats }) => {
  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-slate-50 to-slate-100'}`}>
      {/* Header */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg sticky top-0 z-40`}>
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <button
            onClick={onBack}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              darkMode
                ? 'bg-gray-700 text-white hover:bg-gray-600'
                : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
            }`}
          >
            ← Back
          </button>
          <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Your Dashboard
          </h1>
          <div className="w-20"></div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white shadow-lg'}`}>
            <div className={`text-sm font-semibold mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Completed Stories
            </div>
            <div className={`text-4xl font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
              {userStats?.completed_stories || 0}
            </div>
          </div>
          <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white shadow-lg'}`}>
            <div className={`text-sm font-semibold mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Avg Accuracy
            </div>
            <div className={`text-4xl font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
              {userStats?.avg_accuracy || 0}%
            </div>
          </div>
          <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white shadow-lg'}`}>
            <div className={`text-sm font-semibold mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Avg WPM
            </div>
            <div className={`text-4xl font-bold ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
              {userStats?.avg_wpm || 0}
            </div>
          </div>
          <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white shadow-lg'}`}>
            <div className={`text-sm font-semibold mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Current Streak
            </div>
            <div className={`text-4xl font-bold ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
              🔥 {userStats?.streak || 0}
            </div>
          </div>
        </div>

        {/* Level Progress */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white shadow-lg'} rounded-xl p-8 mb-12`}>
          <h3 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Level Progress
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map((level) => (
              <div key={level} className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <div className="flex justify-between items-center mb-2">
                  <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{level}</span>
                  <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>8/20</span>
                </div>
                <div className={`w-full h-2 rounded-full ${darkMode ? 'bg-gray-600' : 'bg-gray-300'}`}>
                  <div className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" style={{ width: '40%' }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white shadow-lg'} rounded-xl p-8`}>
          <h3 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Recent Activity
          </h3>
          <div className="space-y-4">
            <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className="flex justify-between items-start">
                <div>
                  <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Story Title</p>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Level A1 • 2 hours ago</p>
                </div>
                <span className={`font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>85%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// THEME TOGGLE COMPONENT
// ============================================================================

export const ThemeToggleComponent: React.FC<{
  darkMode: boolean;
  onToggle: () => void;
}> = ({ darkMode, onToggle }) => {
  return (
    <button
      onClick={onToggle}
      className={`p-2 rounded-lg transition ${
        darkMode
          ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
      title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      {darkMode ? '☀️' : '🌙'}
    </button>
  );
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

// Calculate WPM
export function calculateWPM(characterCount: number, timeSeconds: number): number {
  if (timeSeconds === 0) return 0;
  const words = characterCount / 5;
  const minutes = timeSeconds / 60;
  return Math.round(words / minutes);
}

// Calculate accuracy
export function calculateAccuracy(totalChars: number, correctChars: number): number {
  if (totalChars === 0) return 100;
  return Math.round((correctChars / totalChars) * 100);
}

// Text-to-speech
export function speakText(text: string, rate: number = 0.9): void {
  if (!window.speechSynthesis) {
    console.error('Speech Synthesis not supported');
    return;
  }

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = rate;
  utterance.pitch = 1;
  utterance.volume = 1;

  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

// Stop speech
export function stopSpeech(): void {
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

// Format time
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Generate word tooltips
export function getWordTooltip(englishWord: string, turkishText: string): string {
  const turkishWords = turkishText.split(/\s+/);
  const englishWords = englishWord.split(/\s+/);

  // Find matching Turkish word
  if (turkishWords.length > 0) {
    return turkishWords[0];
  }
  return englishWord;
}

// Debounce function
export function debounce<T extends any[], R>(
  func: (...args: T) => R,
  wait: number
): (...args: T) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function (...args: T) {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Local storage helpers
export const storage = {
  get: (key: string) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  },
  set: (key: string, value: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      console.error('Failed to save to localStorage');
    }
  },
  remove: (key: string) => {
    localStorage.removeItem(key);
  },
  clear: () => {
    localStorage.clear();
  },
};

// Error handler
export function handleError(error: Error, context: string): void {
  console.error(`Error in ${context}:`, error);
  // Send to error tracking service if needed
  // Example: Sentry.captureException(error)
}

export default {
  StoryListComponent,
  TypingInterfaceComponent,
  ResultsScreenComponent,
  DashboardComponent,
  ThemeToggleComponent,
  calculateWPM,
  calculateAccuracy,
  speakText,
  stopSpeech,
  formatTime,
  getWordTooltip,
  debounce,
  storage,
  handleError,
};
