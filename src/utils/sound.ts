/**
 * Lightweight sound effects using Web Audio API.
 * No external audio files needed — all sounds are synthesized.
 */

let ctx: AudioContext | null = null;
let unlocked = false;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  }
  return ctx;
}

/** Must be called from a user gesture to unlock audio on mobile */
export function unlockAudio() {
  if (unlocked) return;
  const c = getCtx();
  if (c && c.state === 'suspended') c.resume();
  unlocked = true;
}

function playTone(freq: number, duration: number, type: OscillatorType = 'sine', volume = 0.15) {
  const c = getCtx();
  if (!c) return;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(volume, c.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
  osc.connect(gain).connect(c.destination);
  osc.start(c.currentTime);
  osc.stop(c.currentTime + duration);
}

export const SFX = {
  /** Short tap / button click */
  tap() {
    playTone(800, 0.08, 'sine', 0.12);
  },

  /** Countdown beep (3-2-1) */
  countdownTick() {
    playTone(600, 0.15, 'sine', 0.15);
  },

  /** Countdown "GO!" */
  countdownGo() {
    playTone(880, 0.1, 'square', 0.12);
    setTimeout(() => playTone(1100, 0.2, 'square', 0.12), 100);
  },

  /** Positive result (win / correct answer) */
  success() {
    playTone(523, 0.12, 'sine', 0.15);
    setTimeout(() => playTone(659, 0.12, 'sine', 0.15), 120);
    setTimeout(() => playTone(784, 0.2, 'sine', 0.15), 240);
  },

  /** Negative result (lose / wrong / bomb) */
  fail() {
    playTone(300, 0.15, 'sawtooth', 0.1);
    setTimeout(() => playTone(200, 0.3, 'sawtooth', 0.1), 150);
  },

  /** Explosion / bomb */
  boom() {
    const c = getCtx();
    if (!c) return;
    const bufferSize = c.sampleRate * 0.3;
    const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }
    const noise = c.createBufferSource();
    const gain = c.createGain();
    noise.buffer = buffer;
    gain.gain.setValueAtTime(0.2, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.3);
    noise.connect(gain).connect(c.destination);
    noise.start();
  },

  /** Spinning / roulette tick */
  tick() {
    playTone(1200, 0.03, 'square', 0.08);
  },

  /** Dice roll */
  roll() {
    for (let i = 0; i < 5; i++) {
      setTimeout(() => playTone(400 + Math.random() * 400, 0.05, 'triangle', 0.08), i * 60);
    }
  },

  /** Coin flip */
  flip() {
    playTone(1000, 0.06, 'sine', 0.1);
    setTimeout(() => playTone(1200, 0.06, 'sine', 0.1), 80);
  },

  /** Game over fanfare */
  fanfare() {
    const notes = [523, 587, 659, 784, 880, 1047];
    notes.forEach((freq, i) => {
      setTimeout(() => playTone(freq, 0.15, 'sine', 0.12), i * 100);
    });
  },
} as const;
