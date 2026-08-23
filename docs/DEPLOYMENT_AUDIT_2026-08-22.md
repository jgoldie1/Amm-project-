# TRYAMM Deployment Audit — 2026-08-22

## Executive result

The repository contains a working Express/Socket.IO application, static PWA shell, HoloGPT routes, Stubbs AI modules, Supabase REST helpers, Stripe checkout wiring, release gates, and a large `amm-omniverse/src` TypeScript concept/runtime tree. The main blocker is not missing ideas; it is release truth: several systems exist in source but are not yet proven in the deployed environment.

## GREEN — verified in source

- Node 20 application entry point exists and starts through `server.js` with the modular preload layer.
- `/api/health`, authentication, rooms, chat signaling, creator activation, gifts, reporting, checkout, admin summary, music APIs, HoloGPT and Stubbs AI routes exist.
- PWA service worker uses network-first navigation and explicitly bypasses cache for `/api/*`.
- Blockchain is locked behind an audit hold by default.
- CI configuration runs syntax checks and smoke tests.
- HoloGPT has explicit degraded mode instead of pretending an external model is configured.

## YELLOW — implemented but not live-verified

- Supabase REST support exists, but production credentials and migration state cannot be verified from repository contents.
- Stripe checkout exists, but secret key/webhook configuration and a real payment webhook path are not proven here.
- HoloGPT supports OpenAI, OpenAI-compatible endpoints, Ollama and a Stubbs gateway, but the live provider configuration is not visible in source control.
- Socket.IO/WebRTC signaling exists, but multi-device live video still needs an external deployed two-device test including NAT/TURN behavior.
- The service worker has a versioned cache and network-first navigation, but installed PWAs still need a deployed upgrade/reload test on iOS/Android.
- Many immersive systems exist under `amm-omniverse/src`, but they are not part of the root Node build and must not be called deployed gameplay until wired into a browser/game runtime.

## RED — release blockers found

1. **Render auto-deploy was disabled.** The previous `render.yaml` used `autoDeploy: false`, so GitHub changes could be correct while the Render URL remained old. This audit changes it to `autoDeploy: true`.
2. **Render blueprint omitted HoloGPT/Stubbs AI configuration slots.** The service could therefore run in `local-degraded` mode even though the UI existed. This audit adds the required provider environment-variable declarations without committing secrets.
3. **Existing smoke tests mostly verify that files and strings exist, not that the server actually boots and routes work.** This audit adds `test/http-runtime-smoke.js`, which starts the real server, hits health, registers a user, checks HoloGPT health, performs authenticated HoloGPT chat in degraded mode and verifies API 404 behavior.
4. **`package-lock.json` does not describe the current `package.json`.** The lock identifies a different package (`cleanapp`) and different dependencies (`express@5`, `multer`) while the current app declares `express@4`, `socket.io`, and `stripe`. Until the lockfile is regenerated from the current package, deployment must use `npm install`, not `npm ci`.
5. **The repository contains tracked `node_modules`.** `.gitignore` now ignores it, but previously committed dependencies remain in Git history/tree, creating unnecessary repository weight and risk of platform-specific/stale modules. Remove tracked `node_modules` in a dedicated cleanup commit after a correct lockfile is generated.
6. **Core auth/session/live-room state still uses `data/store.json`.** On ephemeral hosting this is not durable production state. Supabase-backed persistence must replace or wrap users, sessions, rooms, purchases, reports and creator ledger before the platform is considered production-safe.
7. **Live Render health could not be independently confirmed from this audit environment.** A successful source audit is not deployment proof. The deployed release must return healthy responses from `/api/health` and `/api/hologpt/health` after the branch is merged and deployed.

## Required release order

1. Merge this deployment-fix branch after CI passes.
2. Confirm Render service is linked to the repository/branch and redeploys the merged commit.
3. Set `APP_URL`, Supabase credentials and at least one authorized HoloGPT provider in Render.
4. Run deployed `/api/health` and `/api/hologpt/health` checks.
5. Register/login from two separate devices and verify session behavior.
6. Verify Socket.IO room join/chat, then WebRTC camera/microphone across two networks.
7. Apply and verify Supabase migrations/RLS; migrate durable auth/state away from `data/store.json`.
8. Configure Stripe test-mode secrets and webhook, complete a test checkout, and reconcile the ledger.
9. Regenerate and commit `package-lock.json`; then change CI/Render to `npm ci`.
10. Remove tracked `node_modules`.
11. Wire selected `amm-omniverse/src` modules into an actual build/runtime before labeling those worlds playable.
12. Keep blockchain disabled until the independent audit evidence gates are satisfied.

## Release truth

A feature is GREEN only when source, build, environment, database/migrations, API/auth, deployment and live smoke evidence all agree. Source-only modules remain YELLOW until connected and tested; conceptual or unwired systems remain RED for launch purposes.
