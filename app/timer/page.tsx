'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Shield,
  ShieldCheck,
  Headphones,
  CheckCircle2,
  ChevronRight,
  Volume2,
  PauseCircle,
  AlertTriangle,
} from 'lucide-react';
import { useAppStore } from '@/stores/useAppStore';
import { CircularTimer } from '@/components/CircularTimer';
import { TimerMode } from '@/types';

export default function TimerPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    status,
    mode,
    remainingSeconds,
    totalSeconds,
    cycleCount,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    skipSession,
    setMode,
    distractionShieldActive,
    toggleDistractionShield,
    getSelectedTask,
    settings,
    getSproutStage,
    tracks,
    isMasterPlaying,
    toggleTrack,
  } = useAppStore();

  const [confirmingExit, setConfirmingExit] = useState(false);
  const [countdownRemaining, setCountdownRemaining] = useState(settings.emergencyExitDelaySec);

  if (!mounted) {
    return (
      <div className="p-8 text-center text-xs text-gray-400">
        Loading focus timer...
      </div>
    );
  }

  const selectedTask = getSelectedTask();
  const sproutInfo = getSproutStage();
  const activeTrack = tracks.find((t) => t.isPlaying);

  const isRunning = status === 'running';
  const isPaused = status === 'paused';

  const handleResetClick = () => {
    if ((isRunning || isPaused) && distractionShieldActive && settings.emergencyExitDelaySec > 0) {
      setConfirmingExit(true);
      setCountdownRemaining(settings.emergencyExitDelaySec);

      const interval = setInterval(() => {
        setCountdownRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      resetTimer();
    }
  };

  const handleConfirmReset = () => {
    setConfirmingExit(false);
    resetTimer(true);
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col items-center space-y-6 animate-in fade-in duration-300">
      {/* Top Bar: Distraction Shield status & Ambient Audio pill */}
      <div className="w-full flex items-center justify-between gap-3">
        <button
          onClick={() => toggleDistractionShield()}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border ${
            distractionShieldActive
              ? 'bg-[#EBF6EE] dark:bg-[#1C3A27] text-[#1B4332] dark:text-[#74C69D] border-[#CEE9D5] dark:border-[#274435]'
              : 'bg-gray-100 dark:bg-[#1E2520] text-gray-500 border-gray-200 dark:border-[#2E3B32]'
          }`}
        >
          {distractionShieldActive ? (
            <ShieldCheck className="w-4 h-4 text-[#40916C]" />
          ) : (
            <Shield className="w-4 h-4" />
          )}
          <span>{distractionShieldActive ? 'Shield Guard Active' : 'Shield Off'}</span>
        </button>

        <Link
          href="/sounds"
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
            isMasterPlaying
              ? 'bg-[#40916C] text-white shadow-sm'
              : 'bg-[#EFF4EF] dark:bg-[#1A2C21] text-[#2D6A4F] dark:text-[#A9C4B3] hover:bg-[#E2EDE3]'
          }`}
        >
          <Headphones className="w-4 h-4" />
          <span>{activeTrack ? activeTrack.name : 'Ambient Sounds'}</span>
        </Link>
      </div>

      {/* Target Task Selector Pill */}
      <Link
        href="/tasks"
        className="w-full p-4 rounded-2xl bg-white dark:bg-[#17251D] border border-[#E2EBE3] dark:border-[#23382C] hover:border-[#40916C] shadow-sm flex items-center justify-between group transition-all"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              selectedTask
                ? 'bg-[#EBF6EE] dark:bg-[#1C3A27] text-[#40916C]'
                : 'bg-gray-100 dark:bg-[#222] text-gray-400'
            }`}
          >
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-bold text-[#14261C] dark:text-[#F0F7F2] truncate">
              {selectedTask ? selectedTask.title : 'Select a target task to focus on'}
            </div>
            {selectedTask ? (
              <div className="text-xs text-[#4A6253] dark:text-[#A9C4B3] truncate">
                {selectedTask.category} • {selectedTask.completedPomodoros}/
                {selectedTask.estimatedPomodoros} Pomodoros completed
              </div>
            ) : (
              <div className="text-xs text-gray-400">Tap to link a task from your list</div>
            )}
          </div>
        </div>

        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-[#40916C] group-hover:translate-x-0.5 transition-all" />
      </Link>

      {/* Mode Selector Tabs (Focus / Short Break / Long Break) */}
      <div className="w-full flex p-1 bg-[#E8F1EA] dark:bg-[#18271E] rounded-full max-w-md shadow-inner">
        {(['focus', 'short_break', 'long_break'] as TimerMode[]).map((m) => {
          const isSelected = mode === m;
          const label =
            m === 'focus' ? 'Focus' : m === 'short_break' ? 'Short Break' : 'Long Break';

          return (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex-1 py-2 text-xs font-bold rounded-full transition-all ${
                isSelected
                  ? 'bg-white dark:bg-[#2D6A4F] text-[#14261C] dark:text-white shadow-sm'
                  : 'text-[#6B8775] dark:text-[#7E9C88] hover:text-[#14261C]'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Primary Circular Timer Display */}
      <div className="my-4">
        <CircularTimer
          remainingSeconds={remainingSeconds}
          totalSeconds={totalSeconds}
          mode={mode}
          status={status}
          cycleCount={cycleCount}
          maxCycles={settings.sessionsBeforeLongBreak}
          sproutLevel={sproutInfo.currentStage.level}
          size={320}
        />
      </div>

      {/* Main Play / Pause / Reset / Skip Controls */}
      <div className="flex items-center gap-6">
        {/* Reset Button */}
        <button
          onClick={handleResetClick}
          disabled={status === 'idle'}
          title="Reset timer"
          className="w-12 h-12 rounded-full flex items-center justify-center bg-gray-100 dark:bg-[#1C2C22] text-[#4A6253] dark:text-[#A9C4B3] hover:bg-gray-200 dark:hover:bg-[#273D30] disabled:opacity-40 transition-all"
        >
          <RotateCcw className="w-5 h-5" />
        </button>

        {/* Big Play / Pause Button */}
        <button
          onClick={() => {
            if (isRunning) pauseTimer();
            else if (isPaused) resumeTimer();
            else startTimer();
          }}
          className={`w-20 h-20 rounded-full flex items-center justify-center text-white shadow-xl transition-all transform active:scale-95 ${
            mode === 'focus'
              ? 'bg-[#40916C] hover:bg-[#2D6A4F] shadow-[#40916C]/30'
              : mode === 'short_break'
              ? 'bg-[#2A9D8F] hover:bg-[#1E7268] shadow-[#2A9D8F]/30'
              : 'bg-[#E76F51] hover:bg-[#BA5238] shadow-[#E76F51]/30'
          }`}
        >
          {isRunning ? (
            <Pause className="w-8 h-8 fill-white" />
          ) : (
            <Play className="w-8 h-8 fill-white ml-1" />
          )}
        </button>

        {/* Skip Button */}
        <button
          onClick={() => skipSession()}
          title="Skip session"
          className="w-12 h-12 rounded-full flex items-center justify-center bg-gray-100 dark:bg-[#1C2C22] text-[#4A6253] dark:text-[#A9C4B3] hover:bg-gray-200 dark:hover:bg-[#273D30] transition-all"
        >
          <SkipForward className="w-5 h-5" />
        </button>
      </div>

      {/* Ambient Sound Playing Bar if active */}
      {activeTrack && (
        <div className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-[#E8F5EC] dark:bg-[#182B20] border border-[#C4E3CC] dark:border-[#254432] shadow-sm">
          <div className="flex items-center gap-2.5">
            <Volume2 className="w-4 h-4 text-[#40916C] animate-pulse" />
            <span className="text-xs font-bold text-[#14261C] dark:text-[#F0F7F2]">
              Now Playing: {activeTrack.name}
            </span>
          </div>
          <button
            onClick={() => toggleTrack(activeTrack.id)}
            className="p-1 text-[#40916C] hover:text-[#2D6A4F]"
            title="Pause sound"
          >
            <PauseCircle className="w-6 h-6" />
          </button>
        </div>
      )}

      {/* Gentle Mindfulness Quote */}
      <p className="text-xs text-center italic text-[#7E9786] dark:text-[#688574] max-w-sm px-4 pt-2">
        "Like a tender sprout pushing through fertile soil, steady mindful focus yields blossoming growth."
      </p>

      {/* Emergency Exit Delay Modal */}
      {confirmingExit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md p-6 bg-white dark:bg-[#17251D] border border-gray-200 dark:border-[#253A2E] rounded-3xl shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-[#14261C] dark:text-[#F0F7F2]">
              Pause Your Focus Streak?
            </h3>

            <p className="text-xs text-[#4A6253] dark:text-[#A9C4B3] leading-relaxed">
              Distraction Shield is currently active. Take a mindful breath before ending this session early.
            </p>

            <div className="py-2 text-2xl font-mono font-bold text-[#40916C]">
              {countdownRemaining > 0 ? `Breathe: ${countdownRemaining}s` : 'You can now proceed.'}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setConfirmingExit(false)}
                className="flex-1 py-3 text-xs font-bold text-white bg-[#40916C] hover:bg-[#2D6A4F] rounded-xl"
              >
                Keep Focusing 🌱
              </button>
              <button
                onClick={handleConfirmReset}
                disabled={countdownRemaining > 0}
                className="flex-1 py-3 text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl disabled:opacity-40"
              >
                End Session Early
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
