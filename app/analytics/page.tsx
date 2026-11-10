'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Clock,
  CheckCircle2,
  Flame,
  Trophy,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  TrendingUp,
  Calendar as CalendarIcon,
  Sparkles,
} from 'lucide-react';
import { useAppStore } from '@/stores/useAppStore';
import { Session } from '@/types';

export default function AnalyticsPage() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'trends' | 'calendar'>('overview');

  // Calendar month state
  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(() => new Date('2026-11-01'));
  const [selectedCalendarDay, setSelectedCalendarDay] = useState<{
    dateStr: string;
    sessions: Session[];
  } | null>(null);

  useEffect(() => {
    setMounted(true);
    setCurrentMonthDate(new Date());
  }, []);

  const {
    getTodayProductivity,
    getWeeklyProductivity,
    getHourlyProductivity,
    getStreakStats,
    getCategoryBreakdown,
    sessions,
    settings,
  } = useAppStore();

  if (!mounted) {
    return (
      <div className="p-8 text-center text-xs text-gray-400">
        Loading focus analytics...
      </div>
    );
  }

  const today = getTodayProductivity();
  const weekly = getWeeklyProductivity();
  const hourly = getHourlyProductivity();
  const streakStats = getStreakStats();
  const categoryBreakdown = getCategoryBreakdown();

  // Peak hour
  const peakHour = hourly.reduce(
    (max, curr) => (curr.focusMinutes > max.focusMinutes ? curr : max),
    hourly[0] || { focusMinutes: 0, label: 'None' }
  );

  // Calendar calculations
  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();
  const monthName = currentMonthDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const dateMap: Record<string, Session[]> = {};
  sessions.forEach((s) => {
    if (s.mode === 'focus') {
      const d = s.startedAt.split('T')[0];
      if (!dateMap[d]) dateMap[d] = [];
      dateMap[d].push(s);
    }
  });

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDayOfWeek; i++) cells.push(null);
  for (let day = 1; day <= daysInMonth; day++) cells.push(day);

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#14261C] dark:text-[#F0F7F2]">
            Productivity & Trends
          </h1>
          <p className="text-xs sm:text-sm text-[#4A6253] dark:text-[#A9C4B3] mt-0.5">
            Real data calculated from {sessions.length} recorded focus sessions.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex p-1 bg-gray-100 dark:bg-[#1A281F] rounded-xl self-start sm:self-auto">
          {(['overview', 'trends', 'calendar'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all capitalize ${
                activeTab === tab
                  ? 'bg-white dark:bg-[#2D6A4F] text-[#14261C] dark:text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              {tab === 'overview' ? 'Overview' : tab === 'trends' ? 'Hourly Trends' : 'Calendar'}
            </button>
          ))}
        </div>
      </div>

      {/* 4 Stat Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-[#17251D] border border-[#E2EBE3] dark:border-[#23382C] shadow-sm">
          <div className="w-9 h-9 rounded-xl bg-[#EAF5ED] dark:bg-[#1C3124] text-[#40916C] flex items-center justify-center mb-3">
            <Clock className="w-5 h-5" />
          </div>
          <div className="text-2xl font-extrabold text-[#14261C] dark:text-[#F0F7F2]">
            {Math.floor(today.totalFocusMinutes / 60)}h {today.totalFocusMinutes % 60}m
          </div>
          <div className="text-xs font-semibold text-[#4A6253] dark:text-[#A9C4B3] mt-0.5">
            Today's Focus Time
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#17251D] border border-[#E2EBE3] dark:border-[#23382C] shadow-sm">
          <div className="w-9 h-9 rounded-xl bg-[#EFF9F2] dark:bg-[#193322] text-[#52B788] flex items-center justify-center mb-3">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="text-2xl font-extrabold text-[#14261C] dark:text-[#F0F7F2]">
            {today.completedSessions}
          </div>
          <div className="text-xs font-semibold text-[#4A6253] dark:text-[#A9C4B3] mt-0.5">
            Sessions Finished
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#17251D] border border-[#E2EBE3] dark:border-[#23382C] shadow-sm">
          <div className="w-9 h-9 rounded-xl bg-[#FDF0EC] dark:bg-[#36211C] text-[#E76F51] flex items-center justify-center mb-3">
            <Flame className="w-5 h-5 fill-[#E76F51]" />
          </div>
          <div className="text-2xl font-extrabold text-[#14261C] dark:text-[#F0F7F2]">
            {streakStats.currentStreak} {streakStats.currentStreak === 1 ? 'day' : 'days'}
          </div>
          <div className="text-xs font-semibold text-[#4A6253] dark:text-[#A9C4B3] mt-0.5">
            Current Streak (Best: {streakStats.longestStreak}d)
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#17251D] border border-[#E2EBE3] dark:border-[#23382C] shadow-sm">
          <div className="w-9 h-9 rounded-xl bg-[#EDF7F6] dark:bg-[#1A3331] text-[#2A9D8F] flex items-center justify-center mb-3">
            <Trophy className="w-5 h-5" />
          </div>
          <div className="text-2xl font-extrabold text-[#14261C] dark:text-[#F0F7F2]">
            {today.completionRate}%
          </div>
          <div className="text-xs font-semibold text-[#4A6253] dark:text-[#A9C4B3] mt-0.5">
            Session Completion
          </div>
        </div>
      </div>

      {/* Main Tab Views */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Weekly Trends Chart (2 cols) */}
          <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-[#17251D] border border-[#E2EBE3] dark:border-[#23382C] shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#14261C] dark:text-[#F0F7F2]">
                  Weekly Focus Trend
                </h3>
                <p className="text-xs text-gray-500">
                  Target: {Math.round(settings.dailyGoalMinutes / 60)}h / day ({settings.dailyGoalMinutes}m)
                </p>
              </div>
              <span className="flex items-center gap-1.5 text-xs font-bold text-[#40916C]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#40916C]" /> Focus Time
              </span>
            </div>

            {/* Bars */}
            <div className="h-52 pt-6 flex items-end justify-between gap-2 border-b border-gray-100 dark:border-gray-800">
              {weekly.map((day, idx) => {
                const max = Math.max(settings.dailyGoalMinutes * 1.25, ...weekly.map((d) => d.totalFocusMinutes), 60);
                const heightPct = Math.min(100, Math.max(4, (day.totalFocusMinutes / max) * 100));
                const hitGoal = day.totalFocusMinutes >= settings.dailyGoalMinutes;
                const isToday = idx === weekly.length - 1;

                return (
                  <div key={day.date} className="flex-1 flex flex-col items-center h-full justify-end group">
                    <div className="text-[10px] font-bold text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity mb-1">
                      {day.totalFocusMinutes}m
                    </div>
                    <div className="w-full max-w-[32px] bg-gray-100 dark:bg-[#223629] rounded-t-lg h-36 flex items-end overflow-hidden p-0.5">
                      <div
                        className={`w-full rounded-t-md transition-all duration-500 ${
                          hitGoal
                            ? 'bg-[#52B788]'
                            : isToday
                            ? 'bg-[#40916C]'
                            : 'bg-[#95D5B2] dark:bg-[#2F5A3F]'
                        }`}
                        style={{ height: `${heightPct}%` }}
                      />
                    </div>
                    <span
                      className={`text-xs font-bold mt-2 ${
                        isToday ? 'text-[#40916C]' : 'text-gray-500'
                      }`}
                    >
                      {day.dayOfWeek}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Category Breakdown (1 col) */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#17251D] border border-[#E2EBE3] dark:border-[#23382C] shadow-sm space-y-4">
            <h3 className="text-base font-bold text-[#14261C] dark:text-[#F0F7F2]">
              Focus by Category
            </h3>

            <div className="space-y-4">
              {categoryBreakdown.map((cat) => (
                <div key={cat.category} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="font-bold text-[#14261C] dark:text-[#F0F7F2]">
                        {cat.category}
                      </span>
                    </div>
                    <span className="font-semibold text-gray-500">
                      {cat.minutes}m ({cat.percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 dark:bg-[#223629] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${cat.percentage}%`,
                        backgroundColor: cat.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'trends' && (
        <div className="space-y-6">
          {/* Hourly Peak Flow Chart */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#17251D] border border-[#E2EBE3] dark:border-[#23382C] shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-[#14261C] dark:text-[#F0F7F2]">
                  Peak Focus Hours (24-Hour Histogram)
                </h3>
                <p className="text-xs text-gray-500">
                  {peakHour && peakHour.focusMinutes > 0
                    ? `Highest productivity around ${peakHour.label} (${peakHour.focusMinutes} total mins)`
                    : 'Complete sessions to reveal your natural daily chronotype flow.'}
                </p>
              </div>

              {peakHour && peakHour.focusMinutes > 0 && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold bg-[#EBF6EE] dark:bg-[#1C3626] text-[#40916C] rounded-full">
                  <Sparkles className="w-3.5 h-3.5" /> Peak: {peakHour.label}
                </span>
              )}
            </div>

            <div className="h-56 pt-6 flex items-end justify-between gap-1 sm:gap-2 overflow-x-auto pb-2 border-b border-gray-100 dark:border-gray-800">
              {hourly.map((h) => {
                const max = Math.max(...hourly.map((i) => i.focusMinutes), 30);
                const heightPct = Math.min(100, Math.max(h.focusMinutes > 0 ? 8 : 2, (h.focusMinutes / max) * 100));
                const isPeak = h.focusMinutes > 0 && h.focusMinutes === peakHour.focusMinutes;

                return (
                  <div key={h.hour} className="flex-1 min-w-[28px] flex flex-col items-center h-full justify-end group">
                    <div className="text-[9px] font-bold text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity mb-1">
                      {h.focusMinutes}m
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-[#223629] rounded-t-md h-36 flex items-end overflow-hidden p-0.5">
                      <div
                        className={`w-full rounded-t-sm transition-all duration-500 ${
                          isPeak
                            ? 'bg-[#52B788]'
                            : h.focusMinutes > 0
                            ? 'bg-[#40916C]'
                            : 'bg-gray-200 dark:bg-[#1E2E23]'
                        }`}
                        style={{ height: `${heightPct}%` }}
                      />
                    </div>
                    <span
                      className={`text-[10px] font-semibold mt-2 whitespace-nowrap ${
                        isPeak ? 'text-[#40916C] font-bold' : 'text-gray-400'
                      }`}
                    >
                      {h.label.replace(' ', '')}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'calendar' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-[#17251D] border border-[#E2EBE3] dark:border-[#23382C] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[#14261C] dark:text-[#F0F7F2]">
              {monthName} Focus Calendar
            </h3>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentMonthDate(new Date(year, month - 1, 1))}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#223629] text-gray-600 dark:text-gray-300"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentMonthDate(new Date(year, month + 1, 1))}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#223629] text-gray-600 dark:text-gray-300"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weekdays */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-gray-400">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Grid cells */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {cells.map((dayNum, idx) => {
              if (dayNum === null) {
                return <div key={`empty-${idx}`} className="h-14 rounded-xl" />;
              }

              const dayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const daySessions = dateMap[dayStr] || [];
              const hasFocus = daySessions.length > 0;
              const isToday = dayStr === todayStr;
              const isSelected = selectedCalendarDay?.dateStr === dayStr;

              return (
                <button
                  key={dayNum}
                  onClick={() => {
                    if (hasFocus) {
                      setSelectedCalendarDay({ dateStr: dayStr, sessions: daySessions });
                    } else {
                      setSelectedCalendarDay(null);
                    }
                  }}
                  className={`h-14 rounded-2xl flex flex-col items-center justify-center relative transition-all border ${
                    isSelected
                      ? 'border-[#40916C] bg-[#EBF6EE] dark:bg-[#1E3626] shadow-sm'
                      : hasFocus
                      ? 'bg-[#F2F9F4] dark:bg-[#16291E] border-transparent hover:border-[#40916C]/40'
                      : 'bg-gray-50/50 dark:bg-black/10 border-transparent text-gray-400'
                  } ${isToday ? 'ring-2 ring-[#40916C]' : ''}`}
                >
                  <span
                    className={`text-xs font-bold ${
                      hasFocus
                        ? 'text-[#1B4332] dark:text-[#74C69D]'
                        : 'text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    {dayNum}
                  </span>
                  {hasFocus && (
                    <span
                      className={`w-1.5 h-1.5 rounded-full mt-1 ${
                        daySessions.length >= 3 ? 'bg-[#2D6A4F]' : 'bg-[#52B788]'
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Selected Day Inspect Callout */}
          {selectedCalendarDay && (
            <div className="p-4 rounded-2xl bg-[#EBF6EE] dark:bg-[#1A3123] border border-[#CEE9D5] dark:border-[#274435] animate-in fade-in">
              <h4 className="text-sm font-bold text-[#14261C] dark:text-[#F0F7F2]">
                🌱 {selectedCalendarDay.dateStr}: {selectedCalendarDay.sessions.length} Focus Sessions
              </h4>
              <p className="text-xs text-[#2D6A4F] dark:text-[#74C69D] mt-0.5">
                Total Focus Time:{' '}
                {Math.round(
                  selectedCalendarDay.sessions.reduce((acc, s) => acc + s.actualDurationSec, 0) / 60
                )}{' '}
                minutes
              </p>
            </div>
          )}
        </div>
      )}

      {/* Link to Session Timeline */}
      <Link
        href="/history"
        className="p-5 rounded-2xl bg-white dark:bg-[#17251D] border border-[#E2EBE3] dark:border-[#23382C] shadow-sm hover:border-[#40916C] flex items-center justify-between group transition-all"
      >
        <div className="flex items-center gap-3">
          <CalendarIcon className="w-5 h-5 text-[#40916C]" />
          <div>
            <h4 className="text-sm font-bold text-[#14261C] dark:text-[#F0F7F2]">
              Explore Complete Session Logs & History
            </h4>
            <p className="text-xs text-gray-500">
              Browse timestamps, notes, and filter by completed/interrupted sessions
            </p>
          </div>
        </div>
        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-[#40916C] group-hover:translate-x-1 transition-all" />
      </Link>
    </div>
  );
}
