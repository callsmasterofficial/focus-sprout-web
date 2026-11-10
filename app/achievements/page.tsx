'use client';

import React from 'react';
import {
  Trophy,
  Lock,
  CheckCircle2,
  Sparkles,
  Award,
  Flame,
  Sun,
  Droplets,
  Flower2,
  Sprout as SproutIcon,
} from 'lucide-react';
import { useAppStore } from '@/stores/useAppStore';
import { SproutVisual } from '@/components/SproutVisual';
import { SPROUT_STAGES } from '@/constants';

const ICON_MAP: Record<string, React.ElementType> = {
  Sprout: SproutIcon,
  Flower2,
  Droplets,
  Sun,
  Flame,
  Award,
  Trophy,
  CheckCircle2,
};

export default function AchievementsPage() {
  const { getSproutStage, achievements, settings } = useAppStore();
  const sproutInfo = getSproutStage();

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-300">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#14261C] dark:text-[#F0F7F2]">
          Sprout Garden & Badges 🏆
        </h1>
        <p className="text-xs sm:text-sm text-[#4A6253] dark:text-[#A9C4B3] mt-0.5">
          Celebrate your focus milestones, plant evolutions, and mindful achievements.
        </p>
      </div>

      {/* Hero Showcase Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#EBF6EE] via-[#F2F9F4] to-[#D8F3DC] dark:from-[#17271D] dark:via-[#192D21] dark:to-[#122218] border border-[#CEE9D5] dark:border-[#233F2E] shadow-sm">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="shrink-0 p-4 rounded-2xl bg-white/70 dark:bg-black/30 backdrop-blur-sm border border-white/60 dark:border-white/5 shadow-inner">
            <SproutVisual level={sproutInfo.currentStage.level} size={130} />
          </div>

          <div className="flex-1 space-y-2 text-center sm:text-left">
            <span className="inline-block px-3 py-1 text-[11px] font-extrabold uppercase tracking-wide bg-[#40916C] text-white rounded-full">
              STAGE {sproutInfo.currentStage.level} OF 6
            </span>

            <h2 className="text-2xl font-extrabold text-[#14261C] dark:text-[#F0F7F2]">
              {settings.sproutName} ({sproutInfo.currentStage.name})
            </h2>

            <div className="text-sm font-bold text-[#2D6A4F] dark:text-[#74C69D]">
              {sproutInfo.currentStage.title}
            </div>

            <p className="text-xs text-[#4A6253] dark:text-[#A9C4B3] max-w-xl leading-relaxed">
              {sproutInfo.currentStage.description}
            </p>

            {/* Evolution Progress */}
            <div className="pt-2 max-w-md">
              <div className="flex items-center justify-between text-xs font-semibold mb-1 text-[#2D6A4F] dark:text-[#74C69D]">
                <span>{sproutInfo.completedSessions} completed sessions</span>
                <span>{Math.round(sproutInfo.progressToNext * 100)}% to next stage</span>
              </div>
              <div className="w-full h-2.5 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#40916C] rounded-full transition-all duration-700"
                  style={{ width: `${Math.round(sproutInfo.progressToNext * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Botanical Evolution Stages Gallery */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-[#14261C] dark:text-[#F0F7F2]">
          Botanical Evolution Gallery
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {SPROUT_STAGES.map((stage) => {
            const isUnlocked = sproutInfo.completedSessions >= stage.requiredSessions;
            const isCurrent = stage.level === sproutInfo.currentStage.level;

            return (
              <div
                key={stage.level}
                className={`p-3.5 rounded-2xl border text-center flex flex-col items-center justify-between transition-all ${isCurrent
                    ? 'border-2 border-[#40916C] bg-white dark:bg-[#1C2C22] shadow-md scale-102'
                    : isUnlocked
                      ? 'border-[#E2EBE3] dark:border-[#23382C] bg-white dark:bg-[#17251D] shadow-sm'
                      : 'border-gray-200 dark:border-[#212E25] bg-gray-50/70 dark:bg-black/20 opacity-60'
                  }`}
              >
                <div className="relative my-2">
                  <SproutVisual level={stage.level} size={64} />
                  {!isUnlocked && (
                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                      <Lock className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>

                <div>
                  <div className="text-xs font-bold text-[#14261C] dark:text-[#F0F7F2]">
                    {stage.name}
                  </div>
                  <div className="text-[10px] text-gray-500 mt-0.5">
                    {stage.requiredSessions} sessions
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Milestone Badges */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-[#14261C] dark:text-[#F0F7F2]">
            Milestone Badges ({unlockedCount} / {achievements.length})
          </h3>
          <span className="text-xs font-semibold text-[#40916C]">
            {Math.round((unlockedCount / achievements.length) * 100)}% Complete
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {achievements.map((ach) => {
            const Icon = ICON_MAP[ach.icon] || Trophy;
            const progressRatio = Math.min(1, ach.progress / ach.maxProgress);

            return (
              <div
                key={ach.id}
                className={`p-4 rounded-2xl border transition-all flex items-start gap-4 ${ach.unlocked
                    ? 'border-[#40916C]/60 bg-white dark:bg-[#17251D] shadow-sm'
                    : 'border-gray-200 dark:border-[#23382C] bg-gray-50/50 dark:bg-black/10 opacity-70'
                  }`}
              >
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${ach.unlocked
                      ? 'bg-[#EBF6EE] dark:bg-[#1C3A27] text-[#40916C] shadow-sm'
                      : 'bg-gray-100 dark:bg-[#1E2822] text-gray-400'
                    }`}
                >
                  <Icon className="w-6 h-6" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-sm font-bold text-[#14261C] dark:text-[#F0F7F2] truncate">
                      {ach.title}
                    </h4>
                    {ach.unlocked && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2 py-0.5 bg-[#40916C] text-white rounded-full">
                        <CheckCircle2 className="w-3 h-3" /> Unlocked
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-[#4A6253] dark:text-[#A9C4B3] mt-0.5 line-clamp-1">
                    {ach.description}
                  </p>

                  <div className="flex items-center gap-2 mt-2 text-[11px] text-gray-500 font-semibold">
                    <div className="flex-1 h-1.5 bg-gray-200 dark:bg-[#25392D] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#40916C] rounded-full"
                        style={{ width: `${Math.round(progressRatio * 100)}%` }}
                      />
                    </div>
                    <span>
                      {ach.progress}/{ach.maxProgress}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

