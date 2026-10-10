/**
 * J.A.R.V.I.S. HUD Holographic Visualizer Engine
 * High-performance 60FPS Canvas rendering:
 * 1. Stark Industries Mark Arc Reactor Core with Audio-Reactive Rings
 * 2. Tactical Orbital Radar / Satellite Sweep Scope
 */

class JarvisHUDVisualizer {
  constructor() {
    this.arcCanvas = null;
    this.arcCtx = null;
    this.radarCanvas = null;
    this.radarCtx = null;

    this.state = 'STANDBY'; // 'STANDBY', 'LISTENING', 'SPEAKING', 'COMBAT'
    this.theme = 'cyan'; // 'cyan', 'combat', 'stealth', 'gold'

    this.rotationAngle = 0;
    this.counterAngle = 0;
    this.pulsePhase = 0;
    this.particles = [];
    this.radarAngle = 0;
    this.radarBlips = [
      { dist: 0.35, angle: 0.8, size: 3, id: 'STK-01', alpha: 1 },
      { dist: 0.65, angle: 2.4, size: 4, id: 'STK-02', alpha: 1 },
      { dist: 0.50, angle: 4.1, size: 3, id: 'TGT-A', alpha: 1 },
      { dist: 0.80, angle: 5.3, size: 4, id: 'SAT-IV', alpha: 1 }
    ];

    this.audioData = new Uint8Array(64);
    this.animationFrameId = null;
  }

  init(arcCanvasId, radarCanvasId) {
    this.arcCanvas = document.getElementById(arcCanvasId);
    this.radarCanvas = document.getElementById(radarCanvasId);

    if (this.arcCanvas) {
      this.arcCtx = this.arcCanvas.getContext('2d');
      this.resizeCanvas(this.arcCanvas);
    }

    if (this.radarCanvas) {
      this.radarCtx = this.radarCanvas.getContext('2d');
      this.resizeCanvas(this.radarCanvas);
    }

    window.addEventListener('resize', () => {
      if (this.arcCanvas) this.resizeCanvas(this.arcCanvas);
      if (this.radarCanvas) this.resizeCanvas(this.radarCanvas);
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
  }

  setTheme(theme) {
    this.theme = theme;
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

    this.renderArcReactor();
    this.renderRadar();

    this.animationFrameId = requestAnimationFrame(() => this.animate());
  }

  renderArcReactor() {
    if (!this.arcCanvas || !this.arcCtx) return;
    const ctx = this.arcCtx;
    const width = this.arcCanvas.getBoundingClientRect().width;
    const height = this.arcCanvas.getBoundingClientRect().height;
    const cx = width / 2;
    const cy = height / 2;
    const radius = Math.min(cx, cy) * 0.85;

    ctx.clearRect(0, 0, width, height);

    const colors = this.getColors();
    const pulseScale = 1 + Math.sin(this.pulsePhase) * (this.state === 'SPEAKING' ? 0.08 : 0.03);

    // 1. Outer Holographic Bracket Ring
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(this.rotationAngle);

    ctx.strokeStyle = colors.ring;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.stroke();

    // 12 Outer calibration notches
    const notches = 12;
    for (let i = 0; i < notches; i++) {
      const angle = (i * Math.PI * 2) / notches;
      ctx.strokeStyle = colors.primary;
      ctx.lineWidth = i % 3 === 0 ? 3 : 1.5;
      ctx.beginPath();
      ctx.moveTo(Math.cos(angle) * (radius - 8), Math.sin(angle) * (radius - 8));
      ctx.lineTo(Math.cos(angle) * (radius + 4), Math.sin(angle) * (radius + 4));
      ctx.stroke();
    }
    ctx.restore();

    // 2. Counter-rotating Segmented Ring
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(this.counterAngle);

    const segments = 8;
    const segRadius = radius * 0.82;
    for (let i = 0; i < segments; i++) {
      const startAngle = (i * Math.PI * 2) / segments;
      const endAngle = startAngle + (Math.PI * 2) / segments * 0.65;
      ctx.strokeStyle = i % 2 === 0 ? colors.primary : colors.secondary;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, 0, segRadius, startAngle, endAngle);
      ctx.stroke();
    }
    ctx.restore();

    // 3. Audio Reactive Spectrum Ring (48 radial frequency rays)
    const rayCount = 48;
    const innerRayRadius = radius * 0.52;
    ctx.save();
    ctx.translate(cx, cy);
    for (let i = 0; i < rayCount; i++) {
      const angle = (i * Math.PI * 2) / rayCount;
      const dataIdx = i % this.audioData.length;
      const val = this.audioData[dataIdx] / 255;
      const rayLen = 6 + val * (radius * 0.24);

      ctx.strokeStyle = colors.primary;
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.4 + val * 0.6;
      ctx.beginPath();
      ctx.moveTo(Math.cos(angle) * innerRayRadius, Math.sin(angle) * innerRayRadius);
      ctx.lineTo(Math.cos(angle) * (innerRayRadius + rayLen), Math.sin(angle) * (innerRayRadius + rayLen));
      ctx.stroke();
    }
    ctx.restore();

    // 4. Floating Particles
    ctx.save();
    ctx.translate(cx, cy);
    for (const p of this.particles) {
      p.dist += p.speed;
      if (p.dist > radius * 0.85) {
        p.dist = 15;
        p.angle = Math.random() * Math.PI * 2;
      }
      const px = Math.cos(p.angle) * p.dist;
      const py = Math.sin(p.angle) * p.dist;

      ctx.fillStyle = colors.primary;
      ctx.globalAlpha = (1 - p.dist / (radius * 0.85)) * 0.7;
      ctx.beginPath();
      ctx.arc(px, py, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // 5. Central Reactor Housing & Iris Blades
    const coreRadius = radius * 0.38 * pulseScale;

    // Glowing aura gradient
    const glowGrad = ctx.createRadialGradient(cx, cy, 2, cx, cy, coreRadius * 1.6);
    glowGrad.addColorStop(0, colors.core);
    glowGrad.addColorStop(0.3, colors.primary);
    glowGrad.addColorStop(0.7, colors.secondary);
    glowGrad.addColorStop(1, 'rgba(0,0,0,0)');

    ctx.save();
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, coreRadius * 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Iris Blades / Hexagonal geometry
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(-this.rotationAngle * 0.5);
    const blades = 6;
    for (let i = 0; i < blades; i++) {
      const a = (i * Math.PI * 2) / blades;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * (coreRadius * 0.3), Math.sin(a) * (coreRadius * 0.3));
      ctx.lineTo(Math.cos(a + 0.4) * coreRadius, Math.sin(a + 0.4) * coreRadius);
      ctx.stroke();
    }
    ctx.restore();

    // Inner pure energy heart
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = colors.primary;
    ctx.shadowBlur = 18;
    ctx.beginPath();
    ctx.arc(cx, cy, coreRadius * 0.28, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Status label at the bottom of the reactor
    ctx.save();
    ctx.font = '600 10px "Nexa Serif Variable Medium", "Nexa Serif", serif';
    ctx.fillStyle = colors.text;
    ctx.textAlign = 'center';
    ctx.fillText(`SUPREM-MARK.VII // ${this.state}`, cx, cy + radius * 0.95);
    ctx.restore();
  }

  renderRadar() {
    if (!this.radarCanvas || !this.radarCtx) return;
    const ctx = this.radarCtx;
    const width = this.radarCanvas.getBoundingClientRect().width;
    const height = this.radarCanvas.getBoundingClientRect().height;
    const cx = width / 2;
    const cy = height / 2;
    const radius = Math.min(cx, cy) * 0.85;

    ctx.clearRect(0, 0, width, height);

    const colors = this.getColors();

    // Background circle
    ctx.fillStyle = 'rgba(4, 12, 24, 0.7)';
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();

    // Concentric grid rings (25km, 50km, 75km, 100km)
    ctx.strokeStyle = colors.ring;
    ctx.lineWidth = 1;
    for (let i = 1; i <= 4; i++) {
      ctx.beginPath();
      ctx.arc(cx, cy, (radius / 4) * i, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Crosshairs
    ctx.beginPath();
    ctx.moveTo(cx - radius, cy);
    ctx.lineTo(cx + radius, cy);
    ctx.moveTo(cx, cy - radius);
    ctx.lineTo(cx, cy + radius);
    ctx.stroke();

    // Radar Sweep Cone
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(this.radarAngle);

    const sweepGrad = ctx.createRadialGradient(0, 0, 5, 0, 0, radius);
    sweepGrad.addColorStop(0, 'rgba(0, 229, 255, 0.4)');
    sweepGrad.addColorStop(1, 'rgba(0, 229, 255, 0.0)');

    ctx.fillStyle = sweepGrad;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, radius, 0, -Math.PI / 4, true);
    ctx.closePath();
    ctx.fill();

    // Sweep leading edge line
    ctx.strokeStyle = colors.primary;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(radius, 0);
    ctx.stroke();
    ctx.restore();

    // Radar Targets
    ctx.save();
    ctx.translate(cx, cy);
    for (const blip of this.radarBlips) {
      const bx = Math.cos(blip.angle) * (radius * blip.dist);
      const by = Math.sin(blip.angle) * (radius * blip.dist);

      ctx.fillStyle = colors.primary;
      ctx.beginPath();
      ctx.arc(bx, by, blip.size, 0, Math.PI * 2);
      ctx.fill();

      // Blip ring
      ctx.strokeStyle = colors.primary;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(bx, by, blip.size * 2, 0, Math.PI * 2);
      ctx.stroke();

      // Label
      ctx.font = '8px "Nexa Serif Variable Medium", "Nexa Serif", serif';
      ctx.fillStyle = colors.text;
      ctx.fillText(blip.id, bx + 8, by + 3);
    }
    ctx.restore();

    // Cardinal markers
    ctx.font = '9px "Nexa Serif Variable Medium", "Nexa Serif", serif';
    ctx.fillStyle = colors.text;
    ctx.textAlign = 'center';
    ctx.fillText('N', cx, cy - radius - 3);
    ctx.fillText('S', cx, cy + radius + 10);
    ctx.fillText('W', cx - radius - 8, cy + 3);
    ctx.fillText('E', cx + radius + 8, cy + 3);
  }
}

window.hudVisualizer = new JarvisHUDVisualizer();
