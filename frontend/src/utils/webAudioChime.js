/**
 * Native Web Audio API Chime Generator
 * Synthesizes a crisp, melodious cashier / merchant order chime without downloading any external MP3 files.
 * Zero network dependencies, zero 404 errors, zero CORS issues, instant playback.
 */

let cachedAudioContext = null;

function getAudioContext() {
  if (typeof window === 'undefined') return null;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;

  if (!cachedAudioContext || cachedAudioContext.state === 'closed') {
    cachedAudioContext = new AudioContextClass();
  }

  // Resume context if browser suspended it due to lack of prior user interaction
  if (cachedAudioContext.state === 'suspended') {
    cachedAudioContext.resume().catch(() => {});
  }

  return cachedAudioContext;
}

/**
 * Play a double-chime (D5 -> A5) melodious order notification sound
 * @param {number} volume - Volume multiplier between 0.0 and 1.0 (default 0.4)
 */
export function playNewOrderChime(volume = 0.4) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(Math.max(0, Math.min(volume, 1)), ctx.currentTime);
    masterGain.connect(ctx.destination);

    // Note 1: D5 (587.33 Hz) - Warm soft sine tone
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, ctx.currentTime);
    gain1.gain.setValueAtTime(0.5, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    osc1.connect(gain1);
    gain1.connect(masterGain);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.35);

    // Note 2: A5 (880.00 Hz) - Bright chime tone with slight delay (120ms)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(880.0, ctx.currentTime + 0.12);
    gain2.gain.setValueAtTime(0.6, ctx.currentTime + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.65);
    osc2.connect(gain2);
    gain2.connect(masterGain);
    osc2.start(ctx.currentTime + 0.12);
    osc2.stop(ctx.currentTime + 0.65);

    // Note 3: High Sparkle Harmonics: E6 (1318.51 Hz) (220ms delay)
    const osc3 = ctx.createOscillator();
    const gain3 = ctx.createGain();
    osc3.type = 'sine';
    osc3.frequency.setValueAtTime(1318.51, ctx.currentTime + 0.22);
    gain3.gain.setValueAtTime(0.3, ctx.currentTime + 0.22);
    gain3.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.85);
    osc3.connect(gain3);
    gain3.connect(masterGain);
    osc3.start(ctx.currentTime + 0.22);
    osc3.stop(ctx.currentTime + 0.85);
  } catch (err) {
    console.warn('Web Audio playback prevented by browser audio policy:', err);
  }
}
