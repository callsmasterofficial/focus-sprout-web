'use client';

import React, { useState } from 'react';
import {
  Shield,
  ShieldCheck,
  Plus,
  Trash2,
  ExternalLink,
  Laptop,
  Smartphone,
  Globe,
  Clock,
  Check,
} from 'lucide-react';
import { useAppStore } from '@/stores/useAppStore';

export default function DistractionPage() {
  const {
    rules,
    toggleRule,
    addCustomRule,
    deleteRule,
    distractionShieldActive,
    toggleDistractionShield,
    settings,
    updateSettings,
  } = useAppStore();

  const [showAddForm, setShowAddForm] = useState(false);
  const [newRuleName, setNewRuleName] = useState('');
  const [newRuleUrl, setNewRuleUrl] = useState('');

  const handleAddRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRuleName.trim()) return;
    await addCustomRule(newRuleName.trim(), newRuleUrl.trim() || undefined);
    setNewRuleName('');
    setNewRuleUrl('');
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#14261C] dark:text-[#F0F7F2]">
          Distraction Shield 🛡️
        </h1>
        <p className="text-xs sm:text-sm text-[#4A6253] dark:text-[#A9C4B3] mt-0.5">
          Establish healthy digital boundaries, guard focus sessions, and eliminate tab jumping.
        </p>
      </div>

      {/* Master Shield Toggle Card */}
      <div
        className={`p-6 rounded-3xl border transition-all ${distractionShieldActive
            ? 'bg-[#EBF6EE] dark:bg-[#162C20] border-[#40916C] shadow-md'
            : 'bg-white dark:bg-[#17251D] border-[#E2EBE3] dark:border-[#23382C] shadow-sm'
          }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${distractionShieldActive
                  ? 'bg-[#40916C] text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                }`}
            >
              {distractionShieldActive ? (
                <ShieldCheck className="w-6 h-6" />
              ) : (
                <Shield className="w-6 h-6" />
              )}
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#14261C] dark:text-[#F0F7F2]">
                Distraction Shield {distractionShieldActive ? 'is Armed' : 'is Paused'}
              </h2>
              <p className="text-xs text-[#4A6253] dark:text-[#A9C4B3] mt-0.5">
                {distractionShieldActive
                  ? 'Guarding active focus sessions against tab-switching and impulse exits.'
                  : 'Restrictions are turned off. Enable to stay committed during Pomodoros.'}
              </p>
            </div>
          </div>

          <button
            onClick={() => toggleDistractionShield()}
            className={`px-5 py-2.5 text-xs font-bold rounded-xl transition-all self-end sm:self-auto ${distractionShieldActive
                ? 'bg-[#1B4332] text-white hover:bg-[#132A13]'
                : 'bg-[#40916C] text-white hover:bg-[#2D6A4F]'
              }`}
          >
            {distractionShieldActive ? 'Deactivate Shield' : 'Activate Shield'}
          </button>
        </div>
      </div>

      {/* Emergency Exit Delay Challenge */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#17251D] border border-[#E2EBE3] dark:border-[#23382C] shadow-sm space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#EDF7F6] dark:bg-[#1A3331] text-[#2A9D8F] flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#14261C] dark:text-[#F0F7F2]">
              Emergency Exit Delay Challenge
            </h3>
            <p className="text-xs text-[#4A6253] dark:text-[#A9C4B3] mt-0.5">
              Requires a brief moment of reflection before abandoning or pausing an active session to break impulse phone/tab checking.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 pt-2">
          {[
            { label: 'None (Instant Exit)', val: 0, sub: 'No pause required' },
            { label: '5s Deep Breath', val: 5, sub: 'Quick mindful pause' },
            { label: '10s Reflection', val: 10, sub: 'Strong impulse curb' },
          ].map((item) => {
            const isSelected = settings.emergencyExitDelaySec === item.val;
            return (
              <button
                key={item.val}
                onClick={() => updateSettings({ emergencyExitDelaySec: item.val })}
                className={`p-3 rounded-2xl border text-center transition-all ${isSelected
                    ? 'border-[#40916C] bg-[#EBF6EE] dark:bg-[#1C3626] text-[#1B4332] dark:text-[#74C69D] font-bold shadow-sm'
                    : 'border-gray-200 dark:border-[#283D32] bg-gray-50/50 dark:bg-black/10 text-gray-600 dark:text-gray-400 hover:bg-gray-100'
                  }`}
              >
                <div className="text-xs font-bold">{item.label}</div>
                <div className="text-[10px] text-gray-500 mt-0.5">{item.sub}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Target Distractions Checklist */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#17251D] border border-[#E2EBE3] dark:border-[#23382C] shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-[#14261C] dark:text-[#F0F7F2]">
              Target Distraction Sites & Apps
            </h3>
            <p className="text-xs text-[#4A6253] dark:text-[#A9C4B3]">
              Synchronized with the Chrome Extension for real-time URL blocking during Focus sessions.
            </p>
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-[#EBF6EE] dark:bg-[#1C3626] text-[#40916C] rounded-xl hover:bg-[#D8F3DC] transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Site</span>
          </button>
        </div>

        {/* Add custom rule form */}
        {showAddForm && (
          <form
            onSubmit={handleAddRule}
            className="p-4 rounded-2xl bg-[#F6F9F6] dark:bg-[#142119] border border-[#E1EBE2] dark:border-[#23382C] space-y-3 animate-in fade-in"
          >
            <h4 className="text-xs font-bold text-[#14261C] dark:text-[#F0F7F2]">
              Add Website / App Boundary
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                required
                placeholder="Name (e.g. Reddit, Discord)"
                value={newRuleName}
                onChange={(e) => setNewRuleName(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-[#2A4032] bg-white dark:bg-[#17251D] text-[#14261C] dark:text-[#F0F7F2] focus:outline-none focus:ring-2 focus:ring-[#40916C]"
              />
              <input
                type="text"
                placeholder="Domain (e.g. reddit.com)"
                value={newRuleUrl}
                onChange={(e) => setNewRuleUrl(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-[#2A4032] bg-white dark:bg-[#17251D] text-[#14261C] dark:text-[#F0F7F2] focus:outline-none focus:ring-2 focus:ring-[#40916C]"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-bold text-white bg-[#40916C] hover:bg-[#2D6A4F] rounded-xl shadow-sm"
              >
                Save Boundary
              </button>
            </div>
          </form>
        )}

        {/* Rules list */}
        <div className="space-y-2">
          {rules.map((rule) => (
            <div
              key={rule.id}
              className="p-3.5 rounded-xl border border-gray-100 dark:border-[#203426] bg-[#FDFEFE] dark:bg-[#142119] flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <Globe className={`w-4 h-4 ${rule.enabled ? 'text-[#40916C]' : 'text-gray-300'}`} />
                <div>
                  <span className={`text-xs font-bold ${rule.enabled ? 'text-[#14261C] dark:text-[#F0F7F2]' : 'text-gray-400 line-through'}`}>
                    {rule.name}
                  </span>
                  {rule.website && (
                    <span className="block text-[10px] text-gray-400 font-mono">
                      {rule.website}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                {rule.category === 'custom' && (
                  <button
                    onClick={() => deleteRule(rule.id)}
                    className="text-gray-300 hover:text-red-500 transition-colors"
                    title="Remove custom rule"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rule.enabled}
                    onChange={() => toggleRule(rule.id)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#40916C]" />
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chrome Extension & OS Sync Banner */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#17251D] border border-[#E2EBE3] dark:border-[#23382C] shadow-sm space-y-3">
        <div className="flex items-center gap-3">
          <Laptop className="w-5 h-5 text-[#40916C]" />
          <h3 className="text-base font-bold text-[#14261C] dark:text-[#F0F7F2]">
            Chrome Extension Active Interception
          </h3>
        </div>
        <p className="text-xs text-[#4A6253] dark:text-[#A9C4B3] leading-relaxed">
          When using the <strong>FocusSprout Chrome Extension</strong>, any attempted navigation to guarded websites during an active Focus timer redirects to an encouraging mindfulness page with your growing sprout!
        </p>
      </div>
    </div>
  );
}

