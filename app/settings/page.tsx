'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Settings as SettingsIcon,
  User,
  Clock,
  Volume2,
  Shield,
  Download,
  Upload,
  Sparkles,
  Trash2,
  Cloud,
  Check,
  ChevronRight,
  LogOut,
  LogIn,
  RefreshCw,
  Sun,
  Moon,
} from 'lucide-react';
import { useAppStore } from '@/stores/useAppStore';
import { SproutVisual } from '@/components/SproutVisual';

export default function SettingsPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    settings,
    updateSettings,
    resetSettings,
    seedDemoData,
    exportDataJson,
    importDataJson,
    clearSessions,
    isLoggedIn,
    user,
    login,
    register,
    logout,
    syncWithBackend,
    isSyncing,
    lastSyncedAt,
    getSproutStage,
  } = useAppStore();

  const sproutInfo = getSproutStage();

  // Name editing
  const [editingNames, setEditingNames] = useState(false);
  const [nameInput, setNameInput] = useState(settings.userName);
  const [sproutInput, setSproutInput] = useState(settings.sproutName);

  // Auth modal
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');

  if (!mounted) {
    return (
      <div className="p-8 text-center text-xs text-gray-400">
        Loading settings...
      </div>
    );
  }

  const handleSaveNames = () => {
    updateSettings({
      userName: nameInput.trim() || 'Sprout Gardener',
      sproutName: sproutInput.trim() || 'Bonsai',
    });
    setEditingNames(false);
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    try {
      if (isRegisterMode) {
        await register({
          email: authEmail,
          password: authPassword,
          name: nameInput,
          sproutName: sproutInput,
        });
      } else {
        await login(authEmail, authPassword);
      }
      setShowAuthModal(false);
      setAuthEmail('');
      setAuthPassword('');
    } catch (err: any) {
      setAuthError(err.message || 'Authentication failed');
    }
  };

  const handleExportBackup = () => {
    const json = exportDataJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `focus_sprout_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      const ok = await importDataJson(content);
      if (ok) {
        alert('Backup data successfully imported and synced!');
      } else {
        alert('Failed to import backup file. Invalid structure.');
      }
    };
    reader.readAsText(file);
  };

  const handleResetAll = () => {
    if (confirm('Are you sure you want to delete all tasks, session history, and reset settings? This cannot be undone.')) {
      clearSessions();
      resetSettings();
      alert('FocusSprout has been restored to factory state.');
    }
  };

  const handleSeedDemo = async () => {
    if (confirm('Load sample focus sessions, tasks, and historical charts?')) {
      await seedDemoData();
      alert('Sample focus data loaded successfully!');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#14261C] dark:text-[#F0F7F2]">
          Settings & Ecosystem
        </h1>
        <p className="text-xs sm:text-sm text-[#4A6253] dark:text-[#A9C4B3] mt-0.5">
          Configure Pomodoro durations, cross-device sync, distraction thresholds, and data backup.
        </p>
      </div>

      {/* Gardener Profile & Cloud Sync Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#17251D] border border-[#E2EBE3] dark:border-[#23382C] shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#D8F3DC] dark:bg-[#1C3A27] flex items-center justify-center shadow-inner">
              <SproutVisual level={sproutInfo.currentStage.level} size={48} />
            </div>

            <div>
              {editingNames ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="Your Name"
                    className="px-2.5 py-1 text-xs rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#142119]"
                  />
                  <input
                    type="text"
                    value={sproutInput}
                    onChange={(e) => setSproutInput(e.target.value)}
                    placeholder="Sprout Companion Name"
                    className="px-2.5 py-1 text-xs rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#142119] ml-2"
                  />
                  <button
                    onClick={handleSaveNames}
                    className="px-3 py-1 text-xs font-bold text-white bg-[#40916C] rounded-lg ml-2"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base sm:text-lg font-bold text-[#14261C] dark:text-[#F0F7F2]">
                      {settings.userName}
                    </h2>
                    <button
                      onClick={() => setEditingNames(true)}
                      className="text-xs text-[#40916C] hover:underline font-semibold"
                    >
                      Edit
                    </button>
                  </div>
                  <p className="text-xs text-[#4A6253] dark:text-[#A9C4B3]">
                    Nurturing <span className="font-bold text-[#40916C]">{settings.sproutName}</span> • Level {sproutInfo.currentStage.level} ({sproutInfo.currentStage.name})
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Cloud Auth Status */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            {isLoggedIn ? (
              <div className="flex items-center gap-2">
                <div className="text-right text-xs">
                  <div className="font-bold text-[#40916C] flex items-center gap-1">
                    <Cloud className="w-3.5 h-3.5" /> Synchronized
                  </div>
                  <div className="text-[10px] text-gray-400">{user?.email}</div>
                </div>
                <button
                  onClick={() => logout()}
                  className="px-3 py-1.5 text-xs font-semibold text-gray-500 hover:text-red-500 bg-gray-100 dark:bg-[#203125] rounded-xl"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setAuthError('');
                  setShowAuthModal(true);
                }}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#40916C] hover:bg-[#2D6A4F] rounded-xl shadow-sm"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In / Cloud Sync</span>
              </button>
            )}
          </div>
        </div>

        <Link
          href="/achievements"
          className="p-3 rounded-2xl bg-[#EFF7F1] dark:bg-[#1A2E21] border border-[#CEE9D5] dark:border-[#264532] text-xs font-bold text-[#2D6A4F] dark:text-[#74C69D] flex items-center justify-between hover:bg-[#E5F1E7] transition-colors"
        >
          <span>🌱 View Sprout Botanical Gallery & Milestones</span>
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Timer Preferences Section */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#17251D] border border-[#E2EBE3] dark:border-[#23382C] shadow-sm space-y-4">
        <h3 className="text-base font-bold text-[#14261C] dark:text-[#F0F7F2] flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#40916C]" /> Timer Durations
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          {/* Focus Duration */}
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#142119] border border-gray-100 dark:border-[#223328] flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-[#14261C] dark:text-[#F0F7F2]">
                Focus Session
              </div>
              <div className="text-[11px] text-gray-500">Standard deep work</div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => updateSettings({ focusDurationMin: Math.max(5, settings.focusDurationMin - 5) })}
                className="w-7 h-7 rounded-lg bg-white dark:bg-[#203225] text-gray-700 dark:text-gray-200 flex items-center justify-center font-bold shadow-sm"
              >
                -
              </button>
              <span className="w-10 text-center text-xs font-extrabold text-[#40916C]">
                {settings.focusDurationMin}m
              </span>
              <button
                onClick={() => updateSettings({ focusDurationMin: Math.min(90, settings.focusDurationMin + 5) })}
                className="w-7 h-7 rounded-lg bg-white dark:bg-[#203225] text-gray-700 dark:text-gray-200 flex items-center justify-center font-bold shadow-sm"
              >
                +
              </button>
            </div>
          </div>

          {/* Short Break */}
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#142119] border border-gray-100 dark:border-[#223328] flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-[#14261C] dark:text-[#F0F7F2]">
                Short Break
              </div>
              <div className="text-[11px] text-gray-500">Quick rest recharge</div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => updateSettings({ shortBreakMin: Math.max(1, settings.shortBreakMin - 1) })}
                className="w-7 h-7 rounded-lg bg-white dark:bg-[#203225] text-gray-700 dark:text-gray-200 flex items-center justify-center font-bold shadow-sm"
              >
                -
              </button>
              <span className="w-10 text-center text-xs font-extrabold text-[#40916C]">
                {settings.shortBreakMin}m
              </span>
              <button
                onClick={() => updateSettings({ shortBreakMin: Math.min(30, settings.shortBreakMin + 1) })}
                className="w-7 h-7 rounded-lg bg-white dark:bg-[#203225] text-gray-700 dark:text-gray-200 flex items-center justify-center font-bold shadow-sm"
              >
                +
              </button>
            </div>
          </div>

          {/* Long Break */}
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#142119] border border-gray-100 dark:border-[#223328] flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-[#14261C] dark:text-[#F0F7F2]">
                Long Break
              </div>
              <div className="text-[11px] text-gray-500">Extended restoration</div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => updateSettings({ longBreakMin: Math.max(5, settings.longBreakMin - 5) })}
                className="w-7 h-7 rounded-lg bg-white dark:bg-[#203225] text-gray-700 dark:text-gray-200 flex items-center justify-center font-bold shadow-sm"
              >
                -
              </button>
              <span className="w-10 text-center text-xs font-extrabold text-[#40916C]">
                {settings.longBreakMin}m
              </span>
              <button
                onClick={() => updateSettings({ longBreakMin: Math.min(60, settings.longBreakMin + 5) })}
                className="w-7 h-7 rounded-lg bg-white dark:bg-[#203225] text-gray-700 dark:text-gray-200 flex items-center justify-center font-bold shadow-sm"
              >
                +
              </button>
            </div>
          </div>

          {/* Cycles before Long Break */}
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#142119] border border-gray-100 dark:border-[#223328] flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-[#14261C] dark:text-[#F0F7F2]">
                Pomos Before Long Break
              </div>
              <div className="text-[11px] text-gray-500">Sessions per cycle</div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => updateSettings({ sessionsBeforeLongBreak: Math.max(2, settings.sessionsBeforeLongBreak - 1) })}
                className="w-7 h-7 rounded-lg bg-white dark:bg-[#203225] text-gray-700 dark:text-gray-200 flex items-center justify-center font-bold shadow-sm"
              >
                -
              </button>
              <span className="w-10 text-center text-xs font-extrabold text-[#40916C]">
                {settings.sessionsBeforeLongBreak}
              </span>
              <button
                onClick={() => updateSettings({ sessionsBeforeLongBreak: Math.min(8, settings.sessionsBeforeLongBreak + 1) })}
                className="w-7 h-7 rounded-lg bg-white dark:bg-[#203225] text-gray-700 dark:text-gray-200 flex items-center justify-center font-bold shadow-sm"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Toggles */}
        <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-800">
          <label className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-[#142119] cursor-pointer">
            <div>
              <span className="text-xs font-bold text-[#14261C] dark:text-[#F0F7F2]">
                Auto-Start Breaks
              </span>
              <p className="text-[11px] text-gray-500">
                Automatically begin break timer when focus session concludes
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.autoStartBreaks}
              onChange={(e) => updateSettings({ autoStartBreaks: e.target.checked })}
              className="accent-[#40916C] w-4 h-4 rounded"
            />
          </label>

          <label className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-[#142119] cursor-pointer">
            <div>
              <span className="text-xs font-bold text-[#14261C] dark:text-[#F0F7F2]">
                Auto-Start Next Focus
              </span>
              <p className="text-[11px] text-gray-500">
                Automatically start next focus session when break concludes
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.autoStartFocus}
              onChange={(e) => updateSettings({ autoStartFocus: e.target.checked })}
              className="accent-[#40916C] w-4 h-4 rounded"
            />
          </label>

          <label className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-[#142119] cursor-pointer">
            <div>
              <span className="text-xs font-bold text-[#14261C] dark:text-[#F0F7F2]">
                Sound Effects & Bells
              </span>
              <p className="text-[11px] text-gray-500">
                Play completion chime when timer finishes
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.soundEnabled}
              onChange={(e) => updateSettings({ soundEnabled: e.target.checked })}
              className="accent-[#40916C] w-4 h-4 rounded"
            />
          </label>

          <label className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-[#142119] cursor-pointer">
            <div>
              <span className="text-xs font-bold text-[#14261C] dark:text-[#F0F7F2]">
                Rhythmic Clock Ticking
              </span>
              <p className="text-[11px] text-gray-500">
                Subtle wooden ticks each second during active focus
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.tickingSound}
              onChange={(e) => updateSettings({ tickingSound: e.target.checked })}
              className="accent-[#40916C] w-4 h-4 rounded"
            />
          </label>
        </div>
      </div>

      {/* Data Management & Backup Section */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#17251D] border border-[#E2EBE3] dark:border-[#23382C] shadow-sm space-y-4">
        <h3 className="text-base font-bold text-[#14261C] dark:text-[#F0F7F2]">
          Data Sovereignty, Export & Backup
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={handleSeedDemo}
            className="p-3.5 rounded-2xl border border-gray-200 dark:border-[#274031] bg-gray-50 dark:bg-[#142119] text-[#14261C] dark:text-[#F0F7F2] hover:border-[#40916C] flex items-center gap-3 transition-all"
          >
            <Sparkles className="w-5 h-5 text-[#40916C]" />
            <div className="text-left">
              <div className="text-xs font-bold">Load Sample Demo Data</div>
              <div className="text-[10px] text-gray-500">Populate realistic test stats</div>
            </div>
          </button>

          <button
            onClick={handleExportBackup}
            className="p-3.5 rounded-2xl border border-gray-200 dark:border-[#274031] bg-gray-50 dark:bg-[#142119] text-[#14261C] dark:text-[#F0F7F2] hover:border-[#40916C] flex items-center gap-3 transition-all"
          >
            <Download className="w-5 h-5 text-[#40916C]" />
            <div className="text-left">
              <div className="text-xs font-bold">Export Backup (JSON)</div>
              <div className="text-[10px] text-gray-500">Save full data to local file</div>
            </div>
          </button>

          <label className="p-3.5 rounded-2xl border border-gray-200 dark:border-[#274031] bg-gray-50 dark:bg-[#142119] text-[#14261C] dark:text-[#F0F7F2] hover:border-[#40916C] flex items-center gap-3 cursor-pointer transition-all">
            <Upload className="w-5 h-5 text-[#40916C]" />
            <div className="text-left">
              <div className="text-xs font-bold">Import Backup (JSON)</div>
              <div className="text-[10px] text-gray-500">Restore from previously saved backup</div>
            </div>
            <input
              type="file"
              accept=".json"
              onChange={handleImportBackup}
              className="hidden"
            />
          </label>

          <button
            onClick={handleResetAll}
            className="p-3.5 rounded-2xl border border-red-200 dark:border-red-900/30 bg-red-50/50 dark:bg-red-950/10 text-red-600 flex items-center gap-3 hover:bg-red-50 transition-all"
          >
            <Trash2 className="w-5 h-5" />
            <div className="text-left">
              <div className="text-xs font-bold">Reset All Focus Data</div>
              <div className="text-[10px] text-red-400">Clear all tasks, sessions and logs</div>
            </div>
          </button>
        </div>
      </div>

      {/* Ecosystem Footer */}
      <div className="p-6 text-center text-xs text-gray-400 dark:text-gray-500 space-y-1">
        <p className="font-bold text-gray-600 dark:text-gray-400">
          FocusSprout Ecosystem v1.0.0
        </p>
        <p>Mobile App (Expo) • Next.js Web App • Manifest V3 Chrome Extension</p>
      </div>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md p-6 bg-white dark:bg-[#17251D] border border-gray-200 dark:border-[#253A2E] rounded-3xl shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-[#14261C] dark:text-[#F0F7F2]">
              {isRegisterMode ? 'Create FocusSprout Account' : 'Sign In to FocusSprout'}
            </h3>
            <p className="text-xs text-gray-500">
              Synchronize your tasks, sprout growth, and session timeline across Web, Chrome Extension, and Mobile.
            </p>

            {authError && (
              <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/30 text-red-600 text-xs font-semibold">
                {authError}
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#14261C] dark:text-[#F0F7F2] mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="gardener@example.com"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-[#2A4032] bg-gray-50 dark:bg-[#142119] text-[#14261C] dark:text-[#F0F7F2] focus:outline-none focus:ring-2 focus:ring-[#40916C]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#14261C] dark:text-[#F0F7F2] mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="At least 6 characters"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-[#2A4032] bg-gray-50 dark:bg-[#142119] text-[#14261C] dark:text-[#F0F7F2] focus:outline-none focus:ring-2 focus:ring-[#40916C]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 text-xs font-bold text-white bg-[#40916C] hover:bg-[#2D6A4F] rounded-xl shadow-sm"
              >
                {isRegisterMode ? 'Register & Sync' : 'Sign In'}
              </button>
            </form>

            <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800 text-xs">
              <button
                type="button"
                onClick={() => {
                  setIsRegisterMode(!isRegisterMode);
                  setAuthError('');
                }}
                className="text-[#40916C] font-semibold hover:underline"
              >
                {isRegisterMode ? 'Already have an account? Sign in' : "Don't have an account? Register"}
              </button>
              <button
                type="button"
                onClick={() => setShowAuthModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
