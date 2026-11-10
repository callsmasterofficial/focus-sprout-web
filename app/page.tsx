'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Play,
  CheckCircle2,
  Flame,
  Shield,
  ShieldCheck,
  Headphones,
  FileText,
  Trophy,
  ArrowRight,
  Plus,
  Clock,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { useAppStore } from '@/stores/useAppStore';
import { SproutVisual } from '@/components/SproutVisual';

export default function DashboardPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  const {
    settings,
    tasks,
    selectedTaskId,
    selectTask,
    getSelectedTask,
    getTodayProductivity,
    getStreakStats,
    getSproutStage,
    startTimer,
    status: timerStatus,
    distractionShieldActive,
    toggleDistractionShield,
    rules,
    syncWithBackend,
    isSyncing,
  } = useAppStore();

  useEffect(() => {
    setMounted(true);
    syncWithBackend();
  }, []);

  if (!mounted) return null;

  const today = getTodayProductivity();
  const streakStats = getStreakStats();
  const sproutInfo = getSproutStage();
  const selectedTask = getSelectedTask();
  const activeRulesCount = rules.filter((r) => r.enabled).length;

  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12
      ? 'Good morning'
      : currentHour < 18
      ? 'Good afternoon'
      : 'Good evening';

  const goalProgress =
    settings.dailyGoalMinutes > 0
      ? Math.min(1, today.totalFocusMinutes / settings.dailyGoalMinutes)
      : 0;

  const handleStartSession = () => {
    if (timerStatus === 'idle') {
      startTimer();
    }
    router.push('/timer');
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in duration-300">
      {/* Top Greeting & Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#40916C]">
            {greeting}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#14261C] dark:text-[#F0F7F2] tracking-tight">
            {settings.userName || 'Sprout Gardener'} 🌱
          </h1>
          <p className="text-xs sm:text-sm text-[#4A6253] dark:text-[#A9C4B3] mt-0.5">
            Water your focus today and watch {settings.sproutName} flourish.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => syncWithBackend()}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-white dark:bg-[#1A2920] border border-[#E2EBE3] dark:border-[#23382C] rounded-xl text-[#2D6A4F] dark:text-[#74C69D] hover:bg-[#F2F7F3] shadow-sm transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : 'Sync Cloud'}</span>
          </button>

          <Link
            href="/timer"
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-[#40916C] hover:bg-[#2D6A4F] rounded-xl shadow-md transition-all active:scale-[0.98]"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>{timerStatus === 'running' ? 'View Timer' : 'Quick Focus'}</span>
          </Link>
        </div>
      </div>

      {/* Hero Sprout Evolution Showcase Card */}
      <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#EBF6EE] via-[#F2F9F4] to-[#D8F3DC] dark:from-[#17271D] dark:via-[#192D21] dark:to-[#122218] border border-[#CEE9D5] dark:border-[#233F2E] shadow-sm">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex-1 space-y-3 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-white bg-[#40916C] rounded-full shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              Stage {sproutInfo.currentStage.level} of 6 • {sproutInfo.currentStage.name}
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold text-[#14261C] dark:text-[#F0F7F2]">
              {settings.sproutName} is Growing Strong
            </h2>

            <p className="text-xs sm:text-sm text-[#4A6253] dark:text-[#A9C4B3] max-w-xl">
              {sproutInfo.nextStage
                ? `${sproutInfo.sessionsToNext} more completed focus sessions needed to blossom into a ${sproutInfo.nextStage.name}!`
                : 'Maximum majestic blooming evergreen level reached! Keep maintaining your sacred garden.'}
            </p>

            {/* Evolution Progress Bar */}
            <div className="max-w-md pt-2">
              <div className="flex items-center justify-between text-xs font-semibold mb-1 text-[#2D6A4F] dark:text-[#74C69D]">
                <span>Stage Progress</span>
                <span>{Math.round(sproutInfo.progressToNext * 100)}%</span>
              </div>
              <div className="w-full h-2.5 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#40916C] rounded-full transition-all duration-700"
                  style={{ width: `${Math.round(sproutInfo.progressToNext * 100)}%` }}
                />
              </div>
            </div>
          </div>

          <div className="shrink-0 flex flex-col items-center justify-center p-4 rounded-2xl bg-white/60 dark:bg-black/20 backdrop-blur-sm border border-white/50 dark:border-white/5 shadow-inner">
            <SproutVisual level={sproutInfo.currentStage.level} size={110} />
            <span className="text-xs font-bold text-[#2D6A4F] dark:text-[#52B788] mt-1">
              {sproutInfo.currentStage.title}
            </span>
          </div>
        </div>
      </div>

      {/* Distraction Shield Banner */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-[#17251D] border border-[#E2EBE3] dark:border-[#23382C] shadow-sm">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              distractionShieldActive
                ? 'bg-[#EBF6EE] dark:bg-[#1C3A27] text-[#40916C]'
                : 'bg-gray-100 dark:bg-[#222] text-gray-400'
            }`}
          >
            {distractionShieldActive ? (
              <ShieldCheck className="w-5 h-5 text-[#40916C]" />
            ) : (
              <Shield className="w-5 h-5" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-[#14261C] dark:text-[#F0F7F2]">
                Distraction Shield {distractionShieldActive ? 'Active' : 'Paused'}
              </span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                  distractionShieldActive
                    ? 'bg-[#D8F3DC] text-[#1B4332]'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                {distractionShieldActive ? 'GUARDED' : 'OFF'}
              </span>
            </div>
            <p className="text-xs text-[#4A6253] dark:text-[#A9C4B3]">
              {distractionShieldActive
                ? `${activeRulesCount} sites & apps guarded with ${settings.emergencyExitDelaySec}s mindfulness exit challenge.`
                : 'Focus restrictions are currently off. Tap to re-engage mindfulness.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Link
            href="/distraction"
            className="text-xs font-bold text-[#40916C] hover:underline px-2 py-1"
          >
            Configure
          </Link>
          <button
            onClick={() => toggleDistractionShield()}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
              distractionShieldActive
                ? 'bg-gray-100 dark:bg-[#25382D] text-gray-700 dark:text-gray-200 hover:bg-gray-200'
                : 'bg-[#40916C] text-white hover:bg-[#2D6A4F]'
            }`}
          >
            {distractionShieldActive ? 'Turn Off' : 'Turn On'}
          </button>
        </div>
      </div>

      {/* Main Grid: Today's Goal + Active Focus Target */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Today's Goal Card */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#17251D] border border-[#E2EBE3] dark:border-[#23382C] shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-bold text-[#14261C] dark:text-[#F0F7F2]">
                Today's Focus Goal
              </h3>
              <span className="px-2.5 py-1 text-xs font-bold bg-[#EBF6EE] dark:bg-[#1E3626] text-[#40916C] rounded-full">
                {today.completedSessions} sessions
              </span>
            </div>

            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-3xl font-extrabold text-[#14261C] dark:text-[#F0F7F2]">
                {today.totalFocusMinutes}
              </span>
              <span className="text-sm font-semibold text-[#4A6253] dark:text-[#A9C4B3]">
                / {settings.dailyGoalMinutes} mins ({Math.round(goalProgress * 100)}%)
              </span>
            </div>

            <div className="w-full h-3 bg-[#E6F0E8] dark:bg-[#213629] rounded-full overflow-hidden mb-4">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  goalProgress >= 1 ? 'bg-[#52B788]' : 'bg-[#40916C]'
                }`}
                style={{ width: `${Math.round(goalProgress * 100)}%` }}
              />
            </div>
          </div>

          <button
            onClick={handleStartSession}
            className="w-full py-3 px-4 flex items-center justify-center gap-2 font-bold text-white bg-[#40916C] hover:bg-[#2D6A4F] rounded-2xl shadow-sm transition-all active:scale-[0.99]"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>{timerStatus === 'running' ? 'Return to Active Timer' : 'Start Focus Session'}</span>
          </button>
        </div>

        {/* Focus Target Task Card */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#17251D] border border-[#E2EBE3] dark:border-[#23382C] shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-[#14261C] dark:text-[#F0F7F2]">
                Focus Target Task
              </h3>
              <Link
                href="/tasks"
                className="text-xs font-bold text-[#40916C] hover:underline flex items-center gap-0.5"
              >
                <span>All Tasks</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {selectedTask ? (
              <div className="p-4 rounded-2xl bg-[#EFF7F1] dark:bg-[#1C2C22] border-2 border-[#40916C] relative">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-[#40916C] text-white rounded">
                    READY TO FOCUS
                  </span>
                  <button
                    onClick={() => selectTask(null)}
                    className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    title="Unlink task"
                  >
                    Unlink
                  </button>
                </div>
                <h4 className="text-base font-bold text-[#14261C] dark:text-[#F0F7F2] truncate">
                  {selectedTask.title}
                </h4>
                <div className="flex items-center justify-between text-xs text-[#4A6253] dark:text-[#A9C4B3] mt-2">
                  <span>🏷️ {selectedTask.category} • Priority: {selectedTask.priority}</span>
                  <span className="font-bold text-[#40916C]">
                    🌱 {selectedTask.completedPomodoros}/{selectedTask.estimatedPomodoros} Pomos
                  </span>
                </div>
              </div>
            ) : (
              <Link
                href="/tasks"
                className="p-6 rounded-2xl border-2 border-dashed border-[#D9E8DC] dark:border-[#21382A] bg-[#F2F7F3] dark:bg-[#152219] flex flex-col items-center justify-center text-center group hover:border-[#40916C] transition-all"
              >
                <Plus className="w-7 h-7 text-[#40916C] mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-bold text-[#14261C] dark:text-[#F0F7F2]">
                  No task currently linked
                </span>
                <span className="text-xs text-[#4A6253] dark:text-[#A9C4B3] mt-0.5">
                  Select or create a task to dedicate your next Pomodoro session
                </span>
              </Link>
            )}
          </div>

          <div className="pt-4 flex items-center justify-between text-xs text-gray-500">
            <span>Tasks: {tasks.filter((t) => !t.completed).length} active</span>
            <Link href="/tasks" className="text-[#40916C] font-semibold hover:underline">
              + New Task
            </Link>
          </div>
        </div>
      </div>

      {/* 4-Stat Productivity Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Total Focus Time',
            value: `${Math.floor(today.totalFocusMinutes / 60)}h ${today.totalFocusMinutes % 60}m`,
            icon: Clock,
            color: '#40916C',
            bg: 'bg-[#EAF5ED] dark:bg-[#1C3124]',
          },
          {
            label: 'Sessions Finished',
            value: `${today.completedSessions}`,
            icon: CheckCircle2,
            color: '#52B788',
            bg: 'bg-[#EFF9F2] dark:bg-[#193322]',
          },
          {
            label: 'Current Streak',
            value: `${streakStats.currentStreak} ${streakStats.currentStreak === 1 ? 'day' : 'days'}`,
            icon: Flame,
            color: '#E76F51',
            bg: 'bg-[#FDF0EC] dark:bg-[#36211C]',
          },
          {
            label: 'Completion Rate',
            value: `${today.completionRate}%`,
            icon: Trophy,
            color: '#2A9D8F',
            bg: 'bg-[#EDF7F6] dark:bg-[#1A3331]',
          },
        ].map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={index}
              className="p-4 rounded-2xl bg-white dark:bg-[#17251D] border border-[#E2EBE3] dark:border-[#23382C] shadow-sm flex flex-col justify-between"
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${item.bg} mb-3`}>
                <Icon className="w-5 h-5" style={{ color: item.color }} />
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-extrabold text-[#14261C] dark:text-[#F0F7F2]">
                  {item.value}
                </div>
                <div className="text-xs font-semibold text-[#4A6253] dark:text-[#A9C4B3] mt-0.5">
                  {item.label}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Access Hub Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/sounds"
          className="p-4 rounded-2xl bg-white dark:bg-[#17251D] border border-[#E2EBE3] dark:border-[#23382C] shadow-sm hover:border-[#40916C] transition-all group flex items-center gap-3.5"
        >
          <div className="w-11 h-11 rounded-xl bg-[#EBF6EE] dark:bg-[#1C3A27] flex items-center justify-center group-hover:scale-105 transition-transform">
            <Headphones className="w-5 h-5 text-[#40916C]" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#14261C] dark:text-[#F0F7F2]">
              Ambient Sounds
            </h4>
            <p className="text-xs text-[#4A6253] dark:text-[#A9C4B3]">
              Rain, waves, forest & white noise
            </p>
          </div>
        </Link>

        <Link
          href="/analytics"
          className="p-4 rounded-2xl bg-white dark:bg-[#17251D] border border-[#E2EBE3] dark:border-[#23382C] shadow-sm hover:border-[#40916C] transition-all group flex items-center gap-3.5"
        >
          <div className="w-11 h-11 rounded-xl bg-[#EDF7F6] dark:bg-[#1A3331] flex items-center justify-center group-hover:scale-105 transition-transform">
            <Clock className="w-5 h-5 text-[#2A9D8F]" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#14261C] dark:text-[#F0F7F2]">
              Analytics & Trends
            </h4>
            <p className="text-xs text-[#4A6253] dark:text-[#A9C4B3]">
              Weekly charts & peak focus hours
            </p>
          </div>
        </Link>

        <Link
          href="/history"
          className="p-4 rounded-2xl bg-white dark:bg-[#17251D] border border-[#E2EBE3] dark:border-[#23382C] shadow-sm hover:border-[#40916C] transition-all group flex items-center gap-3.5"
        >
          <div className="w-11 h-11 rounded-xl bg-[#EFF9F2] dark:bg-[#193322] flex items-center justify-center group-hover:scale-105 transition-transform">
            <FileText className="w-5 h-5 text-[#52B788]" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#14261C] dark:text-[#F0F7F2]">
              Session Timeline
            </h4>
            <p className="text-xs text-[#4A6253] dark:text-[#A9C4B3]">
              Review past sessions & reflections
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}
