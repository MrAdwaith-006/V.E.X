const express = require('express');
const cors = require('cors');
const http = require('http');
const { WebSocketServer } = require('ws');
const os = require('os');
const { exec } = require('child_process');
const path = require('path');

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
    const lat = req.query.lat || '40.7128';
    const lon = req.query.lon || '-74.0060';
    const city = req.query.city || 'Moxx Citadel';

    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&hourly=temperature_2m&temperature_unit=celsius`
    );
    const data = await response.json();
    res.json({ city, ...data });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch weather data', details: err.message });
  }
});

// LLM Proxy endpoint to avoid CORS issues
app.post('/api/chat-proxy', async (req, res) => {
  const { provider, apiKey, model, messages, temperature = 0.7 } = req.body;

  try {
    if (provider === 'groq') {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
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
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
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
      const geminiModel = model || 'gemini-1.5-flash';
      const contents = messages.map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }));
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents })
      });
      const data = await response.json();
      return res.json(data);
    } else if (provider === 'ollama') {
      const ollamaUrl = req.body.endpoint || 'http://localhost:11434';
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
        ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
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
  console.log(`  [MOXX INDUSTRIES] S.U.P.R.E.M. ONLINE ON PORT ${PORT}`);
  console.log(`  ACCESS HUD: http://localhost:${PORT}`);
  console.log(`======================================================\n`);
});
