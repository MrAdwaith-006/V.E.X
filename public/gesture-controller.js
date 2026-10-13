/**
 * S.U.P.R.E.M. Holographic Hand Gesture & Air-Touch Controller
 * Powered by MediaPipe Tasks-Vision Hand Landmarker (JarvisHandTracker).
 * Replicates Tony Stark / Iron Man air gesture control:
 * 1. Virtual Repulsor Cursor mapped to index fingertip with EMA smoothing.
 * 2. Pinch (Thumb + Index) / Dwell Air-Touch click.
 * 3. Air swipe scroll (Up / Down).
 * 4. Modular: imports JarvisHandTracker for plug-and-play hand detection.
 */
import { JarvisHandTracker } from './hand-tracker.js';

class SupremGestureController {
  constructor() {
    this.isActive = false;
    this.tracker = null;
    this.videoElement = null;

    // Virtual cursor position & smoothing
    this.cursorX = window.innerWidth / 2;
    this.cursorY = window.innerHeight / 2;
    this.targetX = window.innerWidth / 2;
    this.targetY = window.innerHeight / 2;
    this.smoothFactor = 0.32; // Responsive smoothing

    // Gesture states
    this.isPinching = false;
    this.lastPinchTime = 0;
    this.pinchCooldownMs = 380;
    this.dwellTimer = null;
    this.lastDwellElem = null;

    // Swipe / Scroll
    this.prevHandY = null;
    this.lastScrollTime = 0;

    // DOM Elements
    this.cursorElem = null;
    this.cursorCoords = null;
    this.cursorState = null;
    this.dwellRing = null;

    this.handDetected = false;
    this.animId = null;
  }

  init(videoElementId) {
    this.videoElement = document.getElementById(videoElementId);
    this.createHolographicCursor();

    // Create the JarvisHandTracker bound to the existing camera video element
    this.tracker = new JarvisHandTracker({
      videoElement: this.videoElement,
      onResults: (results) => this.onHandResults(results),
      numHands: 1
    });

    this.startCursorLoop();
    console.log('[S.U.P.R.E.M.] Gesture Controller initialized with Tasks-Vision Hand Landmarker.');
  }

  createHolographicCursor() {
    if (document.getElementById('holographicCursor')) {
      this.cursorElem = document.getElementById('holographicCursor');
      this.cursorCoords = document.getElementById('cursorCoords');
      this.cursorState = document.getElementById('cursorState');
      this.dwellRing = document.getElementById('cursorDwellRing');
      return;
    }

    const cursor = document.createElement('div');
    cursor.id = 'holographicCursor';
    cursor.className = 'holographic-cursor';
    cursor.innerHTML = `
      <div class="cursor-reticle">
        <svg class="cursor-dwell-svg" viewBox="0 0 44 44">
          <circle cx="22" cy="22" r="18" class="dwell-track"></circle>
          <circle id="cursorDwellRing" cx="22" cy="22" r="18" class="dwell-fill"></circle>
        </svg>
        <div class="cursor-core"></div>
        <div class="cursor-bracket tl"></div>
        <div class="cursor-bracket tr"></div>
        <div class="cursor-bracket bl"></div>
        <div class="cursor-bracket br"></div>
      </div>
      <div class="cursor-hud-tag">
        <span id="cursorState" class="tag-status">AIR-TOUCH</span>
        <span id="cursorCoords" class="tag-coords">X: 0 Y: 0</span>
      </div>
    `;

    document.body.appendChild(cursor);

    this.cursorElem = cursor;
    this.cursorCoords = document.getElementById('cursorCoords');
    this.cursorState = document.getElementById('cursorState');
    this.dwellRing = document.getElementById('cursorDwellRing');
  }

  async enable() {
    this.isActive = true;
    if (this.cursorElem) this.cursorElem.classList.add('active');
    const badge = document.getElementById('gestureStatusBadge');
    if (badge) {
      badge.textContent = 'ONLINE (AIR-TOUCH)';
      badge.style.color = '#00e5ff';
    }
    const btn = document.getElementById('toggleGestureBtn');
    if (btn) btn.classList.add('active');

    // Start the Tasks-Vision hand tracking loop if not already running
    if (this.tracker && !this.tracker.running) {
      try {
        await this.tracker.start();
        console.log('[S.U.P.R.E.M.] Hand tracking loop started via enable().');
      } catch (err) {
        console.warn('[S.U.P.R.E.M.] Hand tracker start failed:', err);
      }
    }
  }

  async disable() {
    this.isActive = false;
    if (this.cursorElem) this.cursorElem.classList.remove('active');
    const badge = document.getElementById('gestureStatusBadge');
    if (badge) {
      badge.textContent = 'STANDBY';
      badge.style.color = 'var(--text-secondary)';
    }
    const btn = document.getElementById('toggleGestureBtn');
    if (btn) btn.classList.remove('active');

    // Stop the Tasks-Vision hand tracking loop
    if (this.tracker && this.tracker.running) {
      await this.tracker.stop();
      console.log('[S.U.P.R.E.M.] Hand tracking loop stopped via disable().');
    }
  }

  async toggle() {
    if (this.isActive) await this.disable();
    else await this.enable();
  }

  // MediaPipe Tasks-Vision 21 Hand Landmarks Processor
  // Called by JarvisHandTracker's onResults callback
  onHandResults(results) {
    if (!this.isActive) return;

    if (results.landmarks && results.landmarks.length > 0) {
      const landmarks = results.landmarks[0];
      this.handDetected = true;

      // Landmark 8: Index Fingertip
      // Landmark 4: Thumb Tip
      // Landmark 0: Wrist
      // Landmark 12: Middle Fingertip

      const indexTip = landmarks[8];
      const thumbTip = landmarks[4];
      const middleTip = landmarks[12];

      // Mirror X coordinate because webcam feed is horizontally flipped
      const screenW = window.innerWidth;
      const screenH = window.innerHeight;

      // Map [0.1, 0.9] of camera frame to [0, 1] of screen for comfortable reach
      const normX = (1 - indexTip.x - 0.15) / 0.7;
      const normY = (indexTip.y - 0.15) / 0.7;

      this.targetX = Math.max(10, Math.min(screenW - 10, normX * screenW));
      this.targetY = Math.max(10, Math.min(screenH - 10, normY * screenH));

      // =====================================================================
      // 3D ARC REACTOR TELEMETRY COMPUTATION (Tony Stark Holographic Control)
      // =====================================================================
      const wrist = landmarks[0];
      const middleMcp = landmarks[9];
      const ringTip = landmarks[16];
      const pinkyTip = landmarks[20];

      // Hand 2D/3D Center (mirrored X for camera feed)
      const handCenterX = 1 - (wrist.x + middleMcp.x) / 2;
      const handCenterY = (wrist.y + middleMcp.y) / 2;
      const reactorNormX = (handCenterX - 0.5) * 2.2;
      const reactorNormY = (handCenterY - 0.5) * 2.2;

      // Hand Roll (tilt angle in radians)
      const handRoll = Math.atan2((middleMcp.y - wrist.y), (1 - middleMcp.x) - (1 - wrist.x)) - Math.PI / 2;

      // Hand Depth / Span (distance between wrist and middle MCP)
      const handDepthSpan = Math.hypot((1 - middleMcp.x) - (1 - wrist.x), middleMcp.y - wrist.y);

      // Check finger extensions (distance from wrist)
      const dIndex = Math.hypot((1 - indexTip.x) - (1 - wrist.x), indexTip.y - wrist.y);
      const dMiddle = Math.hypot((1 - middleTip.x) - (1 - wrist.x), middleTip.y - wrist.y);
      const dRing = Math.hypot((1 - ringTip.x) - (1 - wrist.x), ringTip.y - wrist.y);
      const dPinky = Math.hypot((1 - pinkyTip.x) - (1 - wrist.x), pinkyTip.y - wrist.y);
      const dThumb = Math.hypot((1 - thumbTip.x) - (1 - wrist.x), thumbTip.y - wrist.y);

      // Open Hand / Palm: all 4 main fingers extended outward
      const isOpenHand = dIndex > 0.22 && dMiddle > 0.24 && dRing > 0.21 && dPinky > 0.18;

      // Closed Fist: all fingers curled tightly toward palm
      const isFist = dIndex < 0.15 && dMiddle < 0.15 && dRing < 0.14 && dPinky < 0.13;

      // Forward to 3D Arc Reactor
      if (window.arcReactor3D) {
        window.arcReactor3D.updateHandTelemetry({
          normX: reactorNormX,
          normY: reactorNormY,
          roll: handRoll,
          handSpan: handDepthSpan,
          isOpen: isOpenHand,
          isFist: isFist,
          isPinch: pinchDist < 0.065,
          isAirTap: pinchDist < 0.05
        });
      }

      // Calculate Pinch Distance between Thumb (4) and Index (8)
      const dx = thumbTip.x - indexTip.x;
      const dy = thumbTip.y - indexTip.y;
      const dz = (thumbTip.z || 0) - (indexTip.z || 0);
      const pinchDist = Math.sqrt(dx * dx + dy * dy + dz * dz);

      const now = Date.now();

      // PINCH / AIR-TOUCH CLICK GESTURE
      if (pinchDist < 0.065) {
        if (!this.isPinching && now - this.lastPinchTime > this.pinchCooldownMs) {
          this.triggerAirClick('PINCH CLICK');
          this.isPinching = true;
          this.lastPinchTime = now;
          if (window.arcReactor3D) window.arcReactor3D.fireShockwave();
        }
      } else {
        this.isPinching = false;
      }

      // AIR SWIPE SCROLL GESTURE (Two fingers extended: index 8 + middle 12 moving vertically)
      const handSwipeY = (indexTip.y + middleTip.y) / 2;
      if (this.prevHandY !== null && !this.isPinching) {
        const deltaY = handSwipeY - this.prevHandY;
        if (Math.abs(deltaY) > 0.04 && now - this.lastScrollTime > 60) {
          const scrollAmount = deltaY * screenH * 1.5;
          window.scrollBy({ top: scrollAmount, behavior: 'smooth' });

          const webFrame = document.getElementById('webViewerFrame');
          if (webFrame && webFrame.contentWindow) {
            try { webFrame.contentWindow.scrollBy(0, scrollAmount); } catch (e) {}
          }

          this.cursorState.textContent = deltaY > 0 ? 'SCROLL DOWN ↓' : 'SCROLL UP ↑';
          this.lastScrollTime = now;
        }
      }
      this.prevHandY = handSwipeY;

      // Dwell click for steady hand on target
      const speed = Math.abs(this.targetX - this.cursorX) + Math.abs(this.targetY - this.cursorY);
      if (speed < 8) {
        this.handleDwellClick();
      } else {
        this.cancelDwell();
      }

    } else {
      this.handDetected = false;
      this.prevHandY = null;
      this.cancelDwell();
      if (window.arcReactor3D) {
        window.arcReactor3D.releaseHand();
      }
    }
  }

  // Optical Fallback Cursor Feeder (from optical motion tracker)
  updateFromOpticalMotion(rawX, rawY, isMoving) {
    if (!this.isActive || this.handDetected) return;

    this.targetX = rawX;
    this.targetY = rawY;

    // Dwell click trigger when hand stays steady on an element for 700ms
    if (!isMoving) {
      this.handleDwellClick();
    } else {
      this.cancelDwell();
    }
  }

  handleDwellClick() {
    const elem = document.elementFromPoint(this.cursorX, this.cursorY);
    if (!elem || elem === this.cursorElem || this.cursorElem.contains(elem)) return;

    if (elem === this.lastDwellElem) {
      if (!this.dwellTimer) {
        if (this.dwellRing) this.dwellRing.classList.add('filling');
        this.dwellTimer = setTimeout(() => {
          this.triggerAirClick('DWELL TAP');
          this.cancelDwell();
        }, 750);
      }
    } else {
      this.cancelDwell();
      this.lastDwellElem = elem;
    }
  }

  cancelDwell() {
    if (this.dwellTimer) {
      clearTimeout(this.dwellTimer);
      this.dwellTimer = null;
    }
    if (this.dwellRing) this.dwellRing.classList.remove('filling');
    this.lastDwellElem = null;
  }

  // Air Click Trigger
  triggerAirClick(reason = 'AIR TAP') {
    if (!this.isActive) return;

    window.jarvisAudio.ensureContext();
    window.jarvisAudio.playClick();

    // Visual ripple effect
    if (this.cursorElem) {
      this.cursorElem.classList.add('clicking');
      setTimeout(() => this.cursorElem.classList.remove('clicking'), 250);
    }

    if (this.cursorState) {
      this.cursorState.textContent = reason;
      this.cursorState.style.color = '#f5c518';
      setTimeout(() => {
        if (this.cursorState) {
          this.cursorState.textContent = 'AIR-TOUCH';
          this.cursorState.style.color = '#00e5ff';
        }
      }, 600);
    }

    // Spawn ripple wave on screen
    this.spawnRipple(this.cursorX, this.cursorY);

    // Target the element under the virtual cursor
    // Temporarily hide cursor pointer-events to hit underlying DOM
    this.cursorElem.style.pointerEvents = 'none';
    const target = document.elementFromPoint(this.cursorX, this.cursorY);

    if (target) {
      // 1. Dispatch hover & click events
      target.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true, clientX: this.cursorX, clientY: this.cursorY }));
      target.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true, clientX: this.cursorX, clientY: this.cursorY }));
      target.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, clientX: this.cursorX, clientY: this.cursorY }));

      // 2. Direct click / focus
      if (typeof target.click === 'function') {
        target.click();
      }

      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        target.focus();
      }

      // Flash target with holographic cyan outline
      target.classList.add('hud-gesture-tapped');
      setTimeout(() => target.classList.remove('hud-gesture-tapped'), 400);
    }
  }

  spawnRipple(x, y) {
    const ripple = document.createElement('div');
    ripple.className = 'gesture-ripple-burst';
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    document.body.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  }

  // 60FPS Cursor Interpolation Loop (Smooth buttery motion)
  startCursorLoop() {
    const loop = () => {
      if (this.isActive && this.cursorElem) {
        // Linear interpolation (Lerp)
        this.cursorX += (this.targetX - this.cursorX) * this.smoothFactor;
        this.cursorY += (this.targetY - this.cursorY) * this.smoothFactor;

        this.cursorElem.style.transform = `translate3d(${this.cursorX}px, ${this.cursorY}px, 0)`;

        if (this.cursorCoords) {
          this.cursorCoords.textContent = `X: ${Math.round(this.cursorX)} Y: ${Math.round(this.cursorY)}`;
        }

        // Check hovered element
        this.cursorElem.style.pointerEvents = 'none';
        const hovered = document.elementFromPoint(this.cursorX, this.cursorY);
        if (hovered && (hovered.tagName === 'BUTTON' || hovered.tagName === 'A' || hovered.onclick || hovered.classList.contains('protocol-card') || hovered.classList.contains('app-launcher-btn'))) {
          this.cursorElem.classList.add('hovering-target');
        } else {
          this.cursorElem.classList.remove('hovering-target');
        }
      }

      this.animId = requestAnimationFrame(loop);
    };

    this.animId = requestAnimationFrame(loop);
  }
}

window.supremGesture = new SupremGestureController();
