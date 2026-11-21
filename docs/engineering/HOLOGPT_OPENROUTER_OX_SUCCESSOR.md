# Former Ox Alpha model — OpenRouter integration for HoloGPT

OpenRouter's `stealth/ox-alpha` was identified as Z.ai GLM-5.3-Flash.
Use `z-ai/glm-5.3-flash`; **do not rely on the retired preview slug**
or assume preview-era free pricing.

## What the branch adds
- Server-only opt-in model adapter for **HoloGPT text responses** (including
  coding questions related to StreetVerse, TRYAMM and MiddleVerse).
- The existing HoloGPT priority order remains: Vercel gateway, OpenAI,
  **opted-in OpenRouter successor**, existing compatible provider, Ollama,
  Stubbs Gateway, then local degraded response. A failed call (including 402)
  continues through the existing fallback loop.
- No client-side key, automatic GitHub edits, automatic model installations,
  paid asset generation, payments or deployments.
- Max 1,024 generated tokens per request. **Not a monetary quota**: actual
  billing can still occur, especially for long prompts. Use OpenRouter's
  account limits and explicit permission before enabling.

## Configuration (server environment only)
```sh
HOLOGPT_OPENROUTER_ENABLED=true
OPENROUTER_API_KEY=<server-only secret from OpenRouter>
```
Do not paste the key into a GitHub file or a client-side VITE variable.
Do not place personal/private business data in prompts without reviewing
provider retention terms. Until both settings exist, **zero OpenRouter
requests** are made by this adapter.

## Tests
```sh
node --test test/openrouter-ox-successor.test.js
```
The test mocks all provider traffic; it cannot prove live provider
availability, token billing, or production readiness.

## GitHub versus model weights
The OpenRouter API model is **not a GitHub source-code repository**.
A GitHub project may contain clients, benchmarks or adapters but does not
provide unrestricted rights to train, modify, or self-host the model. The
separately linked model weights have their own license and hardware requirements.

To make this an autonomous engineering worker, a separate, human-approved
GitHub PR workflow, sandbox, cost controls, review, tests and rollback gate
must be added first. A language-model chat response alone may not push code.
