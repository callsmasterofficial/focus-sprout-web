'use client';

import React from 'react';
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  Plus,
  Minus,
  Info,
  CloudRain,
  Trees,
  Waves,
  Radio,
  Flame,
  Coffee,
} from 'lucide-react';
import { useAppStore } from '@/stores/useAppStore';
import { AmbientSoundId } from '@/types';

const ICON_MAP: Record<string, React.ElementType> = {
  CloudRain,
  Trees,
  Waves,
  Radio,
  Flame,
  Coffee,
};

export default function SoundsPage() {
  const {
    tracks,
    masterVolume,
    isMasterPlaying,
    toggleTrack,
    setTrackVolume,
    setMasterVolume,
    stopAllTracks,
  } = useAppStore();

  const handleMasterDown = () => {
    setMasterVolume(Math.max(0.1, Math.round((masterVolume - 0.1) * 10) / 10));
  };

  const handleMasterUp = () => {
    setMasterVolume(Math.min(1.0, Math.round((masterVolume + 0.1) * 10) / 10));
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#14261C] dark:text-[#F0F7F2]">
          Ambient Sound Mixer 🎧
        </h1>
        <p className="text-xs sm:text-sm text-[#4A6253] dark:text-[#A9C4B3] mt-0.5">
          Mix offline procedural soundscapes to mask noisy environments and enter peak flow state.
        </p>
      </div>

      {/* Master Volume Bar */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#17251D] border border-[#E2EBE3] dark:border-[#23382C] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#EBF6EE] dark:bg-[#1C3A27] text-[#40916C] flex items-center justify-center">
            {isMasterPlaying ? <Volume2 className="w-5 h-5 animate-pulse" /> : <VolumeX className="w-5 h-5" />}
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#14261C] dark:text-[#F0F7F2]">
              Master Ambient Volume
            </h3>
            <span className="text-xs font-semibold text-[#40916C]">
              {Math.round(masterVolume * 100)}% output
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          <button
            onClick={handleMasterDown}
            className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-[#223629] text-gray-700 dark:text-gray-200 flex items-center justify-center hover:bg-gray-200"
          >
            <Minus className="w-4 h-4" />
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={masterVolume}
            onChange={(e) => setMasterVolume(parseFloat(e.target.value))}
            className="w-32 sm:w-40 accent-[#40916C]"
          />
          <button
            onClick={handleMasterUp}
            className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-[#223629] text-gray-700 dark:text-gray-200 flex items-center justify-center hover:bg-gray-200"
          >
            <Plus className="w-4 h-4" />
          </button>

          {isMasterPlaying && (
            <button
              onClick={stopAllTracks}
              className="ml-2 px-3 py-1.5 text-xs font-bold text-white bg-[#E76F51] hover:bg-[#BA5238] rounded-xl transition-all"
            >
              Mute All
            </button>
          )}
        </div>
      </div>

      {/* Sound Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tracks.map((sound) => {
          const Icon = ICON_MAP[sound.icon] || CloudRain;

          return (
            <div
              key={sound.id}
              className={`p-5 rounded-2xl bg-white dark:bg-[#17251D] border transition-all space-y-4 ${sound.isPlaying
                  ? 'border-2 border-[#40916C] shadow-md'
                  : 'border-[#E2EBE3] dark:border-[#23382C] shadow-sm hover:border-[#40916C]/60'
                }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${sound.isPlaying
                        ? 'bg-[#40916C] text-white shadow-sm'
                        : 'bg-[#EFF4EF] dark:bg-[#1E3024] text-[#2D6A4F] dark:text-[#A9C4B3]'
                      }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#14261C] dark:text-[#F0F7F2]">
                      {sound.name}
                    </h3>
                    <p className="text-xs text-[#4A6253] dark:text-[#A9C4B3] mt-0.5">
                      {sound.description}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => toggleTrack(sound.id)}
                  className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all ${sound.isPlaying
                      ? 'bg-[#40916C] text-white'
                      : 'bg-[#EFF7F1] dark:bg-[#1C2C22] text-[#40916C] hover:bg-[#D8F3DC]'
                    }`}
                  title={sound.isPlaying ? 'Pause sound' : 'Play sound'}
                >
                  {sound.isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                </button>
              </div>

              {/* Volume Slider if playing */}
              {sound.isPlaying && (
                <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-3 animate-in fade-in">
                  <span className="text-xs font-semibold text-gray-500">Volume</span>
                  <input
                    type="range"
                    min={0.1}
                    max={1}
                    step={0.05}
                    value={sound.volume}
                    onChange={(e) => setTrackVolume(sound.id, parseFloat(e.target.value))}
                    className="flex-1 accent-[#40916C]"
                  />
                  <span className="w-10 text-right text-xs font-bold text-[#40916C]">
                    {Math.round(sound.volume * 100)}%
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Info Callout */}
      <div className="p-4 rounded-2xl bg-[#EBF6EE] dark:bg-[#172B20] border border-[#CEE9D5] dark:border-[#23422E] flex items-start gap-3 text-xs text-[#2D6A4F] dark:text-[#A9C4B3]">
        <Info className="w-4 h-4 shrink-0 mt-0.5 text-[#40916C]" />
        <div>
          <span className="font-bold">Acoustic Procedural Synthesis:</span> Ambient audio is generated entirely in real-time in your browser using the HTML5 Web Audio API. It requires no streaming bandwidth, works offline, and produces non-repeating natural pink/white noise and acoustic resonance.
        </div>
      </div>
    </div>
  );
}

