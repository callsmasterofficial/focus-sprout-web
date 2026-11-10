'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Plus,
  CheckCircle2,
  Circle,
  Trash2,
  Play,
  X,
  Sprout,
  Filter,
  Calendar,
} from 'lucide-react';
import { useAppStore } from '@/stores/useAppStore';
import { Task, TaskPriority } from '@/types';

const CATEGORIES = ['All', 'Work', 'Study', 'Health', 'Personal', 'Coding'];

export default function TasksPage() {
  const router = useRouter();
  const {
    tasks,
    selectedTaskId,
    selectTask,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskCompleted,
    startTimer,
  } = useAppStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed'>('active');

  // New task modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState('Work');
  const [newPriority, setNewPriority] = useState<TaskPriority>('medium');
  const [newPomos, setNewPomos] = useState(2);
  const [autoSelectFocus, setAutoSelectFocus] = useState(true);

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === 'All' || task.category === selectedCategory;

    const matchesStatus =
      filterStatus === 'all'
        ? true
        : filterStatus === 'active'
          ? !task.completed
          : task.completed;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const created = await addTask({
      title: newTitle.trim(),
      description: newDesc.trim() || undefined,
      category: newCategory,
      priority: newPriority,
      estimatedPomodoros: newPomos,
    });

    if (autoSelectFocus) {
      selectTask(created.id);
    }

    setNewTitle('');
    setNewDesc('');
    setShowAddModal(false);
  };

  const handleFocusTask = (taskId: string) => {
    selectTask(taskId);
    router.push('/timer');
  };

  const getPriorityStyle = (priority: TaskPriority) => {
    if (priority === 'high') {
      return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/50';
    }
    if (priority === 'medium') {
      return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/50';
    }
    return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-900/50';
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-300">
      {/* Top Header & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#14261C] dark:text-[#F0F7F2]">
            Tasks & Habits
          </h1>
          <p className="text-xs sm:text-sm text-[#4A6253] dark:text-[#A9C4B3] mt-0.5">
            Organize goals, estimate Pomodoros, and water your daily habits.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-[#40916C] hover:bg-[#2D6A4F] rounded-xl shadow-md transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Task</span>
        </button>
      </div>

      {/* Search Input & Category Filters */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search tasks, notes, or categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 text-xs rounded-xl border border-[#E2EBE3] dark:border-[#23382C] bg-white dark:bg-[#17251D] text-[#14261C] dark:text-[#F0F7F2] focus:outline-none focus:ring-2 focus:ring-[#40916C]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Status filter tabs */}
        <div className="flex p-1 bg-gray-100 dark:bg-[#1A281F] rounded-xl self-start md:self-auto">
          {(['active', 'completed', 'all'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all capitalize ${filterStatus === status
                  ? 'bg-white dark:bg-[#2D6A4F] text-[#14261C] dark:text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-bold rounded-full whitespace-nowrap transition-all ${isSelected
                  ? 'bg-[#40916C] text-white shadow-sm'
                  : 'bg-white dark:bg-[#17251D] text-[#4A6253] dark:text-[#A9C4B3] border border-[#E2EBE3] dark:border-[#23382C] hover:bg-[#F2F7F3]'
                }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Task Cards List */}
      <div className="space-y-3">
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => {
            const isSelected = selectedTaskId === task.id;

            return (
              <div
                key={task.id}
                className={`p-4 rounded-2xl bg-white dark:bg-[#17251D] border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${isSelected
                    ? 'border-2 border-[#40916C] shadow-md'
                    : 'border-[#E2EBE3] dark:border-[#23382C] hover:border-[#40916C]/60 shadow-sm'
                  } ${task.completed ? 'opacity-65' : ''}`}
              >
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  {/* Complete Checkbox */}
                  <button
                    onClick={() => toggleTaskCompleted(task.id)}
                    className="mt-0.5 text-[#40916C] hover:scale-110 transition-transform shrink-0"
                    title={task.completed ? 'Mark incomplete' : 'Mark completed'}
                  >
                    {task.completed ? (
                      <CheckCircle2 className="w-5 h-5 fill-[#40916C] text-white" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-300 dark:text-gray-600 hover:text-[#40916C]" />
                    )}
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3
                        className={`text-sm sm:text-base font-bold text-[#14261C] dark:text-[#F0F7F2] truncate ${task.completed ? 'line-through text-gray-400 dark:text-gray-500' : ''
                          }`}
                      >
                        {task.title}
                      </h3>
                      {isSelected && (
                        <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 bg-[#40916C] text-white rounded">
                          FOCUS TARGET
                        </span>
                      )}
                    </div>

                    {task.description && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                        {task.description}
                      </p>
                    )}

                    {/* Badges & Pomodoros */}
                    <div className="flex items-center gap-2 mt-2.5 flex-wrap text-xs">
                      <span className="px-2 py-0.5 rounded-full bg-[#EBF6EE] dark:bg-[#1C3626] text-[#2D6A4F] dark:text-[#74C69D] font-bold text-[11px]">
                        🏷️ {task.category}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold text-[11px] border ${getPriorityStyle(
                          task.priority
                        )}`}
                      >
                        {task.priority.toUpperCase()}
                      </span>
                      <span className="flex items-center gap-1 font-bold text-[#40916C] text-[11px]">
                        <Sprout className="w-3.5 h-3.5" />
                        {task.completedPomodoros}/{task.estimatedPomodoros} Pomos
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Action buttons */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  {!task.completed && (
                    <button
                      onClick={() => handleFocusTask(task.id)}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${isSelected
                          ? 'bg-[#40916C] text-white shadow-sm'
                          : 'bg-[#EFF7F1] dark:bg-[#1F3327] text-[#40916C] hover:bg-[#E2F0E6]'
                        }`}
                      title="Load into timer"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>{isSelected ? 'Active' : 'Focus'}</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      if (confirm(`Delete task "${task.title}"?`)) {
                        deleteTask(task.id);
                      }
                    }}
                    className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                    title="Delete task"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#17251D] border border-dashed border-[#CEE9D5] dark:border-[#23382C] space-y-3">
            <Sprout className="w-12 h-12 text-[#52B788] mx-auto animate-bounce" />
            <h3 className="text-base font-bold text-[#14261C] dark:text-[#F0F7F2]">
              No tasks found
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
              {searchQuery
                ? 'No tasks match your search filter.'
                : 'Plan your deep focus sessions by adding a new goal or to-do task.'}
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-[#40916C] rounded-xl hover:bg-[#2D6A4F]"
            >
              <Plus className="w-4 h-4" /> Add Your First Task
            </button>
          </div>
        )}
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg p-6 bg-white dark:bg-[#17251D] border border-gray-200 dark:border-[#253A2E] rounded-3xl shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#14261C] dark:text-[#F0F7F2]">
                Create New Focus Task 🌱
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#14261C] dark:text-[#F0F7F2] mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Build Chrome Extension for FocusSprout"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-200 dark:border-[#2A4032] bg-gray-50 dark:bg-[#142119] text-[#14261C] dark:text-[#F0F7F2] focus:outline-none focus:ring-2 focus:ring-[#40916C]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#14261C] dark:text-[#F0F7F2] mb-1">
                  Notes & Context (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Key milestones, specifications, links..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 dark:border-[#2A4032] bg-gray-50 dark:bg-[#142119] text-[#14261C] dark:text-[#F0F7F2] focus:outline-none focus:ring-2 focus:ring-[#40916C]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#14261C] dark:text-[#F0F7F2] mb-1">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-[#2A4032] bg-gray-50 dark:bg-[#142119] text-[#14261C] dark:text-[#F0F7F2] focus:outline-none focus:ring-2 focus:ring-[#40916C]"
                  >
                    {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#14261C] dark:text-[#F0F7F2] mb-1">
                    Priority
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as TaskPriority)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-[#2A4032] bg-gray-50 dark:bg-[#142119] text-[#14261C] dark:text-[#F0F7F2] focus:outline-none focus:ring-2 focus:ring-[#40916C]"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#14261C] dark:text-[#F0F7F2] mb-1">
                  Estimated Pomodoros (25m sessions)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={newPomos}
                    onChange={(e) => setNewPomos(parseInt(e.target.value))}
                    className="flex-1 accent-[#40916C]"
                  />
                  <span className="w-12 text-center text-xs font-bold px-2 py-1 bg-[#EBF6EE] dark:bg-[#1E3626] text-[#40916C] rounded-lg">
                    {newPomos} Pomo
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 mt-1">
                  ≈ {newPomos * 25} minutes of deep focused work
                </p>
              </div>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#14261C] dark:text-[#F0F7F2]">
                <input
                  type="checkbox"
                  checked={autoSelectFocus}
                  onChange={(e) => setAutoSelectFocus(e.target.checked)}
                  className="rounded accent-[#40916C]"
                />
                Set as active focus task immediately
              </label>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 text-xs font-semibold rounded-xl text-gray-600 hover:bg-gray-100 dark:hover:bg-[#223328]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 text-xs font-bold text-white bg-[#40916C] hover:bg-[#2D6A4F] rounded-xl shadow-sm"
                >
                  Plant Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

