/**
 * Web Audio API Order Chime & Alert Synthesizer
 * 
 * Synthesizes a high-fidelity e-commerce order notification chime (like Swiggy / Zomato / Meesho)
 * without requiring any external MP3/audio assets or network requests.
 */

const STORAGE_KEY = 'mshoppy_supplier_sound_alerts';

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
 * Synthesize and play the official "New Order Received" melodic chime.
 * Uses a 4-chord ascending bell arpeggio followed by a metallic register shimmer.
 */
export function playOrderChime() {
  if (!isSoundAlertEnabled()) return;

  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;

    // Harmonic Chord Sequence: C5 (523.25) -> E5 (659.25) -> G5 (783.99) -> C6 (1046.5)
    const chordNotes = [
      { freq: 523.25, time: now + 0.0, duration: 0.26, gain: 0.22 },
      { freq: 659.25, time: now + 0.09, duration: 0.28, gain: 0.24 },
      { freq: 783.99, time: now + 0.18, duration: 0.32, gain: 0.26 },
      { freq: 1046.5, time: now + 0.28, duration: 0.6, gain: 0.32 },
    ];

    chordNotes.forEach(({ freq, time, duration, gain }) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = 'triangle'; // Smooth, warm bell tone
      osc.frequency.setValueAtTime(freq, time);

      // Attack & decay envelope
      gainNode.gain.setValueAtTime(0.0001, time);
      gainNode.gain.exponentialRampToValueAtTime(gain, time + 0.025);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, time + duration);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(time);
      osc.stop(time + duration + 0.05);
    });

    // High crystalline metallic shimmer (C7 - 2093 Hz)
    const shimmerOsc = ctx.createOscillator();
    const shimmerGain = ctx.createGain();
    shimmerOsc.type = 'sine';
    shimmerOsc.frequency.setValueAtTime(2093, now + 0.3);
    shimmerGain.gain.setValueAtTime(0.0001, now + 0.3);
    shimmerGain.gain.exponentialRampToValueAtTime(0.12, now + 0.32);
    shimmerGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.95);

    shimmerOsc.connect(shimmerGain);
    shimmerGain.connect(ctx.destination);

    shimmerOsc.start(now + 0.3);
    shimmerOsc.stop(now + 1.0);
  } catch (err) {
    console.warn('[OrderChime] Web Audio playback failed:', err);
  }
}

/**
 * Short confirmation test chime when user clicks to test or enable sound
 */
export function playTestChime() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(880, now); // A5 note
    osc.frequency.exponentialRampToValueAtTime(1318.5, now + 0.12); // E6 note

    gainNode.gain.setValueAtTime(0.0001, now);
    gainNode.gain.exponentialRampToValueAtTime(0.2, now + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.4);
  } catch (err) {
    console.warn('[OrderChime] Test sound failed:', err);
  }
}

