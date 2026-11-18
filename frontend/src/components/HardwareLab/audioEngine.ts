// Audio Engine for Axiom EMS Hardware Simulation Lab using Web Audio API

class JunctionAudioEngine {
  private ctx: AudioContext | null = null;
  private osc1: OscillatorNode | null = null;
  private osc2: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;
  private lfo: OscillatorNode | null = null;
  private lfoGain: GainNode | null = null;
  private isPlaying = false;
  private stopTimeout: ReturnType<typeof setTimeout> | null = null;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public playAlert(volume = 0.3, durationSec = 5, onFinished?: () => void) {
    try {
      this.initContext();
      if (!this.ctx) return;

      // Stop any existing sound first
      this.stopAlert();

      const now = this.ctx.currentTime;
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(Math.min(1, Math.max(0, volume)) * 0.25, now + 0.1);
      gain.connect(this.ctx.destination);
      this.gainNode = gain;

      // Dual-tone frequency modulated emergency acoustic alert
      const osc1 = this.ctx.createOscillator();
      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(680, now);

      // Low frequency modulation for standard European/Delhi emergency warble
      const lfo = this.ctx.createOscillator();
      lfo.frequency.setValueAtTime(2.5, now); // 2.5 Hz warble
      const lfoGain = this.ctx.createGain();
      lfoGain.gain.setValueAtTime(280, now); // modulate between 400Hz and 960Hz

      lfo.connect(lfoGain);
      lfoGain.connect(osc1.frequency);

      // Second harmonic sub-oscillator for realistic horn resonance
      const osc2 = this.ctx.createOscillator();
      osc2.type = 'square';
      osc2.frequency.setValueAtTime(1020, now);
      const osc2Gain = this.ctx.createGain();
      osc2Gain.gain.setValueAtTime(0.12, now);
      osc2.connect(osc2Gain);
      osc2Gain.connect(gain);

      osc1.connect(gain);

      osc1.start(now);
      osc2.start(now);
      lfo.start(now);

      this.osc1 = osc1;
      this.osc2 = osc2;
      this.lfo = lfo;
      this.lfoGain = lfoGain;
      this.isPlaying = true;

      if (durationSec > 0) {
        this.stopTimeout = setTimeout(() => {
          this.stopAlert();
          if (onFinished) onFinished();
        }, durationSec * 1000);
      }
    } catch {
      // Audio autoplay policy handled silently
      this.isPlaying = false;
    }
  }

  public stopAlert() {
    if (this.stopTimeout) {
      clearTimeout(this.stopTimeout);
      this.stopTimeout = null;
    }
    if (!this.ctx || !this.isPlaying) return;

    try {
      const now = this.ctx.currentTime;
      if (this.gainNode) {
        this.gainNode.gain.linearRampToValueAtTime(0.001, now + 0.08);
      }
      setTimeout(() => {
        try {
          this.osc1?.stop();
          this.osc2?.stop();
          this.lfo?.stop();
          this.osc1?.disconnect();
          this.osc2?.disconnect();
          this.lfo?.disconnect();
          this.gainNode?.disconnect();
        } catch {
          // ignore disconnect errors
        }
        this.osc1 = null;
        this.osc2 = null;
        this.lfo = null;
        this.lfoGain = null;
        this.gainNode = null;
        this.isPlaying = false;
      }, 100);
    } catch {
      this.isPlaying = false;
    }
  }

  public playChirp() {
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.08);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.08);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.09);
    } catch {
      // autoplay
    }
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }
}

export const junctionAudio = new JunctionAudioEngine();
