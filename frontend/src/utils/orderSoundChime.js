/**
 * Web Audio API Order Chime & Alert Synthesizer
 * 
 * Synthesizes a high-fidelity e-commerce order notification chime (like Swiggy / Zomato / Meesho)
 * without requiring any external MP3/audio assets or network requests.
 * Plays automatically when an order is received and shuts off cleanly in 3 to 4 seconds.
 */

const STORAGE_KEY = 'mshoppy_supplier_sound_alerts';

// Active sound state references
let activeAudioCtx = null;
let activeMasterGain = null;
let activeStopTimer = null;
let isCurrentlyPlaying = false;
const listeners = new Set();

function notifyListeners(state) {
  isCurrentlyPlaying = state;
  listeners.forEach((fn) => {
    try {
      fn(state);
    } catch (_) {}
  });
}

/**
 * Check if sound alerts are enabled (defaults to true)
 */
export function isSoundAlertEnabled() {
  try {
    const val = localStorage.getItem(STORAGE_KEY);
    return val === null ? true : val === 'true';
  } catch (_) {
    return true;
  }
}

/**
 * Set sound alert preference in localStorage
 */
export function setSoundAlertEnabled(enabled) {
  try {
    localStorage.setItem(STORAGE_KEY, enabled ? 'true' : 'false');
  } catch (_) {}
}

/**
 * Check if the order chime is currently actively ringing
 */
export function isOrderChimePlaying() {
  return isCurrentlyPlaying;
}

/**
 * Subscribe to chime play/stop status changes
 */
export function subscribeChimeState(callback) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

/**
 * Immediately stop and silence any currently playing chime
 */
export function stopOrderChime() {
  if (activeStopTimer) {
    clearTimeout(activeStopTimer);
    activeStopTimer = null;
  }

  if (activeMasterGain && activeAudioCtx) {
    try {
      const now = activeAudioCtx.currentTime;
      activeMasterGain.gain.setValueAtTime(activeMasterGain.gain.value, now);
      activeMasterGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);
      setTimeout(() => {
        try {
          if (activeAudioCtx && activeAudioCtx.state !== 'closed') {
            activeAudioCtx.close().catch(() => {});
          }
        } catch (_) {}
        activeAudioCtx = null;
        activeMasterGain = null;
        notifyListeners(false);
      }, 60);
      return;
    } catch (_) {}
  }

  activeAudioCtx = null;
  activeMasterGain = null;
  notifyListeners(false);
}

/**
 * Synthesize and play the official "New Order Received" melodic chime.
 * Runs a continuous 3-stage melodic merchant chime that lasts ~3.5 to 3.8 seconds
 * and automatically shuts off and disconnects.
 */
export function playOrderChime(options = {}) {
  if (!isSoundAlertEnabled()) return;

  // If already playing, stop previous instance first
  stopOrderChime();

  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    activeAudioCtx = ctx;

    // Master gain node for overall volume & clean master fade-out
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(1.0, ctx.currentTime);
    masterGain.connect(ctx.destination);
    activeMasterGain = masterGain;

    const now = ctx.currentTime;
    notifyListeners(true);

    /**
     * 3-Stage Melodic Wave Sequence (~3.5 to 3.8s total duration):
     * - Stage 1 (0.0s - 1.0s): Ascending C5-E5-G5-C6 Bell Arpeggio + 2093 Hz Shimmer
     * - Stage 2 (1.1s - 2.1s): Bright Confirmation E5-G5-C6-E6 + 2637 Hz Sparkle
     * - Stage 3 (2.2s - 3.4s): Celebration Finale G5-C6-G6 + Resonant Acoustic Bell Chord
     * - 3.4s - 3.6s: Smooth Acoustic Fade-Out to 0 (Off)
     */
    const notes = [
      // --- STAGE 1: Initial Arrival Ding ---
      { freq: 523.25, time: now + 0.00, duration: 0.26, gain: 0.22, type: 'triangle' }, // C5
      { freq: 659.25, time: now + 0.10, duration: 0.28, gain: 0.24, type: 'triangle' }, // E5
      { freq: 783.99, time: now + 0.20, duration: 0.30, gain: 0.26, type: 'triangle' }, // G5
      { freq: 1046.50, time: now + 0.32, duration: 0.65, gain: 0.30, type: 'triangle' }, // C6
      { freq: 2093.00, time: now + 0.34, duration: 0.70, gain: 0.14, type: 'sine' },     // C7 Shimmer

      // --- STAGE 2: Mid Confirmation Melody ---
      { freq: 659.25, time: now + 1.15, duration: 0.26, gain: 0.22, type: 'triangle' }, // E5
      { freq: 783.99, time: now + 1.28, duration: 0.28, gain: 0.25, type: 'triangle' }, // G5
      { freq: 1046.50, time: now + 1.42, duration: 0.32, gain: 0.28, type: 'triangle' }, // C6
      { freq: 1318.51, time: now + 1.58, duration: 0.65, gain: 0.30, type: 'triangle' }, // E6
      { freq: 2637.02, time: now + 1.60, duration: 0.75, gain: 0.14, type: 'sine' },     // E7 Sparkle

      // --- STAGE 3: Final Resolution & Resonant Chime ---
      { freq: 783.99, time: now + 2.25, duration: 0.25, gain: 0.22, type: 'triangle' }, // G5
      { freq: 1046.50, time: now + 2.38, duration: 0.28, gain: 0.26, type: 'triangle' }, // C6
      { freq: 1567.98, time: now + 2.52, duration: 0.85, gain: 0.32, type: 'triangle' }, // G6 Triumphant
      { freq: 261.63, time: now + 2.55, duration: 0.95, gain: 0.15, type: 'sine' },     // C4 Warm Root
      { freq: 523.25, time: now + 2.55, duration: 0.95, gain: 0.20, type: 'triangle' }, // C5 Warm Bell
      { freq: 3135.96, time: now + 2.55, duration: 0.85, gain: 0.10, type: 'sine' },     // G7 Glass Shimmer
    ];

    notes.forEach(({ freq, time, duration, gain, type = 'triangle' }) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, time);

      // Acoustic attack & natural decay envelope
      gainNode.gain.setValueAtTime(0.0001, time);
      gainNode.gain.exponentialRampToValueAtTime(gain, time + 0.025);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, time + duration);

      osc.connect(gainNode);
      gainNode.connect(masterGain);

      osc.start(time);
      osc.stop(time + duration + 0.05);
    });

    // Master fade out smoothly between 3.4s and 3.6s
    masterGain.gain.setValueAtTime(1.0, now + 3.35);
    masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 3.60);

    // Automatic shutdown timer: Turns completely off at 3.65 seconds
    activeStopTimer = setTimeout(() => {
      stopOrderChime();
    }, 3650);

  } catch (err) {
    console.warn('[OrderChime] Web Audio playback note:', err);
    notifyListeners(false);
  }
}

/**
 * Full test chime (plays the exact 3.5s merchant chime for verification)
 */
export function playTestChime() {
  playOrderChime();
}

// Auto-unlock AudioContext on first user interaction to comply with browser autoplay policies
if (typeof window !== 'undefined') {
  const unlockAudio = () => {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        const dummyCtx = new AudioContextClass();
        if (dummyCtx.state === 'suspended') {
          dummyCtx.resume().then(() => dummyCtx.close()).catch(() => {});
        } else {
          dummyCtx.close().catch(() => {});
        }
      }
    } catch (_) {}
    window.removeEventListener('click', unlockAudio);
    window.removeEventListener('keydown', unlockAudio);
    window.removeEventListener('touchstart', unlockAudio);
  };

  window.addEventListener('click', unlockAudio, { once: true, passive: true });
  window.addEventListener('keydown', unlockAudio, { once: true, passive: true });
  window.addEventListener('touchstart', unlockAudio, { once: true, passive: true });
}


