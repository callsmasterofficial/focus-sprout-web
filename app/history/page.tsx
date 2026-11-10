'use client';

import React, { useState, useEffect } from 'react';
import {
  Calendar,
  CheckCircle2,
  AlertCircle,
  Trash2,
  MessageSquare,
  ShieldCheck,
  Clock,
  Filter,
} from 'lucide-react';
import { useAppStore } from '@/stores/useAppStore';
import { TimerMode } from '@/types';

export default function HistoryPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const { sessions, updateSessionNotes, deleteSession } = useAppStore();

  const [filterMode, setFilterMode] = useState<TimerMode | 'all'>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');

  if (!mounted) {
    return (
      <div className="p-8 text-center text-xs text-gray-400">
        Loading session timeline...
      </div>
    );
  }

  const filteredSessions = sessions.filter((s) => {
    if (filterMode === 'all') return true;
    return s.mode === filterMode;
  });

  const handleStartEdit = (id: string, existingNote?: string) => {
    setEditingId(id);
    setNoteText(existingNote || '');
  };

  const handleSaveNote = async (id: string) => {
    await updateSessionNotes(id, noteText.trim());
    setEditingId(null);
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      return isoString;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#14261C] dark:text-[#F0F7F2]">
          Session History & Timeline 📖
        </h1>
        <p className="text-xs sm:text-sm text-[#4A6253] dark:text-[#A9C4B3] mt-0.5">
          {sessions.length} total recorded focus and break sessions.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {(['all', 'focus', 'short_break', 'long_break'] as const).map((mode) => {
          const isSelected = filterMode === mode;
          const label =
            mode === 'all'
              ? 'All Sessions'
              : mode === 'focus'
              ? '🌱 Focus'
              : mode === 'short_break'
              ? '☕ Short Break'
              : '🧘 Long Break';

          return (
            <button
              key={mode}
              onClick={() => setFilterMode(mode)}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-full transition-all ${
                isSelected
                  ? 'bg-[#40916C] text-white shadow-sm'
                  : 'bg-white dark:bg-[#17251D] text-[#4A6253] dark:text-[#A9C4B3] border border-[#E2EBE3] dark:border-[#23382C] hover:bg-[#F2F7F3]'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Sessions List */}
      <div className="space-y-3">
        {filteredSessions.length > 0 ? (
          filteredSessions.map((session) => {
            const mins = Math.round(session.actualDurationSec / 60);
            const isEditing = editingId === session.id;

            return (
              <div
                key={session.id}
                className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#17251D] border border-[#E2EBE3] dark:border-[#23382C] shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        session.mode === 'focus'
                          ? 'bg-[#EBF6EE] dark:bg-[#1C3A27] text-[#1B4332] dark:text-[#74C69D]'
                          : session.mode === 'short_break'
                          ? 'bg-[#E0F2F1] dark:bg-[#172B2B] text-[#1A655F]'
                          : 'bg-[#FFE8D6] dark:bg-[#2E1F1A] text-[#A04328]'
                      }`}
                    >
                      {session.mode === 'focus'
                        ? '🌱 Focus'
                        : session.mode === 'short_break'
                        ? '☕ Short Break'
                        : '🧘 Long Break'}
                    </span>

                    <span className="text-sm font-extrabold text-[#14261C] dark:text-[#F0F7F2]">
                      {mins} mins
                    </span>

                    {session.completed ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#40916C]">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Finished
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#E76F51]">
                        <AlertCircle className="w-3.5 h-3.5" /> Interrupted
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      if (confirm('Delete this session record?')) {
                        deleteSession(session.id);
                      }
                    }}
                    className="text-gray-300 hover:text-red-500 transition-colors p-1"
                    title="Delete record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Target Task Title */}
                {session.taskTitle && (
                  <div className="text-xs font-bold text-[#14261C] dark:text-[#F0F7F2]">
                    🎯 {session.taskTitle}
                  </div>
                )}

                {/* Meta row */}
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <span>{formatDate(session.startedAt)}</span>
                  {session.category && <span>• 🏷️ {session.category}</span>}
                  {session.distractionShieldActive && (
                    <span className="text-[#40916C] font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> Shield Guarded
                    </span>
                  )}
                </div>

                {/* Notes Section */}
                <div className="pt-2 border-t border-gray-100 dark:border-gray-800 text-xs">
                  {isEditing ? (
                    <div className="space-y-2">
                      <textarea
                        rows={2}
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        placeholder="Add reflections, accomplishments, or thoughts..."
                        className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-[#2A4032] bg-gray-50 dark:bg-[#142119] text-[#14261C] dark:text-[#F0F7F2] focus:outline-none focus:ring-2 focus:ring-[#40916C]"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-3 py-1 text-xs text-gray-500 hover:text-gray-700"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSaveNote(session.id)}
                          className="px-3 py-1 text-xs font-bold text-white bg-[#40916C] rounded-lg"
                        >
                          Save Reflection
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleStartEdit(session.id, session.notes)}
                      className="text-left w-full flex items-center gap-2 text-gray-500 hover:text-[#40916C] transition-colors"
                    >
                      <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                      <span className={session.notes ? 'text-[#14261C] dark:text-[#F0F7F2]' : 'italic text-gray-400'}>
                        {session.notes || 'Tap to add reflection notes...'}
                      </span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#17251D] border border-dashed border-[#CEE9D5] dark:border-[#23382C] space-y-2">
            <Clock className="w-10 h-10 text-gray-400 mx-auto" />
            <h3 className="text-sm font-bold text-[#14261C] dark:text-[#F0F7F2]">
              No sessions found
            </h3>
            <p className="text-xs text-gray-500">
              Complete your next Pomodoro session to add to your focus timeline!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
