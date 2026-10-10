/**
 * J.A.R.V.I.S. Audio Synthesizer
 * Pure Web Audio API procedural sound engine.
 * Generates all iconic Stark HUD / Iron Man sci-fi sound effects in real time.
 * Zero external audio files required — 0ms latency, zero missing asset errors.
 */

class JarvisAudioSynthesizer {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.analyser = null;
    this.gainNode = null;
    this.initDone = false;
  }

  init() {
    if (this.initDone && this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 128;
      this.gainNode = this.ctx.createGain();
      this.gainNode.gain.value = 0.6;
      this.gainNode.connect(this.ctx.destination);
      this.analyser.connect(this.gainNode);
      this.initDone = true;
    } catch (e) {
      console.warn('Web Audio API not supported or blocked:', e);
    }
  }

  ensureContext() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setMuted(muted) {
    this.isMuted = muted;
  }

  // Futuristic holographic interface click
  playClick() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.04);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(this.analyser);

    osc.start(now);
    osc.stop(now + 0.04);
  }

  // Dual-tone high-tech Stark confirmation beep
  playAcknowledge() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    // Tone 1: 1760 Hz (A6)
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(1760, now);
    gain1.gain.setValueAtTime(0.18, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
    osc1.connect(gain1);
    gain1.connect(this.analyser);
    osc1.start(now);
    osc1.stop(now + 0.09);

    // Tone 2: 2637 Hz (E7) - slightly delayed
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(2637, now + 0.08);
    gain2.gain.setValueAtTime(0.22, now + 0.08);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
    osc2.connect(gain2);
    gain2.connect(this.analyser);
    osc2.start(now + 0.08);
    osc2.stop(now + 0.22);
  }

  // Listening chime when voice recognition activates
  playListeningStart() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(660, now);
    osc.frequency.exponentialRampToValueAtTime(1320, now + 0.12);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

    osc.connect(gain);
    gain.connect(this.analyser);

    osc.start(now);
    osc.stop(now + 0.16);
  }

  // Stark OS boot power-up sweep
  playBootSound() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    // Sub-bass hum
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(55, now);
    subOsc.frequency.exponentialRampToValueAtTime(220, now + 1.2);
    subGain.gain.setValueAtTime(0.3, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 1.4);
    subOsc.connect(subGain);
    subGain.connect(this.analyser);
    subOsc.start(now);
    subOsc.stop(now + 1.4);

    // Resonant sweep
    const sweepOsc = this.ctx.createOscillator();
    const sweepGain = this.ctx.createGain();
    sweepOsc.type = 'sawtooth';
    sweepOsc.frequency.setValueAtTime(180, now + 0.2);
    sweepOsc.frequency.exponentialRampToValueAtTime(1760, now + 1.1);

    // Low pass filter
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, now + 0.2);
    filter.frequency.exponentialRampToValueAtTime(4000, now + 1.1);

    sweepGain.gain.setValueAtTime(0.01, now + 0.2);
    sweepGain.gain.linearRampToValueAtTime(0.15, now + 0.6);
    sweepGain.gain.exponentialRampToValueAtTime(0.001, now + 1.3);

    sweepOsc.connect(filter);
    filter.connect(sweepGain);
    sweepGain.connect(this.analyser);

    sweepOsc.start(now + 0.2);
    sweepOsc.stop(now + 1.3);

    // High crystal confirmation chime
    const chimeOsc = this.ctx.createOscillator();
    const chimeGain = this.ctx.createGain();
    chimeOsc.type = 'sine';
    chimeOsc.frequency.setValueAtTime(2093, now + 1.15); // C7
    chimeGain.gain.setValueAtTime(0.2, now + 1.15);
    chimeGain.gain.exponentialRampToValueAtTime(0.001, now + 1.7);
    chimeOsc.connect(chimeGain);
    chimeGain.connect(this.analyser);
    chimeOsc.start(now + 1.15);
    chimeOsc.stop(now + 1.7);
  }

  // Iconic Repulsor charging whine and energy burst
  playRepulsor() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    // Charge whine
    const chargeOsc = this.ctx.createOscillator();
    const chargeGain = this.ctx.createGain();
    chargeOsc.type = 'sine';
    chargeOsc.frequency.setValueAtTime(300, now);
    chargeOsc.frequency.exponentialRampToValueAtTime(3200, now + 0.6);

    chargeGain.gain.setValueAtTime(0.05, now);
    chargeGain.gain.linearRampToValueAtTime(0.25, now + 0.55);
    chargeGain.gain.exponentialRampToValueAtTime(0.01, now + 0.65);

    chargeOsc.connect(chargeGain);
    chargeGain.connect(this.analyser);
    chargeOsc.start(now);
    chargeOsc.stop(now + 0.65);

    // Blast burst
    const blastOsc = this.ctx.createOscillator();
    const blastGain = this.ctx.createGain();
    blastOsc.type = 'triangle';
    blastOsc.frequency.setValueAtTime(800, now + 0.6);
    blastOsc.frequency.exponentialRampToValueAtTime(60, now + 1.0);

    blastGain.gain.setValueAtTime(0.35, now + 0.6);
    blastGain.gain.exponentialRampToValueAtTime(0.001, now + 1.05);

    blastOsc.connect(blastGain);
    blastGain.connect(this.analyser);
    blastOsc.start(now + 0.6);
    blastOsc.stop(now + 1.05);
  }

  // Tactical Emergency Alarm Klaxon
  playAlarm() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    for (let i = 0; i < 3; i++) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const startTime = now + i * 0.28;

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, startTime);
      osc.frequency.linearRampToValueAtTime(440, startTime + 0.22);

      gain.gain.setValueAtTime(0.2, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.24);

      osc.connect(gain);
      gain.connect(this.analyser);

      osc.start(startTime);
      osc.stop(startTime + 0.24);
    }
  }

  // Protocol engaged heavy bass impact and harmonic wave
  playProtocolEngaged() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    // Sub drop
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(35, now + 0.5);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

    osc.connect(gain);
    gain.connect(this.analyser);
    osc.start(now);
    osc.stop(now + 0.6);

    // Harmonic pulse
    const harm = this.ctx.createOscillator();
    const hGain = this.ctx.createGain();
    harm.type = 'triangle';
    harm.frequency.setValueAtTime(880, now + 0.05);
    harm.frequency.exponentialRampToValueAtTime(1760, now + 0.3);

    hGain.gain.setValueAtTime(0.18, now + 0.05);
    hGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    harm.connect(hGain);
    hGain.connect(this.analyser);
    harm.start(now + 0.05);
    harm.stop(now + 0.35);
  }
}

window.jarvisAudio = new JarvisAudioSynthesizer();
