/**
 * Plug-and-play browser hand tracking for S.U.P.R.E.M. HUD.
 * Uses Google's MediaPipe Hand Landmarker via CDN; no npm install required.
 * Serve the site on localhost or HTTPS so the browser can access the webcam.
 */
import { FilesetResolver, HandLandmarker } from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/vision_bundle.mjs";

const WASM_URL = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm";
const MODEL_URL = "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task";

export class JarvisHandTracker {
  constructor({ videoElement = null, onResults = () => {}, numHands = 2 } = {}) {
    this.video = videoElement || document.createElement("video");
    this.ownsVideo = !videoElement;
    this.onResults = onResults;
    this.numHands = numHands;
    this.landmarker = null;
    this.stream = null;
    this.running = false;
    this.lastVideoTime = -1;
    this.rafId = 0;

    if (this.ownsVideo) {
      Object.assign(this.video.style, {
        position: "fixed", left: "-10px", top: "-10px",
        width: "1px", height: "1px", opacity: "0", pointerEvents: "none"
      });
      document.body.appendChild(this.video);
    }
    this.video.autoplay = true;
    this.video.playsInline = true;
    this.video.muted = true;
  }

  async start() {
    if (this.running) return;
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error("Webcam access is unavailable. Open this page on localhost or HTTPS.");
    }

    console.log('[S.U.P.R.E.M.] Initializing MediaPipe Tasks-Vision Hand Landmarker...');

    const vision = await FilesetResolver.forVisionTasks(WASM_URL);
    this.landmarker = await HandLandmarker.createFromOptions(vision, {
      baseOptions: { modelAssetPath: MODEL_URL },
      runningMode: "VIDEO",
      numHands: this.numHands,
      minHandDetectionConfidence: 0.5,
      minHandPresenceConfidence: 0.5,
      minTrackingConfidence: 0.5
    });

    console.log('[S.U.P.R.E.M.] Hand Landmarker model loaded (float16).');

    // Re-use existing srcObject from the optical visor if available,
    // otherwise acquire a new webcam stream.
    if (!this.video.srcObject) {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } }
      });
      this.video.srcObject = this.stream;
      console.log('[S.U.P.R.E.M.] New webcam stream acquired for hand tracking.');
    } else {
      this.stream = this.video.srcObject;
      console.log('[S.U.P.R.E.M.] Re-using existing webcam stream for hand tracking.');
    }

    await this.video.play();
    this.running = true;
    this._loop();

    console.log('[S.U.P.R.E.M.] Hand tracking loop active @ 60 FPS.');
  }

  _loop = () => {
    if (!this.running) return;
    if (this.video.readyState >= 2 && this.video.currentTime !== this.lastVideoTime) {
      const result = this.landmarker.detectForVideo(this.video, performance.now());
      this.onResults({
        landmarks: result.landmarks || [],
        worldLandmarks: result.worldLandmarks || [],
        handedness: result.handedness || [],
        video: this.video
      });
      this.lastVideoTime = this.video.currentTime;
    }
    this.rafId = requestAnimationFrame(this._loop);
  };

  async stop() {
    this.running = false;
    cancelAnimationFrame(this.rafId);
    // Only stop camera tracks if WE created the stream (ownsVideo).
    // If the optical visor owns the stream, leave it running.
    if (this.ownsVideo && this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
    }
    this.stream = null;
    this.landmarker?.close();
    this.landmarker = null;
    console.log('[S.U.P.R.E.M.] Hand tracking stopped.');
  }
}
