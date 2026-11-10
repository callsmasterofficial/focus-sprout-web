import { AmbientSoundId } from '@/types';

let audioCtx: AudioContext | null = null;
const activeNodes: Record<string, { gain: GainNode; source: AudioNode; filter?: BiquadFilterNode; lfo?: OscillatorNode }> = {};

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => { });
  }
  return audioCtx;
}

export const soundService = {
  // Harmonic completion bell chime (C5 + G5 + C6)
  playCompletionSound(type: string = 'chime') {
    if (type === 'none') return;
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const freqs = type === 'nature' ? [523.25, 659.25, 783.99] : [523.25, 659.25, 1046.5];

      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0.25, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 1.8);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 1.9);
      });
    } catch (e) {
      console.warn('Completion sound error:', e);
    }
  },

  // Subtle clock ticking sound
  playTickSound(volume: number = 0.2) {
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.025);

      gain.gain.setValueAtTime(volume * 0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.025);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.03);
    } catch (e) {
      // quiet fallback
    }
  },

  // Start procedural ambient sound (rain, ocean waves, forest canopy, white noise, campfire, cafe)
  startAmbientSound(id: AmbientSoundId, volume: number = 0.5) {
    const ctx = getAudioContext();
    if (!ctx) return;

    this.stopAmbientSound(id);

    try {
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;

        if (id === 'rain' || id === 'ocean' || id === 'cafe') {
          // Pink noise filter (1/f)
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          b3 = 0.86650 * b3 + white * 0.3104856;
          b4 = 0.55000 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.0168980;
          data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
          b6 = white * 0.115926;
        } else {
          // White noise
          data[i] = white * 0.14;
        }
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const filter = ctx.createBiquadFilter();
      let lfo: OscillatorNode | undefined;

      if (id === 'rain') {
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1100, ctx.currentTime);
      } else if (id === 'ocean') {
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(500, ctx.currentTime);

        // Low Frequency Oscillator for rolling swells
        lfo = ctx.createOscillator();
        lfo.frequency.setValueAtTime(0.12, ctx.currentTime);
        const lfoGain = ctx.createGain();
        lfoGain.gain.setValueAtTime(280, ctx.currentTime);
        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);
        lfo.start();
      } else if (id === 'forest' || id === 'birds') {
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(2200, ctx.currentTime);
        filter.Q.setValueAtTime(2.5, ctx.currentTime);
      } else if (id === 'campfire') {
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(700, ctx.currentTime);
      } else if (id === 'cafe') {
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1400, ctx.currentTime);
      } else {
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2800, ctx.currentTime);
      }

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(Math.min(1, Math.max(0, volume * 0.55)), ctx.currentTime);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start(0);

      activeNodes[id] = { gain, source: noise, filter, lfo };
    } catch (e) {
      console.warn('Failed to start ambient sound:', e);
    }
  },

  updateAmbientVolume(id: AmbientSoundId, volume: number) {
    if (activeNodes[id]) {
      const ctx = getAudioContext();
      if (ctx) {
        activeNodes[id].gain.gain.setValueAtTime(
          Math.min(1, Math.max(0, volume * 0.55)),
          ctx.currentTime
        );
      }
    }
  },

  stopAmbientSound(id: AmbientSoundId) {
    if (activeNodes[id]) {
      try {
        if (activeNodes[id].lfo) {
          activeNodes[id].lfo?.stop();
          activeNodes[id].lfo?.disconnect();
        }
        (activeNodes[id].source as AudioBufferSourceNode).stop();
        activeNodes[id].source.disconnect();
        activeNodes[id].gain.disconnect();
      } catch (e) {
        // already stopped
      }
      delete activeNodes[id];
    }
  },

  stopAllAmbientSounds() {
    Object.keys(activeNodes).forEach((id) => {
      this.stopAmbientSound(id as AmbientSoundId);
    });
  },
};

