# S.U.P.R.E.M. Environment Configuration Directory

This directory stores environment variable configurations and templates for **S.U.P.R.E.M.** (Superior Universal Processing and Real-time Execution Matrix).

## Available Files

- `.env.development` - Pre-configured development settings with temporary mock values and Anthropic Claude integration.
- `.env.production` - Recommended production settings template.
- `.env.example` - Generic template demonstrating all available variables.

---

## Environment Variable Reference

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `PORT` | `3000` | Port for Express & WebSocket telemetry server. |
| `NODE_ENV` | `development` | Runtime environment mode (`development` or `production`). |
| `ANTHROPIC_API_KEY` | *(None)* | API key for Anthropic Claude models (`sk-ant-...`). |
| `ANTHROPIC_MODEL` | `claude-3-5-sonnet-20241022` | Default Anthropic model (e.g. `claude-3-5-sonnet-20241022`, `claude-3-5-haiku-20241022`). |
| `LOCAL_LLM_URL` | `http://127.0.0.1:8080/v1/messages` | Local Anthropic-compatible LLM inference endpoint (port 8080). |
| `LOCAL_LLM_MODEL` | `local-model` | Model name identifier sent to the local LLM server. |
| `LOCAL_LLM_TYPE` | `anthropic` | Set to `anthropic` for `/v1/messages` format, or `openai` for `/v1/chat/completions`. |
| `OLLAMA_URL` | `http://localhost:11434` | Ollama API endpoint for local offline inference. |
| `GROQ_API_KEY` | *(None)* | Server-level API key for Groq Cloud inference (e.g. LLaMA 3.3). |
| `OPENAI_API_KEY` | *(None)* | Server-level API key for OpenAI (e.g. GPT-4o). |
| `GEMINI_API_KEY` | *(None)* | Server-level API key for Google Gemini models. |
| `DEFAULT_LLM_PROVIDER` | `anthropic` | Default cognitive engine provider (`anthropic`, `local`, `groq`, `openai`, `gemini`, `ollama`). |
| `DEFAULT_LLM_MODEL` | `claude-3-5-sonnet-20241022` | Default AI model name. |
| `WEATHER_CITY` | `Moxx Citadel` | City display name for the atmospheric weather widget. |
| `WEATHER_LAT` | `40.7128` | Latitude for Open-Meteo telemetry queries. |
| `WEATHER_LON` | `-74.0060` | Longitude for Open-Meteo telemetry queries. |

---

## How S.U.P.R.E.M. Loads Environment Variables

`server.js` checks for a `.env` file at the root directory of the project upon startup:
1. When running Node.js 20.6.0+, it utilizes native `process.loadEnvFile(path.join(__dirname, '.env'))`.
2. For earlier Node versions, it falls back to a built-in line parser.
3. If no root `.env` exists, it automatically falls back to `env/.env.development`.

To activate one of the configurations in this directory, copy it to the root `.env`:

```bash
# On Windows (PowerShell)
Copy-Item env/.env.development .env
```
