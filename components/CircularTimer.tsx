'use client';

import React from 'react';
import { TimerMode, TimerStatus } from '@/types';
import { Palette } from '@/constants';
import { SproutVisual } from './SproutVisual';

interface CircularTimerProps {
  remainingSeconds: number;
  totalSeconds: number;
  mode: TimerMode;
  status: TimerStatus;
  cycleCount: number;
  maxCycles: number;
  sproutLevel: number;
  size?: number;
}

export function CircularTimer({
  remainingSeconds,
  totalSeconds,
  mode,
  status,
  cycleCount,
  maxCycles,
  sproutLevel,
  size = 320,
}: CircularTimerProps) {
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // MM:SS
  const mins = Math.floor(remainingSeconds / 60);
  const secs = remainingSeconds % 60;
  const timeFormatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

  const progress = totalSeconds > 0 ? (totalSeconds - remainingSeconds) / totalSeconds : 0;
  const strokeDashoffset = circumference * (1 - progress);

  let gradientStart = Palette.forestSprout;
  let gradientEnd = Palette.sproutFresh;
  let modeLabel = '🌱 Deep Focus';
  let badgeBg = '#D8F3DC';
  let badgeText = '#132A13';

  if (mode === 'short_break') {
    gradientStart = '#2A9D8F';
    gradientEnd = '#38A3A5';
    modeLabel = '☕ Short Break';
    badgeBg = '#E0F2F1';
    badgeText = '#1A655F';
  } else if (mode === 'long_break') {
    gradientStart = '#E76F51';
    gradientEnd = '#F4A261';
    modeLabel = '🧘 Long Break';
    badgeBg = '#FFE8D6';
    badgeText = '#A04328';
  }

  return (
    <div className="relative flex flex-col items-center justify-center select-none" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="absolute inset-0">
        <defs>
          <linearGradient id="webTimerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={gradientStart} />
            <stop offset="100%" stopColor={gradientEnd} />
          </linearGradient>
        </defs>

        {/* Track circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          className="text-[#E6F0E8] dark:text-[#1C2C22]"
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Animated Progress Arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#webTimerGradient)"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="none"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          className="transition-all duration-500 ease-linear"
        />
      </svg>

      {/* Inside Content */}
      <div className="z-10 flex flex-col items-center justify-center text-center">
        {/* Mode Pill */}
        <div
          className="px-3 py-1 text-xs font-bold rounded-full mb-1 tracking-wide"
          style={{ backgroundColor: badgeBg, color: badgeText }}
        >
          {modeLabel}
        </div>

        {/* Central Sprout Evolution Visual */}
        <div className="my-1 transform hover:scale-105 transition-transform">
          <SproutVisual
            level={sproutLevel}
            size={76}
            isFocusing={status === 'running' && mode === 'focus'}
          />
        </div>

        {/* Countdown Digits */}
        <div className="text-5xl md:text-6xl font-extrabold tracking-wider font-mono text-[#14261C] dark:text-[#F0F7F2]">
          {timeFormatted}
        </div>

        {/* Pomodoro Round Progress Dots */}
        <div className="flex items-center gap-1.5 mt-2">
          {Array.from({ length: maxCycles }).map((_, index) => {
            const isFilled = index < cycleCount;
            return (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${isFilled
                    ? 'bg-[#40916C] scale-110 shadow-sm'
                    : 'bg-[#C8DACD] dark:bg-[#2B4234]'
                  }`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

