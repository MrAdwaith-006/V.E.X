/**
 * V.E.X. MVEX OS Holographic 3D Acoustic Wave Reactor Core
 * Powered by Three.js WebGL & Real-Time Vocal/Acoustic Wave Telemetry.
 * 
 * Features:
 * 1. 3D Holographic Sinusoidal Wave Structure:
 *    - 9 Layered 3D Multi-Harmonic Wave Ribbons that undulate and twist across the core.
 *    - 9 Glowing Vector Crest Lines highlighting the sharp wave peaks.
 *    - 4 Gyroscopic 3D Harmonic Wave Orbital Loops surrounding the vocal field.
 *    - Central Acoustic Singularity Node & Deforming Harmonic Cage.
 *    - Floating Sonic Wave Particle Field (380 motes riding the wave peaks).
 *    - Holographic HUD Depth Frame & Acoustic Degree Reticles.
 * 2. True Dynamic Speech & Vocal Reactivity:
 *    - When TALKING (Assistant speaks or voice synthesis active):
 *      Wave structure surges into dynamic motion! Ribbons oscillate vigorously with
 *      vocal formant modulations, amplitude swells up to 4.5x, colors shift to radiant
 *      24K Stark Gold & Electric Blue, and wave ripples travel rapidly across the matrix.
 *    - When LISTENING (Microphone input):
 *      Shifts to Emerald Aquamarine with responsive high-frequency acoustic ripples.
 *    - Standby:
 *      Serene, hypnotic sinusoidal standing waves undulating gently through the field.
 * 3. Full 3D Interactive Controls:
 *    - Mouse / Touch 3D drag rotation with momentum & wheel-to-zoom.
 *    - Exploded Blueprint View (expands multi-tier wave ribbons along Z-depth).
 *    - Reset 3D View to canonical perspective.
 *    - Hand tracking & Air-tap acoustic shockwave blast.
 */

import * as THREE from './three.module.js';

export class ArcReactor3D {
  constructor() {
    this.container = null;
    this.canvas = null;
    this.scene = null;
    this.camera = null;
    this.renderer = null;

    // Groups
    this.rootGroup = null;
    this.waveFieldGroup = null;
    this.orbitalsGroup = null;
    this.singularityGroup = null;
    this.hudGroup = null;
    this.particleSystem = null;
    this.shockwaveMesh = null;

    // Lights
    this.coreLight = null;
    this.ambientLight = null;

    // Wave Ribbons & Crest Lines
    this.waveRibbons = []; // { mesh, geo, crestLine, crestGeo, baseZ, baseY, freq, speed, phase, amp, colorHex }
    this.waveOrbitals = []; // { line, geo, baseRadius, tiltX, tiltY, nodes, speed, baseColor }

    // State & Animation
    this.state = 'STANDBY'; // 'STANDBY', 'LISTENING', 'SPEAKING', 'COMBAT'
    this.theme = 'cyan';
    this.acousticMode = 'STANDBY'; // 'STANDBY', 'HEARING', 'SAYING'
    this.isExploded = false;
    this.explodeFactor = 0;
    this.targetExplodeFactor = 0;
    this.speechIntensity = 0; // 0 to 1 smooth speech envelope
    this.speakingDecayTimer = 0;
    this.time = 0;
    this.pulsePhase = 0;

    // Colors
    this.currentColor = new THREE.Color(0x00e5ff);
    this.targetColor = new THREE.Color(0x00e5ff);
    this.secondaryColor = new THREE.Color(0x0077ff);
    this.targetSecondaryColor = new THREE.Color(0x0077ff);
    this.goldColor = new THREE.Color(0xffd700);
    this.speakingCrestColor = new THREE.Color(0xfff5a6);

    // Hand Tracking & Gestures
    this.handActive = false;
    this.handTelemetry = {
      x: 0, y: 0, z: 0, roll: 0, pitch: 0, yaw: 0,
      isOpen: false, isFist: false, isPinch: false, isAirTap: false,
      gestureName: 'STANDBY'
    };

    // Camera & Transform Targets (Default with canonical 3D perspective tilt)
    this.targetRotation = { x: 0.15, y: -0.15, z: 0 };
    this.currentRotation = { x: 0.15, y: -0.15, z: 0 };
    this.targetPosition = { x: 0, y: 0, z: 0 };
    this.currentPosition = { x: 0, y: 0, z: 0 };
    this.targetZoom = 35;
    this.currentZoom = 35;

    // Mouse / Touch interaction
    this.isDragging = false;
    this.previousMousePosition = { x: 0, y: 0 };

    this.shockwaveScale = 0;
    this.isShockwaveActive = false;

    this.animId = null;
    this.clock = new THREE.Clock();
  }

  init(containerElementId = 'arcReactorTrigger', canvasElementId = 'arcReactorCanvas') {
    if (this.renderer) return;
    this.container = document.getElementById(containerElementId);
    this.canvas = document.getElementById(canvasElementId);

    if (!this.container || !this.canvas) {
      console.warn('[ArcReactor3D] Container or Canvas not found.');
      return;
    }

    const width = this.canvas.clientWidth || 650;
    const height = this.canvas.clientHeight || 280;

    // 1. Three.js Scene & Camera
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    this.camera.position.set(0, 0, this.currentZoom);
    this.camera.lookAt(0, 0, 0);

    // 2. WebGL Renderer
    try {
      this.renderer = new THREE.WebGLRenderer({
        canvas: this.canvas,
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance'
      });
      this.renderer.setSize(width, height, false);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      this.renderer.toneMappingExposure = 1.35;
    } catch (err) {
      console.error('[ArcReactor3D] WebGL init error:', err);
      return;
    }

    // 3. Lighting setup
    this.setupLighting();

    // 4. Build 3D Acoustic Wave Structure
    this.buildWaveReactorModel();

    // 5. Interaction Listeners
    this.setupEventListeners();

    // 6. Start Render Loop
    this.animate();

    console.log('[V.E.X.] 3D Acoustic Wave Reactor Core Online.');
  }

  setupLighting() {
    this.ambientLight = new THREE.AmbientLight(0x0a1e38, 1.5);
    this.scene.add(this.ambientLight);

    // Dynamic Central Sonic Core Light
    this.coreLight = new THREE.PointLight(0x00e5ff, 5.5, 95);
    this.coreLight.position.set(0, 0, 3);
    this.scene.add(this.coreLight);

    // Key front light
    const frontKey = new THREE.DirectionalLight(0x80f0ff, 1.4);
    frontKey.position.set(15, 20, 35);
    this.scene.add(frontKey);

    // Back rim accent
    const backRim = new THREE.DirectionalLight(0x0077ff, 1.2);
    backRim.position.set(-20, -18, -25);
    this.scene.add(backRim);
  }

  buildWaveReactorModel() {
    this.rootGroup = new THREE.Group();
    this.scene.add(this.rootGroup);

    // =========================================================================
    // LAYER 1: MULTI-TIER 3D ACOUSTIC WAVE RIBBONS & VECTOR CREST TRACERS
    // =========================================================================
    this.waveFieldGroup = new THREE.Group();
    this.rootGroup.add(this.waveFieldGroup);
    this.waveRibbons = [];

    // Configuration for 9 layered 3D wave ribbons spanning depth and height
    const ribbonConfigs = [
      { baseZ: -6.4, baseY: -2.0, freq: 0.26, speed: 1.0,  phase: 0.0, amp: 1.8, colorHex: 0x0055d4, opacity: 0.55 },
      { baseZ: -4.8, baseY: -1.4, freq: 0.31, speed: -1.2, phase: 0.9, amp: 2.1, colorHex: 0x0077ff, opacity: 0.65 },
      { baseZ: -3.2, baseY: -0.8, freq: 0.36, speed: 1.4,  phase: 1.8, amp: 2.4, colorHex: 0x00a8ff, opacity: 0.72 },
      { baseZ: -1.6, baseY: -0.2, freq: 0.42, speed: -1.7, phase: 2.7, amp: 2.8, colorHex: 0x00d4ff, opacity: 0.82 },
      { baseZ:  0.0, baseY:  0.0, freq: 0.48, speed: 1.9,  phase: 3.6, amp: 3.3, colorHex: 0xffffff, opacity: 0.96 }, // Central Primary Ribbon
      { baseZ:  1.6, baseY:  0.2, freq: 0.42, speed: -1.6, phase: 4.5, amp: 2.8, colorHex: 0x00f2fe, opacity: 0.82 },
      { baseZ:  3.2, baseY:  0.8, freq: 0.36, speed: 1.3,  phase: 5.4, amp: 2.4, colorHex: 0x4facfe, opacity: 0.72 },
      { baseZ:  4.8, baseY:  1.4, freq: 0.31, speed: -1.1, phase: 0.5, amp: 2.1, colorHex: 0x0088ff, opacity: 0.65 },
      { baseZ:  6.4, baseY:  2.0, freq: 0.26, speed: 0.9,  phase: 1.4, amp: 1.8, colorHex: 0x0055d4, opacity: 0.55 }
    ];

    const RIBBON_WIDTH = 56; // Extended length spanning both sides
    const SEGMENTS_X = 180;
    const RIBBON_HEIGHT = 1.3;

    ribbonConfigs.forEach((cfg, idx) => {
      // 1. Surface Ribbon Geometry (Strip of 120 quads)
      const planeGeo = new THREE.PlaneGeometry(RIBBON_WIDTH, RIBBON_HEIGHT, SEGMENTS_X, 2);
      const planeMat = new THREE.MeshStandardMaterial({
        color: cfg.colorHex,
        emissive: cfg.colorHex,
        emissiveIntensity: 0.65,
        roughness: 0.3,
        metalness: 0.1,
        transparent: true,
        opacity: cfg.opacity,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        wireframe: false
      });

      const ribbonMesh = new THREE.Mesh(planeGeo, planeMat);
      ribbonMesh.position.set(0, cfg.baseY, cfg.baseZ);
      this.waveFieldGroup.add(ribbonMesh);

      // 2. Center Crest Vector Line
      const linePositions = new Float32Array((SEGMENTS_X + 1) * 3);
      const lineGeo = new THREE.BufferGeometry();
      lineGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));

      const lineMat = new THREE.LineBasicMaterial({
        color: cfg.colorHex === 0xffffff ? 0xffffff : 0x80f0ff,
        transparent: true,
        opacity: 0.95,
        blending: THREE.AdditiveBlending,
        linewidth: 2
      });

      const crestLine = new THREE.Line(lineGeo, lineMat);
      crestLine.position.set(0, cfg.baseY, cfg.baseZ);
      this.waveFieldGroup.add(crestLine);

      this.waveRibbons.push({
        mesh: ribbonMesh,
        geo: planeGeo,
        mat: planeMat,
        crestLine,
        crestGeo: lineGeo,
        crestMat: lineMat,
        baseZ: cfg.baseZ,
        baseY: cfg.baseY,
        freq: cfg.freq,
        speed: cfg.speed,
        phase: cfg.phase,
        amp: cfg.amp,
        baseColorHex: cfg.colorHex,
        segmentsX: SEGMENTS_X,
        ribbonIndex: idx
      });
    });

    // =========================================================================
    // LAYER 2: 4 GYROSCOPIC 3D HARMONIC WAVE ORBITALS
    // =========================================================================
    this.orbitalsGroup = new THREE.Group();
    this.rootGroup.add(this.orbitalsGroup);
    this.waveOrbitals = [];

    const orbitalConfigs = [
      { radius: 11.5, rotX: 0.05, rotY: 0.0,  nodes: 8,  speed:  1.2, colorHex: 0x00e5ff },
      { radius: 12.8, rotX: 0.65, rotY: 0.30, nodes: 10, speed: -0.9, colorHex: 0x0099ff },
      { radius: 12.8, rotX:-0.65, rotY:-0.30, nodes: 10, speed:  1.0, colorHex: 0x00ffff },
      { radius: 13.8, rotX: 1.57, rotY: 0.0,  nodes: 12, speed: -0.7, colorHex: 0x48cae4 }
    ];

    const POINTS_PER_ORBITAL = 180;

    orbitalConfigs.forEach((cfg, idx) => {
      const positions = new Float32Array((POINTS_PER_ORBITAL + 1) * 3);
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

      const mat = new THREE.LineBasicMaterial({
        color: cfg.colorHex,
        transparent: true,
        opacity: 0.65,
        blending: THREE.AdditiveBlending,
        linewidth: 1.5
      });

      const line = new THREE.Line(geo, mat);
      line.rotation.x = cfg.rotX;
      line.rotation.y = cfg.rotY;
      this.orbitalsGroup.add(line);

      this.waveOrbitals.push({
        line,
        geo,
        mat,
        baseRadius: cfg.radius,
        baseRotX: cfg.rotX,
        baseRotY: cfg.rotY,
        nodes: cfg.nodes,
        speed: cfg.speed,
        pointsCount: POINTS_PER_ORBITAL,
        baseColorHex: cfg.colorHex,
        orbitalIndex: idx
      });
    });

    // =========================================================================
    // LAYER 3: CENTRAL ACOUSTIC SINGULARITY & HARMONIC CAGE
    // =========================================================================
    this.singularityGroup = new THREE.Group();
    this.rootGroup.add(this.singularityGroup);

    // Glowing Inner Sonic Core Sphere
    const coreGeo = new THREE.SphereGeometry(1.6, 32, 32);
    this.coreMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0x00e5ff,
      emissiveIntensity: 3.5,
      roughness: 0.1,
      metalness: 0.2
    });
    this.coreMesh = new THREE.Mesh(coreGeo, this.coreMat);
    this.singularityGroup.add(this.coreMesh);

    // Deforming Harmonic Icosahedron Lattice
    const cageGeo = new THREE.IcosahedronGeometry(2.5, 2);
    this.cageMat = new THREE.MeshBasicMaterial({
      color: 0x80f0ff,
      wireframe: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });
    this.cageMesh = new THREE.Mesh(cageGeo, this.cageMat);
    this.singularityGroup.add(this.cageMesh);

    // =========================================================================
    // LAYER 4: FLOATING SONIC WAVE PARTICLE FIELD (380 Motes riding wave peaks)
    // =========================================================================
    const PARTICLE_COUNT = 380;
    const particleGeo = new THREE.BufferGeometry();
    this.particlePositions = new Float32Array(PARTICLE_COUNT * 3);
    this.particleMetadata = [];
    const particleColors = new Float32Array(PARTICLE_COUNT * 3);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const px = (Math.random() - 0.5) * 54.0;
      const pz = (Math.random() - 0.5) * 12.0;
      const rIdx = Math.floor(Math.random() * ribbonConfigs.length);

      this.particlePositions[i * 3] = px;
      this.particlePositions[i * 3 + 1] = 0;
      this.particlePositions[i * 3 + 2] = pz;

      this.particleMetadata.push({
        x: px,
        z: pz,
        rIdx,
        driftSpeed: (Math.random() * 0.4 + 0.2) * (Math.random() > 0.5 ? 1 : -1),
        phase: Math.random() * Math.PI * 2,
        yOffset: (Math.random() - 0.5) * 0.7
      });

      particleColors[i * 3] = 0.1;
      particleColors[i * 3 + 1] = 0.85 + Math.random() * 0.15;
      particleColors[i * 3 + 2] = 1.0;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(this.particlePositions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    this.particleMat = new THREE.PointsMaterial({
      size: 0.42,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });

    this.particleSystem = new THREE.Points(particleGeo, this.particleMat);
    this.rootGroup.add(this.particleSystem);

    // =========================================================================
    // LAYER 5: SONIC MATRIX (CLEAN BORDERLESS WAVE FIELD)
    // =========================================================================
    this.hudGroup = new THREE.Group();
    this.rootGroup.add(this.hudGroup);

    // =========================================================================
    // LAYER 6: ACOUSTIC SHOCKWAVE BLAST (Triggered on click / air-tap)
    // =========================================================================
    const shockGeo = new THREE.RingGeometry(0.3, 1.4, 64);
    this.shockMat = new THREE.MeshBasicMaterial({
      color: 0x00e5ff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending
    });
    this.shockwaveMesh = new THREE.Mesh(shockGeo, this.shockMat);
    this.shockwaveMesh.position.z = 2.0;
    this.rootGroup.add(this.shockwaveMesh);
  }

  setupEventListeners() {
    window.addEventListener('resize', () => this.onWindowResize());

    // Mouse Drag Rotation
    this.canvas.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.isDragging) return;
      const deltaX = e.clientX - this.previousMousePosition.x;
      const deltaY = e.clientY - this.previousMousePosition.y;

      this.targetRotation.y += deltaX * 0.007;
      this.targetRotation.x += deltaY * 0.007;
      this.previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
    });

    // Touch Support
    this.canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        this.isDragging = true;
        this.previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (!this.isDragging || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - this.previousMousePosition.x;
      const deltaY = e.touches[0].clientY - this.previousMousePosition.y;

      this.targetRotation.y += deltaX * 0.007;
      this.targetRotation.x += deltaY * 0.007;
      this.previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }, { passive: true });

    window.addEventListener('touchend', () => {
      this.isDragging = false;
    });

    // Zoom on wheel
    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      this.targetZoom += e.deltaY * 0.035;
      this.targetZoom = Math.max(18, Math.min(65, this.targetZoom));
    }, { passive: false });

    // Click trigger shockwave
    this.canvas.addEventListener('click', (e) => {
      if (Math.abs(e.movementX || 0) < 3 && Math.abs(e.movementY || 0) < 3) {
        this.fireShockwave();
      }
    });
  }

  // MediaPipe Hand Gesture Telemetry Integration
  updateHandTelemetry(telemetry) {
    this.handActive = true;
    this.handTelemetry = telemetry;

    const normX = (telemetry.x - 0.5) * 2;
    const normY = (telemetry.y - 0.5) * 2;

    this.targetRotation.y = normX * 0.95;
    this.targetRotation.x = normY * 0.75;

    if (telemetry.roll !== undefined) {
      this.targetRotation.z = telemetry.roll * 0.85;
    }

    this.targetPosition.x = normX * 4.5;
    this.targetPosition.y = -normY * 3.5;

    if (telemetry.handSpan !== undefined) {
      const clampedSpan = Math.max(0.12, Math.min(0.5, telemetry.handSpan));
      this.targetZoom = 55 - (clampedSpan - 0.12) / (0.38) * 32;
    }

    if (telemetry.isOpen) {
      this.targetExplodeFactor = 1.0;
      this.updateGestureBadge('🖐️ OPEN PALM // EXPANDED WAVE MATRIX');
    } else if (telemetry.isFist) {
      this.targetExplodeFactor = 0.0;
      this.updateGestureBadge('✊ FIST // HARMONIC LOCK ENGAGED');
    } else if (telemetry.isPinch) {
      this.updateGestureBadge('🤏 PINCH // SONIC WAVE FOCUS');
    } else {
      this.targetExplodeFactor = 0.22;
      this.updateGestureBadge('👆 HAND TRACKING // AIR CONTROL');
    }

    if (telemetry.isAirTap) {
      this.fireShockwave();
    }
  }

  releaseHand() {
    this.handActive = false;
    this.targetPosition.x = 0;
    this.targetPosition.y = 0;
    this.targetExplodeFactor = this.isExploded ? 1.0 : 0.0;
    this.updateGestureBadge('STANDBY // 3D WAVE CORE READY');
  }

  updateGestureBadge(text) {
    const badge = document.getElementById('arcGestureBadge');
    if (badge) {
      badge.textContent = text;
      badge.style.color = '#00e5ff';
    }
  }

  toggleExplodedView() {
    this.isExploded = !this.isExploded;
    this.targetExplodeFactor = this.isExploded ? 1.0 : 0.0;
    if (window.jarvisAudio) window.jarvisAudio.playAcknowledge();
    this.updateGestureBadge(this.isExploded ? 'EXPLODED WAVE MATRIX VIEW' : 'ASSEMBLED WAVE CORE VIEW');
  }

  fireShockwave() {
    this.isShockwaveActive = true;
    this.shockwaveScale = 0.1;
    if (this.shockwaveMesh) {
      this.shockwaveMesh.scale.set(1, 1, 1);
      this.shockwaveMesh.material.opacity = 1.0;
    }
    if (window.jarvisAudio) window.jarvisAudio.playRepulsor();
    if (this.coreLight) {
      this.coreLight.intensity = 8.8;
      setTimeout(() => {
        if (this.coreLight) this.coreLight.intensity = 5.5;
      }, 350);
    }
  }

  resetView() {
    this.targetRotation = { x: 0.15, y: -0.15, z: 0 };
    this.targetPosition = { x: 0, y: 0, z: 0 };
    this.targetZoom = 35;
    this.targetExplodeFactor = 0.0;
    this.isExploded = false;
    if (window.jarvisAudio) window.jarvisAudio.playClick();
  }

  setState(state) {
    this.state = state;
    if (state === 'SPEAKING') {
      this.speakingDecayTimer = 1.8; // Hold speaking animation for a moment to prevent jarring pops
    }
  }

  setTheme(theme) {
    this.theme = theme;
  }

  setPersonality() {}

  onWindowResize() {
    if (!this.canvas || !this.renderer || !this.camera) return;
    const width = this.canvas.clientWidth || 650;
    const height = this.canvas.clientHeight || 280;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
  }

  // =========================================================================
  // 60 FPS RENDER, PHYSICS & ACOUSTIC WAVE COMPUTATION LOOP
  // =========================================================================
  animate() {
    this.animId = requestAnimationFrame(() => this.animate());

    const delta = this.clock.getDelta();
    this.time += delta;
    this.pulsePhase += delta * 3.5;

    if (this.speakingDecayTimer > 0) {
      this.speakingDecayTimer -= delta;
    }

    // 1. Fetch Real-Time Acoustic Telemetry
    const telemetry = window.jarvisAudio ? window.jarvisAudio.getAcousticTelemetry() : {
      frequencies: new Uint8Array(64),
      waveform: new Uint8Array(64).fill(128),
      level: 0,
      isHearing: false,
      isSaying: false,
      state: 'STANDBY'
    };

    const freqData = telemetry.frequencies || new Uint8Array(64);
    const waveData = telemetry.waveform || new Uint8Array(64);
    const audioLevel = telemetry.level || 0;

    // Detect if assistant is talking via Web Speech, state, audio, or timer
    const isSpeechSynthesisActive = (typeof window !== 'undefined' && window.speechSynthesis && window.speechSynthesis.speaking);
    const isAppSpeaking = (typeof window !== 'undefined' && window.app && window.app.state === 'SPEAKING');
    const isSayingActive = this.state === 'SPEAKING' || telemetry.isSaying || isSpeechSynthesisActive || isAppSpeaking || (this.speakingDecayTimer > 0);
    const isHearingActive = !isSayingActive && (this.state === 'LISTENING' || telemetry.isHearing || (audioLevel > 0.04));

    // Smooth speech envelope tracking
    const targetSpeech = isSayingActive ? 1.0 : 0.0;
    this.speechIntensity += (targetSpeech - this.speechIntensity) * (isSayingActive ? 0.20 : 0.08);

    if (isSayingActive) {
      this.acousticMode = 'SAYING';
      // 24K Stark Gold & Radiant Electric Blue
      this.targetColor.setHex(0xffd700);
      this.targetSecondaryColor.setHex(0x0099ff);
    } else if (isHearingActive) {
      this.acousticMode = 'HEARING';
      // Emerald Aquamarine & Sonic Cyan
      this.targetColor.setHex(0x00ffc4);
      this.targetSecondaryColor.setHex(0x00e5ff);
    } else if (this.state === 'COMBAT' || this.theme === 'combat') {
      this.acousticMode = 'COMBAT';
      this.targetColor.setHex(0xff3344);
      this.targetSecondaryColor.setHex(0xff7700);
    } else {
      this.acousticMode = 'STANDBY';
      // Holographic Cyber Stark Cyan & Royal Blue
      this.targetColor.setHex(0x00e5ff);
      this.targetSecondaryColor.setHex(0x0077ff);
    }

    // Smooth Color Interpolation
    this.currentColor.lerp(this.targetColor, 0.12);
    this.secondaryColor.lerp(this.targetSecondaryColor, 0.12);

    // Update Lighting with reactive intensity
    if (this.coreLight) {
      this.coreLight.color.copy(this.currentColor);
      const baseIntensity = isSayingActive ? 7.2 : (isHearingActive ? 6.0 : 4.8);
      this.coreLight.intensity = baseIntensity + this.speechIntensity * 2.8 + audioLevel * 4.0;
    }
    if (this.coreMat) {
      this.coreMat.emissive.copy(this.currentColor);
    }
    if (this.cageMat) {
      this.cageMat.color.copy(this.currentColor);
    }
    if (this.reticleMat) {
      this.reticleMat.color.copy(this.currentColor);
    }
    if (this.backReticleMat) {
      this.backReticleMat.color.copy(this.secondaryColor);
    }

    // 2. Smooth Transform Interpolation
    const lerpSpeed = this.handActive ? 0.16 : 0.08;
    this.currentRotation.x += (this.targetRotation.x - this.currentRotation.x) * lerpSpeed;
    this.currentRotation.y += (this.targetRotation.y - this.currentRotation.y) * lerpSpeed;
    this.currentRotation.z += (this.targetRotation.z - this.currentRotation.z) * lerpSpeed;

    this.currentPosition.x += (this.targetPosition.x - this.currentPosition.x) * lerpSpeed;
    this.currentPosition.y += (this.targetPosition.y - this.currentPosition.y) * lerpSpeed;

    this.currentZoom += (this.targetZoom - this.currentZoom) * 0.1;
    this.camera.position.z = this.currentZoom;

    this.explodeFactor += (this.targetExplodeFactor - this.explodeFactor) * 0.12;
    const exp = this.explodeFactor;

    if (this.rootGroup) {
      this.rootGroup.rotation.x = this.currentRotation.x;
      this.rootGroup.rotation.y = this.currentRotation.y;
      this.rootGroup.rotation.z = this.currentRotation.z;
      this.rootGroup.position.x = this.currentPosition.x;
      this.rootGroup.position.y = this.currentPosition.y;
    }

    // 3. Central Sonic Singularity Pulsation
    const vocalPulse = Math.sin(this.time * 9.5) * 0.35 + Math.sin(this.time * 16.0) * 0.25;
    const coreScale = 1.0 + (this.speechIntensity * (0.38 + vocalPulse * 0.28)) + audioLevel * 0.35;

    if (this.coreMesh) {
      this.coreMesh.scale.set(coreScale, coreScale, coreScale);
    }
    if (this.cageMesh) {
      this.cageMesh.rotation.x += 0.015 * (1 + this.speechIntensity * 2.2);
      this.cageMesh.rotation.y += 0.020 * (1 + this.speechIntensity * 2.2);
      const cageScale = coreScale * 1.1;
      this.cageMesh.scale.set(cageScale, cageScale, cageScale);
    }

    // 4. UPDATE THE 3D ACOUSTIC WAVE RIBBONS & VECTOR CREST LINES
    // When talking, waves swell up to 4.5x in amplitude and oscillate with vocal formant cadences!
    const speechAmpMultiplier = 1.0 + this.speechIntensity * 3.8 + (audioLevel * 3.2);
    const speechSpeedMultiplier = 1.0 + this.speechIntensity * 2.5;

    this.waveRibbons.forEach((ribbon) => {
      const posAttr = ribbon.geo.attributes.position;
      const posArray = posAttr.array;
      const crestPosAttr = ribbon.crestGeo.attributes.position;
      const crestPosArray = crestPosAttr.array;

      const segs = ribbon.segmentsX;
      const rIdx = ribbon.ribbonIndex;
      const speed = ribbon.speed * speechSpeedMultiplier;
      const phaseOffset = ribbon.phase + this.time * speed * 2.8;

      // Dynamic color interpolation per ribbon
      if (isSayingActive) {
        if (rIdx === 4) {
          ribbon.mat.emissive.copy(this.speakingCrestColor);
          ribbon.crestMat.color.copy(this.speakingCrestColor);
        } else if (rIdx % 2 === 0) {
          ribbon.mat.emissive.copy(this.goldColor);
          ribbon.crestMat.color.copy(this.goldColor);
        } else {
          ribbon.mat.emissive.copy(this.secondaryColor);
          ribbon.crestMat.color.copy(this.currentColor);
        }
      } else {
        ribbon.mat.emissive.copy(rIdx % 2 === 0 ? this.currentColor : this.secondaryColor);
        ribbon.crestMat.color.copy(rIdx === 4 ? new THREE.Color(0xffffff) : this.currentColor);
      }

      // Exploded Blueprint View Z-separation
      const zSeparation = ribbon.baseZ + (rIdx - 4) * exp * 3.2;
      ribbon.mesh.position.z = zSeparation;
      ribbon.crestLine.position.z = zSeparation;

      const cols = segs + 1;
      const halfWidth = 28.0;

      for (let c = 0; c < cols; c++) {
        const u = (c / segs) * 2 - 1; // [-1, 1] normalized X
        const x = u * halfWidth;

        // Smooth cosine window envelope
        const envelope = Math.pow(Math.cos(u * Math.PI * 0.49), 1.15);

        // Multi-frequency harmonic wave computation
        const k1 = ribbon.freq * 0.85;
        const k2 = ribbon.freq * 1.55;
        const k3 = ribbon.freq * 2.6;

        let waveY = (
          Math.sin(x * k1 + phaseOffset) * 0.55 +
          Math.sin(x * k2 - phaseOffset * 1.4) * 0.32 +
          Math.cos(x * k3 + phaseOffset * 0.7) * 0.18
        ) * ribbon.amp * envelope * speechAmpMultiplier;

        let waveZ = Math.cos(x * k1 * 0.8 + phaseOffset) * 0.45 * envelope * speechAmpMultiplier;

        // Reactive Audio Telemetry & Vocal Formant Pulse
        if (isSayingActive) {
          const vocalFormant = Math.sin(x * 0.26 - this.time * 12.0) * (0.85 + audioLevel * 1.6);
          waveY += vocalFormant * envelope;
          waveZ += Math.cos(x * 0.20 + this.time * 8.0) * 0.65 * envelope;
        } else if (isHearingActive) {
          const bin = (c * 2 + rIdx * 6) % freqData.length;
          const fNorm = freqData[bin] / 255;
          const wByte = waveData[(c + rIdx * 4) % waveData.length] || 128;
          const wNorm = (wByte - 128) / 128;
          waveY += (fNorm * 2.2 + wNorm * 1.2) * envelope;
        }

        const ribbonHalfH = 0.65 * (1.0 + this.speechIntensity * 0.45);
        for (let row = 0; row < 3; row++) {
          const vIdx = row * cols + c;
          const localY = (1 - row) * ribbonHalfH + waveY;

          posArray[vIdx * 3]     = x;
          posArray[vIdx * 3 + 1] = localY;
          posArray[vIdx * 3 + 2] = waveZ;
        }

        crestPosArray[c * 3]     = x;
        crestPosArray[c * 3 + 1] = waveY;
        crestPosArray[c * 3 + 2] = waveZ + 0.05;
      }

      posAttr.needsUpdate = true;
      crestPosAttr.needsUpdate = true;
    });

    // 5. UPDATE GYROSCOPIC 3D HARMONIC WAVE ORBITALS
    this.waveOrbitals.forEach((orbital) => {
      const posAttr = orbital.geo.attributes.position;
      const posArray = posAttr.array;
      const N = orbital.pointsCount;
      const nodes = orbital.nodes;
      const baseR = orbital.baseRadius;
      const speed = orbital.speed * speechSpeedMultiplier;
      const orbitPhase = this.time * speed * 2.2;

      orbital.mat.color.copy(isSayingActive ? this.goldColor : (orbital.orbitalIndex % 2 === 0 ? this.currentColor : this.secondaryColor));

      for (let i = 0; i <= N; i++) {
        const theta = (i / N) * Math.PI * 2;
        let harmonicR = Math.sin(nodes * theta + orbitPhase) * 0.40;
        let harmonicZ = Math.cos(nodes * theta * 1.3 - orbitPhase) * 0.50;

        if (isSayingActive) {
          harmonicR += Math.sin(theta * 4 + this.time * 6) * (0.8 + audioLevel * 1.5) * this.speechIntensity;
          harmonicZ += Math.cos(theta * 3 - this.time * 5) * (0.9 + audioLevel * 1.2) * this.speechIntensity;
        } else if (isHearingActive) {
          const bin = (i * 2 + orbital.orbitalIndex * 8) % freqData.length;
          const fNorm = freqData[bin] / 255;
          harmonicR += fNorm * 1.6;
        }

        const r = baseR + harmonicR;
        posArray[i * 3]     = Math.cos(theta) * r;
        posArray[i * 3 + 1] = Math.sin(theta) * r;
        posArray[i * 3 + 2] = harmonicZ;
      }

      posAttr.needsUpdate = true;
      orbital.line.rotation.z += 0.003 * speechSpeedMultiplier;
      orbital.line.position.z = (orbital.orbitalIndex - 1.5) * exp * 3.5;
    });

    // 6. UPDATE FLOATING SONIC PARTICLES RIDING WAVE PEAKS
    if (this.particleSystem) {
      const posAttr = this.particleSystem.geometry.attributes.position;
      const colorsAttr = this.particleSystem.geometry.attributes.color;
      const count = posAttr.count;

      for (let i = 0; i < count; i++) {
        const meta = this.particleMetadata[i];
        meta.x += meta.driftSpeed * delta * 4.5 * speechSpeedMultiplier;
        if (meta.x > 27.5) meta.x = -27.5;
        if (meta.x < -27.5) meta.x = 27.5;

        const u = meta.x / 28.0;
        const envelope = Math.pow(Math.cos(u * Math.PI * 0.49), 1.15);

        const waveY = (
          Math.sin(meta.x * 0.35 + this.time * 2.5 + meta.phase) * 1.8 +
          Math.cos(meta.x * 0.65 - this.time * 3.0) * 0.9
        ) * envelope * speechAmpMultiplier;

        const y = waveY + meta.yOffset;
        const z = meta.z + Math.sin(this.time * 3 + i) * 0.35;

        posAttr.setXYZ(i, meta.x, y, z);

        if (isSayingActive) {
          colorsAttr.setXYZ(i, 1.0, 0.85, 0.2);
        } else {
          colorsAttr.setXYZ(i, 0.1, 0.85, 1.0);
        }
      }

      posAttr.needsUpdate = true;
      colorsAttr.needsUpdate = true;
    }

    // 7. HUD Reticle Frame Rotation
    if (this.hudGroup) {
      this.hudGroup.rotation.z += 0.002 * speechSpeedMultiplier;
      this.hudGroup.position.z = exp * 10;
    }

    // 8. Shockwave blast expansion
    if (this.isShockwaveActive && this.shockwaveMesh) {
      this.shockwaveScale += delta * 12.0;
      this.shockwaveMesh.scale.set(this.shockwaveScale, this.shockwaveScale, 1);
      this.shockwaveMesh.material.opacity = Math.max(0, 1.0 - (this.shockwaveScale / 18.0));

      if (this.shockwaveScale >= 18.0) {
        this.isShockwaveActive = false;
        this.shockwaveMesh.material.opacity = 0;
      }
    }

    // 9. Render Three.js Scene
    this.renderer.render(this.scene, this.camera);
  }
}

// Global Singleton Instance & Auto-Initialization
window.arcReactor3D = new ArcReactor3D();

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      if (document.getElementById('arcReactorCanvas') && !window.arcReactor3D.renderer) {
        window.arcReactor3D.init('arcReactorTrigger', 'arcReactorCanvas');
      }
    });
  } else {
    setTimeout(() => {
      if (document.getElementById('arcReactorCanvas') && !window.arcReactor3D.renderer) {
        window.arcReactor3D.init('arcReactorTrigger', 'arcReactorCanvas');
      }
    }, 50);
  }
}
