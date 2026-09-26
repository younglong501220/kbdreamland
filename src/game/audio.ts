// 8-bit Web Audio Synthesizer for Kirby's Dream Land (1992 GB Tribute)

class ChiptuneAudioEngine {
  private ctx: AudioContext | null = null;
  private sfxGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private masterGain: GainNode | null = null;
  private isMuted: boolean = false;
  private isMusicEnabled: boolean = true;
  private bgmPlaying: boolean = false;
  private bgmTimer: number | null = null;
  private currentStep: number = 0;

  // Inhale continuous sound oscillator
  private inhaleOsc: OscillatorNode | null = null;
  private inhaleGain: GainNode | null = null;

  init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.5, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(0.35, this.ctx.currentTime);
      this.musicGain.connect(this.masterGain);
    } catch {
      // Web Audio not supported or blocked
    }
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.5, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  toggleMusic(): boolean {
    this.isMusicEnabled = !this.isMusicEnabled;
    if (!this.isMusicEnabled) {
      this.stopBGM();
    } else {
      this.startBGM();
    }
    return this.isMusicEnabled;
  }

  getMuted() {
    return this.isMuted;
  }

  getMusicEnabled() {
    return this.isMusicEnabled;
  }

  // --- Sound Effects ---

  playJump() {
    this.init();
    if (!this.ctx || this.isMuted) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.exponentialRampToValueAtTime(390, t + 0.12);

    g.gain.setValueAtTime(0.2, t);
    g.gain.linearRampToValueAtTime(0.01, t + 0.12);

    osc.connect(g);
    g.connect(this.sfxGain!);
    osc.start(t);
    osc.stop(t + 0.12);
  }

  playFly() {
    this.init();
    if (!this.ctx || this.isMuted) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(260, t);
    osc.frequency.linearRampToValueAtTime(380, t + 0.09);

    g.gain.setValueAtTime(0.18, t);
    g.gain.linearRampToValueAtTime(0.01, t + 0.09);

    osc.connect(g);
    g.connect(this.sfxGain!);
    osc.start(t);
    osc.stop(t + 0.09);
  }

  startInhaleLoop() {
    this.init();
    if (!this.ctx || this.isMuted || this.inhaleOsc) return;
    try {
      const t = this.ctx.currentTime;
      this.inhaleOsc = this.ctx.createOscillator();
      this.inhaleGain = this.ctx.createGain();

      this.inhaleOsc.type = 'sawtooth';
      this.inhaleOsc.frequency.setValueAtTime(80, t);
      // LFO modulation for wind vortex
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.setValueAtTime(14, t);
      lfoGain.gain.setValueAtTime(40, t);
      lfo.connect(this.inhaleOsc.frequency);
      lfo.start(t);

      this.inhaleGain.gain.setValueAtTime(0.1, t);

      this.inhaleOsc.connect(this.inhaleGain);
      this.inhaleGain.connect(this.sfxGain!);
      this.inhaleOsc.start(t);
    } catch {
      // Ignored
    }
  }

  stopInhaleLoop() {
    if (this.inhaleOsc) {
      try {
        this.inhaleOsc.stop();
        this.inhaleOsc.disconnect();
      } catch {
        // Ignored
      }
      this.inhaleOsc = null;
      this.inhaleGain = null;
    }
  }

  playSwallow() {
    this.init();
    this.stopInhaleLoop();
    if (!this.ctx || this.isMuted) return;
    const t = this.ctx.currentTime;

    // Two-tone gulp: high then drop
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(140, t + 0.18);

    g.gain.setValueAtTime(0.25, t);
    g.gain.linearRampToValueAtTime(0.01, t + 0.18);

    osc.connect(g);
    g.connect(this.sfxGain!);
    osc.start(t);
    osc.stop(t + 0.18);
  }

  playSpitStar() {
    this.init();
    if (!this.ctx || this.isMuted) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(620, t);
    osc.frequency.exponentialRampToValueAtTime(120, t + 0.2);

    g.gain.setValueAtTime(0.25, t);
    g.gain.linearRampToValueAtTime(0.01, t + 0.2);

    osc.connect(g);
    g.connect(this.sfxGain!);
    osc.start(t);
    osc.stop(t + 0.2);
  }

  playSpitPuff() {
    this.init();
    if (!this.ctx || this.isMuted) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, t);
    osc.frequency.linearRampToValueAtTime(200, t + 0.12);

    g.gain.setValueAtTime(0.18, t);
    g.gain.linearRampToValueAtTime(0.01, t + 0.12);

    osc.connect(g);
    g.connect(this.sfxGain!);
    osc.start(t);
    osc.stop(t + 0.12);
  }

  playHit() {
    this.init();
    if (!this.ctx || this.isMuted) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.linearRampToValueAtTime(45, t + 0.18);

    g.gain.setValueAtTime(0.3, t);
    g.gain.linearRampToValueAtTime(0.01, t + 0.18);

    osc.connect(g);
    g.connect(this.sfxGain!);
    osc.start(t);
    osc.stop(t + 0.18);
  }

  playBreakBlock() {
    this.init();
    if (!this.ctx || this.isMuted) return;
    const t = this.ctx.currentTime;

    // Crunchy burst
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(240, t);
    osc.frequency.setValueAtTime(180, t + 0.04);
    osc.frequency.setValueAtTime(90, t + 0.08);

    g.gain.setValueAtTime(0.2, t);
    g.gain.linearRampToValueAtTime(0.01, t + 0.15);

    osc.connect(g);
    g.connect(this.sfxGain!);
    osc.start(t);
    osc.stop(t + 0.15);
  }

  playItem() {
    this.init();
    if (!this.ctx || this.isMuted) return;
    const t = this.ctx.currentTime;

    // Sweet arpeggio
    const notes = [440, 554, 659, 880];
    notes.forEach((freq, idx) => {
      const start = t + idx * 0.06;
      const osc = this.ctx!.createOscillator();
      const g = this.ctx!.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, start);
      g.gain.setValueAtTime(0.2, start);
      g.gain.linearRampToValueAtTime(0.01, start + 0.08);

      osc.connect(g);
      g.connect(this.sfxGain!);
      osc.start(start);
      osc.stop(start + 0.08);
    });
  }

  playWhispyGust() {
    this.init();
    if (!this.ctx || this.isMuted) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.exponentialRampToValueAtTime(70, t + 0.25);
    g.gain.setValueAtTime(0.25, t);
    g.gain.linearRampToValueAtTime(0.01, t + 0.25);

    osc.connect(g);
    g.connect(this.sfxGain!);
    osc.start(t);
    osc.stop(t + 0.25);
  }

  playStageClear() {
    this.init();
    this.stopBGM();
    if (!this.ctx || this.isMuted) return;
    const t = this.ctx.currentTime;

    // Classic 1992 Kirby Dance Fanfare!
    // G4, C5, E5, G5, F5, E5, D5, C5...
    const melody = [
      { note: 392.0, dur: 0.14 }, // G4
      { note: 523.25, dur: 0.14 }, // C5
      { note: 659.25, dur: 0.14 }, // E5
      { note: 783.99, dur: 0.28 }, // G5
      { note: 659.25, dur: 0.14 }, // E5
      { note: 783.99, dur: 0.35 }, // G5
      { note: 880.0, dur: 0.18 },  // A5
      { note: 783.99, dur: 0.18 }, // G5
      { note: 659.25, dur: 0.18 }, // E5
      { note: 523.25, dur: 0.45 }, // C5
    ];

    let offset = 0;
    melody.forEach((item) => {
      const start = t + offset;
      const osc = this.ctx!.createOscillator();
      const g = this.ctx!.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(item.note, start);

      g.gain.setValueAtTime(0.25, start);
      g.gain.linearRampToValueAtTime(0.01, start + item.dur - 0.02);

      osc.connect(g);
      g.connect(this.sfxGain!);
      osc.start(start);
      osc.stop(start + item.dur);

      offset += item.dur;
    });
  }

  playGameOver() {
    this.init();
    this.stopBGM();
    if (!this.ctx || this.isMuted) return;
    const t = this.ctx.currentTime;

    const melody = [
      { note: 329.63, dur: 0.2 }, // E4
      { note: 311.13, dur: 0.2 }, // Eb4
      { note: 293.66, dur: 0.2 }, // D4
      { note: 277.18, dur: 0.4 }, // C#4
      { note: 261.63, dur: 0.6 }, // C4
    ];

    let offset = 0;
    melody.forEach((item) => {
      const start = t + offset;
      const osc = this.ctx!.createOscillator();
      const g = this.ctx!.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(item.note, start);

      g.gain.setValueAtTime(0.22, start);
      g.gain.linearRampToValueAtTime(0.01, start + item.dur - 0.02);

      osc.connect(g);
      g.connect(this.sfxGain!);
      osc.start(start);
      osc.stop(start + item.dur);

      offset += item.dur;
    });
  }

  // --- Background Music: Iconic Green Greens Chiptune Loop ---

  startBGM() {
    if (this.bgmPlaying || !this.isMusicEnabled) return;
    this.init();
    this.resume();
    this.bgmPlaying = true;
    this.currentStep = 0;
    this.scheduleNextBgmStep();
  }

  stopBGM() {
    this.bgmPlaying = false;
    if (this.bgmTimer !== null) {
      window.clearTimeout(this.bgmTimer);
      this.bgmTimer = null;
    }
  }

  private scheduleNextBgmStep() {
    if (!this.bgmPlaying || !this.isMusicEnabled || !this.ctx) return;

    // Green Greens main theme motif in C Major
    // Note frequencies (Hz)
    const C4 = 261.63, D4 = 293.66, E4 = 329.63, F4 = 349.23, G4 = 392.00, A4 = 440.00, B4 = 493.88;
    const C5 = 523.25, D5 = 587.33, E5 = 659.25, F5 = 698.46, G5 = 783.99, A5 = 880.00;

    const pattern = [
      // Bar 1: C5, C5, B4, C5, D5, G4
      { lead: C5, bass: C4, len: 1 },
      { lead: C5, bass: G4, len: 1 },
      { lead: B4, bass: C4, len: 1 },
      { lead: C5, bass: G4, len: 1 },
      { lead: D5, bass: C4, len: 2 },
      { lead: G4, bass: G4, len: 2 },
      // Bar 2: E5, E5, D5, E5, F5, G5
      { lead: E5, bass: E4, len: 1 },
      { lead: E5, bass: B4, len: 1 },
      { lead: D5, bass: E4, len: 1 },
      { lead: E5, bass: B4, len: 1 },
      { lead: F5, bass: F4, len: 2 },
      { lead: G5, bass: G4, len: 2 },
      // Bar 3: A5, G5, F5, E5, D5, C5
      { lead: A5, bass: F4, len: 1.5 },
      { lead: G5, bass: E4, len: 1 },
      { lead: F5, bass: D4, len: 1 },
      { lead: E5, bass: C4, len: 1 },
      { lead: D5, bass: G4, len: 1.5 },
      { lead: C5, bass: C4, len: 2 },
      // Bar 4: B4, C5, D5, G4
      { lead: B4, bass: G4, len: 1 },
      { lead: C5, bass: C4, len: 1 },
      { lead: D5, bass: G4, len: 2 },
      { lead: G4, bass: C4, len: 2 },
    ];

    const step = pattern[this.currentStep % pattern.length];
    const stepDuration = 0.15 * step.len; // 150ms per beat unit

    if (!this.isMuted) {
      const now = this.ctx.currentTime;

      // Lead Channel: Square Wave (50% duty cycle feel)
      if (step.lead) {
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(step.lead, now);

        g.gain.setValueAtTime(0.09, now);
        g.gain.exponentialRampToValueAtTime(0.01, now + stepDuration - 0.02);

        osc.connect(g);
        g.connect(this.musicGain!);
        osc.start(now);
        osc.stop(now + stepDuration);
      }

      // Bass Channel: Triangle Wave
      if (step.bass) {
        const bassOsc = this.ctx.createOscillator();
        const bassG = this.ctx.createGain();
        bassOsc.type = 'triangle';
        bassOsc.frequency.setValueAtTime(step.bass * 0.5, now); // 1 octave lower

        bassG.gain.setValueAtTime(0.12, now);
        bassG.gain.linearRampToValueAtTime(0.01, now + stepDuration - 0.02);

        bassOsc.connect(bassG);
        bassG.connect(this.musicGain!);
        bassOsc.start(now);
        bassOsc.stop(now + stepDuration);
      }
    }

    this.currentStep = (this.currentStep + 1) % pattern.length;
    this.bgmTimer = window.setTimeout(() => {
      this.scheduleNextBgmStep();
    }, stepDuration * 1000);
  }
}

export const audio = new ChiptuneAudioEngine();
