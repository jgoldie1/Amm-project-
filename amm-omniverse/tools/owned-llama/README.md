# StreetVerse owned Llama → HoloGPT: tested local gateway

The existing `/api/ai/answer` adapter already supports a private OpenAI-compatible inference endpoint. This tool adds a **runnable local proxy** for one Ollama model, with a separate random bearer token, prompt limits and local-only listener. It does not download or run a model itself and **does not prove a live deployed model**.

## Minimum viable setup on a Linux or desktop machine

1. Install Ollama using the official instructions for your operating system: https://ollama.com/download
2. Download a compact dialogue model. Its published download size is approximately 1.3 GB; runtime memory/disk requirements vary:

```bash
ollama pull llama3.2:1b
ollama serve
```

Run `ollama serve` only if Ollama is not already running; keep it on localhost.

3. In a *separate terminal*, from the `amm-omniverse` directory, generate a local token (never commit it):

```bash
export HOLO_LLAMA_PROXY_TOKEN="$(openssl rand -hex 32)"
export HOLOGPT_SELFHOST_MODEL="llama3.2:1b"
node tools/owned-llama/holo-llama-gateway.mjs
```

The gateway listens at `http://127.0.0.1:4117`. Do not bind to a public IP or forward port 11434/4117 onto the open Internet.

4. With the **same token** in the calling server environment, test an actual inference, not just configuration:

```bash
curl --fail-with-body -H "Authorization: Bearer $HOLO_LLAMA_PROXY_TOKEN" http://127.0.0.1:4117/health
curl --fail-with-body -H "Authorization: Bearer $HOLO_LLAMA_PROXY_TOKEN" \
  -H "Content-Type: application/json" \
  http://127.0.0.1:4117/v1/chat/completions \
  -d '{"model":"llama3.2:1b","messages":[{"role":"user","content":"As KIT AI, give one original fictional StreetVerse mission line."}],"stream":false}'
```

Expect a valid `choices[0].message.content` response. Mock tests alone do not verify the downloaded model.

## Connect to Vercel / HoloGPT

A Vercel-hosted app cannot reach `localhost` on your Chromebook. After locally validating inference, deploy this proxy on a dedicated server **behind private, authenticated HTTPS networking**, with access controls, monitoring, rate limits and agreed costs. A plaintext public HTTP tunnel is not acceptable. The proxy itself always listens on loopback; use a carefully reviewed reverse proxy or private tunnel to forward only the authenticated chat/health paths.

Set **server-only** environment variables in the actual HoloGPT deployment (never `VITE_` keys):

```dotenv
HOLOGPT_SELFHOST_BASE=https://your-secure-inference-host.example/v1
HOLOGPT_SELFHOST_MODEL=llama3.2:1b
HOLOGPT_SELFHOST_API_KEY=<same-random-secret-as-proxy>
HOLOGPT_SELFHOST_PREFERRED=true
HOLOGPT_TIMEOUT_MS=45000
```

The HTTPS domain above is a placeholder, not a running endpoint. Do not copy private tokens into chats, GitHub, or browser code. Confirm Vercel account reactivation first; that is an independent account-level blocker. Use `GET /api/ai/health` for configuration, and a real `POST /api/ai/answer` (expect provider `hologpt-selfhost` and `degraded:false`) to prove inference.

## Verification

```bash
node --test tests/hologpt-owned-llama-gateway.test.mjs
node --test tests/streetverse-holocreator-bridge-contract.mjs
npm run typecheck
npm run build
```

The new GitHub workflow performs these checks in a clean runner; a build is only certified when its run succeeds. The separate `tryamm-device-certification.yml` requires **actual user-attested** Chrome/Chromebook playtesting on the deployed commit; no emulator or CI run may forge that.

## Hardware and spending

A 1B Llama model is a pragmatic inexpensive test target, not evidence of a uniquely trained TRYAMM-owned model. If you have your *own weights or LoRA*, specify their actual installed Ollama model ID instead. Start with small context and no background calls. Nothing here buys GPU hosting, activates an account, moves credits, publishes Reels or replaces BJ's tested v6 assets.
