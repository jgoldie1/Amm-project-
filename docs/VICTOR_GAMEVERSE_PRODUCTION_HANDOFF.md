# Victor Gameverse Production Handoff

## New control surface

Open `/game-production.html` after starting the app.

The dashboard manages production work for:

- original 3D characters and environments
- professional animation sets
- NPC behavior trees and memory hooks
- complete quest content
- soundtrack, voice acting and sound effects
- dedicated multiplayer infrastructure
- performance budgets
- large-scale QA
- balancing

## New backend

Mounted at `/api/game-production`.

Routes:

- `GET /summary`
- `GET /items`
- `POST /items`
- `PATCH /items/:category/:id`
- `POST /seed`

Write routes require `x-admin-key` matching `ADMIN_ACTION_KEY`.

## New migration

Apply after migration 017:

`supabase/migrations/202607140018_game_production_pipeline.sql`

It creates production items, asset versions and test-run records with row-level security.

## Required production gates

### 3D assets

- Original or commercially licensed content only
- Source files and license records retained
- LOD0–LOD3
- Rig, collision, navmesh and accessibility variants
- glTF/GLB for web plus approved Unity, Unreal and Godot exports
- Mobile and desktop budgets documented

### Animation

- Root-motion and in-place variants where needed
- Humanoid retargeting standard
- Facial blend shapes and subtitle timing
- One-handed and reduced-motion alternatives
- Animation-event audit for gameplay-critical actions

### NPC intelligence

- Server-authoritative state for multiplayer-impacting NPCs
- Behavior trees, blackboards and navigation
- Dialogue, reputation and quest hooks
- Memory retention limits and moderation filters
- Deterministic fallbacks when AI providers fail

### Multiplayer

- Regional dedicated servers
- Matchmaking, party, presence and reconnect
- State snapshots, interpolation and reconciliation
- Lag compensation and rate limits
- Anti-cheat, moderation, replay and telemetry
- Staging soak tests before production

### Audio

- Original score and licensed stems
- Voice contracts and performance releases
- Localization, captions and loudness targets
- Spatial and stereo fallbacks
- Music, dialogue and effects accessibility controls

### QA and balancing

- Functional, regression, accessibility, network, load, soak, security and device testing
- Server-verified scores and rewards
- Economy simulation and exploit testing
- Yogihoo creature matchup matrix
- StreetVerse mission pacing and district performance
- Every release linked to a build SHA and test report

## Victor commands

```bash
npm install
npm run ci
npm start
npm run game:worker
npm run game:load
```

Then open:

- `/game-launcher.html`
- `/game-production.html`

## Honest completion boundary

This update creates the frontend, backend, persistence schema and production-control workflow. It does not fabricate finished 3D models, recorded voice acting, complete maps or deployed regional servers. Those deliverables require the asset, audio, level-design, gameplay, infrastructure and QA teams to complete and approve the tracked production records.
