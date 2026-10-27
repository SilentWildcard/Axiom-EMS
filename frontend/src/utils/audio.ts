// Synthesized electronic warning tone using Web Audio API
// Uses OscillatorNode + GainNode — NO recordings or copyrighted audio
// Sweeps between 700Hz and 900Hz with a 0.4s period

export interface SirenController {
  play: (durationMs?: number) => void;
  stop: () => void;
  isPlaying: () => boolean;
}

let audioCtx: AudioContext | null = null;
let oscillator: OscillatorNode | null = null;
let gainNode: GainNode | null = null;
let lfoOscillator: OscillatorNode | null = null;
let lfoGain: GainNode | null = null;
let playing = false;
let stopTimeout: ReturnType<typeof setTimeout> | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx || audioCtx.state === 'closed') {
    audioCtx = new AudioContext();
  }
  return audioCtx;
}

function stopAll() {
  if (stopTimeout) { clearTimeout(stopTimeout); stopTimeout = null; }
  if (lfoOscillator) { try { lfoOscillator.stop(); } catch { /* already stopped */ } lfoOscillator = null; }
  if (oscillator) { try { oscillator.stop(); } catch { /* already stopped */ } oscillator = null; }
  if (gainNode && audioCtx) {
    gainNode.gain.cancelScheduledValues(audioCtx.currentTime);
    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
  }
  gainNode = null;
  lfoGain = null;
  playing = false;
}

export function createSiren(volume: number = 0.6): SirenController {
  // Volume is capped at 0.8 regardless of input
  const safeVolume = Math.min(volume, 0.8);

  const play = (durationMs?: number) => {
    if (playing) return; // prevent overlap

    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => { /* browser blocked autoplay */ });
    }

    playing = true;

    // Main oscillator — carrier wave (700Hz base)
    oscillator = ctx.createOscillator();
    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(700, ctx.currentTime);

    // LFO for frequency sweep 700→900 Hz at 0.4s period
    lfoOscillator = ctx.createOscillator();
    lfoOscillator.type = 'sine';
    lfoOscillator.frequency.setValueAtTime(2.5, ctx.currentTime); // 1/0.4 = 2.5 Hz

    lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(100, ctx.currentTime); // sweep depth ±100 Hz

    // Volume envelope
    gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(safeVolume, ctx.currentTime + 0.05);

    // Connect: lfoOsc → lfoGain → oscillator.frequency (frequency modulation)
    lfoOscillator.connect(lfoGain);
    lfoGain.connect(oscillator.frequency);

    // Connect: oscillator → gainNode → destination
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start();
    lfoOscillator.start();

    if (durationMs && durationMs > 0) {
      stopTimeout = setTimeout(() => stopAll(), durationMs);
    }
  };

  const stop = () => stopAll();

  const isPlaying = () => playing;

  return { play, stop, isPlaying };
}

// Singleton siren instance
let sirenInstance: SirenController | null = null;

export function getSiren(volume?: number): SirenController {
  if (!sirenInstance) {
    sirenInstance = createSiren(volume);
  }
  return sirenInstance;
}

export function resetSiren(volume: number) {
  if (sirenInstance) {
    sirenInstance.stop();
  }
  sirenInstance = createSiren(volume);
  return sirenInstance;
}
