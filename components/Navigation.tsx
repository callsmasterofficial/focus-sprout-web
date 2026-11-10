'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Timer,
  CheckSquare,
  BarChart2,
  Headphones,
  ShieldCheck,
  Trophy,
  History,
  Settings,
  Flame,
  Volume2,
  VolumeX,
  Cloud,
  CloudOff,
  Menu,
  X,
  Sun,
  Moon,
  Sparkles,
} from 'lucide-react';
import { useAppStore } from '@/stores/useAppStore';
import { SproutVisual } from './SproutVisual';
import { Palette } from '@/constants';

import { SPROUT_STAGES } from '@/constants';

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Timer', href: '/timer', icon: Timer },
  { name: 'Tasks', href: '/tasks', icon: CheckSquare },
  { name: 'Analytics', href: '/analytics', icon: BarChart2 },
  { name: 'Sounds', href: '/sounds', icon: Headphones },
  { name: 'Distraction', href: '/distraction', icon: ShieldCheck },
  { name: 'Garden & Badges', href: '/achievements', icon: Trophy },
  { name: 'History', href: '/history', icon: History },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Navigation() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    getStreakStats,
    getSproutStage,
    settings,
    updateSettings,
    isMasterPlaying,
    stopAllTracks,
    isLoggedIn,
    user,
    lastSyncedAt,
    syncWithBackend,
    isSyncing,
  } = useAppStore();

  const streakStats = mounted ? getStreakStats() : { currentStreak: 1, longestStreak: 1 };
  const sproutInfo = mounted
    ? getSproutStage()
    : {
        currentStage: SPROUT_STAGES[1],
        nextStage: SPROUT_STAGES[2],
        completedSessions: 4,
        progressToNext: 0.2,
        sessionsToNext: 8,
      };

  const isDark = settings.theme === 'dark';

  const toggleTheme = () => {
    const next = isDark ? 'light' : 'dark';
    updateSettings({ theme: next });
    if (next === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <>
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 w-full bg-white/90 dark:bg-[#13241A]/90 backdrop-blur-md border-b border-[#E1EBE2] dark:border-[#23382C] px-4 md:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-[#D8F3DC] dark:bg-[#1C3A27] flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <SproutVisual level={sproutInfo.currentStage.level} size={28} />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-[#14261C] dark:text-[#F0F7F2]">
                Focus<span className="text-[#40916C]">Sprout</span>
              </span>
              <span className="hidden sm:inline-block ml-1.5 px-2 py-0.5 text-[10px] font-bold bg-[#EBF6EE] dark:bg-[#1E3626] text-[#40916C] rounded-full">
                WEB
              </span>
            </div>
          </Link>
        </div>

        {/* Header Right Cluster */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Sync indicator */}
          <button
            onClick={() => syncWithBackend()}
            title={isLoggedIn ? `Logged in as ${user?.email}. Click to sync.` : 'Guest Mode. Click to sync with cloud.'}
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border transition-all ${
              isLoggedIn
                ? 'bg-[#EBF6EE] dark:bg-[#1E3626] border-[#CEE9D5] dark:border-[#2E523A] text-[#2D6A4F] dark:text-[#74C69D]'
                : 'bg-gray-100 dark:bg-[#1A251E] border-gray-200 dark:border-[#2A3B30] text-gray-600 dark:text-gray-300'
            }`}
          >
            <Cloud className={`w-3.5 h-3.5 ${isSyncing ? 'animate-pulse text-[#40916C]' : ''}`} />
            <span>{isLoggedIn ? (user?.name || 'Cloud Sync') : 'Guest Mode'}</span>
          </button>

          {/* Ambient Sound Pill */}
          <Link
            href="/sounds"
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-full transition-all ${
              isMasterPlaying
                ? 'bg-[#40916C] text-white shadow-sm animate-pulse'
                : 'bg-[#EFF4EF] dark:bg-[#1A2C21] text-[#2D6A4F] dark:text-[#A9C4B3] hover:bg-[#E2EDE3]'
            }`}
          >
            {isMasterPlaying ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isMasterPlaying ? 'Playing' : 'Ambience'}</span>
          </Link>

          {/* Streak Badge */}
          <Link
            href="/achievements"
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-extrabold text-[#E76F51] bg-[#FDECE7] dark:bg-[#2F1C18] rounded-full shadow-sm hover:scale-105 transition-transform"
          >
            <Flame className="w-4 h-4 fill-[#E76F51]" />
            <span>{streakStats.currentStreak}d</span>
          </Link>

          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            title="Toggle theme"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-30 bg-black/50 backdrop-blur-sm pt-16">
          <div className="w-64 h-full bg-white dark:bg-[#142119] p-4 flex flex-col justify-between shadow-2xl border-r border-[#E1EBE2] dark:border-[#23382C]">
            <nav className="flex flex-col gap-1">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      isActive
                        ? 'bg-[#40916C] text-white shadow-sm'
                        : 'text-[#4A6253] dark:text-[#A9C4B3] hover:bg-[#F0F7F2] dark:hover:bg-[#1A2E22]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            <div className="p-3 bg-[#F6F9F6] dark:bg-[#18271E] rounded-2xl border border-[#E1EBE2] dark:border-[#23382C]">
              <div className="flex items-center gap-2 mb-2">
                <SproutVisual level={sproutInfo.currentStage.level} size={32} />
                <div>
                  <div className="text-xs font-bold text-[#14261C] dark:text-[#F0F7F2]">
                    {settings.sproutName}
                  </div>
                  <div className="text-[10px] text-[#40916C] font-semibold">
                    {sproutInfo.currentStage.name}
                  </div>
                </div>
              </div>
              <div className="text-[10px] text-gray-500">
                {sproutInfo.completedSessions} sessions completed
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { getSproutStage, settings, user, isLoggedIn } = useAppStore();
  const sproutInfo = mounted
    ? getSproutStage()
    : {
        currentStage: SPROUT_STAGES[1],
        nextStage: SPROUT_STAGES[2],
        completedSessions: 4,
        progressToNext: 0.2,
        sessionsToNext: 8,
      };

  return (
    <aside className="hidden md:flex flex-col justify-between w-64 shrink-0 bg-white dark:bg-[#121F17] border-r border-[#E1EBE2] dark:border-[#23382C] min-h-[calc(100vh-57px)] p-4 sticky top-[57px]">
      <div className="flex flex-col gap-6">
        {/* Sprout Companion Mini Card */}
        <Link
          href="/achievements"
          className="p-3.5 rounded-2xl bg-gradient-to-br from-[#EBF6EE] to-[#D8F3DC] dark:from-[#172E21] dark:to-[#13241A] border border-[#CEE9D5] dark:border-[#274435] flex items-center gap-3 group hover:shadow-sm transition-all"
        >
          <div className="w-12 h-12 rounded-xl bg-white/80 dark:bg-[#1E3626] flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
            <SproutVisual level={sproutInfo.currentStage.level} size={40} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-[#14261C] dark:text-[#F0F7F2] truncate">
                {settings.sproutName}
              </span>
              <span className="text-[10px] font-bold text-[#40916C] bg-white/70 dark:bg-black/30 px-1.5 py-0.5 rounded">
                Lvl {sproutInfo.currentStage.level}
              </span>
            </div>
            <p className="text-[11px] text-[#4A6253] dark:text-[#A9C4B3] truncate">
              {sproutInfo.currentStage.name}
            </p>
            <div className="w-full bg-black/10 dark:bg-white/10 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-[#40916C] h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.round(sproutInfo.progressToNext * 100)}%` }}
              />
            </div>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-[#40916C] text-white shadow-sm'
                    : 'text-[#4A6253] dark:text-[#A9C4B3] hover:bg-[#F0F7F2] dark:hover:bg-[#1A2E22] hover:text-[#14261C] dark:hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom User / Chrome Extension banner */}
      <div className="flex flex-col gap-2 pt-4 border-t border-gray-100 dark:border-[#223629]">
        <Link
          href="/distraction"
          className="p-3 text-xs rounded-xl bg-[#EFF4EF] dark:bg-[#17271D] border border-[#E1EBE2] dark:border-[#253D2F] text-[#2D6A4F] dark:text-[#A9C4B3] flex items-center justify-between hover:bg-[#E5EFE6] transition-colors"
        >
          <span className="font-semibold">🛡️ Distraction Shield</span>
          <span className="text-[10px] bg-[#40916C] text-white px-2 py-0.5 rounded-full font-bold">
            ON
          </span>
        </Link>

        <div className="text-[11px] text-gray-400 dark:text-gray-500 text-center pt-1">
          FocusSprout Ecosystem v1.0
        </div>
      </div>
    </aside>
  );
}
