/**
 * S.U.P.R.E.M. Main Application Controller
 * Orchestrates Speech Recognition ("Suprem" Wake-Word), British Speech Synthesis,
 * Real-Time Optical Movement Tracking (WebRTC + Canvas Computer Vision),
 * WebSockets Telemetry, and Procedural Web Audio FX.
 */

class SupremApp {
  constructor() {
    this.recognition = null;
    this.isListening = false;
    this.isHandsFree = true; // Default hands-free hotword active
    this.selectedVoice = null;
    this.speechSynthesisVoices = [];
    this.ws = null;

    // Optical Movement Tracking
    this.cameraStream = null;
    this.isCameraActive = false;
    this.trackingCanvas = null;
    this.trackingCtx = null;
    this.analysisCanvas = null;
    this.analysisCtx = null;
    this.prevFrameData = null;
    this.trackingAnimId = null;
    this.smoothedX = 320;
    this.smoothedY = 240;
    this.motionHistory = [];

    this.dom = {};
  }

  init() {
    this.cacheDom();
    this.initHUD();
    this.initLocalLlm();
    this.initSpeechSynthesis();
    this.initSpeechRecognition();
    this.initWebSocket();
    this.bindEvents();
    this.fetchWeather();
    this.drawGauges(0, 0);

    // Boot message
    this.addTranscript('system', 'INITIALIZING MOXX INDUSTRIES S.U.P.R.E.M. v4.2.0...');
    setTimeout(() => {
      this.addTranscript('suprem', 'All systems online, Mr. Moxx. S.U.P.R.E.M. is ready for your command.');
    }, 600);
  }

  cacheDom() {
    this.dom.stateBadge = document.getElementById('jarvisStateBadge');
    this.dom.stateText = document.getElementById('jarvisStateText');
    this.dom.transcriptBox = document.getElementById('transcriptBox');
    this.dom.commandInput = document.getElementById('commandInput');
    this.dom.sendBtn = document.getElementById('sendBtn');
    this.dom.micBtn = document.getElementById('micToggleBtn');
    this.dom.handsFreeCheckbox = document.getElementById('handsFreeToggle');
    this.dom.uptimeVal = document.getElementById('uptimeVal');
    this.dom.cpuVal = document.getElementById('cpuVal');
    this.dom.ramVal = document.getElementById('ramVal');
    this.dom.hostnameVal = document.getElementById('hostnameVal');
    this.dom.settingsModal = document.getElementById('settingsModal');
    this.dom.openSettingsBtn = document.getElementById('openSettingsBtn');
    this.dom.closeSettingsBtn = document.getElementById('closeSettingsBtn');
    this.dom.saveSettingsBtn = document.getElementById('saveSettingsBtn');
    this.dom.cameraVisorModal = document.getElementById('cameraVisorModal');
    this.dom.toggleCameraBtn = document.getElementById('toggleCameraBtn');
    this.dom.closeCameraBtn = document.getElementById('closeCameraBtn');
    this.dom.cameraVideo = document.getElementById('cameraVideo');
    this.dom.trackingOverlayCanvas = document.getElementById('trackingOverlayCanvas');
    this.dom.activateSensorsBtn = document.getElementById('activateSensorsBtn');
    this.dom.muteBtn = document.getElementById('muteBtn');
    this.dom.alertBanner = document.getElementById('alertBanner');
    this.dom.alertBannerText = document.getElementById('alertBannerText');

    // Local LLM & Quick API Vault Controls
    this.dom.toggleLocalLlmBtn = document.getElementById('toggleLocalLlmBtn');
    this.dom.localLlmToggle = document.getElementById('localLlmToggle');
    this.dom.localLlmStatusText = document.getElementById('localLlmStatusText');
    this.dom.localLlmUrlInput = document.getElementById('localLlmUrlInput');
    this.dom.apiProviderQuick = document.getElementById('apiProviderQuick');
    this.dom.apiKeyQuickInput = document.getElementById('apiKeyQuickInput');
    this.dom.apiModelQuick = document.getElementById('apiModelQuick');
    this.dom.saveApiKeyBtn = document.getElementById('saveApiKeyBtn');
    this.dom.apiKeyStatusTag = document.getElementById('apiKeyStatusTag');
    this.dom.apiKeyVisibilityBtn = document.getElementById('apiKeyVisibilityBtn');

    // Web Portal & Air-Touch Gesture elements
    this.dom.toggleGestureBtn = document.getElementById('toggleGestureBtn');
    this.dom.openWebPortalBtn = document.getElementById('openWebPortalBtn');
    this.dom.closeWebPortalBtn = document.getElementById('closeWebPortalBtn');
    this.dom.webPortalModal = document.getElementById('webPortalModal');
    this.dom.webUrlInput = document.getElementById('webUrlInput');
    this.dom.webSearchBtn = document.getElementById('webSearchBtn');
    this.dom.webViewerFrame = document.getElementById('webViewerFrame');
    this.dom.webBackBtn = document.getElementById('webBackBtn');
    this.dom.webForwardBtn = document.getElementById('webForwardBtn');

    // Movement telemetry widgets
    this.dom.opticalSensorState = document.getElementById('opticalSensorState');
    this.dom.movementVectorVal = document.getElementById('movementVectorVal');
    this.dom.movementCoordsVal = document.getElementById('movementCoordsVal');
    this.dom.movementSpeedVal = document.getElementById('movementSpeedVal');
    this.dom.trackingStatusBadge = document.getElementById('trackingStatusBadge');
    this.dom.visorVectorText = document.getElementById('visorVectorText');
    this.dom.visorCoordsText = document.getElementById('visorCoordsText');
    this.dom.reticleBox = document.getElementById('reticleBox');
  }

  initLocalLlm() {
    const isActive = window.supremBrain?.isLocalLLMActive || false;
    this.updateLocalLlmUI(isActive);

    if (this.dom.localLlmUrlInput && window.supremBrain?.localLLMUrl) {
      this.dom.localLlmUrlInput.value = window.supremBrain.localLLMUrl;
    }

    if (this.dom.apiProviderQuick) {
      const currentProvider = window.supremBrain?.provider || 'builtin';
      this.dom.apiProviderQuick.value = isActive ? 'local' : currentProvider;
    }

    if (this.dom.apiKeyQuickInput && window.supremBrain?.apiKey) {
      this.dom.apiKeyQuickInput.value = window.supremBrain.apiKey;
    }

    if (this.dom.apiModelQuick && window.supremBrain?.model) {
      this.dom.apiModelQuick.value = window.supremBrain.model;
    }
  }

  updateLocalLlmUI(isActive) {
    if (this.dom.toggleLocalLlmBtn) {
      this.dom.toggleLocalLlmBtn.classList.toggle('active', isActive);
    }
    if (this.dom.localLlmStatusText) {
      this.dom.localLlmStatusText.textContent = isActive ? 'ACTIVE' : 'OFF';
    }
    if (this.dom.localLlmToggle) {
      this.dom.localLlmToggle.checked = isActive;
      const wrapper = this.dom.localLlmToggle.closest('.local-ai-toggle-wrapper');
      if (wrapper) wrapper.classList.toggle('active', isActive);
    }
    if (this.dom.apiProviderQuick && isActive) {
      this.dom.apiProviderQuick.value = 'local';
    }
    if (this.dom.apiKeyStatusTag) {
      if (isActive) {
        this.dom.apiKeyStatusTag.textContent = 'LOCAL AI (8080)';
        this.dom.apiKeyStatusTag.classList.add('active');
      } else {
        const prov = window.supremBrain?.provider || 'builtin';
        if (prov === 'builtin') {
          this.dom.apiKeyStatusTag.textContent = 'OFFLINE';
          this.dom.apiKeyStatusTag.classList.remove('active');
        } else {
          this.dom.apiKeyStatusTag.textContent = prov.toUpperCase();
          this.dom.apiKeyStatusTag.classList.add('active');
        }
      }
    }
  }

  setLocalLlmState(newState, silent = false) {
    if (window.supremBrain) {
      window.supremBrain.setLocalLLMActive(newState);
    }
    this.updateLocalLlmUI(newState);

    if (!silent) {
      if (newState) {
        this.addTranscript('system', 'COGNITIVE CORE: ROUTED TO LOCAL LLM (PORT 8080)');
        this.speak('Local intelligence connected on port 8080, Mr. Moxx.');
      } else {
        this.addTranscript('system', 'COGNITIVE CORE: RESTORED TO DEFAULT PROVIDER');
        this.speak('Restored default cognitive provider, Mr. Moxx.');
      }
    }
  }

  initHUD() {
    window.hudVisualizer.init('arcReactorCanvas', 'radarCanvas');
    if (window.supremGesture) {
      window.supremGesture.init('cameraVideo');
    }
  }

  // British Speech Synthesis Setup
  initSpeechSynthesis() {
    if (!('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported in this browser.');
      return;
    }

    const loadVoices = () => {
      this.speechSynthesisVoices = window.speechSynthesis.getVoices();
      const britishVoice = this.speechSynthesisVoices.find(v => 
        (v.lang === 'en-GB' || v.lang.startsWith('en_GB') || v.name.toLowerCase().includes('british') || v.name.toLowerCase().includes('uk')) &&
        (v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('george') || v.name.toLowerCase().includes('daniel') || v.name.toLowerCase().includes('david') || v.name.toLowerCase().includes('oliver'))
      ) || this.speechSynthesisVoices.find(v => v.lang.startsWith('en-GB') || v.lang.startsWith('en_GB'))
        || this.speechSynthesisVoices.find(v => v.lang.startsWith('en'));

      this.selectedVoice = britishVoice || this.speechSynthesisVoices[0];
      this.populateVoiceSelect();
    };

    window.speechSynthesis.onvoiceschanged = loadVoices;
    loadVoices();
  }

  populateVoiceSelect() {
    const select = document.getElementById('voiceSelect');
    if (!select) return;
    select.innerHTML = '';
    this.speechSynthesisVoices.forEach((v, idx) => {
      const opt = document.createElement('option');
      opt.value = idx;
      opt.textContent = `${v.name} (${v.lang})`;
      if (v === this.selectedVoice) opt.selected = true;
      select.appendChild(opt);
    });
  }

  speak(text) {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    if (this.selectedVoice) {
      utterance.voice = this.selectedVoice;
    }
    utterance.pitch = 0.95;
    utterance.rate = 1.05;

    utterance.onstart = () => {
      this.setState('SPEAKING');
    };

    utterance.onend = () => {
      this.setState('STANDBY');
      if (this.isHandsFree && !this.isListening) {
        this.startListening();
      }
    };

    utterance.onerror = () => {
      this.setState('STANDBY');
    };

    window.speechSynthesis.speak(utterance);
  }

  // Web Speech Recognition for "Suprem"
  initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('Speech Recognition not supported in this browser.');
      this.addTranscript('system', 'VOICE INPUT: Web Speech API not supported. Use text command box.');
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';

    this.recognition.onstart = () => {
      this.isListening = true;
      this.dom.micBtn.classList.add('listening');
      this.setState('LISTENING');
    };

    this.recognition.onresult = (event) => {
      let interim = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }

      if (interim) {
        this.dom.commandInput.placeholder = `Listening: "${interim}"...`;
      }

      if (finalTranscript.trim()) {
        this.dom.commandInput.placeholder = 'Call "Suprem" or type a command...';
        this.handleUserCommand(finalTranscript.trim());
      }
    };

    this.recognition.onerror = (event) => {
      console.warn('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        this.addTranscript('system', 'MIC ACCESS DENIED: Click "⚡ LINK SENSORS" to allow microphone access.');
      }
      this.stopListening();
    };

    this.recognition.onend = () => {
      this.isListening = false;
      this.dom.micBtn.classList.remove('listening');
      if (this.isHandsFree) {
        setTimeout(() => {
          try {
            if (this.isHandsFree) this.recognition.start();
          } catch (e) {
            // ignore
          }
        }, 300);
      } else {
        if (this.dom.stateText.textContent === 'LISTENING') {
          this.setState('STANDBY');
        }
      }
    };
  }

  startListening() {
    if (!this.recognition) return;
    window.jarvisAudio.ensureContext();
    try {
      this.recognition.start();
    } catch (e) {
      // already active
    }
  }

  stopListening() {
    if (!this.recognition) return;
    try {
      this.recognition.stop();
    } catch (e) {
      // ignore
    }
    this.isListening = false;
    this.dom.micBtn.classList.remove('listening');
    this.setState('STANDBY');
  }

  toggleListening() {
    window.jarvisAudio.ensureContext();
    if (this.isListening) {
      this.stopListening();
    } else {
      this.startListening();
    }
  }

  setState(state) {
    if (this.dom.stateText) {
      this.dom.stateText.textContent = state;
    }
    window.hudVisualizer.setState(state);
  }

  // WebSocket for Live System Telemetry
  initWebSocket() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        const netDot = document.getElementById('networkIndicator');
        if (netDot) netDot.style.backgroundColor = '#00e5ff';
        const netText = document.getElementById('networkText');
        if (netText) netText.textContent = 'MOXX QUANTUM LINK ONLINE';
      };

      this.ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'telemetry') {
            this.handleTelemetry(msg.data);
          }
        } catch (e) {
          // ignore
        }
      };

      this.ws.onclose = () => {
        setTimeout(() => this.initWebSocket(), 3000);
      };
    } catch (e) {
      setInterval(() => this.pollSystemStats(), 2000);
    }
  }

  async pollSystemStats() {
    try {
      const res = await fetch('/api/system');
      const data = await res.json();
      this.handleTelemetry(data);
    } catch (e) {
      // ignore
    }
  }

  handleTelemetry(stats) {
    window.supremBrain.updateSystemStats(stats);

    if (this.dom.uptimeVal) this.dom.uptimeVal.textContent = stats.os.uptime;
    if (this.dom.cpuVal) this.dom.cpuVal.textContent = `${stats.cpu.usagePercent}%`;
    if (this.dom.ramVal) this.dom.ramVal.textContent = `${stats.memory.usagePercent}%`;
    if (this.dom.hostnameVal) this.dom.hostnameVal.textContent = stats.os.hostname.toUpperCase();

    const memDetail = document.getElementById('ramDetails');
    if (memDetail) memDetail.textContent = `${stats.memory.usedGB} / ${stats.memory.totalGB} GB`;

    const cpuCores = document.getElementById('cpuCores');
    if (cpuCores) cpuCores.textContent = `${stats.cpu.cores} CORES ACTIVE`;

    this.drawGauges(stats.cpu.usagePercent, stats.memory.usagePercent);
  }

  drawGauges(cpuPct, ramPct) {
    this.drawRadialGauge('cpuGaugeCanvas', cpuPct, '#00e5ff');
    this.drawRadialGauge('ramGaugeCanvas', ramPct, '#0077ff');
  }

  drawRadialGauge(canvasId, pct, color) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const r = (w / 2) - 6;

    ctx.clearRect(0, 0, w, h);

    // Track
    ctx.strokeStyle = 'rgba(0, 229, 255, 0.12)';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();

    // Fill arc
    const startAngle = -Math.PI / 2;
    const endAngle = startAngle + (Math.PI * 2 * (pct / 100));
    ctx.strokeStyle = color;
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(cx, cy, r, startAngle, endAngle);
    ctx.stroke();
  }

  async fetchWeather() {
    try {
      const res = await fetch('/api/weather');
      const data = await res.json();
      if (data && data.current) {
        const cityEl = document.getElementById('weatherCity');
        const tempEl = document.getElementById('weatherTemp');
        const subEl = document.getElementById('weatherSub');

        if (cityEl) cityEl.textContent = data.city;
        if (tempEl) tempEl.textContent = `${Math.round(data.current.temperature_2m)}°C`;
        if (subEl) subEl.textContent = `HUMIDITY ${data.current.relative_humidity_2m}% // WIND ${Math.round(data.current.wind_speed_10m)} KM/H`;
      }
    } catch (e) {
      // ignore
    }
  }

  addTranscript(sender, text) {
    const line = document.createElement('div');
    line.className = `transcript-line ${sender}`;

    const prefix = sender === 'user' ? 'MR. MOXX: ' : sender === 'suprem' || sender === 'jarvis' ? 'S.U.P.R.E.M.: ' : '// ';
    line.textContent = `${prefix}${text}`;

    this.dom.transcriptBox.appendChild(line);
    this.dom.transcriptBox.scrollTop = this.dom.transcriptBox.scrollHeight;
  }

  async handleUserCommand(text) {
    if (!text) return;
    window.jarvisAudio.ensureContext();
    window.jarvisAudio.playAcknowledge();

    this.addTranscript('user', text);
    this.setState('PROCESSING');

    const result = await window.supremBrain.processCommand(text);

    this.addTranscript('suprem', result.speech);
    this.speak(result.speech);

    // Handle Optical Movement Tracking & Gesture activation
    if (result.action === 'activate_tracking') {
      await this.startOpticalTracking();
    } else if (result.action === 'activate_gestures') {
      await this.startOpticalTracking();
      if (window.supremGesture) window.supremGesture.enable();
    } else if (result.action === 'open_web_portal') {
      await this.openWebPortal();
    } else if (result.action === 'deactivate_tracking') {
      this.stopOpticalTracking();
    } else if (result.action === 'protocol_veronica') {
      this.triggerAlert('PROTOCOL VERONICA // HULKBUSTER DEPLOYED');
      window.jarvisAudio.playAlarm();
      window.hudVisualizer.setState('COMBAT');
    } else if (result.action === 'protocol_clean_slate') {
      this.triggerAlert('CLEAN SLATE PROTOCOL // PURGE COMPLETE');
      window.jarvisAudio.playProtocolEngaged();
    } else if (result.action === 'mode_combat') {
      this.triggerAlert('COMBAT MODE // ALL SYSTEMS ARMED');
      window.jarvisAudio.playAlarm();
      window.hudVisualizer.setState('COMBAT');
    } else if (result.action === 'mode_normal') {
      this.hideAlert();
      window.hudVisualizer.setState('STANDBY');
      window.hudVisualizer.setTheme('cyan');
    } else if (result.action === 'mode_stealth') {
      window.hudVisualizer.setTheme('stealth');
    }
  }

  triggerAlert(text) {
    if (this.dom.alertBanner) {
      this.dom.alertBannerText.textContent = text;
      this.dom.alertBanner.classList.add('active');
      setTimeout(() => this.hideAlert(), 6000);
    }
  }

  hideAlert() {
    if (this.dom.alertBanner) {
      this.dom.alertBanner.classList.remove('active');
    }
  }

  // =========================================================================
  // REAL-TIME OPTICAL MOVEMENT TRACKING ENGINE
  // Uses Video Stream Pixel Difference Analysis to track user movement
  // =========================================================================
  async startOpticalTracking() {
    try {
      if (!this.cameraStream) {
        this.cameraStream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 } }
        });
        this.dom.cameraVideo.srcObject = this.cameraStream;
      }

      this.isCameraActive = true;
      this.dom.cameraVisorModal.classList.add('active');

      if (this.dom.opticalSensorState) this.dom.opticalSensorState.textContent = 'ONLINE (60 FPS)';
      if (this.dom.trackingStatusBadge) {
        this.dom.trackingStatusBadge.textContent = 'LOCKED';
        this.dom.trackingStatusBadge.style.color = '#00e5ff';
        this.dom.trackingStatusBadge.style.borderColor = '#00e5ff';
      }

      // Initialize analysis offscreen canvas
      if (!this.analysisCanvas) {
        this.analysisCanvas = document.createElement('canvas');
        this.analysisCanvas.width = 160;
        this.analysisCanvas.height = 120;
        this.analysisCtx = this.analysisCanvas.getContext('2d', { willReadFrequently: true });
      }

      // Initialize overlay canvas
      this.trackingCanvas = this.dom.trackingOverlayCanvas;
      this.trackingCtx = this.trackingCanvas.getContext('2d');
      this.resizeTrackingCanvas();

      window.jarvisAudio.playAcknowledge();
      this.addTranscript('system', 'OPTICAL SENSORS ONLINE: REAL-TIME MOVEMENT TRACKING ACTIVE');

      if (window.supremGesture) {
        window.supremGesture.enable();
      }

      this.processVideoFrame();
    } catch (err) {
      console.error('Camera access failed:', err);
      alert('Camera access denied or unavailable. Please enable permissions.');
      if (this.dom.opticalSensorState) this.dom.opticalSensorState.textContent = 'BLOCKED / NO MIC';
    }
  }

  resizeTrackingCanvas() {
    if (!this.trackingCanvas) return;
    const rect = this.trackingCanvas.getBoundingClientRect();
    this.trackingCanvas.width = rect.width || 640;
    this.trackingCanvas.height = rect.height || 480;
  }

  processVideoFrame() {
    if (!this.isCameraActive || !this.dom.cameraVideo) return;

    const video = this.dom.cameraVideo;
    if (video.readyState >= video.HAVE_CURRENT_DATA) {
      const aW = this.analysisCanvas.width;
      const aH = this.analysisCanvas.height;

      // Draw downscaled frame for high-speed analysis
      this.analysisCtx.drawImage(video, 0, 0, aW, aH);
      const currentFrame = this.analysisCtx.getImageData(0, 0, aW, aH);

      if (this.prevFrameData) {
        let totalDiff = 0;
        let sumX = 0;
        let sumY = 0;
        let motionPixels = 0;
        let minX = aW, maxX = 0, minY = aH, maxY = 0;

        const curr = currentFrame.data;
        const prev = this.prevFrameData.data;

        // Step by 4 bytes for speed (every pixel)
        for (let i = 0; i < curr.length; i += 4) {
          // Luminance calculation
          const diff = Math.abs(curr[i] - prev[i]) + Math.abs(curr[i + 1] - prev[i + 1]) + Math.abs(curr[i + 2] - prev[i + 2]);
          if (diff > 45) { // Motion threshold
            const pixelIndex = i / 4;
            const x = pixelIndex % aW;
            const y = Math.floor(pixelIndex / aW);

            sumX += x;
            sumY += y;
            motionPixels++;

            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
          }
        }

        // Evaluate motion
        const overlayW = this.trackingCanvas.width;
        const overlayH = this.trackingCanvas.height;

        this.trackingCtx.clearRect(0, 0, overlayW, overlayH);

        if (motionPixels > 80) {
          // Mirror X so it matches the mirrored camera feed
          const rawCx = overlayW - ((sumX / motionPixels) * (overlayW / aW));
          const rawCy = (sumY / motionPixels) * (overlayH / aH);

          // Exponential smoothing
          const dx = rawCx - this.smoothedX;
          const dy = rawCy - this.smoothedY;
          this.smoothedX += dx * 0.35;
          this.smoothedY += dy * 0.35;

          const speed = Math.round(Math.sqrt(dx * dx + dy * dy));

          // Determine movement vector
          let vectorText = 'CENTERED // MICRO-MOTION';
          if (dx > 12) vectorText = 'MOVING RIGHT →';
          else if (dx < -12) vectorText = 'MOVING LEFT ←';
          else if (dy > 12) vectorText = 'MOVING DOWN ↓';
          else if (dy < -12) vectorText = 'MOVING UP ↑';

          // Update HUD telemetry
          const roundX = Math.round(this.smoothedX);
          const roundY = Math.round(this.smoothedY);
          if (this.dom.movementVectorVal) this.dom.movementVectorVal.textContent = vectorText;
          if (this.dom.movementCoordsVal) this.dom.movementCoordsVal.textContent = `X: ${roundX}  Y: ${roundY}`;
          if (this.dom.movementSpeedVal) this.dom.movementSpeedVal.textContent = `${speed} px/s`;
          if (this.dom.visorVectorText) this.dom.visorVectorText.textContent = `VECTOR: ${vectorText}`;
          if (this.dom.visorCoordsText) this.dom.visorCoordsText.textContent = `COORDS: X: ${roundX} Y: ${roundY}`;

          // Draw holographic tracking box on visor canvas
          this.drawHolographicTrackingBox(this.smoothedX, this.smoothedY, speed, vectorText);
        } else {
          // Stationary
          if (this.dom.movementVectorVal) this.dom.movementVectorVal.textContent = 'STATIONARY // TARGET LOCKED';
          if (this.dom.movementSpeedVal) this.dom.movementSpeedVal.textContent = '0 px/s';
          if (this.dom.visorVectorText) this.dom.visorVectorText.textContent = 'VECTOR: STATIONARY';

          // Keep drawing reticle at last smoothed coordinates
          this.drawHolographicTrackingBox(this.smoothedX, this.smoothedY, 0, 'LOCKED');
        }

        // Feed optical motion fallback to Gesture Controller
        // (Hand Landmarker runs its own loop; this only drives the cursor when no hand is detected)
        if (window.supremGesture) {
          const isMoving = motionPixels > 80;
          window.supremGesture.updateFromOpticalMotion(this.smoothedX, this.smoothedY, isMoving);
        }
      }

      this.prevFrameData = currentFrame;
    }

    this.trackingAnimId = requestAnimationFrame(() => this.processVideoFrame());
  }

  drawHolographicTrackingBox(cx, cy, speed, vector) {
    if (!this.trackingCtx) return;
    const ctx = this.trackingCtx;
    const boxSize = 130;
    const half = boxSize / 2;

    const x = Math.max(half, Math.min(this.trackingCanvas.width - half, cx));
    const y = Math.max(half, Math.min(this.trackingCanvas.height - half, cy));

    ctx.save();

    // Glowing Sci-Fi Corner Brackets
    ctx.strokeStyle = '#00e5ff';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = 'rgba(0, 229, 255, 0.8)';
    ctx.shadowBlur = 12;

    const cornerLen = 22;

    // Top-Left
    ctx.beginPath();
    ctx.moveTo(x - half, y - half + cornerLen);
    ctx.lineTo(x - half, y - half);
    ctx.lineTo(x - half + cornerLen, y - half);
    ctx.stroke();

    // Top-Right
    ctx.beginPath();
    ctx.moveTo(x + half - cornerLen, y - half);
    ctx.lineTo(x + half, y - half);
    ctx.lineTo(x + half, y - half + cornerLen);
    ctx.stroke();

    // Bottom-Left
    ctx.beginPath();
    ctx.moveTo(x - half, y + half - cornerLen);
    ctx.lineTo(x - half, y + half);
    ctx.lineTo(x - half + cornerLen, y + half);
    ctx.stroke();

    // Bottom-Right
    ctx.beginPath();
    ctx.moveTo(x + half - cornerLen, y + half);
    ctx.lineTo(x + half, y + half);
    ctx.lineTo(x + half, y + half - cornerLen);
    ctx.stroke();

    // Center Crosshair Reticle
    ctx.beginPath();
    ctx.arc(x, y, 6, 0, Math.PI * 2);
    ctx.fillStyle = speed > 10 ? '#ffaa00' : '#00e5ff';
    ctx.fill();

    // Telemetry Tags
    ctx.font = '600 11px "Nexa Serif Variable Medium", "Nexa Serif", serif';
    ctx.fillStyle = '#00e5ff';
    ctx.fillText(`[TARGET: MR. MOXX]`, x - half, y - half - 8);

    ctx.font = '10px "Nexa Serif Variable Medium", "Nexa Serif", serif';
    ctx.fillStyle = '#f5c518';
    ctx.fillText(`COORDS: X:${Math.round(x)} Y:${Math.round(y)}`, x - half, y + half + 16);
    ctx.fillText(`SPEED: ${speed} px/s // ${vector}`, x - half, y + half + 28);

    ctx.restore();
  }

  stopOpticalTracking() {
    if (this.trackingAnimId) {
      cancelAnimationFrame(this.trackingAnimId);
      this.trackingAnimId = null;
    }
    if (this.cameraStream) {
      this.cameraStream.getTracks().forEach(track => track.stop());
      this.cameraStream = null;
    }
    this.dom.cameraVisorModal.classList.remove('active');
    this.isCameraActive = false;
    this.prevFrameData = null;

    if (this.dom.opticalSensorState) this.dom.opticalSensorState.textContent = 'STANDBY';
    if (this.dom.trackingStatusBadge) {
      this.dom.trackingStatusBadge.textContent = 'STANDBY';
      this.dom.trackingStatusBadge.style.color = 'var(--text-secondary)';
    }
    this.addTranscript('system', 'OPTICAL TRACKING DEACTIVATED');
  }

  // One-click Link Sensors Handler (Grants both Mic & Camera access)
  async initializeSensors() {
    window.jarvisAudio.ensureContext();
    window.jarvisAudio.playBootSound();

    this.addTranscript('system', 'INITIALIZING SENSORY ARRAY (MIC & OPTICAL TRACKING)...');

    // 1. Start Mic
    this.startListening();

    // 2. Start Camera Tracking
    await this.startOpticalTracking();

    this.speak('Sensory matrix initialized, Mr. Moxx. Optical movement tracking and audio recognition are online and locked on you.');
  }

  // Holographic Web Access Portal Methods
  async openWebPortal() {
    window.jarvisAudio.ensureContext();
    window.jarvisAudio.playAcknowledge();
    if (!this.isCameraActive) {
      await this.startOpticalTracking();
    }
    if (window.supremGesture) {
      window.supremGesture.enable();
    }
    if (this.dom.webPortalModal) {
      this.dom.webPortalModal.classList.add('active');
    }
    this.addTranscript('system', 'MOXX QUANTUM WEB ACCESS ONLINE: AIR-TOUCH ACTIVE');
  }

  closeWebPortal() {
    if (this.dom.webPortalModal) {
      this.dom.webPortalModal.classList.remove('active');
    }
  }

  navigateToWeb(urlOrQuery) {
    if (!urlOrQuery) return;
    window.jarvisAudio.playClick();
    let target = urlOrQuery.trim();
    if (!target.startsWith('http://') && !target.startsWith('https://')) {
      if (target.includes('.') && !target.includes(' ')) {
        target = 'https://' + target;
      } else {
        target = `https://www.google.com/search?igu=1&q=${encodeURIComponent(target)}`;
      }
    }
    if (this.dom.webViewerFrame) {
      this.dom.webViewerFrame.src = target;
    }
    if (this.dom.webUrlInput) {
      this.dom.webUrlInput.value = target;
    }
    this.addTranscript('system', `WEB NAVIGATION: ${target}`);
  }

  bindEvents() {
    // Arc Reactor click
    const arcCanvas = document.getElementById('arcReactorCanvas');
    if (arcCanvas) {
      arcCanvas.addEventListener('click', () => {
        window.jarvisAudio.ensureContext();
        window.jarvisAudio.playRepulsor();
        this.handleUserCommand('system status');
      });
    }

    // Initialize Sensors Button (One-click permission grant)
    if (this.dom.activateSensorsBtn) {
      this.dom.activateSensorsBtn.addEventListener('click', () => this.initializeSensors());
    }

    // Mic Button
    this.dom.micBtn.addEventListener('click', () => this.toggleListening());

    // Send Button & Enter Key
    this.dom.sendBtn.addEventListener('click', () => {
      const val = this.dom.commandInput.value.trim();
      if (val) {
        this.handleUserCommand(val);
        this.dom.commandInput.value = '';
      }
    });

    this.dom.commandInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const val = this.dom.commandInput.value.trim();
        if (val) {
          this.handleUserCommand(val);
          this.dom.commandInput.value = '';
        }
      }
    });

    // Hands-Free Hotword Checkbox
    this.dom.handsFreeCheckbox.addEventListener('change', (e) => {
      this.isHandsFree = e.target.checked;
      if (this.isHandsFree && !this.isListening) {
        this.startListening();
      }
    });

    // Moxx Protocol Buttons
    document.querySelectorAll('.protocol-card').forEach(card => {
      card.addEventListener('click', () => {
        window.jarvisAudio.playClick();
        const cmd = card.dataset.command;
        if (cmd) this.handleUserCommand(cmd);
      });
    });

    // Windows App Launch Buttons
    document.querySelectorAll('.app-launcher-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        window.jarvisAudio.playClick();
        const app = btn.dataset.app;
        if (app) this.handleUserCommand(`open ${app}`);
      });
    });

    // Optical Tracker Box Click
    const trackerBox = document.getElementById('opticalTrackerBox');
    if (trackerBox) {
      trackerBox.addEventListener('click', () => {
        window.jarvisAudio.playClick();
        if (this.isCameraActive) {
          this.stopOpticalTracking();
        } else {
          this.startOpticalTracking();
        }
      });
    }

    // Local LLM Header Button
    if (this.dom.toggleLocalLlmBtn) {
      this.dom.toggleLocalLlmBtn.addEventListener('click', () => {
        window.jarvisAudio.playClick();
        const nextState = !window.supremBrain.isLocalLLMActive;
        this.setLocalLlmState(nextState);
      });
    }

    // Local LLM Inline Checkbox Toggle
    if (this.dom.localLlmToggle) {
      this.dom.localLlmToggle.addEventListener('change', (e) => {
        window.jarvisAudio.playClick();
        this.setLocalLlmState(e.target.checked);
      });
    }

    // Quick API Vault on Left Panel
    if (this.dom.saveApiKeyBtn) {
      this.dom.saveApiKeyBtn.addEventListener('click', () => {
        window.jarvisAudio.playClick();
        const provider = this.dom.apiProviderQuick?.value || 'builtin';
        const apiKey = this.dom.apiKeyQuickInput?.value.trim() || '';
        const model = this.dom.apiModelQuick?.value.trim() || '';

        if (provider === 'local') {
          this.setLocalLlmState(true);
        } else {
          this.setLocalLlmState(false, true);
          window.supremBrain.setLLMConfig(provider, apiKey, model);
          this.addTranscript('system', `API VAULT ACTIVATED: ${provider.toUpperCase()}`);
          this.updateLocalLlmUI(false);
        }

        this.dom.saveApiKeyBtn.classList.add('saved');
        setTimeout(() => this.dom.saveApiKeyBtn.classList.remove('saved'), 2000);
      });
    }

    // API Key visibility toggle
    if (this.dom.apiKeyVisibilityBtn && this.dom.apiKeyQuickInput) {
      this.dom.apiKeyVisibilityBtn.addEventListener('click', () => {
        const isPass = this.dom.apiKeyQuickInput.type === 'password';
        this.dom.apiKeyQuickInput.type = isPass ? 'text' : 'password';
      });
    }

    // Provider select change hint
    if (this.dom.apiProviderQuick) {
      this.dom.apiProviderQuick.addEventListener('change', (e) => {
        const prov = e.target.value;
        if (prov === 'anthropic' && this.dom.apiModelQuick && !this.dom.apiModelQuick.value) {
          this.dom.apiModelQuick.placeholder = 'claude-3-5-sonnet-20241022';
        } else if (prov === 'openai' && this.dom.apiModelQuick && !this.dom.apiModelQuick.value) {
          this.dom.apiModelQuick.placeholder = 'gpt-4o';
        } else if (prov === 'groq' && this.dom.apiModelQuick && !this.dom.apiModelQuick.value) {
          this.dom.apiModelQuick.placeholder = 'llama-3.3-70b-versatile';
        }
      });
    }

    // Settings Modal
    this.dom.openSettingsBtn.addEventListener('click', () => {
      window.jarvisAudio.playClick();
      const provSelect = document.getElementById('llmProviderSelect');
      if (provSelect) {
        provSelect.value = window.supremBrain.isLocalLLMActive ? 'local' : (window.supremBrain.provider || 'builtin');
      }
      const keyInput = document.getElementById('apiKeyInput');
      if (keyInput) keyInput.value = window.supremBrain.apiKey || '';
      const modelInput = document.getElementById('modelNameInput');
      if (modelInput) modelInput.value = window.supremBrain.model || '';
      const localUrlInput = document.getElementById('localLlmUrlInput');
      if (localUrlInput) localUrlInput.value = window.supremBrain.localLLMUrl || 'http://127.0.0.1:8080/v1/messages';
      this.dom.settingsModal.classList.add('active');
    });

    const closeModal = () => {
      window.jarvisAudio.playClick();
      this.dom.settingsModal.classList.remove('active');
    };

    this.dom.closeSettingsBtn.addEventListener('click', closeModal);
    this.dom.settingsModal.addEventListener('click', (e) => {
      if (e.target === this.dom.settingsModal) closeModal();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (this.dom.settingsModal.classList.contains('active')) closeModal();
        if (this.dom.webPortalModal && this.dom.webPortalModal.classList.contains('active')) this.closeWebPortal();
        if (this.isCameraActive) this.stopOpticalTracking();
      }
    });

    // Air-Touch Gesture & Web Portal Controls
    if (this.dom.toggleGestureBtn) {
      this.dom.toggleGestureBtn.addEventListener('click', () => {
        window.jarvisAudio.playClick();
        if (window.supremGesture) window.supremGesture.toggle();
      });
    }

    if (this.dom.openWebPortalBtn) {
      this.dom.openWebPortalBtn.addEventListener('click', () => this.openWebPortal());
    }

    if (this.dom.closeWebPortalBtn) {
      this.dom.closeWebPortalBtn.addEventListener('click', () => this.closeWebPortal());
    }

    if (this.dom.webSearchBtn) {
      this.dom.webSearchBtn.addEventListener('click', () => {
        this.navigateToWeb(this.dom.webUrlInput.value);
      });
    }

    if (this.dom.webUrlInput) {
      this.dom.webUrlInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          this.navigateToWeb(this.dom.webUrlInput.value);
        }
      });
    }

    if (this.dom.webBackBtn) {
      this.dom.webBackBtn.addEventListener('click', () => {
        try { if (this.dom.webViewerFrame.contentWindow) this.dom.webViewerFrame.contentWindow.history.back(); } catch (e) {}
      });
    }

    if (this.dom.webForwardBtn) {
      this.dom.webForwardBtn.addEventListener('click', () => {
        try { if (this.dom.webViewerFrame.contentWindow) this.dom.webViewerFrame.contentWindow.history.forward(); } catch (e) {}
      });
    }

    document.querySelectorAll('.web-quick-tile').forEach(tile => {
      tile.addEventListener('click', () => {
        this.navigateToWeb(tile.dataset.url);
      });
    });

    this.dom.saveSettingsBtn.addEventListener('click', () => {
      window.jarvisAudio.playClick();
      const provider = document.getElementById('llmProviderSelect').value;
      const apiKey = document.getElementById('apiKeyInput').value.trim();
      const model = document.getElementById('modelNameInput').value.trim();
      const ollamaUrl = document.getElementById('ollamaUrlInput').value.trim();
      const localUrl = document.getElementById('localLlmUrlInput')?.value.trim();

      window.supremBrain.setLLMConfig(provider, apiKey, model, ollamaUrl, localUrl, model);

      if (provider === 'local') {
        this.setLocalLlmState(true);
      } else {
        this.setLocalLlmState(false, true);
        this.updateLocalLlmUI(false);
      }

      const voiceSelect = document.getElementById('voiceSelect');
      if (voiceSelect && voiceSelect.value !== '') {
        this.selectedVoice = this.speechSynthesisVoices[parseInt(voiceSelect.value, 10)];
      }

      this.dom.settingsModal.classList.remove('active');
      this.addTranscript('system', `S.U.P.R.E.M. COGNITIVE CORE UPDATED: Provider set to ${provider.toUpperCase()}`);
    });

    // Voice Selector Change
    const voiceSelect = document.getElementById('voiceSelect');
    if (voiceSelect) {
      voiceSelect.addEventListener('change', (e) => {
        this.selectedVoice = this.speechSynthesisVoices[parseInt(e.target.value, 10)];
      });
    }

    // Camera Visor Buttons
    this.dom.toggleCameraBtn.addEventListener('click', () => {
      if (this.isCameraActive) this.stopOpticalTracking();
      else this.startOpticalTracking();
    });
    this.dom.closeCameraBtn.addEventListener('click', () => this.stopOpticalTracking());

    // Mute Audio Toggle
    this.dom.muteBtn.addEventListener('click', () => {
      const isMuted = !window.jarvisAudio.isMuted;
      window.jarvisAudio.setMuted(isMuted);
      this.dom.muteBtn.textContent = isMuted ? '🔇 AUDIO: MUTED' : '🔊 AUDIO: ACTIVE';
    });

    // First user gesture triggers audio context unlock
    document.addEventListener('click', () => {
      window.jarvisAudio.ensureContext();
      if (this.isHandsFree && !this.isListening) {
        this.startListening();
      }
    }, { once: true });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.supremApp = new SupremApp();
  window.supremApp.init();
});
