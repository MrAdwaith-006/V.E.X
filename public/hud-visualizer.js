/**
 * V.E.X. HUD Holographic Visualizer Engine (MVEX OS)
 * High-performance 60FPS Canvas rendering:
 * 1. Stark Wave Acoustic Core with Audio-Reactive Dynamics
 * 2. Moxx NetSpeed Indicator (Dual Cybernetic Gauges & Live Oscilloscope Waveform)
 */

class JarvisHUDVisualizer {
  constructor() {
    this.arcCanvas = null;
    this.arcCtx = null;
    this.netSpeedCanvas = null;
    this.netSpeedCtx = null;
    this.radarCanvas = null; // backward compatibility
    this.radarCtx = null;

    this.state = 'STANDBY'; // 'STANDBY', 'LISTENING', 'SPEAKING', 'COMBAT'
    this.theme = 'cyan'; // 'cyan', 'combat', 'stealth', 'gold'

    this.rotationAngle = 0;
    this.counterAngle = 0;
    this.pulsePhase = 0;
    this.particles = [];

    // Real-time NetSpeed Telemetry Engine
    this.downSpeed = 284.6;
    this.targetDownSpeed = 284.6;
    this.upSpeed = 94.2;
    this.targetUpSpeed = 94.2;
    this.ping = 12;
    this.targetPing = 12;
    this.jitter = 0.8;
    this.targetJitter = 0.8;

    // Rolling historical waveform buffers (36 sample points)
    this.downHistory = [];
    this.upHistory = [];
    for (let i = 0; i < 36; i++) {
      this.downHistory.push(240 + Math.sin(i * 0.4) * 35 + (Math.random() - 0.5) * 15);
      this.upHistory.push(85 + Math.cos(i * 0.45) * 14 + (Math.random() - 0.5) * 8);
    }
    this.historyTick = 0;

    this.audioData = new Uint8Array(64);
    this.animationFrameId = null;
  }

  init(arcCanvasId, netCanvasId = 'netSpeedCanvas') {
    this.arcCanvas = document.getElementById(arcCanvasId);
    this.netSpeedCanvas = document.getElementById(netCanvasId) || document.getElementById('netSpeedCanvas') || document.getElementById('radarCanvas');
    this.radarCanvas = this.netSpeedCanvas;

    if (this.arcCanvas) {
      this.arcCtx = this.arcCanvas.getContext('2d');
      this.resizeCanvas(this.arcCanvas);
    }

    if (this.netSpeedCanvas) {
      this.netSpeedCtx = this.netSpeedCanvas.getContext('2d');
      this.radarCtx = this.netSpeedCtx;
      this.resizeCanvas(this.netSpeedCanvas);
    }

    window.addEventListener('resize', () => {
      if (this.arcCanvas) this.resizeCanvas(this.arcCanvas);
      if (this.netSpeedCanvas) this.resizeCanvas(this.netSpeedCanvas);
    });

    // Initialize 28 Arc particles
    for (let i = 0; i < 28; i++) {
      this.particles.push({
        angle: Math.random() * Math.PI * 2,
        dist: 20 + Math.random() * 80,
        speed: 0.3 + Math.random() * 0.7,
        size: 1 + Math.random() * 2,
        alpha: Math.random()
      });
    }

    this.animate();
  }

  resizeCanvas(canvas) {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
  }

  setState(state) {
    this.state = state;
    if (window.arcReactor3D && typeof window.arcReactor3D.setState === 'function') {
      window.arcReactor3D.setState(state);
    }
  }

  setTheme(theme) {
    this.theme = theme;
    if (window.arcReactor3D && typeof window.arcReactor3D.setTheme === 'function') {
      window.arcReactor3D.setTheme(theme);
    }
  }

  getColors() {
    if (this.state === 'COMBAT' || this.theme === 'combat') {
      return {
        primary: '#ff3344',
        secondary: '#ff7700',
        core: '#ffffff',
        glow: 'rgba(255, 51, 68, 0.45)',
        ring: 'rgba(255, 80, 80, 0.25)',
        text: '#ff6677'
      };
    }
    if (this.theme === 'gold') {
      return {
        primary: '#f5c518',
        secondary: '#e59400',
        core: '#fff9e6',
        glow: 'rgba(245, 197, 24, 0.4)',
        ring: 'rgba(245, 197, 24, 0.2)',
        text: '#ffdb58'
      };
    }
    // Default Stark Cyan
    return {
      primary: '#00e5ff',
      secondary: '#0077ff',
      core: '#ffffff',
      glow: 'rgba(0, 229, 255, 0.5)',
      ring: 'rgba(0, 229, 255, 0.25)',
      text: '#80f0ff'
    };
  }

  updateAudioData() {
    if (window.jarvisAudio && window.jarvisAudio.analyser) {
      window.jarvisAudio.analyser.getByteFrequencyData(this.audioData);
    } else {
      // Procedural fallback
      const base = this.state === 'SPEAKING' ? 80 : this.state === 'LISTENING' ? 45 : 15;
      for (let i = 0; i < this.audioData.length; i++) {
        const wave = Math.sin(this.pulsePhase * 4 + i * 0.2) * 20;
        this.audioData[i] = Math.max(0, base + wave);
      }
    }
  }

  animate() {
    this.updateAudioData();
    this.rotationAngle += this.state === 'COMBAT' ? 0.025 : 0.008;
    this.counterAngle -= this.state === 'COMBAT' ? 0.03 : 0.012;
    this.pulsePhase += 0.035;
    this.radarAngle += 0.02;

    // Render 3D Arc Reactor if available; otherwise fallback to 2D canvas
    if (!window.arcReactor3D || !window.arcReactor3D.renderer) {
      this.renderArcReactor();
    }
    this.renderNetSpeed();

    this.animationFrameId = requestAnimationFrame(() => this.animate());
  }

  renderArcReactor() {
    if (!this.arcCanvas || !this.arcCtx) return;
    const ctx = this.arcCtx;
    const width = this.arcCanvas.getBoundingClientRect().width;
    const height = this.arcCanvas.getBoundingClientRect().height;
    const cx = width / 2;
    const cy = height / 2;

    ctx.clearRect(0, 0, width, height);

    const colors = this.getColors();
    const isSpeaking = this.state === 'SPEAKING';
    const ampMult = isSpeaking ? 3.5 : 1.0;
    const speedMult = isSpeaking ? 2.5 : 1.0;

    // 5 Layered 2D Acoustic Wave Ribbons
    const ribbonCount = 5;
    for (let r = 0; r < ribbonCount; r++) {
      ctx.save();
      const phase = this.pulsePhase * speedMult * (r % 2 === 0 ? 1 : -1) + r * 1.2;
      const freq = 0.02 + r * 0.008;
      const baseAmp = (12 + r * 6) * ampMult;
      const color = isSpeaking ? (r % 2 === 0 ? '#ffd700' : colors.primary) : colors.primary;

      ctx.strokeStyle = color;
      ctx.lineWidth = r === 2 ? 2.5 : 1.5;
      ctx.globalAlpha = 0.5 + (r / ribbonCount) * 0.4;
      ctx.beginPath();

      for (let x = 0; x <= width; x += 3) {
        const normX = (x - cx) / cx;
        const env = Math.max(0, 1 - normX * normX);
        const y = cy + Math.sin(x * freq + phase) * baseAmp * env + Math.cos(x * freq * 0.5 - phase) * (baseAmp * 0.4) * env;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.restore();
    }

    // Central Vocal Node Glow
    ctx.save();
    const coreGrad = ctx.createRadialGradient(cx, cy, 2, cx, cy, isSpeaking ? 38 : 22);
    coreGrad.addColorStop(0, '#ffffff');
    coreGrad.addColorStop(0.4, isSpeaking ? '#ffd700' : colors.primary);
    coreGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, isSpeaking ? 38 : 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  setNetSpeed(down, up, ping, jitter) {
    if (typeof down === 'number' && !isNaN(down)) this.targetDownSpeed = down;
    if (typeof up === 'number' && !isNaN(up)) this.targetUpSpeed = up;
    if (typeof ping === 'number' && !isNaN(ping)) this.targetPing = ping;
    if (typeof jitter === 'number' && !isNaN(jitter)) this.targetJitter = jitter;
  }

  renderNetSpeed() {
    const canvas = this.netSpeedCanvas || this.radarCanvas;
    const ctx = this.netSpeedCtx || this.radarCtx;
    if (!canvas || !ctx) return;

    const width = canvas.getBoundingClientRect().width || canvas.width;
    const height = canvas.getBoundingClientRect().height || canvas.height;
    if (width === 0 || height === 0) return;

    ctx.clearRect(0, 0, width, height);

    // Smooth lerp values
    this.downSpeed += (this.targetDownSpeed - this.downSpeed) * 0.08;
    this.upSpeed += (this.targetUpSpeed - this.upSpeed) * 0.08;
    this.ping += (this.targetPing - this.ping) * 0.1;
    this.jitter += (this.targetJitter - this.jitter) * 0.1;

    // Organic micro-fluctuation to waveform history
    this.historyTick = (this.historyTick || 0) + 1;
    if (this.historyTick % 6 === 0) {
      const dNoise = (Math.random() - 0.5) * 8;
      const uNoise = (Math.random() - 0.5) * 4;
      this.downHistory.shift();
      this.downHistory.push(Math.max(10, Math.min(600, this.downSpeed + dNoise)));
      this.upHistory.shift();
      this.upHistory.push(Math.max(5, Math.min(300, this.upSpeed + uNoise)));
    }

    // 1. Cybernetic grid background
    ctx.fillStyle = 'rgba(2, 10, 20, 0.75)';
    ctx.fillRect(0, 0, width, height);

    // Subtle grid lines
    ctx.strokeStyle = 'rgba(0, 229, 255, 0.06)';
    ctx.lineWidth = 1;
    const gridStep = 18;
    for (let x = 0; x < width; x += gridStep) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += gridStep) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // 2. Dual Speed Dials (Left: Download, Right: Upload)
    const dialY = height * 0.36;
    const dialR = Math.min(width * 0.19, height * 0.28, 32);
    const leftX = width * 0.27;
    const rightX = width * 0.73;

    this.drawSpeedDial(ctx, leftX, dialY, dialR, this.downSpeed, 500, 'DOWN', '#00e5ff');
    this.drawSpeedDial(ctx, rightX, dialY, dialR, this.upSpeed, 200, 'UP', '#ffd700');

    // 3. Center Link Status
    ctx.fillStyle = 'rgba(0, 229, 255, 0.7)';
    ctx.font = '7px "Nexa Serif Variable Medium", "Nexa Serif", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('1.0 Gbps', width / 2, dialY - 5);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = '6px "Nexa Serif Variable Medium", "Nexa Serif", monospace';
    ctx.fillText('DUPLEX', width / 2, dialY + 7);

    // 4. Real-time Oscilloscope Waveform at lower panel
    const waveY = height * 0.64;
    const waveH = height * 0.32;
    this.drawThroughputWaveform(ctx, 6, waveY, width - 12, waveH);
  }

  drawSpeedDial(ctx, cx, cy, r, val, maxVal, label, color) {
    const startAngle = Math.PI * 0.75; // 135 deg
    const totalAngle = Math.PI * 1.5;  // 270 deg
    const pct = Math.max(0, Math.min(1, val / maxVal));

    // Outer faint background track
    ctx.beginPath();
    ctx.arc(cx, cy, r, startAngle, startAngle + totalAngle);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Active progress arc with neon glow
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, startAngle, startAngle + totalAngle * pct);
    ctx.strokeStyle = color;
    ctx.lineWidth = 3.5;
    ctx.shadowColor = color;
    ctx.shadowBlur = 8;
    ctx.lineCap = 'round';
    ctx.stroke();
    ctx.restore();

    // Needle pointer / tip pip
    const tipAngle = startAngle + totalAngle * pct;
    const tipX = cx + Math.cos(tipAngle) * r;
    const tipY = cy + Math.sin(tipAngle) * r;
    ctx.save();
    ctx.beginPath();
    ctx.arc(tipX, tipY, 2.8, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = color;
    ctx.shadowBlur = 6;
    ctx.fill();
    ctx.restore();

    // Subtle scale ticks
    ctx.save();
    for (let i = 0; i <= 6; i++) {
      const a = startAngle + (totalAngle / 6) * i;
      const inX = cx + Math.cos(a) * (r - 6);
      const inY = cy + Math.sin(a) * (r - 6);
      const outX = cx + Math.cos(a) * (r - 3.5);
      const outY = cy + Math.sin(a) * (r - 3.5);
      ctx.beginPath();
      ctx.moveTo(inX, inY);
      ctx.lineTo(outX, outY);
      ctx.strokeStyle = (i / 6 <= pct) ? color : 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    ctx.restore();

    // Center readout text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 10px "Nexa Serif Variable Medium", "Nexa Serif", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(Math.round(val).toString(), cx, cy + 2);

    ctx.fillStyle = color;
    ctx.font = '6.5px "Nexa Serif Variable Medium", "Nexa Serif", monospace';
    ctx.fillText(label, cx, cy + 11);
  }

  drawThroughputWaveform(ctx, x, y, w, h) {
    // Waveform baseline & bounding grid line
    ctx.strokeStyle = 'rgba(0, 229, 255, 0.12)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, y + h);
    ctx.lineTo(x + w, y + h);
    ctx.stroke();

    const pts = this.downHistory.length;
    if (pts < 2) return;

    const step = w / (pts - 1);

    // Download Waveform (Cyan)
    ctx.save();
    ctx.beginPath();
    for (let i = 0; i < pts; i++) {
      const px = x + i * step;
      const norm = Math.min(1, Math.max(0, this.downHistory[i] / 500));
      const py = y + h - norm * (h - 3);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.strokeStyle = '#00e5ff';
    ctx.lineWidth = 1.4;
    ctx.shadowColor = '#00e5ff';
    ctx.shadowBlur = 5;
    ctx.stroke();

    // Area fill
    ctx.lineTo(x + w, y + h);
    ctx.lineTo(x, y + h);
    ctx.closePath();
    const grad = ctx.createLinearGradient(0, y, 0, y + h);
    grad.addColorStop(0, 'rgba(0, 229, 255, 0.25)');
    grad.addColorStop(1, 'rgba(0, 229, 255, 0.0)');
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.restore();

    // Upload Waveform (Gold)
    ctx.save();
    ctx.beginPath();
    for (let i = 0; i < pts; i++) {
      const px = x + i * step;
      const norm = Math.min(1, Math.max(0, this.upHistory[i] / 200));
      const py = y + h - norm * (h - 3);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 1.2;
    ctx.shadowColor = '#ffd700';
    ctx.shadowBlur = 4;
    ctx.stroke();
    ctx.restore();

    // Oscilloscope live sweep line
    const scanOffset = ((Date.now() / 18) % w);
    const scanX = x + scanOffset;
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(scanX, y);
    ctx.lineTo(scanX, y + h);
    ctx.stroke();
    ctx.restore();
  }

  // Alias for backward compatibility
  renderRadar() {
    this.renderNetSpeed();
  }
}

window.hudVisualizer = new JarvisHUDVisualizer();
