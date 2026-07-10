// src/utils/audio.js
// A lightweight Web Audio API synthesizer for UI micro-interactions.
// Generates a soft, pleasant "pop" / "tick" sound instantly without needing external audio files.

let audioCtx = null;

function initAudio() {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      audioCtx = new AudioContext();
    }
  }
}

export function playPopSound() {
  try {
    initAudio();
    if (!audioCtx) return;

    // Resume context if it was suspended (browser policy)
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const t = audioCtx.currentTime;
    
    // Create oscillator
    const osc = audioCtx.createOscillator();
    osc.type = 'sine';
    
    // Create gain node for envelope
    const gain = audioCtx.createGain();
    
    // Pitch envelope (starts high, drops rapidly)
    osc.frequency.setValueAtTime(600, t);
    osc.frequency.exponentialRampToValueAtTime(100, t + 0.05);
    
    // Volume envelope (quick attack, quick decay)
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.3, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.05);
    
    // Connect and play
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.start(t);
    osc.stop(t + 0.05);
  } catch (e) {
    // Ignore audio errors silently
    console.warn("Audio playback failed", e);
  }
}
