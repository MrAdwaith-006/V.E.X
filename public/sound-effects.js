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
    this.acousticAnalyser = null;
    this.gainNode = null;
    this.initDone = false;

    // Real-time acoustic telemetry tracking
    this.micStream = null;
    this.micSource = null;
    this.isSpeakingAudio = false;
    this.speakingInterval = null;
    this.speakingNodes = null;
  }

  init() {
    if (this.initDone && this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();

      // SFX Analyser & Output bus
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 128;
      this.gainNode = this.ctx.createGain();
      this.gainNode.gain.value = 0.6;
      this.gainNode.connect(this.ctx.destination);
      this.analyser.connect(this.gainNode);

      // Acoustic Wave Analysis Matrix (Samples SFX + Microphone Hearing + Speech Saying)
      this.acousticAnalyser = this.ctx.createAnalyser();
      this.acousticAnalyser.fftSize = 128;
      this.acousticAnalyser.smoothingTimeConstant = 0.82;
      this.analyser.connect(this.acousticAnalyser);

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

  // Hook live microphone stream for "Sound It Hears"
  connectMicrophone(stream) {
    this.ensureContext();
    if (!this.ctx || !stream || !this.acousticAnalyser) return;
    try {
      if (this.micSource) {
        try { this.micSource.disconnect(); } catch(e){}
      }
      this.micStream = stream;
      this.micSource = this.ctx.createMediaStreamSource(stream);
      // Connect to acousticAnalyser only (avoids speaker feedback screech)
      this.micSource.connect(this.acousticAnalyser);
      console.log('[S.U.P.R.E.M. Audio] Microphone acoustic feed locked to 3D Wave Arc Reactor.');
    } catch (err) {
      console.warn('[S.U.P.R.E.M. Audio] Error linking microphone audio:', err);
    }
  }

  // Acoustic Wave Synthesizer for "Sound It Says" (Active vocal formant harmonics)
  startSpeakingWave(pitch = 1.0) {
    this.ensureContext();
    if (!this.ctx || !this.acousticAnalyser) return;
    this.stopSpeakingWave();
    this.isSpeakingAudio = true;

    try {
      const now = this.ctx.currentTime;
      const baseFreq = 145 * Math.max(0.65, Math.min(1.8, pitch));

      const osc1 = this.ctx.createOscillator();
      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(baseFreq, now);

      const osc2 = this.ctx.createOscillator();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(baseFreq * 2.2, now);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(800, now);
      filter.Q.value = 2.8;

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.45, now);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(this.acousticAnalyser);

      osc1.start(now);
      osc2.start(now);

      let step = 0;
      this.speakingInterval = setInterval(() => {
        if (!this.isSpeakingAudio || !this.ctx) return;
        step++;
        const t = this.ctx.currentTime;
        // Human speech vocal formant modulation
        const formant = 600 + Math.sin(step * 0.8) * 480 + Math.cos(step * 1.4) * 260;
        filter.frequency.setValueAtTime(Math.max(220, formant), t);
        const amp = 0.25 + Math.abs(Math.sin(step * 0.55)) * 0.55;
        gain.gain.setValueAtTime(amp, t);
      }, 55);

      this.speakingNodes = [osc1, osc2, filter, gain];
    } catch (e) {
      console.warn('[S.U.P.R.E.M. Audio] Speech wave synthesis warning:', e);
    }
  }

  stopSpeakingWave() {
    this.isSpeakingAudio = false;
    if (this.speakingInterval) {
      clearInterval(this.speakingInterval);
      this.speakingInterval = null;
    }
    if (this.speakingNodes) {
      try {
        this.speakingNodes.forEach(node => {
          if (node.stop) node.stop();
          if (node.disconnect) node.disconnect();
        });
      } catch(e){}
      this.speakingNodes = null;
    }
  }

  // Get combined acoustic spectrum & waveform for 3D visualizers
  getAcousticTelemetry() {
    this.ensureContext();
    const freq = new Uint8Array(64);
    const wave = new Uint8Array(64);

    const targetAnalyser = this.acousticAnalyser || this.analyser;
    if (targetAnalyser) {
      targetAnalyser.getByteFrequencyData(freq);
      targetAnalyser.getByteTimeDomainData(wave);
    }

    let sum = 0;
    for (let i = 0; i < freq.length; i++) sum += freq[i];
    const avg = sum / freq.length;
    const level = avg / 255;

    const isHearing = !this.isSpeakingAudio && level > 0.04;
    const isSaying = this.isSpeakingAudio;

    return {
      frequencies: freq,
      waveform: wave,
      level,
      isHearing,
      isSaying,
      state: isSaying ? 'SAYING' : (isHearing ? 'HEARING' : 'STANDBY')
    };
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

  // Tactical Helmet Com-Link radio squelch / open mic chirp
  playComlinkStart() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(2400, now);
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.04);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1800, now);
    filter.Q.setValueAtTime(3.0, now);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.analyser);

    osc.start(now);
    osc.stop(now + 0.045);
  }

  // Tactical Helmet Com-Link radio close click
  playComlinkEnd() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(950, now);
    osc.frequency.exponentialRampToValueAtTime(450, now + 0.035);

    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

    osc.connect(gain);
    gain.connect(this.analyser);

    osc.start(now);
    osc.stop(now + 0.035);
  }

  // Voice Test Confirmation Chime
  playVoiceTestChime() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    [1046, 1318, 1567].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.05);

      gain.gain.setValueAtTime(0.12, now + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.18);

      osc.connect(gain);
      gain.connect(this.analyser);

      osc.start(now + idx * 0.05);
      osc.stop(now + idx * 0.05 + 0.18);
    });
  }
}

window.jarvisAudio = new JarvisAudioSynthesizer();
