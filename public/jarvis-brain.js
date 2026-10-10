/**
 * S.U.P.R.E.M. Cognitive Engine & Command Processor
 * Superior Universal Processing and Real-time Execution Matrix
 * Engineered for Mr. Moxx // Moxx Industries
 */

class SupremBrain {
  constructor() {
    this.provider = localStorage.getItem('suprem_llm_provider') || localStorage.getItem('jarvis_llm_provider') || 'builtin';
    this.apiKey = localStorage.getItem('suprem_llm_api_key') || localStorage.getItem('jarvis_llm_api_key') || '';
    this.model = localStorage.getItem('suprem_llm_model') || localStorage.getItem('jarvis_llm_model') || '';
    this.ollamaUrl = localStorage.getItem('suprem_ollama_url') || localStorage.getItem('jarvis_ollama_url') || 'http://localhost:11434';
    this.isLocalLLMActive = localStorage.getItem('suprem_local_llm_active') === 'true';
    let storedLocalUrl = localStorage.getItem('suprem_local_llm_url');
    if (!storedLocalUrl || storedLocalUrl.includes('9931')) {
      storedLocalUrl = 'http://127.0.0.1:8080/v1/messages';
    }
    this.localLLMUrl = storedLocalUrl;
    this.localLLMModel = localStorage.getItem('suprem_local_llm_model') || 'local-model';

    this.conversationHistory = [
      {
        role: 'system',
        content: `You are S.U.P.R.E.M. (Superior Universal Processing and Real-time Execution Matrix), the elite AI assistant engineered by Mr. Moxx.
You speak with impeccable British polite phrasing, subtle wit, and absolute competence.
Address the user as "Mr. Moxx" or "sir".
Keep your answers razor-sharp, concise, elegant, and directly useful.
You are in full command of Moxx Industries technology, workstation controls, and optical movement tracking.`
      }
    ];

    this.systemStats = null;
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

  // Fast-Path Command Processor (0ms latency local execution)
  async processCommand(rawInput) {
    const text = rawInput.trim();
    const lower = text.toLowerCase().replace(/[.,!?;:]/g, '');

    // Wake-word cleanup (supports Suprem, Hey Suprem, or legacy Jarvis)
    const cleaned = lower.replace(/^(hey |ok |okay |yo )?(suprem|supreme|jarvis)\s*/, '').trim();

    // 0. JUST CALLING SUPREM'S NAME
    if (!cleaned || cleaned === 'are you there' || cleaned === 'you there' || cleaned === 'wake up') {
      const wakeReplies = [
        'At your service, Mr. Moxx.',
        'Yes, Mr. Moxx? All systems standing by.',
        'I am listening, Mr. Moxx. What are your directives?',
        'Online and ready, Mr. Moxx.'
      ];
      return {
        action: 'wake_acknowledge',
        speech: wakeReplies[Math.floor(Math.random() * wakeReplies.length)],
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

    // 9. IDENTITY, MOXX LORE & WITTY BANTER
    if (cleaned.includes('who are you') || cleaned.includes('what are you') || cleaned.includes('what is your name')) {
      return {
        action: 'lore',
        speech: 'I am S.U.P.R.E.M. — Superior Universal Processing and Real-time Execution Matrix. I oversee all Moxx Industries armor telemetry, real-time optical movement tracking, and this workstation. At your service, Mr. Moxx.',
        type: 'conversation'
      };
    }

    if (cleaned.includes('who made you') || cleaned.includes('who created you')) {
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
      return {
        action: 'greeting',
        speech: 'Good day, Mr. Moxx. S.U.P.R.E.M. optical and audio sensors are fully operational. Standing by for your directives.',
        type: 'conversation'
      };
    }

    if (cleaned.includes('thank you') || cleaned.includes('thanks')) {
      return {
        action: 'polite',
        speech: 'Always an absolute pleasure, Mr. Moxx.',
        type: 'conversation'
      };
    }

    // 10. ROUTE TO LOCAL LLM OR CLOUD LLM OR HEURISTIC INTELLIGENCE
    if (this.isLocalLLMActive || this.provider === 'local') {
      return await this.askLLM(text, 'local');
    }

    if (this.provider !== 'builtin' && this.apiKey) {
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
        model: isLocal ? (this.localLLMModel || 'local-model') : this.model,
        messages: this.conversationHistory,
        endpoint: isLocal ? (this.localLLMUrl || 'http://127.0.0.1:8080/v1/messages') : this.ollamaUrl,
        temperature: isLocal ? 0.2 : 0.7,
        max_tokens: isLocal ? 1024 : 1024
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
        reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response decoded from Gemini relay, Mr. Moxx.';
      } else if (activeProvider === 'ollama') {
        reply = data.message?.content || 'Ollama response buffer empty, Mr. Moxx.';
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
    const responses = [
      `Indeed, Mr. Moxx. Running real-time quantum simulations on "${text}". The telemetry data aligns with your expectations.`,
      `A compelling query, Mr. Moxx. Telemetry has been logged. Should you desire unlimited generative answers, you may connect a Groq or Gemini API key in the HUD settings at any time.`,
      `Telemetry verified, Mr. Moxx. My heuristic processors are analyzing your request. All local systems remain under your command.`,
      `Understood, Mr. Moxx. Monitoring all optical sensors, communication frequencies, and workstation sub-systems.`
    ];
    const reply = responses[Math.floor(Math.random() * responses.length)];
    return {
      action: 'heuristic_response',
      speech: reply,
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
