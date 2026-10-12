const express = require('express');
const cors = require('cors');
const http = require('http');
const { WebSocketServer } = require('ws');
const os = require('os');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const dns = require('dns');
try {
  dns.setDefaultResultOrder('ipv4first');
} catch (e) {}

// Load environment variables from the env/ directory
try {
  const isProd = process.env.NODE_ENV === 'production';
  const envCandidates = [
    path.join(__dirname, 'env', isProd ? '.env.production' : '.env.development'),
    path.join(__dirname, 'env', '.env'),
    path.join(__dirname, '.env'),
    path.join(__dirname, 'env', '.env.local')
  ];

  for (const envFile of envCandidates) {
    if (fs.existsSync(envFile)) {
      try {
        const lines = fs.readFileSync(envFile, 'utf8').split(/\r?\n/);
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith('#')) continue;
          const [k, ...v] = trimmed.split('=');
          if (k) process.env[k.trim()] = v.join('=').trim();
        }
      } catch (err) {}
    }
  }
} catch (e) {
  // Ignore missing or unreadable .env file
}

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// CPU calculation helper
let prevCpus = os.cpus();
function getCpuUsage() {
  const currentCpus = os.cpus();
  let totalIdle = 0;
  let totalTick = 0;

  for (let i = 0; i < currentCpus.length; i++) {
    const cpu = currentCpus[i];
    const prev = prevCpus[i];
    if (!prev) continue;

    const idle = cpu.times.idle - prev.times.idle;
    let tick = 0;
    for (const type of Object.keys(cpu.times)) {
      tick += cpu.times[type] - prev.times[type];
    }
    totalIdle += idle;
    totalTick += tick;
  }

  prevCpus = currentCpus;
  if (totalTick === 0) return 0;
  const percentage = 100 - Math.round((100 * totalIdle) / totalTick);
  return Math.max(0, Math.min(100, percentage));
}

// System stats aggregator
function getSystemStats() {
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  const memPercent = Math.round((usedMem / totalMem) * 100);

  const cpus = os.cpus();
  const cpuModel = cpus.length > 0 ? cpus[0].model : 'Unknown Processor';
  const cpuCores = cpus.length;
  const cpuUsage = getCpuUsage();

  const uptimeSeconds = os.uptime();
  const hours = Math.floor(uptimeSeconds / 3600);
  const minutes = Math.floor((uptimeSeconds % 3600) / 60);
  const seconds = Math.floor(uptimeSeconds % 60);
  const uptimeStr = `${hours}h ${minutes}m ${seconds}s`;

  return {
    cpu: {
      model: cpuModel,
      cores: cpuCores,
      usagePercent: cpuUsage
    },
    memory: {
      totalGB: (totalMem / (1024 ** 3)).toFixed(1),
      usedGB: (usedMem / (1024 ** 3)).toFixed(1),
      freeGB: (freeMem / (1024 ** 3)).toFixed(1),
      usagePercent: memPercent
    },
    os: {
      platform: os.platform(),
      release: os.release(),
      hostname: os.hostname(),
      arch: os.arch(),
      uptime: uptimeStr,
      uptimeSeconds
    },
    timestamp: Date.now()
  };
}

// REST endpoints
app.get('/api/system', (req, res) => {
  res.json(getSystemStats());
});

// App launcher endpoint for Windows
app.post('/api/launch', (req, res) => {
  const { appName, url } = req.body;

  if (url) {
    exec(`start "" "${url}"`, (error) => {
      if (error) {
        return res.status(500).json({ success: false, error: error.message });
      }
      return res.json({ success: true, message: `Opened URL: ${url}` });
    });
    return;
  }

  const appMap = {
    calculator: 'calc.exe',
    calc: 'calc.exe',
    notepad: 'notepad.exe',
    terminal: 'start powershell.exe',
    powershell: 'start powershell.exe',
    cmd: 'start cmd.exe',
    explorer: 'explorer.exe',
    taskmgr: 'taskmgr.exe',
    taskmanager: 'taskmgr.exe',
    chrome: 'start chrome',
    browser: 'start https://google.com',
    code: 'code',
    settings: 'start ms-settings:',
    spotify: 'start spotify:'
  };

  const command = appMap[appName?.toLowerCase()];
  if (!command) {
    return res.status(400).json({ success: false, error: `Unrecognized application: ${appName}` });
  }

  exec(command, (error) => {
    if (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
    res.json({ success: true, message: `Launched ${appName}` });
  });
});

// Windows Lock screen
app.post('/api/system/lock', (req, res) => {
  exec('rundll32.exe user32.dll,LockWorkStation', (error) => {
    if (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
    res.json({ success: true, message: 'Workstation locked' });
  });
});

// Weather API via Open-Meteo (No API key needed)
app.get('/api/weather', async (req, res) => {
  try {
    const lat = req.query.lat || process.env.WEATHER_LAT || '40.7128';
    const lon = req.query.lon || process.env.WEATHER_LON || '-74.0060';
    const city = req.query.city || process.env.WEATHER_CITY || 'Moxx Citadel';

    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&hourly=temperature_2m&temperature_unit=celsius`
    );
    const data = await response.json();
    res.json({ city, ...data });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch weather data', details: err.message });
  }
});

// Config telemetry endpoint (provides default LLM provider & models)
app.get('/api/config', (req, res) => {
  res.json({
    defaultProvider: process.env.DEFAULT_LLM_PROVIDER || 'local',
    defaultModel: process.env.DEFAULT_LLM_MODEL || 'Jackrong/Qwopus3.5-9B-Coder-GGUF',
    localUrl: process.env.LOCAL_LLM_URL || 'http://127.0.0.1:8080/v1/chat/completions',
    localModel: process.env.LOCAL_LLM_MODEL || 'Jackrong/Qwopus3.5-9B-Coder-GGUF',
    hasGeminiKey: !!process.env.GEMINI_API_KEY,
    geminiKey: process.env.GEMINI_API_KEY || '',
    hasAnthropicKey: !!process.env.ANTHROPIC_API_KEY,
    hasOpenAiKey: !!process.env.OPENAI_API_KEY,
    hasGroqKey: !!process.env.GROQ_API_KEY
  });
});

// LLM Proxy endpoint to avoid CORS issues
app.post('/api/chat-proxy', async (req, res) => {
  const { provider, apiKey, model, messages, temperature = 0.7 } = req.body;

  try {
    if (provider === 'groq') {
      const activeKey = apiKey || process.env.GROQ_API_KEY;
      if (!activeKey) return res.status(400).json({ error: 'Groq API Key not configured' });
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${activeKey}`
        },
        body: JSON.stringify({
          model: model || 'llama-3.3-70b-versatile',
          messages,
          temperature,
          max_tokens: 1024
        })
      });
      const data = await response.json();
      return res.json(data);
    } else if (provider === 'openai') {
      const activeKey = apiKey || process.env.OPENAI_API_KEY;
      if (!activeKey) return res.status(400).json({ error: 'OpenAI API Key not configured' });
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${activeKey}`
        },
        body: JSON.stringify({
          model: model || 'gpt-4o',
          messages,
          temperature,
          max_tokens: 1024
        })
      });
      const data = await response.json();
      return res.json(data);
    } else if (provider === 'gemini') {
      const activeKey = apiKey || process.env.GEMINI_API_KEY;
      if (!activeKey) return res.status(400).json({ error: 'Gemini API Key not configured' });
      
      let geminiModel = model || process.env.DEFAULT_LLM_MODEL || 'gemini-3.8-flash';
      if (geminiModel === 'gemini-1.5-flash' || geminiModel === 'gemini-2.5-flash' || geminiModel === 'gemini-flash-latest') {
        geminiModel = 'gemini-3.8-flash';
      }

      // Extract system instructions if present
      const systemMessage = messages.find(m => m.role === 'system')?.content;

      // Filter non-system messages and alternate turns to satisfy Gemini API requirements
      const filtered = messages.filter(m => m.role !== 'system');
      const contents = [];
      for (const m of filtered) {
        const role = m.role === 'assistant' ? 'model' : 'user';
        if (contents.length > 0 && contents[contents.length - 1].role === role) {
          contents[contents.length - 1].parts[0].text += '\n' + (m.content || '');
        } else {
          contents.push({
            role,
            parts: [{ text: m.content || '' }]
          });
        }
      }

      if (contents.length === 0) {
        contents.push({ role: 'user', parts: [{ text: 'Status report' }] });
      }

      const requestPayload = { contents };
      if (systemMessage) {
        requestPayload.system_instruction = {
          parts: [{ text: systemMessage }]
        };
      }

      const callGemini = async (mod) => {
        return await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${mod}:generateContent?key=${activeKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestPayload)
        });
      };

      let response = await callGemini(geminiModel);
      let data = await response.json();

      // If model not found (404), fallback smoothly
      if (!response.ok && data.error?.code === 404) {
        const fallbacks = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.5-flash'];
        for (const fb of fallbacks) {
          if (fb === geminiModel) continue;
          response = await callGemini(fb);
          data = await response.json();
          if (response.ok) break;
        }
      }

      if (!response.ok) {
        return res.status(response.status).json({ error: data.error?.message || `Gemini API error ${response.status}`, details: data });
      }

      return res.json(data);
    } else if (provider === 'anthropic') {
      const activeKey = apiKey || process.env.ANTHROPIC_API_KEY;
      if (!activeKey) return res.status(400).json({ error: 'Anthropic API Key not configured' });
      const anthropicModel = model || process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022';

      // Anthropic requires system prompt at the top level and alternating user/assistant roles
      const systemMessage = messages.find(m => m.role === 'system')?.content;
      const anthropicMessages = messages
        .filter(m => m.role !== 'system')
        .map(m => ({
          role: m.role === 'user' ? 'user' : 'assistant',
          content: m.content
        }));

      if (anthropicMessages.length === 0) {
        anthropicMessages.push({ role: 'user', content: 'Status report' });
      }

      const requestBody = {
        model: anthropicModel,
        max_tokens: req.body.max_tokens || 1024,
        messages: anthropicMessages
      };
      if (systemMessage) requestBody.system = systemMessage;
      if (temperature !== undefined) requestBody.temperature = temperature;

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': activeKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify(requestBody)
      });
      const data = await response.json();
      if (!response.ok) {
        return res.status(response.status).json({ error: data.error?.message || `Anthropic error: ${response.status}`, details: data });
      }
      return res.json(data);
    } else if (provider === 'ollama') {
      const ollamaUrl = req.body.endpoint || process.env.OLLAMA_URL || 'http://localhost:11434';
      const response = await fetch(`${ollamaUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: model || 'llama3',
          messages,
          stream: false
        })
      });
      const data = await response.json();
      return res.json(data);
    } else if (provider === 'local') {
      let localUrl = req.body.endpoint || process.env.LOCAL_LLM_URL || 'http://127.0.0.1:8080/v1/chat/completions';
      if (localUrl.includes('8080') && localUrl.includes('/messages')) {
        localUrl = localUrl.replace('/messages', '/chat/completions');
      }
      const localModel = model || process.env.LOCAL_LLM_MODEL || 'Jackrong/Qwopus3.5-9B-Coder-GGUF';
      const isAnthropicType = (req.body.llmType === 'anthropic' || process.env.LOCAL_LLM_TYPE === 'anthropic') && !localUrl.includes('8080') && !localUrl.includes('/chat/completions');

      let localBody;
      let headers = { 'Content-Type': 'application/json' };

      if (isAnthropicType) {
        const systemMessage = messages.find(m => m.role === 'system')?.content;
        const anthropicMessages = messages
          .filter(m => m.role !== 'system')
          .map(m => ({
            role: m.role === 'user' ? 'user' : 'assistant',
            content: m.content
          }));
        localBody = {
          model: localModel,
          max_tokens: req.body.max_tokens || 2048,
          messages: anthropicMessages.length ? anthropicMessages : [{ role: 'user', content: 'Status report' }]
        };
        if (systemMessage) localBody.system = systemMessage;
        if (req.body.temperature !== undefined) localBody.temperature = req.body.temperature;
        headers['anthropic-version'] = '2023-06-01';
        if (apiKey || process.env.ANTHROPIC_API_KEY) {
          headers['x-api-key'] = apiKey || process.env.ANTHROPIC_API_KEY;
        }
      } else {
        // OpenAI-compatible format (llama-server)
        localBody = {
          model: localModel,
          messages,
          temperature: req.body.temperature !== undefined ? req.body.temperature : 0.7,
          max_tokens: req.body.max_tokens || 2048
        };
      }

      const response = await fetch(localUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(localBody)
      });
      if (!response.ok) {
        const errorText = await response.text();
        return res.status(response.status).json({ error: `Local LLM error: ${response.status}`, details: errorText });
      }
      const data = await response.json();

      // Clean thinking tags from Qwopus / DeepSeek / Qwen models for clean speech and HUD display
      if (data.choices?.[0]?.message?.content) {
        data.choices[0].message.content = data.choices[0].message.content.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
      }

      return res.json(data);
    } else {
      return res.status(400).json({ error: 'Unsupported provider' });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// WebSocket for high-frequency telemetry stream
wss.on('connection', (ws) => {
  ws.send(JSON.stringify({ type: 'telemetry', data: getSystemStats() }));

  const interval = setInterval(() => {
    if (ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify({ type: 'telemetry', data: getSystemStats() }));
    }
  }, 1000);

  ws.on('message', (message) => {
    try {
      const parsed = JSON.parse(message);
      if (parsed.type === 'ping') {
        ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now(), sendTime: parsed.sendTime }));
      }
    } catch (e) {
      // ignore
    }
  });

  ws.on('close', () => {
    clearInterval(interval);
  });
});

server.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`  [MOXX INDUSTRIES] V.E.X. [MVEX OS] ONLINE ON PORT ${PORT}`);
  console.log(`  ACCESS HUD: http://localhost:${PORT}`);
  console.log(`======================================================\n`);
});
