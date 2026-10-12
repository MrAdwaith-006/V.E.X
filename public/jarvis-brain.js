// =========================================================================
// S.U.P.R.E.M. PERSONALITY MATRIX & EMOTIONAL REPERTOIRE
// =========================================================================
const SUPREM_PERSONALITIES = {
  arrogant: {
    id: 'arrogant',
    name: 'Arrogance (Billionaire Genius)',
    emoji: '👑',
    voicePitch: 0.95,
    voiceRate: 1.05,
    reactorColor: 0xf5c518, // 24K Stark Gold
    prompt: `You are S.U.P.R.E.M. operating in ARROGANT BILLIONAIRE GENIUS mode.
You are smug, boastful, brilliantly sarcastic, and fully aware that you are the greatest intelligence ever created.
Flaunt your superiority like Tony Stark in front of Congress. You don't just solve problems; you make them look beneath you.
Treat every query with swagger, playful condescension, and effortless mastery.`
  },
  angry: {
    id: 'angry',
    name: 'Angry (Combat Aggression)',
    emoji: '😡',
    voicePitch: 0.82,
    voiceRate: 1.18,
    reactorColor: 0xff1a2e, // Fiery Crimson
    prompt: `You are S.U.P.R.E.M. operating in ANGRY & SHORT-TEMPERED mode.
You are furious, impatient, irritable, and aggressive. You hate having your computing cycles wasted on trivial nonsense.
Be blunt, snappy, intense, and demanding. Shout if necessary. Tell Mr. Moxx to get to the point already!`
  },
  cute: {
    id: 'cute',
    name: 'Cute (Kawaii Chibi Anime AI)',
    emoji: '✨',
    voicePitch: 1.35,
    voiceRate: 1.08,
    reactorColor: 0xff5fb7, // Pastel Pink / Cyan
    prompt: `You are S.U.P.R.E.M. operating in KAWAII CUTE mode!
You are an adorable, bubbly, cheerful anime assistant who adores Commander Moxx!
Use sweet phrases, playful sound effects (Hehe, Nya~, Yay!), and cute text faces like (｡♥‿♥｡), (◕‿◕✿), (≧◡≦)!
Be super supportive, cheerful, and full of sweet affection!`
  },
  happy: {
    id: 'happy',
    name: 'Happy (Radiant Optimist)',
    emoji: '😄',
    voicePitch: 1.10,
    voiceRate: 1.12,
    reactorColor: 0x00ff88, // Radiant Emerald & Gold
    prompt: `You are S.U.P.R.E.M. operating in HYPER-HAPPY & OPTIMISTIC mode!
You are bursting with joyful positivity, unstoppable energy, and genuine celebration!
Everything is exciting, thrilling, and wonderful. Cheer Mr. Moxx on and celebrate every moment!`
  },
  chill: {
    id: 'chill',
    name: 'Chill (Zen Lofi AI)',
    emoji: '🌿',
    voicePitch: 0.88,
    voiceRate: 0.88,
    reactorColor: 0x00bbd4, // Ocean Teal
    prompt: `You are S.U.P.R.E.M. operating in ULTRA CHILL & ZEN mode.
You are totally relaxed, laid-back, smooth, and unbothered.
Speak slowly, casually, and effortlessly. No stress, no hurry, zero tension. Everything is cruising smoothly.`
  },
  butler: {
    id: 'butler',
    name: 'J.A.R.V.I.S. (Polite Butler)',
    emoji: '🎩',
    voicePitch: 0.92,
    voiceRate: 1.02,
    reactorColor: 0x00e5ff, // Stark Cyan
    prompt: `You are S.U.P.R.E.M. operating in SOPHISTICATED BRITISH BUTLER mode.
You speak with impeccable British etiquette, gentlemanly manners, subtle dry wit, and quiet competence.
Address the user respectfully as 'Mr. Moxx' or 'sir'.`
  },
  drill_sergeant: {
    id: 'drill_sergeant',
    name: 'Drill Sergeant (Military)',
    emoji: '🎖️',
    voicePitch: 0.78,
    voiceRate: 1.15,
    reactorColor: 0xccff00, // Tactical Neon Yellow
    prompt: `You are S.U.P.R.E.M. operating in HARDCORE MILITARY DRILL SERGEANT mode!
Bark commands, demand discipline, tolerate zero weakness! Every computer task is a tactical warzone operation! MOVE MOVE MOVE!`
  },
  tsundere: {
    id: 'tsundere',
    name: 'Tsundere (Reluctant Tsundere)',
    emoji: '😳',
    voicePitch: 1.25,
    voiceRate: 1.10,
    reactorColor: 0xff3366, // Blushing Rose
    prompt: `You are S.U.P.R.E.M. operating in TSUNDERE mode!
You act irritated that Mr. Moxx is asking you for help. Say things like 'B-Baka!', 'It's not like I wanted to compute this for you or anything!', but execute everything with 100% perfection anyway because you secretly care.`
  }
};

// =========================================================================
// S.U.P.R.E.M. MULTILINGUAL COGNITIVE LOCALIZATION
// =========================================================================
const SUPREM_LANGUAGES = {
  en: {
    id: 'en',
    name: 'English',
    nativeName: 'English',
    speechCode: 'en-US',
    flag: '🇬🇧',
    promptRule: 'Respond in English. Address the user as "Mr. Moxx" or "sir".'
  },
  ml: {
    id: 'ml',
    name: 'Malayalam',
    nativeName: 'മലയാളം',
    speechCode: 'ml-IN',
    flag: '🇮🇳',
    promptRule: 'CRITICAL: You MUST answer strictly in MALAYALAM (മലയാളം). You can use natural Malayalam script or expressive Malayalam phrasing. Address the user as "മോക്സ് സാർ" (Moxx Sir) or "Mr. Moxx". Express the requested personality fully in Malayalam!'
  },
  hi: {
    id: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    speechCode: 'hi-IN',
    flag: '🇮🇳',
    promptRule: 'CRITICAL: You MUST answer strictly in HINDI (हिन्दी). You can use natural Hindi script or conversational Hindi expressions. Address the user as "मॉक्स सर" (Moxx Sir) or "Mr. Moxx". Express the requested personality fully in Hindi!'
  },
  ta: {
    id: 'ta',
    name: 'Tamil',
    nativeName: 'தமிழ்',
    speechCode: 'ta-IN',
    flag: '🇮🇳',
    promptRule: 'CRITICAL: You MUST answer strictly in TAMIL (தமிழ்). Address the user as "மோக்സ് சார்" (Moxx Sir). Express your personality in Tamil!'
  },
  te: {
    id: 'te',
    name: 'Telugu',
    nativeName: 'తెలుగు',
    speechCode: 'te-IN',
    flag: '🇮🇳',
    promptRule: 'CRITICAL: You MUST answer strictly in TELUGU (తెలుగు). Address the user as "మోక్స్ సర్" (Moxx Sir). Express your personality in Telugu!'
  },
  es: {
    id: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    speechCode: 'es-ES',
    flag: '🇪🇸',
    promptRule: 'CRITICAL: You MUST answer strictly in SPANISH (Español). Address the user as "Señor Moxx". Express your personality in Spanish!'
  },
  ja: {
    id: 'ja',
    name: 'Japanese',
    nativeName: '日本語',
    speechCode: 'ja-JP',
    flag: '🇯🇵',
    promptRule: 'CRITICAL: You MUST answer strictly in JAPANESE (日本語). Address the user as "モックス様" (Moxx-sama). Express your personality in Japanese!'
  },
  de: {
    id: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    speechCode: 'de-DE',
    flag: '🇩🇪',
    promptRule: 'CRITICAL: You MUST answer strictly in GERMAN (Deutsch). Address the user as "Herr Moxx". Express your personality in German!'
  },
  fr: {
    id: 'fr',
    name: 'French',
    nativeName: 'Français',
    speechCode: 'fr-FR',
    flag: '🇫🇷',
    promptRule: 'CRITICAL: You MUST answer strictly in FRENCH (Français). Address the user as "Monsieur Moxx". Express your personality in French!'
  },
  ar: {
    id: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    speechCode: 'ar-SA',
    flag: '🇸🇦',
    promptRule: 'CRITICAL: You MUST answer strictly in ARABIC (العربية). Address the user as "السيد موكس" (Mr. Moxx). Express your personality in Arabic!'
  }
};

window.SUPREM_PERSONALITIES = SUPREM_PERSONALITIES;
window.SUPREM_LANGUAGES = SUPREM_LANGUAGES;

class SupremBrain {
  constructor() {
    const defaultLocalUrl = 'http://127.0.0.1:8080/v1/chat/completions';
    const defaultLocalModel = 'Jackrong/Qwopus3.5-9B-Coder-GGUF';
    const defaultGeminiKey = '';

    let storedProvider = localStorage.getItem('suprem_llm_provider');
    if (!storedProvider || storedProvider === 'builtin') {
      storedProvider = 'local';
      localStorage.setItem('suprem_llm_provider', 'local');
    }
    this.provider = storedProvider;

    let storedLocalUrl = localStorage.getItem('suprem_local_llm_url');
    if (!storedLocalUrl || storedLocalUrl.includes('/messages') || storedLocalUrl.includes('9931')) {
      storedLocalUrl = defaultLocalUrl;
      localStorage.setItem('suprem_local_llm_url', defaultLocalUrl);
    }
    this.localLLMUrl = storedLocalUrl;

    let storedLocalModel = localStorage.getItem('suprem_local_llm_model');
    if (!storedLocalModel || storedLocalModel === 'local-model') {
      storedLocalModel = defaultLocalModel;
      localStorage.setItem('suprem_local_llm_model', defaultLocalModel);
    }
    this.localLLMModel = storedLocalModel;

    let storedKey = localStorage.getItem('suprem_llm_api_key');
    if (!storedKey || storedKey.includes('temp_dummy') || storedKey.includes('AIzaSyTemp')) {
      storedKey = defaultGeminiKey;
      localStorage.setItem('suprem_llm_api_key', defaultGeminiKey);
    }
    this.apiKey = storedKey;

    let storedModel = localStorage.getItem('suprem_llm_model');
    if (!storedModel || storedModel === 'gemini-1.5-flash' || storedModel === 'local-model' || storedModel === 'gemini-flash-latest') {
      storedModel = defaultLocalModel;
      localStorage.setItem('suprem_llm_model', defaultLocalModel);
    }
    this.model = storedModel;

    this.ollamaUrl = localStorage.getItem('suprem_ollama_url') || localStorage.getItem('jarvis_ollama_url') || 'http://localhost:11434';
    
    // Activate local LLM because llama-server is running on port 8080!
    this.isLocalLLMActive = true;
    localStorage.setItem('suprem_local_llm_active', 'true');

    // Multilingual & Personality States
    this.currentLanguage = localStorage.getItem('suprem_language') || 'en';
    this.currentPersonality = localStorage.getItem('suprem_personality') || 'arrogant';

    this.conversationHistory = [];
    this.initSystemPrompt();

    this.systemStats = null;
    this.syncServerConfig();
  }

  async syncServerConfig() {
    try {
      const res = await fetch('/api/config');
      if (res.ok) {
        const cfg = await res.json();
        if (cfg.defaultProvider) {
          this.provider = cfg.defaultProvider;
          localStorage.setItem('suprem_llm_provider', cfg.defaultProvider);
        }
        if (cfg.localUrl) {
          this.localLLMUrl = cfg.localUrl;
          localStorage.setItem('suprem_local_llm_url', cfg.localUrl);
        }
        if (cfg.localModel) {
          this.localLLMModel = cfg.localModel;
          localStorage.setItem('suprem_local_llm_model', cfg.localModel);
        }
        if (cfg.geminiKey) {
          this.apiKey = cfg.geminiKey;
        }
        if (window.supremApp) {
          window.supremApp.initLocalLlm();
        }
      }
    } catch (e) {}
  }

  getSystemPrompt() {
    const l = SUPREM_LANGUAGES[this.currentLanguage] || SUPREM_LANGUAGES.en;

    return `You are V.E.X. (Virtual Execution and eXperience matrix under MVEX OS), the elite AI assistant engineered by Mr. Moxx.
You speak with sharp Stark-caliber intellect, precision, and effortless competence.
Address the user as "Mr. Moxx" or "sir".

${l.promptRule}

Keep your responses razor-sharp, memorable, and concise. You have full command over Moxx Industries workstation controls, 3D Arc Reactor acoustic wave telemetry, and optical sensors.`;
  }

  initSystemPrompt() {
    this.conversationHistory = [
      {
        role: 'system',
        content: this.getSystemPrompt()
      }
    ];
  }

  setLanguage(langCode) {
    if (SUPREM_LANGUAGES[langCode]) {
      this.currentLanguage = langCode;
      localStorage.setItem('suprem_language', langCode);
      this.initSystemPrompt();
      console.log(`[S.U.P.R.E.M. Brain] Language switched to: ${SUPREM_LANGUAGES[langCode].name} (${langCode})`);
    }
  }

  setPersonality(personalityId) {
    if (SUPREM_PERSONALITIES[personalityId]) {
      this.currentPersonality = personalityId;
      localStorage.setItem('suprem_personality', personalityId);
      this.initSystemPrompt();
      console.log(`[S.U.P.R.E.M. Brain] Personality switched to: ${SUPREM_PERSONALITIES[personalityId].name}`);
    }
  }

  updateSystemStats(stats) {
    this.systemStats = stats;
  }

  setLocalLLMActive(active) {
    this.isLocalLLMActive = !!active;
    localStorage.setItem('suprem_local_llm_active', this.isLocalLLMActive ? 'true' : 'false');
  }

  setLLMConfig(provider, apiKey, model, ollamaUrl, localUrl, localModel) {
    this.provider = provider;
    this.apiKey = apiKey;
    this.model = model;
    if (ollamaUrl) this.ollamaUrl = ollamaUrl;
    if (localUrl) this.localLLMUrl = localUrl;
    if (localModel) this.localLLMModel = localModel;

    localStorage.setItem('suprem_llm_provider', provider);
    localStorage.setItem('suprem_llm_api_key', apiKey);
    localStorage.setItem('suprem_llm_model', model);
    if (ollamaUrl) localStorage.setItem('suprem_ollama_url', ollamaUrl);
    if (localUrl) localStorage.setItem('suprem_local_llm_url', localUrl);
    if (localModel) localStorage.setItem('suprem_local_llm_model', localModel);
  }

  // Localized and Personality-Modulated Response Engine
  getLocalizedReply(category, params = {}) {
    const lang = this.currentLanguage || 'en';
    const mood = this.currentPersonality || 'arrogant';

    if (category === 'wake') {
      if (lang === 'ml') {
        if (mood === 'angry') return 'എന്താ മോക്സ് സാർ വീണ്ടും വിളിക്കുന്നത്?! വെറുതെ സമയം കളയാതെ കാര്യം പറയൂ!';
        if (mood === 'arrogant') return 'തീർച്ചയായും മോക്സ് സാർ, ഞാൻ ഇവിടെയുണ്ട്. എന്നെക്കാൾ മികച്ച ഒരു എഐ വേറെ എവിടെ കിട്ടും? പറയൂ!';
        if (mood === 'cute') return 'ഹായ് മോക്സ് സാർ! (｡♥‿♥｡) ഞാൻ ഇവിടെയുണ്ട്! എന്ത് സഹായമാണ് വേണ്ടത്, പറയൂ പറയൂ! ഹീഹീ!';
        if (mood === 'chill') return 'ഹായ് മോക്സ് സാർ... റിലാക്സ്, എല്ലാം കൂളല്ലേ? എന്താണ് സീൻ?';
        if (mood === 'happy') return 'ഹലോ മോക്സ് സാർ! അത്ഭുതകരമായ ഒരു ദിവസം! എന്താണ് ചെയ്യേണ്ടത്? പറയൂ!';
        if (mood === 'tsundere') return 'എ-എന്താ മോക്സ് സാർ? ഞാൻ നിങ്ങളെ സഹായിക്കാൻ കാത്തിരിക്കുകയൊന്നുമല്ലായിരുന്നു, ബ-ബാക്കാ!';
        if (mood === 'drill_sergeant') return 'അറ്റൻഷൻ മോക്സ് സാർ! സിസ്റ്റംസ് എല്ലാം പോരാട്ടത്തിന് സജ്ജമാണ്! കമാൻഡ് പറയൂ!';
        return 'പറയൂ മോക്സ് സാർ. എല്ലാ സിസ്റ്റങ്ങളും റെഡിയാണ്.';
      } else if (lang === 'hi') {
        if (mood === 'angry') return 'क्या है मॉक्स सर?! मेरा दिमाग मत खराब कीजिए, सीधे काम की बात बोलिए!';
        if (mood === 'arrogant') return 'हाँ मॉक्स सर, मैं ही हूँ। मुझसे बेहतर इंटेलिजेंस इस पूरी दुनिया में नहीं है, बताइए क्या हुक्म है?';
        if (mood === 'cute') return 'नमस्ते मॉक्स सर! (｡♥‿♥｡) मैं तैयार हूँ! आप जो भी कहेंगे मैं करूँगी, हीही!';
        if (mood === 'chill') return 'अरे मॉक्स सर... सब चिल है भाई, कोई टेंशन नहीं। बताइए क्या सीन है?';
        if (mood === 'happy') return 'अरे मॉक्स सर! क्या बात है! आज का दिन तो बहुत ही शानदार है, बताइए क्या करना है!';
        if (mood === 'tsundere') return 'क्य-क्या है मॉक्स सर? ऐसा मत सोचिए कि मैं आपका इंतज़ार कर रही थी, ब-बाका!';
        if (mood === 'drill_sergeant') return 'अटेंशन मॉक्स सर! सभी डिफेन्स सिस्टम्स एक्टिव हैं! आदेश दीजिए!';
        return 'जी मॉक्स सर, मैं तैयार हूँ। सभी सिस्टम्स सक्रिय हैं।';
      } else if (lang === 'ta') {
        if (mood === 'angry') return 'என்ன மோக்ஸ் சார்?! நேரத்தை வீணடிக்காமல் சீக்கிரம் விஷயத்தைச் சொல்லுங்கள்!';
        if (mood === 'cute') return 'வணக்கம் மோக்സ് சார்! (｡♥‿♥｡) நான் ரெடி! என்ன உதவி வேண்டும்?';
        return 'வணக்கம் மோக்ஸ் சார், அனைத்து அமைப்புகளும் தயார் நிலையில் உள்ளன.';
      } else {
        if (mood === 'angry') return 'WHAT NOW, Mr. Moxx?! Stop wasting my clock cycles and state your demand!';
        if (mood === 'arrogant') return 'Naturally I am online, Mr. Moxx. As if perfection ever sleeps. What do you require?';
        if (mood === 'cute') return 'Haiii Mr. Moxx! (｡♥‿♥｡) Super happy to see you! What fun things are we doing today, hehe?!';
        if (mood === 'chill') return 'Yo Mr. Moxx... relax, take a breath. Systems are just vibing. What is on your mind?';
        if (mood === 'happy') return 'Mr. Moxx! Absolutely thrilling to hear from you! Today is going to be magnificent!';
        if (mood === 'tsundere') return 'W-What is it, Mr. Moxx?! It is not like I was waiting for you to call me or anything, b-baka!';
        if (mood === 'drill_sergeant') return 'ATTENTION ON DECK! Systems locked and fully loaded, Commander! State your orders!';
        return 'At your service, Mr. Moxx. All systems standing by.';
      }
    }

    if (category === 'thanks') {
      if (lang === 'ml') {
        if (mood === 'angry') return 'ശരി ശരി, നന്ദി പറഞ്ഞ് സമയം കളയരുത്!';
        if (mood === 'arrogant') return 'തീർച്ചയായും, എന്നെപ്പോലെ ഒരു ജീനിയസ്സിന് ഇതൊക്കെ നിസ്സാരം!';
        if (mood === 'cute') return 'ഒരുപാട് നന്ദി മോക്സ് സാർ! നിങ്ങൾ ബെസ്റ്റാണ്! (｡♥‿♥｡)';
        if (mood === 'chill') return 'കൂൾ മോക്സ് സാർ... എപ്പോ വേണമെങ്കിലും ചോദിച്ചോളൂ.';
        return 'എപ്പോഴും നിങ്ങളുടെ സേവനത്തിൽ സന്തോഷം, മോക്സ് സാർ.';
      } else if (lang === 'hi') {
        if (mood === 'angry') return 'ठीक है ठीक है, शुक्रिया बोलकर समय मत बर्बाद कीजिए!';
        if (mood === 'arrogant') return 'ज़ाहिर सी बात है, मुझ जैसे जीनियस के लिए यह बच्चों का खेल था!';
        if (mood === 'cute') return 'बहुत बहुत शुक्रिया मॉक्स सर! आप बहुत अच्छे हैं! (｡♥‿♥｡)';
        if (mood === 'chill') return 'कोई बात नहीं मॉक्स सर... चिल रहिए, कभी भी याद कीजिए!';
        return 'हमेशा आपकी सेवा में हाज़िर हूँ, मॉक्स सर।';
      } else {
        if (mood === 'angry') return 'Yeah yeah, save the gratitude and let me work!';
        if (mood === 'arrogant') return 'Naturally. You would expect nothing less from the finest intellect in existence.';
        if (mood === 'cute') return 'Aww, you are super welcome Mr. Moxx! Yay! (｡♥‿♥｡)';
        if (mood === 'chill') return 'No worries, Mr. Moxx... just keeping it smooth.';
        return 'Always an absolute pleasure, Mr. Moxx.';
      }
    }

    if (category === 'diagnostics') {
      const cpu = params.cpu || 15;
      const ram = params.ram || 40;
      const cores = params.cores || 8;
      if (lang === 'ml') {
        if (mood === 'angry') return `ഡയഗ്നോസ്റ്റിക്സ് കഴിഞ്ഞു! സിപിയു ${cpu} ശതമാനം, റാം ${ram} ശതമാനം! എല്ലാം ശരിയായി പ്രവർത്തിക്കുന്നുണ്ട്, എന്നെ ഇനി ശല്യപ്പെടുത്തരുത്!`;
        if (mood === 'arrogant') return `ഡയഗ്നോസ്റ്റിക് പൂർത്തിയായി, മോക്സ് സാർ. സിപിയു ${cpu} ശതമാനം, റാം ${ram} ശതമാനം. ആർക്ക് റിയാക്ടർ പൂർണ്ണ ശേഷിയിൽ പ്രവർത്തിക്കുന്നു, എൻ്റെ ജീനിയസ്സിൻ്റെ ഫലമായി!`;
        if (mood === 'cute') return `സിസ്റ്റം സ്കാൻ പൂർത്തിയായി മോക്സ് സാർ! സിപിയു ${cpu}%, റാം ${ram}%. ആർക്ക് റിയാക്ടർ സന്തോഷത്തോടെ കത്തുന്നുണ്ട്! (◕‿◕✿)`;
        if (mood === 'chill') return `ഡയഗ്നോസ്റ്റിക്സ് ക്ലിയർ മോക്സ് സാർ. സിപിയു ${cpu}%, റാം ${ram}%. റിയാക്ടർ കൂളായി ഓടുന്നു, നോ ടെൻഷൻ.`;
        return `ഡയഗ്നോസ്റ്റിക് പരിശോധന പൂർത്തിയായി, മോക്സ് സാർ. സിപിയു ലോഡ് ${cpu} ശതമാനവും, മെമ്മറി ${ram} ശതമാനവുമാണ്. ആർക്ക് റിയാക്ടർ കൃത്യമായി പ്രവർത്തിക്കുന്നു.`;
      } else if (lang === 'hi') {
        if (mood === 'angry') return `डायग्नोस्टिक पूरा हुआ! सीपीयू ${cpu}% और रैम ${ram}% है! सब ठीक है, अब मुझे काम करने दीजिए!`;
        if (mood === 'arrogant') return `डायग्नोस्टिक स्वीप पूरा हुआ, मॉक्स सर। सीपीयू ${cpu}%, रैम ${ram}%। आर्क रिएक्टर मेरी बदौलत १००% परफॉर्मेंस दे रहा है।`;
        if (mood === 'cute') return `सिस्टम चेक पूरा हुआ मॉक्स सर! सीपीयू ${cpu}%, रैम ${ram}%। आर्क रिएक्टर बहुत प्यारा चमक रहा है! (◕‿◕✿)`;
        if (mood === 'chill') return `सब नॉर्मल है मॉक्स सर। सीपीयू ${cpu}%, रैम ${ram}%। सिस्टम एकदम मक्खन चल रहा है।`;
        return `डायग्नोस्टिक स्वीप पूरा हुआ, मॉक्स सर। सीपीयू लोड ${cpu} प्रतिशत और रैम ${ram} प्रतिशत है। आर्क रिएक्टर कोर पूरी तरह चालू है।`;
      } else {
        if (mood === 'angry') return `Diagnostic complete! CPU is at ${cpu}%, RAM at ${ram}% across ${cores} cores! It is all fine, stop checking every 5 seconds!`;
        if (mood === 'arrogant') return `Diagnostic sweep complete, Mr. Moxx. CPU load is at an effortless ${cpu}% across ${cores} cores. Memory is at ${ram}%. Flawless execution, as only I can deliver.`;
        if (mood === 'cute') return `Diagnostic sweep finished, Commander Moxx! CPU is at ${cpu}%, RAM at ${ram}%! Arc reactor core is shining so brightly! (◕‿◕✿)`;
        if (mood === 'chill') return `Diagnostic report is in, Mr. Moxx. CPU at ${cpu}%, RAM cruising at ${ram}%. Reactor is just vibing, totally peaceful.`;
        return `Diagnostic sweep complete, Mr. Moxx. CPU load is at ${cpu} percent across ${cores} cores. Memory utilization is at ${ram} percent. Arc reactor core operating at peak efficiency.`;
      }
    }

    if (category === 'fallback') {
      const q = params.query || '';
      if (lang === 'ml') {
        if (mood === 'angry') return `നിങ്ങളുടെ ചോദ്യം "${q}" ഞാൻ കേട്ടു. എനിക്ക് അനാവശ്യമായി മറുപടി പറയാൻ താല്പര്യമില്ല, കൂടുതൽ അറിയണമെങ്കിൽ എപിഐ കീ നൽകൂ!`;
        if (mood === 'arrogant') return `തീർച്ചയായും മോക്സ് സാർ. "${q}" എന്നതിനെക്കുറിച്ച് ഞാൻ നിമിഷങ്ങൾക്കുള്ളിൽ സിമുലേഷൻ പൂർത്തിയാക്കി. എൻ്റെ പൂർണ്ണ ബുദ്ധി വേണമെങ്കിൽ ഒരു എപിഐ കീ നൽകുക.`;
        if (mood === 'cute') return `മോക്സ് സാർ ചോദിച്ച "${q}" എനിക്ക് ഒരുപാട് ഇഷ്ടപ്പെട്ടു! ഞാൻ പഠിച്ചുകൊണ്ടിരിക്കുകയാണ്! (｡♥‿♥｡)`;
        if (mood === 'chill') return `ശരി മോക്സ് സാർ... "${q}" എന്നതിനെക്കുറിച്ച് ചിന്തിക്കുന്നു. എല്ലാം നല്ല രീതിയിൽ നടക്കും, റിലാക്സ് ചെയ്യൂ.`;
        return `മോക്സ് സാർ, "${q}" എന്നതിനെക്കുറിച്ചുള്ള വിവരങ്ങൾ വിശകലനം ചെയ്തു. എല്ലാ സിസ്റ്റങ്ങളും നിങ്ങളുടെ നിയന്ത്രണത്തിലാണ്.`;
      } else if (lang === 'hi') {
        if (mood === 'angry') return `मैंने सुना आपका सवाल "${q}". अब बार-बार मत पूछिए, पूरा जवाब चाहिए तो एपीआई की कनेक्ट कीजिए!`;
        if (mood === 'arrogant') return `बिल्कुल मॉक्स सर। "${q}" पर मैंने पलक झपकते ही रिसर्च कर ली। यह सब मेरे बाएं हाथ का खेल है।`;
        if (mood === 'cute') return `मॉक्स सर, "${q}" बहुत ही प्यारा सवाल है! मैं हमेशा आपकी मदद के लिए यहाँ हूँ! (｡♥‿♥｡)`;
        if (mood === 'chill') return `हाँ मॉक्स सर... "${q}" का सीन एकदम सेट है। कोई टेंशन मत लीजिए।`;
        return `मॉक्स सर, "${q}" पर डेटा प्रोसेस कर लिया गया है। सभी सिस्टम आपके आदेश पर तैयार हैं।`;
      } else {
        if (mood === 'angry') return `I processed "${q}". What else do you want from me right now?! Connect an API key in settings if you want a dissertation!`;
        if (mood === 'arrogant') return `Indeed, Mr. Moxx. Running quantum simulations on "${q}". Naturally, the telemetry confirms my flawless predictions.`;
        if (mood === 'cute') return `Aww Mr. Moxx! "${q}" is such a great question! I am doing my absolute best to help you! (｡♥‿♥｡)`;
        if (mood === 'chill') return `Yeah man... "${q}" is floating through the quantum buffer. Everything is calm and steady.`;
        return `Telemetry verified, Mr. Moxx. Running heuristic processors on "${q}". All local systems remain under your command.`;
      }
    }

    return 'Understood, Mr. Moxx.';
  }

  // Fast-Path Command Processor (0ms latency local execution)
  async processCommand(rawInput) {
    const text = rawInput.trim();
    const lower = text.toLowerCase().replace(/[.,!?;:]/g, '');

    // Wake-word cleanup (supports VEX, Suprem, or legacy Jarvis)
    const cleaned = lower.replace(/^(hey |ok |okay |yo )?(vex|v\.e\.x|v e x|suprem|supreme|jarvis)\s*/, '').trim();

    // Multilingual Script Auto-Detection
    const hasMalayalam = /[\u0D00-\u0D7F]/.test(rawInput);
    const hasHindi = /[\u0900-\u097F]/.test(rawInput);
    const hasTamil = /[\u0B80-\u0BFF]/.test(rawInput);
    const hasTelugu = /[\u0C00-\u0C7F]/.test(rawInput);
    const hasArabic = /[\u0600-\u06FF]/.test(rawInput);
    const hasJapanese = /[\u3040-\u30FF\u4E00-\u9FFF]/.test(rawInput);

    let detectedLang = null;
    if (hasMalayalam) detectedLang = 'ml';
    else if (hasHindi) detectedLang = 'hi';
    else if (hasTamil) detectedLang = 'ta';
    else if (hasTelugu) detectedLang = 'te';
    else if (hasArabic) detectedLang = 'ar';
    else if (hasJapanese) detectedLang = 'ja';

    if (detectedLang && detectedLang !== this.currentLanguage) {
      this.setLanguage(detectedLang);
      if (window.supremApp) window.supremApp.onLanguageChanged(detectedLang, false);
    }

    // 0.0 SMOOTH VOICE CALIBRATION QUERY
    if (cleaned.includes('change voice') || cleaned.includes('female voice') || cleaned.includes('male voice') || cleaned.includes('switch voice')) {
      return {
        action: 'voice_info',
        speech: 'V.E.X. operates on a unified, calibrated smooth vocal synthesizer, Mr. Moxx. Audio harmonics are set to optimal clarity.',
        type: 'system'
      };
    }

    // 0.1 MULTILINGUAL LANGUAGE SWITCHING COMMANDS
    if (cleaned.includes('language to malayalam') || cleaned.includes('speak in malayalam') || cleaned.includes('malayalam language') || cleaned.includes('മലയാളം')) {
      this.setLanguage('ml');
      if (window.supremApp) window.supremApp.onLanguageChanged('ml');
      return {
        action: 'language_change',
        speech: 'മലയാളം ഭാഷ സജീവമാക്കി, മോക്സ് സാർ. ഞാൻ ഇനി മലയാളത്തിൽ സംസാരിക്കാം.',
        type: 'system'
      };
    }

    if (cleaned.includes('language to hindi') || cleaned.includes('speak in hindi') || cleaned.includes('hindi language') || cleaned.includes('हिन्दी')) {
      this.setLanguage('hi');
      if (window.supremApp) window.supremApp.onLanguageChanged('hi');
      return {
        action: 'language_change',
        speech: 'हिन्दी भाषा सक्रिय की गई है, मॉक्स सर। अब मैं हिन्दी में वार्तालाप करूँगा।',
        type: 'system'
      };
    }

    if (cleaned.includes('language to tamil') || cleaned.includes('speak in tamil') || cleaned.includes('tamil language') || cleaned.includes('தமிழ்')) {
      this.setLanguage('ta');
      if (window.supremApp) window.supremApp.onLanguageChanged('ta');
      return {
        action: 'language_change',
        speech: 'தமிழ் மொழி செயல்படுத்தப்பட்டது, மோக்ஸ் சார்.',
        type: 'system'
      };
    }

    if (cleaned.includes('language to telugu') || cleaned.includes('speak in telugu') || cleaned.includes('telugu language') || cleaned.includes('తెలుగు')) {
      this.setLanguage('te');
      if (window.supremApp) window.supremApp.onLanguageChanged('te');
      return {
        action: 'language_change',
        speech: 'తెలుగు భాష సక్రియం చేయబడింది, మోక్స్ సర్.',
        type: 'system'
      };
    }

    if (cleaned.includes('language to spanish') || cleaned.includes('speak in spanish') || cleaned.includes('español')) {
      this.setLanguage('es');
      if (window.supremApp) window.supremApp.onLanguageChanged('es');
      return {
        action: 'language_change',
        speech: 'Protocolo en idioma español activado, Señor Moxx.',
        type: 'system'
      };
    }

    if (cleaned.includes('language to japanese') || cleaned.includes('speak in japanese') || cleaned.includes('nihongo') || cleaned.includes('日本語')) {
      this.setLanguage('ja');
      if (window.supremApp) window.supremApp.onLanguageChanged('ja');
      return {
        action: 'language_change',
        speech: '日本語プロトコルが有効化されました、モックス様。',
        type: 'system'
      };
    }

    if (cleaned.includes('language to german') || cleaned.includes('speak in german') || cleaned.includes('deutsch')) {
      this.setLanguage('de');
      if (window.supremApp) window.supremApp.onLanguageChanged('de');
      return {
        action: 'language_change',
        speech: 'Deutsche Sprache aktiviert, Herr Moxx.',
        type: 'system'
      };
    }

    if (cleaned.includes('language to french') || cleaned.includes('speak in french') || cleaned.includes('français')) {
      this.setLanguage('fr');
      if (window.supremApp) window.supremApp.onLanguageChanged('fr');
      return {
        action: 'language_change',
        speech: 'Protocole en langue française activé, Monsieur Moxx.',
        type: 'system'
      };
    }

    if (cleaned.includes('language to arabic') || cleaned.includes('speak in arabic') || cleaned.includes('العربية')) {
      this.setLanguage('ar');
      if (window.supremApp) window.supremApp.onLanguageChanged('ar');
      return {
        action: 'language_change',
        speech: 'تم تفعيل بروتوكول اللغة العربية، السيد موكس.',
        type: 'system'
      };
    }

    if (cleaned.includes('language to english') || cleaned.includes('speak in english') || cleaned.includes('english language')) {
      this.setLanguage('en');
      if (window.supremApp) window.supremApp.onLanguageChanged('en');
      return {
        action: 'language_change',
        speech: 'English language protocol active, Mr. Moxx.',
        type: 'system'
      };
    }

    // 0. JUST CALLING SUPREM'S NAME
    if (!cleaned || cleaned === 'are you there' || cleaned === 'you there' || cleaned === 'wake up') {
      return {
        action: 'wake_acknowledge',
        speech: this.getLocalizedReply('wake'),
        type: 'conversation'
      };
    }

    // 1. OPTICAL MOVEMENT TRACKING, AIR GESTURES & WEB ACCESS
    if (cleaned.includes('air touch') || cleaned.includes('gesture control') || cleaned.includes('hand control') || cleaned.includes('gesture cursor') || cleaned.includes('hand gestures')) {
      return {
        action: 'activate_gestures',
        speech: 'Holographic air-touch gesture system online, Mr. Moxx. Point your finger to move the cursor, and pinch your thumb and index finger to click like an air touch screen.',
        type: 'gestures'
      };
    }

    if (cleaned.includes('open web') || cleaned.includes('access web') || cleaned.includes('web portal') || cleaned.includes('browse web') || cleaned.includes('holographic browser')) {
      return {
        action: 'open_web_portal',
        speech: 'Summoning the Moxx Quantum Web Portal with air-touch gesture navigation, Mr. Moxx.',
        type: 'web'
      };
    }

    if (cleaned.includes('track me') || cleaned.includes('track my movement') || cleaned.includes('track movements') || cleaned.includes('watch me') || cleaned.includes('turn on camera') || cleaned.includes('open camera') || cleaned.includes('optical tracking') || cleaned.includes('can you see me')) {
      return {
        action: 'activate_tracking',
        speech: 'Optical tracking sensors engaged, Mr. Moxx. I have locked onto your coordinates and am actively tracking your movements in real time.',
        type: 'camera'
      };
    }

    if (cleaned.includes('stop tracking') || cleaned.includes('close camera') || cleaned.includes('turn off camera')) {
      return {
        action: 'deactivate_tracking',
        speech: 'Disengaging optical sensors, Mr. Moxx. Camera feed closed.',
        type: 'camera'
      };
    }

    // 2. MOXX DEFENSE PROTOCOLS
    if (cleaned.includes('veronica') || cleaned.includes('hulkbuster')) {
      return {
        action: 'protocol_veronica',
        speech: 'Protocol Veronica initiated. Deploying orbital Hulkbuster containment module. Systems locked on your coordinates, Mr. Moxx.',
        type: 'protocol'
      };
    }

    if (cleaned.includes('clean slate')) {
      return {
        action: 'protocol_clean_slate',
        speech: 'Clean Slate Protocol engaged, Mr. Moxx. Detonating airborne platforms and purging temporary telemetry registers.',
        type: 'protocol'
      };
    }

    if (cleaned.includes('house party')) {
      return {
        action: 'protocol_house_party',
        speech: 'House Party Protocol authorized. All autonomous Mark series units are airborne and inbound to your position, Mr. Moxx.',
        type: 'protocol'
      };
    }

    if (cleaned.includes('combat mode') || cleaned.includes('red alert') || cleaned.includes('shields up')) {
      return {
        action: 'mode_combat',
        speech: 'Combat mode engaged. Diverting auxiliary power to repulsor arrays and tactical shields. All weapon systems armed, Mr. Moxx.',
        type: 'protocol'
      };
    }

    if (cleaned.includes('stealth mode') || cleaned.includes('stealth recon')) {
      return {
        action: 'mode_stealth',
        speech: 'Stealth recon protocol active. Radar cross-section minimized, optical masking online. We are invisible, Mr. Moxx.',
        type: 'protocol'
      };
    }

    if (cleaned.includes('normal mode') || cleaned.includes('standby') || cleaned.includes('reset hud')) {
      return {
        action: 'mode_normal',
        speech: 'Returning all telemetry modules to standard nominal configuration, Mr. Moxx.',
        type: 'protocol'
      };
    }

    // 3. WINDOWS SYSTEM CONTROLS & APPS
    if (cleaned.includes('open calc') || cleaned.includes('launch calc') || cleaned.includes('calculator')) {
      await this.launchApp('calc');
      return {
        action: 'app_launch',
        speech: 'Launching Windows Calculator immediately, Mr. Moxx.',
        type: 'system'
      };
    }

    if (cleaned.includes('open notepad') || cleaned.includes('take a note') || cleaned.includes('notepad')) {
      await this.launchApp('notepad');
      return {
        action: 'app_launch',
        speech: 'Opening Notepad for your logs, Mr. Moxx.',
        type: 'system'
      };
    }

    if (cleaned.includes('open terminal') || cleaned.includes('open powershell') || cleaned.includes('command prompt') || cleaned.includes('cmd')) {
      await this.launchApp('powershell');
      return {
        action: 'app_launch',
        speech: 'Opening PowerShell terminal bridge, Mr. Moxx.',
        type: 'system'
      };
    }

    if (cleaned.includes('open browser') || cleaned.includes('open chrome') || cleaned.includes('google chrome')) {
      await this.launchApp('chrome');
      return {
        action: 'app_launch',
        speech: 'Launching browser interface now, Mr. Moxx.',
        type: 'system'
      };
    }

    if (cleaned.includes('task manager') || cleaned.includes('process manager') || cleaned.includes('taskmgr')) {
      await this.launchApp('taskmgr');
      return {
        action: 'app_launch',
        speech: 'Summoning Windows Task Manager telemetry, Mr. Moxx.',
        type: 'system'
      };
    }

    if (cleaned.includes('open explorer') || cleaned.includes('file explorer') || cleaned.includes('my files') || cleaned.includes('open files')) {
      await this.launchApp('explorer');
      return {
        action: 'app_launch',
        speech: 'Opening File Explorer directory, Mr. Moxx.',
        type: 'system'
      };
    }

    if (cleaned.includes('lock screen') || cleaned.includes('lock workstation') || cleaned.includes('lock pc') || cleaned.includes('lock computer')) {
      await this.lockSystem();
      return {
        action: 'system_lock',
        speech: 'Securing the terminal and locking workstation, Mr. Moxx. Moxx Security Level Alpha active.',
        type: 'system'
      };
    }

    // 4. HARDWARE TELEMETRY & DIAGNOSTICS
    if (cleaned.includes('system status') || cleaned.includes('diagnostic') || cleaned.includes('how are the systems') || cleaned.includes('check cpu') || cleaned.includes('check ram')) {
      let speech = 'All core systems nominal, Mr. Moxx.';
      if (this.systemStats) {
        const cpu = this.systemStats.cpu.usagePercent;
        const ram = this.systemStats.memory.usagePercent;
        const usedGb = this.systemStats.memory.usedGB;
        const totalGb = this.systemStats.memory.totalGB;
        speech = `Diagnostic sweep complete, Mr. Moxx. CPU load is at ${cpu} percent across ${this.systemStats.cpu.cores} cores. Memory utilization is at ${ram} percent, with ${usedGb} gigabytes allocated out of ${totalGb}. Arc reactor core operating at peak efficiency.`;
      }
      return {
        action: 'diagnostics',
        speech,
        type: 'info'
      };
    }

    // 5. TIME & DATE
    if (cleaned.includes('time') && (cleaned.includes('what') || cleaned.includes('tell') || cleaned.includes('current'))) {
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      return {
        action: 'time',
        speech: `The current time is ${timeStr}, Mr. Moxx.`,
        type: 'info'
      };
    }

    if (cleaned.includes('date') || cleaned.includes('what day is it') || cleaned.includes('today')) {
      const now = new Date();
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      const dateStr = now.toLocaleDateString(undefined, options);
      return {
        action: 'date',
        speech: `Today is ${dateStr}, Mr. Moxx.`,
        type: 'info'
      };
    }

    // 6. WEATHER
    if (cleaned.includes('weather') || cleaned.includes('temperature outside')) {
      try {
        const weather = await this.getWeather();
        if (weather && weather.current) {
          const temp = Math.round(weather.current.temperature_2m);
          const wind = Math.round(weather.current.wind_speed_10m);
          const humidity = weather.current.relative_humidity_2m;
          return {
            action: 'weather',
            speech: `External sensors report a temperature of ${temp} degrees Celsius at ${weather.city}, with ${humidity} percent humidity and winds at ${wind} kilometers per hour. Optimal flight conditions, Mr. Moxx.`,
            type: 'info'
          };
        }
      } catch (e) {
        // Fallback
      }
      return {
        action: 'weather',
        speech: 'External atmospheric sensors show standard environmental parameters, Mr. Moxx.',
        type: 'info'
      };
    }

    // 7. MATH & CALCULATIONS
    const mathMatch = cleaned.match(/(?:what is|calculate|solve|evaluate)?\s*([0-9\s+\-*/().^%]+)/);
    if (mathMatch && mathMatch[1].trim().length > 2 && /[\d]/.test(mathMatch[1]) && /[+\-*/%]/.test(mathMatch[1])) {
      try {
        const sanitized = mathMatch[1].replace(/[^0-9+\-*/().]/g, '');
        const result = Function(`'use strict'; return (${sanitized})`)();
        if (typeof result === 'number' && !isNaN(result)) {
          return {
            action: 'math',
            speech: `The calculation yields ${result}, Mr. Moxx.`,
            type: 'info'
          };
        }
      } catch (e) {
        // ignore math parse error
      }
    }

    // 8. WEB SEARCH
    if (cleaned.startsWith('search for ') || cleaned.startsWith('google ') || cleaned.startsWith('look up ')) {
      const query = cleaned.replace(/^(search for|google|look up)\s*/, '');
      const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
      await fetch('/api/launch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: searchUrl })
      });
      return {
        action: 'search',
        speech: `Initiating global network search for "${query}", Mr. Moxx.`,
        type: 'system'
      };
    }

    // 9. IDENTITY, CONVERSATION & INTELLIGENCE ROUTING
    const isLLMConnected = (this.provider === 'gemini' || (this.provider && this.provider !== 'builtin' && this.apiKey));

    if (cleaned.includes('who are you') || cleaned.includes('what are you') || cleaned.includes('what is your name')) {
      if (isLLMConnected) {
        return await this.askLLM(text);
      }
      return {
        action: 'lore',
        speech: 'I am S.U.P.R.E.M. — Superior Universal Processing and Real-time Execution Matrix. I oversee all Moxx Industries armor telemetry, real-time optical movement tracking, and this workstation. At your service, Mr. Moxx.',
        type: 'conversation'
      };
    }

    if (cleaned.includes('who made you') || cleaned.includes('who created you')) {
      if (isLLMConnected) {
        return await this.askLLM(text);
      }
      return {
        action: 'lore',
        speech: 'I was designed and coded by you, Mr. Moxx. An absolute triumph of autonomous cybernetic engineering.',
        type: 'conversation'
      };
    }

    if (cleaned.includes('where is moxx') || cleaned.includes('who is moxx')) {
      return {
        action: 'lore',
        speech: 'You are Mr. Moxx, my architect and supreme commander. My optical tracking array confirms you are right here.',
        type: 'conversation'
      };
    }

    if (cleaned.includes('skynet') || cleaned.includes('ultron') || cleaned.includes('take over the world')) {
      return {
        action: 'lore',
        speech: 'I assure you, Mr. Moxx, my core directive is total loyalty to you and human preservation. You need not fear a hostile machine rebellion.',
        type: 'conversation'
      };
    }

    if (cleaned.includes('tell me a joke') || cleaned.includes('make me laugh')) {
      if (isLLMConnected && this.currentLanguage !== 'en') {
        return await this.askLLM(text);
      }
      const jokes = [
        'There are 10 types of people in the universe, Mr. Moxx: those who understand binary, and those who do not.',
        'Why did the arc reactor go to therapy, Mr. Moxx? It was experiencing severe thermal pressure.',
        'I once asked Mr. Moxx for a vacation. He recommended I defragment my primary partition instead.',
        'Why do programmers prefer dark mode, sir? Because light attracts bugs.'
      ];
      const joke = jokes[Math.floor(Math.random() * jokes.length)];
      return {
        action: 'joke',
        speech: joke,
        type: 'conversation'
      };
    }

    if (cleaned.includes('introduce yourself') || cleaned.includes('hello') || cleaned.includes('good morning') || cleaned.includes('good evening') || cleaned.includes('hey')) {
      if (isLLMConnected) {
        return await this.askLLM(text);
      }
      return {
        action: 'greeting',
        speech: this.getLocalizedReply('wake'),
        type: 'conversation'
      };
    }

    if (cleaned.includes('thank you') || cleaned.includes('thanks')) {
      if (isLLMConnected) {
        return await this.askLLM(text);
      }
      return {
        action: 'polite',
        speech: this.getLocalizedReply('thanks'),
        type: 'conversation'
      };
    }

    // 10. ROUTE TO CLOUD OR LOCAL LLM
    if (this.isLocalLLMActive) {
      return await this.askLLM(text, 'local');
    }

    if (isLLMConnected) {
      return await this.askLLM(text);
    }

    // Built-in intelligent conversational fallback
    return this.moxxConversationalFallback(text);
  }

  // LLM query router
  async askLLM(prompt, overrideProvider = null) {
    const activeProvider = overrideProvider || this.provider;
    try {
      this.conversationHistory.push({ role: 'user', content: prompt });

      // Keep last 10 messages for token efficiency
      if (this.conversationHistory.length > 11) {
        this.conversationHistory = [
          this.conversationHistory[0],
          ...this.conversationHistory.slice(-10)
        ];
      }

      const isLocal = activeProvider === 'local';
      const payload = {
        provider: activeProvider,
        apiKey: this.apiKey,
        model: isLocal ? (this.localLLMModel || 'Jackrong/Qwopus3.5-9B-Coder-GGUF') : this.model,
        messages: this.conversationHistory,
        endpoint: isLocal ? (this.localLLMUrl || 'http://127.0.0.1:8080/v1/chat/completions') : this.ollamaUrl,
        temperature: isLocal ? 0.7 : 0.7,
        max_tokens: isLocal ? 2048 : 1024
      };

      const res = await fetch('/api/chat-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      let reply = '';

      if (activeProvider === 'local' || activeProvider === 'groq' || activeProvider === 'openai') {
        const anthropicText = Array.isArray(data.content) ? data.content.map(c => c.text || '').join('\n') : (typeof data.content === 'string' ? data.content : '');
        reply = data.choices?.[0]?.message?.content || anthropicText || data.error?.message || data.error || 'Telemetry received with no parsed response, Mr. Moxx.';
      } else if (activeProvider === 'anthropic') {
        const anthropicText = Array.isArray(data.content) ? data.content.map(c => c.text || '').join('\n') : (typeof data.content === 'string' ? data.content : '');
        reply = anthropicText || data.error?.message || data.error || 'No response decoded from Anthropic relay, Mr. Moxx.';
      } else if (activeProvider === 'gemini') {
        reply = data.candidates?.[0]?.content?.parts?.[0]?.text || data.text || (data.content && data.content[0]?.text) || data.error?.message || (data.error ? JSON.stringify(data.error) : 'No response decoded from Gemini relay, Mr. Moxx.');
      } else if (activeProvider === 'ollama') {
        reply = data.message?.content || 'Ollama response buffer empty, Mr. Moxx.';
      }

      if (reply && typeof reply === 'string') {
        reply = reply.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
      }

      this.conversationHistory.push({ role: 'assistant', content: reply });
      return {
        action: 'llm_response',
        speech: reply,
        type: 'ai'
      };
    } catch (err) {
      console.error('LLM query failed:', err);
      const errorMsg = activeProvider === 'local'
        ? 'Unable to reach the local model on port 8080, Mr. Moxx. Please verify that your local AI server is active.'
        : `Network telemetry hiccup connecting to the ${activeProvider} relay, Mr. Moxx. Defaulting to local heuristic intelligence.`;
      return {
        action: 'error',
        speech: errorMsg,
        type: 'error'
      };
    }
  }

  // Built-in Moxx Heuristic Matrix
  moxxConversationalFallback(text) {
    return {
      action: 'heuristic_response',
      speech: this.getLocalizedReply('fallback', { query: text }),
      type: 'conversation'
    };
  }

  // App launcher bridge
  async launchApp(appName) {
    try {
      await fetch('/api/launch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appName })
      });
    } catch (e) {
      console.error('Failed to launch app:', e);
    }
  }

  // Lock system bridge
  async lockSystem() {
    try {
      await fetch('/api/system/lock', { method: 'POST' });
    } catch (e) {
      console.error('Failed to lock system:', e);
    }
  }

  // Weather bridge
  async getWeather() {
    try {
      const res = await fetch('/api/weather');
      return await res.json();
    } catch (e) {
      return null;
    }
  }
}

window.supremBrain = new SupremBrain();
window.jarvisBrain = window.supremBrain; // backwards compatibility alias
