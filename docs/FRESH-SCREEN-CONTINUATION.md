# TRYAMM Fresh-Screen Continuation Contract

Updated: 2026-08-22

This file is the canonical handoff for continuing TRYAMM on a fresh ChatGPT screen, device, or developer session. Read this before making changes.

## Canonical repository

- Repository: `jgoldie1/Amm-project-`
- Default branch: `main`
- Runtime: Node.js 20+, Express, Socket.IO, Stripe
- Primary server: `server.js`
- App start: `node -r ./lib/content-engine-preload.js server.js`
- Existing smoke/check scripts live in `package.json` and `test/`.
- The `amm-omniverse/` tree contains the larger game, world, HoloGPT, science, space and simulation architecture.

## Non-negotiable continuity rule

Every feature must map into one canonical route map, one auth state, one character/user state, one world-memory state, one release truth and one deployment target. Do not create disconnected duplicate pages when an existing route/module can be extended.

Before declaring anything complete:

1. Find the existing implementation.
2. Wire frontend -> route/API -> persistence/runtime.
3. Run syntax checks.
4. Run smoke tests.
5. Verify the route in the deployed environment.
6. Record evidence in Git history.

## Immediate repair priority

The current priority is not to add hundreds of isolated screens. It is to make the existing app reliable end-to-end:

- Route registry and dead-link audit across every public page.
- HoloGPT/Stubbs AI full-response path: UI -> `/api` route -> tri-brain/runtime -> provider/local-model adapter -> response -> conversation memory.
- Single deployment manifest for Render/Vercel-compatible runtime configuration.
- Persistent project state so a fresh session can resume without relying on chat memory.
- Service-worker/PWA cache versioning so stale pages and icons are not served after deploys.
- Health/readiness endpoints for public proof.

## Platform expansion registry

These are approved product directions to integrate as modules, not separate disconnected projects.

### Media + creator operating system

- Immersive OTT marketplace and channel guide, positioned as a creator/network operating system rather than a Roku copy.
- Multi-destination live streaming control plane with per-platform adapters, permissions and stream-health telemetry.
- Creator academy, Christian record-label academy and streaming academy.
- Creator trend intelligence inspired by public market behavior, without copying private data or impersonating specific creators.
- Consent-based AI image/video tools. No non-consensual impersonation or deceptive deepfakes.

### Marketplace + housing

- Assumable-mortgage discovery lane with verification, lender/servicer disclosures and clear eligibility status; never imply a mortgage is assumable until verified.
- Immersive 3D listings/marketplace and agent-owner workflows.
- National business discovery/growth engine beginning with Black-owned business directories and expanding state-by-state using lawful public/licensed data, opt-out controls and anti-spam rules.

### Accessibility + rehabilitation technology

- Neuromuscular/exosuit research and assistive-control interface as a medical-device research track only. No unsupported treatment claims.
- Hands-free and alternative-input UX, including switch, gaze, voice and future BCI adapters.
- “Mind control” game mode must be implemented through real supported hardware inputs (for example EEG/BCI devices) or simulated accessibility controls; do not claim thought-reading without hardware evidence.
- Lung/respiratory cooling concepts remain an R&D track requiring biomedical/thermal engineering validation before any health claim or deployment.

### Games + worlds

- `Dante: Escape From Hell — Set Apart Edition`: original faith-themed action/adventure interpretation using public-domain source inspiration and original art/story/dialogue.
- Warren/Quarantine Zone game-space registry for survival, containment and mission scenarios.
- Faith/Bible worlds must use the user-authored Bible/metaverse-Bible assets when they are actually present in the repository; do not claim they are integrated until a file/route audit verifies them.
- Subscription design should optimize long-term retention, satisfaction and value—not dark patterns or trapping users.

### AI + agents

- HoloGPT/Stubbs AI as the main orchestrator.
- Optional local-model adapters: Ollama and compatible Hugging Face/open models.
- Model router with provider fallbacks, cost/latency policies and safety gates.
- RAG layer with source provenance, embeddings/vector storage and citations.
- Agent workflows using n8n-compatible webhooks/workflows where appropriate.
- Email/call-center/virtual-agent adapters through authorized providers and secrets only.
- Git-backed source-code memory: commit history is the release ledger; machine-readable project state belongs in `config/project-state.json`.
- Reasoning/history storage should record decisions, inputs, outputs, tool evidence and commit references—not hidden chain-of-thought.

### Communications

Adapters may be added for authorized accounts/services such as LINE, Telegram, Discord, WhatsApp and other messaging platforms. Each integration must have its own credentials, rate limits, privacy boundaries and kill switch.

### Workstation / device nexus

Create one web-based command center for devices the user authorizes. It may synchronize project state, links, files, notifications and remote-control hooks where the target operating system and permissions allow. Do not bypass platform security or device consent.

### App-building / automation layer

- Floot may be used as an optional external build/deploy connector when installed and authorized; the canonical source of truth remains Git unless a deliberate migration is made.
- Build an internal “HoloForge” app-builder inspired by modern AI app builders: visual 3D/holographic workspace, AI-assisted page/component generation, route wiring, data models, preview, tests and deploy orchestration.
- Build an internal Godot-compatible game-authoring lane around open standards and export/import workflows rather than falsely claiming a clone of proprietary implementations.
- Automated open-source component discovery must preserve licenses, provenance and security scanning.

## Requested third-party research items

The following names/services from the 2026-08-22 request are research targets only until positively identified and licensed/authorized: “Ray Reynolds method”, “Alain Antonioe”, “Chris Brichwood/Birchwood”, “trenh.io”, Poyo/Photo AI services, Seedance/Kling APIs, and “Cyber Leaks manifesto”. Do not copy a person’s private resume, identity, voice, likeness or proprietary material. We can reproduce lawful public techniques, workflows and capabilities in an original implementation.

## Fresh-screen resume command

When a new session begins, use this instruction:

> Continue TRYAMM from `docs/FRESH-SCREEN-CONTINUATION.md` and `config/project-state.json` in `jgoldie1/Amm-project-`. Audit the current commit first, fix broken routes/runtime before adding new modules, run checks/tests, and record evidence in Git.

## Definition of done

A feature is GREEN only when all are true:

- source exists in Git;
- route is reachable;
- required secrets/config are present in the target environment;
- backend/runtime responds;
- persistence works where required;
- automated check/smoke test passes;
- deployed smoke test passes;
- accessibility fallback exists;
- telemetry/error handling exists;
- documentation/state registry is updated.

Anything else is `PLANNED`, `BUILT-UNVERIFIED`, or `BLOCKED`—never “finished.”
