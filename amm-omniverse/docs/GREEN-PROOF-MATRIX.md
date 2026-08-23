# TRYAMM / HoloGPT / Holoverse GREEN Proof Matrix

Locked sequence:

ALL PAGES → ONE ROUTE MAP → API HEALTH → HOLOGPT FULL RESPONSE → AUTH → PERSISTENT STATE → SERVICE WORKER/CACHE → DEPLOYMENT → LIVE SMOKE TEST → GREEN PROOF

## Status rules

- GREEN = live evidence exists.
- YELLOW = code exists but live proof is incomplete.
- RED = known failure or missing configuration.
- PLANNED = design only; never reported as working.

## Current engineering split

### Engineer agent
Builds and repairs code. It may edit source, but it cannot self-certify GREEN.

### Senior engineer agent
Reviews architecture, security, route duplication, state consistency, data boundaries, accessibility, error handling, retries, provider fallbacks, regression risk, and deployment assumptions. A blocking finding returns the work to Engineer.

### Verifier agent
Runs independent checks and records evidence. Only the verifier can recommend GREEN after live production checks succeed.

## Multi-model HoloGPT architecture

HoloGPT is the orchestration layer, not a single third-party model.

- OpenAI: general reasoning, coding, multimodal/vision when the configured model supports it.
- Gemini: multimodal reasoning and failover.
- Claude: senior-review/long-context/coding-review lane.
- DeepSeek: coding/reasoning and lower-cost failover lane.
- AMM backend: private TRYAMM/Stubbs AI provider or gateway.
- OpenCrawl: retrieval/RAG ingestion only; it is not treated as a language model.
- Holoverse: world/application layer using one identity, one route map, one persistent world state, and HoloGPT as the assistant/orchestrator.

No third-party provider becomes a source of truth. Git stores source/release history; Supabase stores authenticated user/world state; cited retrieval stores provenance; browser storage is only an ephemeral UI cache.

## Gates

| Gate | Required evidence | Current code state |
|---|---|---|
| ALL PAGES | every exposed page/overlay reachable and no orphan navigation | YELLOW — registry introduced, live crawl still required |
| ONE ROUTE MAP | route registry owns screen/overlay navigation | YELLOW — canonical registry/coordinator added |
| API HEALTH | production health endpoints return expected status | YELLOW — endpoints exist; provider configuration must be verified live |
| HOLOGPT FULL RESPONSE | production smoke returns a non-degraded model response | RED until a provider credential/model is reachable |
| AUTH | Supabase session accepted and unauthorized access rejected where required | YELLOW — auth path exists; live positive/negative tests required |
| PERSISTENT STATE | state survives reload/login/device where intended | YELLOW — Living Worlds bridge exists; live persistence test required |
| SERVICE WORKER/CACHE | new deploy appears without stale shell/asset regression | YELLOW — cache bust/network-first repair added; live device check required |
| DEPLOYMENT | latest commit reaches production successfully | YELLOW until latest commit is confirmed READY |
| LIVE SMOKE TEST | `/api/ai/smoke` and route checks pass in production | RED until non-degraded response is observed |
| GREEN PROOF | verifier evidence links commit → deployment → checks | RED until all previous gates pass |

## Gap policy

Do not solve a RED/YELLOW gate by adding unrelated features. Fix the blocking gate first. Do not duplicate HoloGPT, Holoverse, route state, auth state, or world state to work around a defect.
