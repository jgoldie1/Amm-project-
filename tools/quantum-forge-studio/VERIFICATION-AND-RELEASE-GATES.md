# Quantum Forge 8.0 release gate — 2026-10-30

## Evidence
- Headless Chromium mobile-viewport test executed against standalone character preview via Playwright set_content. Animation selection, pause status and benchmark button worked; zero page errors. This is **not** a Vite integration or real GLB rendering test.
- Recovered GLB loader now references four preserved NPC types with idle/walk/run variants and size/header checks. Real binary download and animation playback are **not yet verified**. These NPCs must not be labeled BJ Stubbs.
- Upload security policy and license gating are **library functions only**, not an authenticated server endpoint. Never accept public uploads or publish files based on client claims.
- AI provider adapter submits a job request to a configured endpoint. No actual image/text generative model backend has been deployed.
- Print STL output is experimental. No thickness verification, healing, slicing or physical printer validation.
- WebXR code checks availability; no immersive session or headset validation.

## Critical blockers before release
1. Download original GLBs through authenticated/reliable asset delivery, verify SHA-256 against preservation manifest, confirm CORS, skinning and actual embedded clips. Test glTF parse and dispose. Keep immutable backups.
2. Connect recovered GLB loader to studio route behind feature flag, implement idle/walk/run mixer transitions and validate skeleton/scale, then wire to StreetVerse movement controls and collisions.
3. Deploy isolated preview with Vite and run Playwright Chromium/WebKit mobile and desktop smoke tests, uploads, touch, accessibility, performance and regression tests.
4. Add server-side identity, owner proof, content scanning, quotas, rate limiting, private storage, moderation, license receipts, copyright/consent handling, and abuse reporting before customer uploads.
5. Integrate an approved AI generation provider or a hosted open-weight model with queue, async polling, retries, budgets and output validation; benchmark equivalent prompts against competitors.
6. Implement mesh healing, real-world unit conversion, wall thickness, watertight manifold checks, support generation through a vetted slicer and physical print tests.
7. Implement actual WebXR immersive sessions and test supported hardware; keep non-XR fallback.
8. Add transactional publishing, payouts/refunds and audit logs; no paid storefront until checkout and delivery are verified.

## Honest benchmark dimensions
Record prompt, seed, input reference, device/GPU, generation time, human geometry score, texture score, rig success, exported size, FPS on phone, real costs and license restrictions. Compare only with equivalent conditions.

## Preservation
Do not merge or deploy this branch to production without gates. Do not overwrite original GLB assets.
