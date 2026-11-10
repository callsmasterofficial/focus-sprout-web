'use client';

import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { useAppStore } from '@/stores/useAppStore';
import { SproutVisual } from './SproutVisual';
import { Coffee, RotateCcw, Check, Sparkles, X } from 'lucide-react';

export function CelebrationModal() {
  const {
    showCelebrationModal,
    closeCelebrationModal,
    getSproutStage,
    getSelectedTask,
    sessions,
    updateSessionNotes,
    setMode,
    startTimer,
  } = useAppStore();

  const [note, setNote] = useState('');
  const [noteSaved, setNoteSaved] = useState(false);

  useEffect(() => {
    if (showCelebrationModal) {
      // Fire confetti burst
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#40916C', '#52B788', '#74C69D', '#DDA15E', '#E76F51'],
        });
      } catch (e) { }
    }
  }, [showCelebrationModal]);

  if (!showCelebrationModal) return null;

  const sproutInfo = getSproutStage();
  const selectedTask = getSelectedTask();
  const latestSession = sessions[0];

  const handleSaveNote = async () => {
    if (latestSession && note.trim()) {
      await updateSessionNotes(latestSession.id, note.trim());
      setNoteSaved(true);
    }
  };

  const handleTakeBreak = () => {
    closeCelebrationModal();
    setMode('short_break');
    startTimer();
  };

  const handleContinueFocus = () => {
    closeCelebrationModal();
    setMode('focus');
    startTimer();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md p-6 bg-white dark:bg-[#17251D] border border-[#E2EBE3] dark:border-[#23382C] rounded-3xl shadow-2xl text-center">
        {/* Close button */}
        <button
          onClick={closeCelebrationModal}
          className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-black/5 dark:hover:bg-white/5"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Celebration Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 mb-3 text-xs font-bold text-white bg-[#40916C] rounded-full shadow-sm">
          <Sparkles className="w-3.5 h-3.5" />
          SESSION WATERED 🌱
        </div>

        <h2 className="text-2xl font-extrabold text-[#14261C] dark:text-[#F0F7F2]">
          Focus Session Complete!
        </h2>
        <p className="mt-1 text-xs text-[#4A6253] dark:text-[#A9C4B3]">
          Your consistency just nurtured your sprout and strengthened your focus roots.
        </p>

        {/* Sprout visual showcase */}
        <div className="my-4 flex flex-col items-center">
          <SproutVisual level={sproutInfo.currentStage.level} size={110} />
          <div className="mt-2 text-sm font-bold text-[#2D6A4F] dark:text-[#52B788]">
            {sproutInfo.currentStage.name} • Stage {sproutInfo.currentStage.level} of 6
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {sproutInfo.nextStage
              ? `${sproutInfo.sessionsToNext} more sessions to evolve into ${sproutInfo.nextStage.name}`
              : 'Maximum flourishing level achieved! 🌸'}
          </p>
        </div>

        {/* Selected Task info */}
        {selectedTask && (
          <div className="p-2.5 mb-4 text-xs font-semibold text-left rounded-xl bg-[#EFF7F1] dark:bg-[#1C2C22] border border-[#D5E8DA] dark:border-[#2A4433] text-[#14261C] dark:text-[#F0F7F2] flex items-center justify-between">
            <span className="truncate mr-2">🎯 {selectedTask.title}</span>
            <span className="shrink-0 text-[#40916C] font-bold">
              {selectedTask.completedPomodoros}/{selectedTask.estimatedPomodoros} Pomos
            </span>
          </div>
        )}

        {/* Quick reflection note */}
        <div className="mb-5">
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add reflection: What did you accomplish?"
            className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 dark:border-[#2C4436] bg-gray-50 dark:bg-[#152019] text-[#14261C] dark:text-[#F0F7F2] focus:outline-none focus:ring-2 focus:ring-[#40916C]"
          />
          {note.length > 0 && !noteSaved && (
            <button
              onClick={handleSaveNote}
              className="mt-2 text-xs font-bold text-[#40916C] hover:underline"
            >
              Save Note
            </button>
          )}
          {noteSaved && (
            <div className="mt-1.5 flex items-center justify-center gap-1 text-xs text-[#40916C] font-semibold">
              <Check className="w-3.5 h-3.5" /> Note saved to session timeline
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-2">
          <button
            onClick={handleTakeBreak}
            className="w-full py-3 px-4 flex items-center justify-center gap-2 font-bold text-white bg-[#2A9D8F] hover:bg-[#238276] rounded-xl shadow-md transition-all active:scale-[0.98]"
          >
            <Coffee className="w-4 h-4" />
            Take a 5m Break
          </button>

          <div className="flex gap-2">
            <button
              onClick={handleContinueFocus}
              className="flex-1 py-2.5 font-bold text-[#40916C] border-2 border-[#40916C] hover:bg-[#40916C]/10 rounded-xl transition-all"
            >
              Focus Again
            </button>
            <button
              onClick={closeCelebrationModal}
              className="flex-1 py-2.5 font-semibold text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-all"
            >
              Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

