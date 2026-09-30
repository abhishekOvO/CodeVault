import { useStore } from '../store';
import { Moon, Sun, Target, Save } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const settings = useStore((s) => s.settings);
  const setSettings = useStore((s) => s.setSettings);
  const toggleTheme = useStore((s) => s.toggleTheme);

  const [goals, setGoals] = useState(settings.dailyGoal);

  const saveGoals = () => {
    setSettings({ dailyGoal: goals });
    toast.success('Goals saved!');
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-dark-400 text-sm mt-1">Customize your CodeVault experience</p>
      </div>

      {/* Theme */}
      <div className="card p-5">
        <h2 className="text-sm font-semibold text-white mb-4">Appearance</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-dark-200">Theme</p>
            <p className="text-xs text-dark-500 mt-0.5">Currently: {settings.theme} mode</p>
          </div>
          <button onClick={toggleTheme} className="btn-secondary">
            {settings.theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
            Switch to {settings.theme === 'dark' ? 'Light' : 'Dark'}
          </button>
        </div>
      </div>

      {/* Daily goals */}
      <div className="card p-5">
        <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <Target size={16} className="text-brand-400" /> Daily Goals
        </h2>
        <div className="space-y-4">
          {[
            { key: 'problemsTarget', label: 'Problems to solve', min: 1, max: 20 },
            { key: 'revisionTarget', label: 'Problems to revise', min: 1, max: 20 },
            { key: 'studyMinutes', label: 'Study duration (minutes)', min: 15, max: 480 },
          ].map(({ key, label, min, max }) => (
            <div key={key} className="flex items-center justify-between gap-4">
              <label className="text-sm text-dark-300 flex-1">{label}</label>
              <input
                type="number"
                min={min}
                max={max}
                value={(goals as any)[key]}
                onChange={(e) => setGoals({ ...goals, [key]: Number(e.target.value) })}
                className="input-base w-24 text-center"
              />
            </div>
          ))}
          <button onClick={saveGoals} className="btn-primary w-full justify-center">
            <Save size={14} /> Save Goals
          </button>
        </div>
      </div>

      {/* Code language */}
      <div className="card p-5">
        <h2 className="text-sm font-semibold text-white mb-4">Default Code Language</h2>
        <div className="flex gap-2">
          {(['cpp', 'python', 'java'] as const).map((lang) => (
            <button
              key={lang}
              onClick={() => setSettings({ codeLanguage: lang })}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                settings.codeLanguage === lang
                  ? 'bg-brand-600 text-white'
                  : 'bg-dark-800 text-dark-400 hover:text-dark-200'
              }`}
            >
              {lang.toUpperCase()}
            </button>
          ))}
        </div>
        <p className="text-xs text-dark-500 mt-2">
          Note: Most solutions in the PDF are in C++
        </p>
      </div>

      {/* Stats */}
      <div className="card p-5">
        <h2 className="text-sm font-semibold text-white mb-4">Your Stats</h2>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex justify-between">
            <span className="text-dark-400">Study Streak</span>
            <span className="text-amber-400 font-medium">{settings.streakDays} days</span>
          </div>
          <div className="flex justify-between">
            <span className="text-dark-400">Last Active</span>
            <span className="text-dark-300">{settings.lastStudyDate ?? 'never'}</span>
          </div>
        </div>
      </div>

      {/* Danger zone */}
      <div className="card p-5 border-red-900/30">
        <h2 className="text-sm font-semibold text-red-400 mb-4">Danger Zone</h2>
        <p className="text-xs text-dark-400 mb-3">
          This will clear all your progress, notes, and starred problems from localStorage.
          The problem content from the PDF will remain.
        </p>
        <button
          onClick={() => {
            if (confirm('Are you sure? This cannot be undone.')) {
              localStorage.removeItem('dsa-mastery-store');
              window.location.reload();
            }
          }}
          className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-600/30 rounded-lg text-sm transition-colors"
        >
          Reset All Progress
        </button>
      </div>
    </div>
  );
}
