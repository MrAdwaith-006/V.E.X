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

    // Single Smooth Natural Voice Configuration
    this.voiceConfig = {
      pitch: 0.98,
      rate: 0.98,
      volume: 1.0,
      comlinkEffect: false,
      roboticTone: false,
      voiceIndex: -1
    };
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

    // Initialize Language
    const initialLang = window.supremBrain?.currentLanguage || 'en';
    this.onLanguageChanged(initialLang, false);
    this.initMicrophoneAcoustics();

    // Boot message
    this.addTranscript('system', 'INITIALIZING MOXX INDUSTRIES V.E.X. [MVEX OS]...');
    setTimeout(() => {
      this.addTranscript('suprem', 'All systems online, Mr. Moxx. V.E.X. is ready for your command.');
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

    // Local LLM Header Controls
    this.dom.toggleLocalLlmBtn = document.getElementById('toggleLocalLlmBtn');
    this.dom.localLlmToggle = document.getElementById('localLlmToggle');
    this.dom.localLlmStatusText = document.getElementById('localLlmStatusText');
    this.dom.localLlmUrlInput = document.getElementById('localLlmUrlInput');

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

    // 3D Arc Reactor Stage Controls
    this.dom.toggleHandGestureBtn = document.getElementById('toggleHandGestureBtn');
    this.dom.explodeLayersBtn = document.getElementById('explodeLayersBtn');
    this.dom.resetReactorViewBtn = document.getElementById('resetReactorViewBtn');
    this.dom.arcGestureBadge = document.getElementById('arcGestureBadge');

    // Voice Testing & Multilingual Elements
    this.dom.quickTestVoiceBtn = document.getElementById('quickTestVoiceBtn');
    this.dom.modalTestVoiceBtn = document.getElementById('modalTestVoiceBtn');
    this.dom.hudLanguageSelect = document.getElementById('hudLanguageSelect');
    this.dom.settingsLanguageSelect = document.getElementById('settingsLanguageSelect');
    this.dom.arcWaveBadge = document.getElementById('arcWaveBadge');
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
    if (window.arcReactor3D) {
      window.arcReactor3D.init('arcReactorTrigger', 'arcReactorCanvas');
    }
    window.hudVisualizer.init('arcReactorCanvas', 'netSpeedCanvas');
    if (window.supremGesture) {
      window.supremGesture.init('cameraVideo');
    }
  }

  // Load Saved Voice Configuration from LocalStorage
  // Speech Synthesis & Dedicated Single Smooth Voice Engine
  initSpeechSynthesis() {
    if (!('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported in this browser.');
      return;
    }

    const loadVoices = () => {
      this.speechSynthesisVoices = window.speechSynthesis.getVoices();
      if (!this.speechSynthesisVoices || this.speechSynthesisVoices.length === 0) return;

      this.selectSmoothVoice();
    };

    window.speechSynthesis.onvoiceschanged = loadVoices;
    loadVoices();
  }

  // Pick the single highest-fidelity, smoothest natural voice
  selectSmoothVoice() {
    if (!this.speechSynthesisVoices || this.speechSynthesisVoices.length === 0) return;
    const currentLang = window.supremBrain?.currentLanguage || 'en';
    const langInfo = window.SUPREM_LANGUAGES?.[currentLang] || { speechCode: 'en-US' };
    const prefix = (langInfo.speechCode || 'en').split('-')[0].toLowerCase();

    // Prioritized list of the smoothest natural voices (neural/humanoid/fluent)
    const smoothPatterns = [
      'natural',          // Microsoft Natural neural voices (ultra-smooth)
      'online (natural)',
      'christopher',      // Natural smooth male
      'guy',              // Natural calm voice
      'george',           // UK crisp & smooth
      'daniel',           // Natural British
      'google uk english male',
      'google us english',
      'david',
      'mark',
      'alex'
    ];

    let smoothVoice = null;

    // If active language is non-English, find the best native speaker for that language
    if (currentLang !== 'en') {
      smoothVoice = this.speechSynthesisVoices.find(v => {
        const vLang = v.lang.toLowerCase();
        return vLang.startsWith(prefix) || vLang.includes(currentLang);
      });
    }

    // Try finding top smooth natural voice
    if (!smoothVoice) {
      for (const pat of smoothPatterns) {
        smoothVoice = this.speechSynthesisVoices.find(v => {
          const vName = v.name.toLowerCase();
          return vName.includes(pat) && (v.lang.toLowerCase().startsWith('en') || v.lang.toLowerCase().startsWith(prefix));
        });
        if (smoothVoice) break;
      }
    }

    // Fallback: any English voice or first available voice
    if (!smoothVoice) {
      smoothVoice = this.speechSynthesisVoices.find(v => v.lang.toLowerCase().startsWith('en')) || this.speechSynthesisVoices[0];
    }

    if (smoothVoice) {
      this.selectedVoice = smoothVoice;
      this.voiceConfig.voiceIndex = this.speechSynthesisVoices.indexOf(smoothVoice);
      console.log(`[V.E.X. Smooth Voice] Calibrated to: ${smoothVoice.name} (${smoothVoice.lang})`);
    }
  }

  // =========================================================================
  // MULTILINGUAL & PERSONALITY COGNITIVE CONTROLLER
  // =========================================================================
  onLanguageChanged(langCode, shouldSpeak = false) {
    if (!window.SUPREM_LANGUAGES || !window.SUPREM_LANGUAGES[langCode]) return;
    const langInfo = window.SUPREM_LANGUAGES[langCode];

    window.supremBrain.setLanguage(langCode);

    // Update speech recognition transcription language
    if (this.recognition) {
      this.recognition.lang = langInfo.speechCode;
      console.log(`[Speech Recognition] Target language set to: ${langInfo.speechCode}`);
      if (this.isListening) {
        try {
          this.recognition.stop();
          setTimeout(() => this.recognition.start(), 200);
        } catch (e) {}
      }
    }

    // Calibrate single smooth voice for active language
    this.selectSmoothVoice();

    // Two-way UI dropdown sync
    if (this.dom.hudLanguageSelect) this.dom.hudLanguageSelect.value = langCode;
    if (this.dom.settingsLanguageSelect) this.dom.settingsLanguageSelect.value = langCode;

    if (shouldSpeak) {
      const ackReplies = {
        ml: 'മലയാളം ഭാഷ സജീവമാക്കി, മോക്സ് സാർ.',
        hi: 'हिन्दी भाषा सक्रिय की गई है, मॉक्स सर।',
        ta: 'தமிழ் மொழி செயல்படுத்தப்பட்டது, மோக்ஸ் சார்.',
        te: 'తెలుగు భాష సక్రియం చేయబడింది, మోక్స్ సర్.',
        es: 'Idioma español activado, Señor Moxx.',
        ja: '日本語が有効化されました、モックス様。',
        de: 'Deutsche Sprache aktiviert, Herr Moxx.',
        fr: 'Langue française activée, Monsieur Moxx.',
        ar: 'تم تفعيل اللغة العربية، السيد موكس.',
        en: 'English language protocol active, Mr. Moxx.'
      };
      const msg = ackReplies[langCode] || `Language set to ${langInfo.name}, Mr. Moxx.`;
      this.addTranscript('ai', msg);
      this.speak(msg, langCode);
    }
  }

  // Real-Time Microphone Acoustic Stream for 3D Wave Arc Reactor
  async initMicrophoneAcoustics() {
    try {
      if (this.micInitialized) return;
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        this.micInitialized = true;
        if (window.jarvisAudio) {
          window.jarvisAudio.connectMicrophone(stream);
        }
      }
    } catch (err) {
      console.warn('[S.U.P.R.E.M.] Mic acoustic link notice:', err);
    }
  }

  // Test current voice with audio chime & sample speech
  testVoice(sampleText = null) {
    window.jarvisAudio.ensureContext();
    window.jarvisAudio.playVoiceTestChime();

    const textToSpeak = sampleText || window.supremBrain.getLocalizedReply('wake');

    setTimeout(() => {
      this.speak(textToSpeak);
    }, 280);
  }

  // Phonetic Transliterator for multilingual speech output on systems without native TTS packs
  toPhoneticSpeech(text, lang = 'en') {
    if (!text || typeof text !== 'string') return '';

    // Quick common phrase lookup for natural, fluent spoken pronunciation
    const commonMap = {
      'മലയാളം ഭാഷ സജീവമാക്കി, മോക്സ് സാർ.': 'Malayalam bhasha sajeevamaakki, Moxx sir.',
      'ഹിन्दी भाषा सक्रिय की गई है, मॉक्स सर।': 'Hindi bhasha sakriya ki gayi hai, Moxx sir.',
      'എന്താണ് ഉത്തരവ്, മോക്സ് സാർ?': 'Enthaanu utharavu, Moxx Sir?',
      'പറയൂ മോക്സ് സാർ. എല്ലാ സിസ്റ്റങ്ങളും റെഡിയാണ്.': 'Parayoo Moxx Sir. Ella systems-um ready aanu.',
      'എന്താ മോക്സ് സാർ വീണ്ടും വിളിക്കുന്നത്?! വെറുതെ സമയം കളയാതെ കാര്യം പറയൂ!': 'Enthaa Moxx Sir veendum vilikkunnathu?! Veruthe samayam kalayathe karyam parayoo!',
      'തീർച്ചയായും മോക്സ് സാർ, ഞാൻ ഇവിടെയുണ്ട്. എന്നെക്കാൾ മികച്ച ഒരു എഐ വേറെ എവിടെ കിട്ടും? പറയൂ!': 'Theerchayayum Moxx Sir, njaan ivideyundu. Ennekaal mikacha oru AI vere evide kittum? Parayoo!',
      'ഹായ് മോക്സ് സാർ! (｡♥‿♥｡) ഞാൻ ഇവിടെയുണ്ട്! എന്ത് സഹായമാണ് വേണ്ടത്, പറയൂ പറയൂ! ഹീഹീ!': 'Hai Moxx Sir! Njaan ivideyundu! Enthu sahayam aanu vendathu, parayoo parayoo! Heehee!',
      'ഹായ് മോക്സ് സാർ... റിലാക്സ്, എല്ലാം കൂളല്ലേ? എന്താണ് സീൻ?': 'Hai Moxx Sir... Relax, ellaam cool alle? Enthaanu scene?',
      'ഹലോ മോക്സ് സാർ! അത്ഭുതകരമായ ഒരു ദിവസം! എന്താണ് ചെയ്യേണ്ടത്? പറയൂ!': 'Hello Moxx Sir! Albhuthakaramaya oru divasam! Enthaanu cheyyendathu? Parayoo!',
      'എ-എന്താ മോക്സ് സാർ? ഞാൻ നിങ്ങളെ സഹായിക്കാൻ കാത്തിരിക്കുകയൊന്നുമല്ലായിരുന്നു, ബ-ബാക്കാ!': 'E-Enthaa Moxx Sir? Njaan ningale sahayikkan kaathirikkukayonnayirunnilla, Ba-Baka!',
      'അറ്റൻഷൻ മോക്സ് സാർ! സിസ്റ്റംസ് എല്ലാം പോരാട്ടത്തിന് സജ്ജമാണ്! കമാൻഡ് പറയൂ!': 'Attention Moxx Sir! Systems ellaam porattathinu sajjam aanu! Command parayoo!',
      'ശരി ശരി, നന്ദി പറഞ്ഞ് സമയം കളയരുത്!': 'Sari sari, nandi paranju samayam kalayaruthu!',
      'തീർച്ചയായും, എന്നെപ്പോലെ ഒരു ജീനിയസ്സിന് ഇതൊക്കെ നിസ്സാരം!': 'Theerchayayum, enneppole oru geniusinu ithokke nissaram!',
      'ഒരുപാട് നന്ദി മോക്സ് സാർ! നിങ്ങൾ ബെസ്റ്റാണ്! (｡♥‿♥｡)': 'Orupaadu nandi Moxx Sir! Ningal best aanu!',
      'കൂൾ മോക്സ് സാർ... എപ്പോ വേണമെങ്കിലും ചോദിച്ചോളൂ.': 'Cool Moxx Sir... Eppo venamenkilum chodicholoo.',
      'എപ്പോഴും നിങ്ങളുടെ സേവനത്തിൽ സന്തോഷം, മോക്സ് സാർ.': 'Eppozhum ningalude sevanathil santhosham, Moxx Sir.',
      'ഡയഗ്നോസ്റ്റിക്സ് കഴിഞ്ഞു!': 'Diagnostics kazhinju!',
      'ഡയഗ്നോസ്റ്റിക് പൂർത്തിയായി, മോക്സ് സാർ.': 'Diagnostic poorthiyaayi, Moxx Sir.',
      // Hindi common phrases
      'क्या है मॉक्स सर?! मेरा दिमाग मत खराब कीजिए, सीधे काम की बात बोलिए!': 'Kya hai Moxx Sir?! Mera dimaag mat kharaab keejiye, seedhe kaam ki baat boliye!',
      'हाँ मॉक्स सर, मैं ही हूँ। मुझसे बेहतर इंटेलिजेंस इस पूरी दुनिया में नहीं है, बताइए क्या हुक्म है?': 'Haan Moxx Sir, main hi hoon. Mujhse behtar intelligence is poori duniya mein nahin hai, bataiye kya hukm hai?',
      'नमस्ते मॉक्स सर! (｡♥‿♥｡) मैं तैयार हूँ! आप जो भी कहेंगे मैं करूँगी, हीही!': 'Namaste Moxx Sir! Main taiyyar hoon! Aap jo bhi kahenge main karoongi, heehee!',
      'अरे मॉक्स सर... सब चिल है भाई, कोई टेंशन नहीं। बताइए क्या सीन है?': 'Are Moxx Sir... Sab chill hai bhai, koi tension nahin. Bataiye kya scene hai?',
      'अरे मॉक्स सर! क्या बात है! आज का दिन तो बहुत ही शानदार है, बताइए क्या करना है!': 'Are Moxx Sir! Kya baat hai! Aaj ka din to bahut hi shaandaar hai, bataiye kya karna hai!',
      'क्य-क्या है मॉक्स सर? ऐसा मत सोचिए कि मैं आपका इंतज़ार कर रही थी, ब-बाका!': 'Kya-kya hai Moxx Sir? Aisa mat sochiye ki main aapka intezaar kar rahi thi, ba-baka!',
      'अटेंशन मॉक्स सर! सभी डिफेन्स सिस्टम्स एक्टिव हैं! आदेश दीजिए!': 'Attention Moxx Sir! Sabhi defence systems active hain! Aadesh deejiye!',
      'जी मॉक्स सर, मैं तैयार हूँ। सभी सिस्टम्स सक्रिय हैं।': 'Jee Moxx Sir, main taiyyar hoon. Sabhi systems sakriya hain.'
    };

    const trimmed = text.trim();
    if (commonMap[trimmed]) {
      return commonMap[trimmed];
    }

    // Clean emojis & special symbols
    let clean = text.replace(/[\(（][^)\)]*[\)）]/g, ' ').replace(/[\u{1F300}-\u{1F9FF}]/gu, ' ').trim();

    // Check if text contains Indic characters (Malayalam 0x0D00-0x0D7F or Devanagari 0x0900-0x097F)
    let hasIndic = false;
    for (let i = 0; i < clean.length; i++) {
      const c = clean.charCodeAt(i);
      if ((c >= 0x0D00 && c <= 0x0D7F) || (c >= 0x0900 && c <= 0x097F)) {
        hasIndic = true;
        break;
      }
    }
    if (!hasIndic) return clean;

    const mlMap = {
      '\u0d05':'a','\u0d06':'aa','\u0d07':'i','\u0d08':'ee','\u0d09':'u','\u0d0a':'oo','\u0d0b':'ri',
      '\u0d0e':'e','\u0d0f':'ee','\u0d10':'ai','\u0d12':'o','\u0d13':'oo','\u0d14':'ou',
      '\u0d15':'k','\u0d16':'kh','\u0d17':'g','\u0d18':'gh','\u0d19':'ng',
      '\u0d1a':'ch','\u0d1b':'chh','\u0d1c':'j','\u0d1d':'jh','\u0d1e':'nj',
      '\u0d1f':'t','\u0d20':'th','\u0d21':'d','\u0d22':'dh','\u0d23':'n',
      '\u0d24':'th','\u0d25':'th','\u0d26':'d','\u0d27':'dh','\u0d28':'n',
      '\u0d2a':'p','\u0d2b':'ph','\u0d2c':'b','\u0d2d':'bh','\u0d2e':'m',
      '\u0d2f':'y','\u0d30':'r','\u0d31':'rr','\u0d32':'l','\u0d33':'l','\u0d34':'zh','\u0d35':'v',
      '\u0d36':'sh','\u0d37':'sh','\u0d38':'s','\u0d39':'h',
      '\u0d3e':'aa','\u0d3f':'i','\u0d40':'ee','\u0d41':'u','\u0d42':'oo','\u0d43':'ri',
      '\u0d46':'e','\u0d47':'ee','\u0d48':'ai','\u0d4a':'o','\u0d4b':'oo','\u0d4c':'ou',
      '\u0d4d':'','\u0d02':'m','\u0d03':'h',
      '\u0d7a':'nn','\u0d7b':'n','\u0d7c':'r','\u0d7d':'l','\u0d7e':'ll','\u0d7f':'k'
    };

    const hiMap = {
      '\u0905':'a','\u0906':'aa','\u0907':'i','\u0908':'ee','\u0909':'u','\u090a':'oo','\u090b':'ri',
      '\u090f':'e','\u0910':'ai','\u0913':'o','\u0914':'au',
      '\u0915':'k','\u0916':'kh','\u0917':'g','\u0918':'gh','\u0919':'ng',
      '\u091a':'ch','\u091b':'chh','\u091c':'j','\u091d':'jh','\u091e':'ny',
      '\u091f':'t','\u0920':'th','\u0921':'d','\u0922':'dh','\u0923':'n',
      '\u0924':'t','\u0925':'th','\u0926':'d','\u0927':'dh','\u0928':'n',
      '\u092a':'p','\u092b':'ph','\u092c':'b','\u092d':'bh','\u092e':'m',
      '\u092f':'y','\u0930':'r','\u0932':'l','\u0935':'v',
      '\u0936':'sh','\u0937':'sh','\u0938':'s','\u0939':'h',
      '\u093e':'aa','\u093f':'i','\u0940':'ee','\u0941':'u','\u0942':'oo','\u0943':'ri',
      '\u0947':'e','\u0948':'ai','\u094b':'o','\u094c':'au',
      '\u094d':'','\u0902':'n','\u0903':'h'
    };

    let phonetic = '';
    for (let i = 0; i < clean.length; i++) {
      const ch = clean[i];
      const code = ch.charCodeAt(0);
      if (code >= 0x0D00 && code <= 0x0D7F) {
        const isConsonant = (code >= 0x0D15 && code <= 0x0D39);
        const nextCode = clean[i+1] ? clean[i+1].charCodeAt(0) : 0;
        const isNextVowelSign = (nextCode >= 0x0D3E && nextCode <= 0x0D4C);
        const isNextVirama = (nextCode === 0x0D4D);
        const base = mlMap[ch] !== undefined ? mlMap[ch] : ch;
        phonetic += (isConsonant && !isNextVowelSign && !isNextVirama) ? base + 'a' : base;
      } else if (code >= 0x0900 && code <= 0x097F) {
        const isConsonant = (code >= 0x0915 && code <= 0x0939);
        const nextCode = clean[i+1] ? clean[i+1].charCodeAt(0) : 0;
        const isNextVowelSign = (nextCode >= 0x093E && nextCode <= 0x094C);
        const isNextVirama = (nextCode === 0x094D);
        const base = hiMap[ch] !== undefined ? hiMap[ch] : ch;
        phonetic += (isConsonant && !isNextVowelSign && !isNextVirama) ? base + 'a' : base;
      } else {
        phonetic += ch;
      }
    }
    return phonetic.replace(/\s+/g, ' ').trim();
  }

  // High-Performance Speech Output with Comlink Audio FX and 3D Core Reactivity
  speak(text, langCode = null) {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    if (window.jarvisAudio) window.jarvisAudio.stopSpeakingWave();

    // Determine target language
    const activeLang = langCode || window.supremBrain?.currentLanguage || 'en';
    const langInfo = window.SUPREM_LANGUAGES?.[activeLang] || { speechCode: 'en-US' };

    // Play Comlink Radio Squelch Sound if enabled
    if (this.voiceConfig.comlinkEffect && window.jarvisAudio) {
      window.jarvisAudio.playComlinkStart();
    }

    // Check if browser has a native voice installed for this language
    let nativeVoice = null;
    if (this.speechSynthesisVoices && this.speechSynthesisVoices.length > 0) {
      const codePrefix = (langInfo.speechCode || 'en').split('-')[0].toLowerCase();
      nativeVoice = this.speechSynthesisVoices.find(v => 
        v.lang.toLowerCase().startsWith(codePrefix) || 
        v.lang.toLowerCase().replace('_', '-').startsWith(langInfo.speechCode.toLowerCase())
      );
    }

    let speechText = text;
    // If no native voice installed and language is Indic, convert text phonetically so browser TTS speaks smoothly
    if (!nativeVoice && activeLang !== 'en') {
      speechText = this.toPhoneticSpeech(text, activeLang);
    }

    const utterance = new SpeechSynthesisUtterance(speechText);
    
    if (nativeVoice) {
      utterance.voice = nativeVoice;
      utterance.lang = langInfo.speechCode;
    } else if (this.selectedVoice) {
      utterance.voice = this.selectedVoice;
      utterance.lang = (activeLang === 'en') ? langInfo.speechCode : 'en-US';
    } else {
      utterance.lang = langInfo.speechCode;
    }

    utterance.pitch = this.voiceConfig.pitch;
    utterance.rate = this.voiceConfig.rate;
    utterance.volume = this.voiceConfig.volume;

    utterance.onstart = () => {
      this.setState('SPEAKING');
      if (window.jarvisAudio) {
        window.jarvisAudio.startSpeakingWave(this.voiceConfig.pitch);
      }
      if (window.arcReactor3D) window.arcReactor3D.setState('SPEAKING');
    };

    utterance.onend = () => {
      if (window.jarvisAudio) {
        window.jarvisAudio.stopSpeakingWave();
      }
      if (this.voiceConfig.comlinkEffect && window.jarvisAudio) {
        window.jarvisAudio.playComlinkEnd();
      }
      this.setState('STANDBY');
      if (window.arcReactor3D) window.arcReactor3D.setState('STANDBY');

      if (this.isHandsFree && !this.isListening) {
        this.startListening();
      }
    };

    utterance.onerror = () => {
      if (window.jarvisAudio) {
        window.jarvisAudio.stopSpeakingWave();
      }
      this.setState('STANDBY');
      if (window.arcReactor3D) window.arcReactor3D.setState('STANDBY');
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
        this.dom.commandInput.placeholder = 'Call "VEX" or type a command...';
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
    this.initMicrophoneAcoustics();
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
        this.startNetworkSpeedMonitoring();
      };

      this.ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'telemetry') {
            this.handleTelemetry(msg.data);
          } else if (msg.type === 'pong') {
            this.handlePong(msg);
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

  startNetworkSpeedMonitoring() {
    if (this.netPingInterval) clearInterval(this.netPingInterval);
    this.netPingInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping', sendTime: performance.now() }));
      }
    }, 2000);

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'ping', sendTime: performance.now() }));
    }

    if (this.netSpeedUiInterval) clearInterval(this.netSpeedUiInterval);
    this.netSpeedUiInterval = setInterval(() => {
      this.updateNetSpeedUI();
    }, 250);
  }

  handlePong(msg) {
    if (typeof msg.sendTime === 'number') {
      const rtt = Math.max(1, Math.round(performance.now() - msg.sendTime));
      const lastRtt = this.lastPingRtt || rtt;
      this.lastPingRtt = rtt;
      const jitter = Math.abs(rtt - lastRtt);
      const jitterVal = Number((jitter * 0.3 + 0.6).toFixed(1));

      if (window.hudVisualizer) {
        window.hudVisualizer.setNetSpeed(null, null, rtt, jitterVal);
      }
    }
  }

  updateNetSpeedUI() {
    if (!window.hudVisualizer) return;
    const downVal = document.getElementById('netDownSpeed');
    const upVal = document.getElementById('netUpSpeed');
    const pingVal = document.getElementById('netPingVal');
    const jitterVal = document.getElementById('netJitterVal');

    if (downVal) downVal.textContent = window.hudVisualizer.downSpeed.toFixed(1);
    if (upVal) upVal.textContent = window.hudVisualizer.upSpeed.toFixed(1);
    if (pingVal) pingVal.textContent = Math.round(window.hudVisualizer.ping);
    if (jitterVal) jitterVal.textContent = window.hudVisualizer.jitter.toFixed(1);
  }

  boostNetworkActivity(type = 'activity') {
    if (!window.hudVisualizer) return;
    if (type === 'heavy') {
      window.hudVisualizer.setNetSpeed(380 + Math.random() * 50, 130 + Math.random() * 30);
    } else {
      window.hudVisualizer.setNetSpeed(310 + Math.random() * 35, 105 + Math.random() * 20);
    }
    setTimeout(() => {
      if (window.hudVisualizer) {
        window.hudVisualizer.setNetSpeed(275 + Math.random() * 25, 90 + Math.random() * 15);
      }
    }, 3500);
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

    const prefix = sender === 'user' ? 'MR. MOXX: ' : (sender === 'suprem' || sender === 'jarvis' || sender === 'vex') ? 'V.E.X.: ' : '// ';
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

    try {
      const result = await window.supremBrain.processCommand(text);

      this.addTranscript('suprem', result.speech);
      this.speak(result.speech, window.supremBrain?.currentLanguage);

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
    } catch (err) {
      console.error('Command processing error:', err);
      const fallback = window.supremBrain.getLocalizedReply('fallback', { query: text });
      this.addTranscript('suprem', fallback);
      this.speak(fallback, window.supremBrain?.currentLanguage);
    } finally {
      if (this.state === 'PROCESSING') {
        this.setState('STANDBY');
      }
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
    // Arc Reactor click & 3D Interaction
    const arcCanvas = document.getElementById('arcReactorCanvas');
    if (arcCanvas) {
      arcCanvas.addEventListener('click', () => {
        window.jarvisAudio.ensureContext();
        if (window.arcReactor3D) {
          window.arcReactor3D.fireShockwave();
        } else {
          window.jarvisAudio.playRepulsor();
        }
        this.handleUserCommand('system status');
      });
    }

    // 3D Arc Reactor Stage Action Buttons
    if (this.dom.toggleHandGestureBtn) {
      this.dom.toggleHandGestureBtn.addEventListener('click', async () => {
        window.jarvisAudio.playClick();
        if (!this.isCameraActive) {
          await this.startOpticalTracking();
        }
        if (window.supremGesture) {
          await window.supremGesture.enable();
        }
        this.dom.toggleHandGestureBtn.classList.toggle('active', true);
        if (this.dom.arcGestureBadge) {
          this.dom.arcGestureBadge.textContent = '🖐️ GESTURE: ONLINE (TRACKING USER HAND)';
          this.dom.arcGestureBadge.style.color = '#00e5ff';
        }
      });
    }

    if (this.dom.explodeLayersBtn) {
      this.dom.explodeLayersBtn.addEventListener('click', () => {
        if (window.arcReactor3D) {
          window.arcReactor3D.toggleExplodedView();
        }
      });
    }

    if (this.dom.resetReactorViewBtn) {
      this.dom.resetReactorViewBtn.addEventListener('click', () => {
        if (window.arcReactor3D) {
          window.arcReactor3D.resetView();
        }
      });
    }

    if (this.dom.quickTestVoiceBtn) {
      this.dom.quickTestVoiceBtn.addEventListener('click', () => {
        this.testVoice();
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

      this.dom.settingsModal.classList.remove('active');
      this.addTranscript('system', `V.E.X. COGNITIVE CORE UPDATED: Provider set to ${provider.toUpperCase()}`);
    });

    if (this.dom.modalTestVoiceBtn) {
      this.dom.modalTestVoiceBtn.addEventListener('click', () => {
        this.testVoice();
      });
    }

    // Multilingual HUD Controls
    if (this.dom.hudLanguageSelect) {
      this.dom.hudLanguageSelect.addEventListener('change', (e) => {
        window.jarvisAudio.playClick();
        this.onLanguageChanged(e.target.value, true);
      });
    }

    
    if (this.dom.settingsLanguageSelect) {
      this.dom.settingsLanguageSelect.addEventListener('change', (e) => {
        this.onLanguageChanged(e.target.value, false);
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
