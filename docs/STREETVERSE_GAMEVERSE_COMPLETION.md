# StreetVerse / GameVerse Completion

Status: AUTHORITATIVE MULTIPLAYER CORE CODED; CLOUD + RENDERER INTEGRATION NEXT

## Preserve existing baseline
- Existing StreetVerse prototype: `openworld.html` / Holo Deck direction.
- Existing server combat direction: `services/openworld.js` behind authenticated routes.
- Existing cloud-save direction: Supabase `game_saves` with user ownership/RLS.
- Shared progression: health, position, Faith Deck, Holographic Deck, inventory, collectibles, XP, Beans, achievements and cross-game identity.
- Shared SDK direction: `packages/amm-game-sdk`.
- Existing renderer direction: reuse current Three.js renderer/avatar/camera/scene and load worlds from `worlds.json`; future worlds are data-driven rather than new loaders.

## StreetVerse launch levels
### Level 1 — Welcome to AMM City
Purpose: onboarding + movement + social + first mission.
- holographic skyline and wayfinding
- safe spawn plaza
- JARVIS/HoloGPT tutorial
- walk/run/jump/interaction
- first vehicle introduction
- first NPC schedules
- first collectible + Beans reward
- first cloud checkpoint
- multiplayer presence and emotes

### Level 2 — District Rescue
Purpose: cooperative gameplay and persistent world consequences.
- mission briefing
- team matchmaking/party entry
- district event state
- civilians/NPC objectives
- optional vehicle route
- co-op tasks and combat/avoidance encounters
- shared objective progress
- server-authoritative completion
- XP/Beans/inventory reward
- checkpoint/cloud save

## Graphics progression
1. Preserve existing playable renderer.
2. Add scalable quality tiers: Performance / Balanced / Cinematic.
3. Use LOD, instancing, pooled effects and streaming districts.
4. Holographic visual language: spatial HUD, JARVIS guidance, mission beacons, portals and diegetic status panels.
5. Accessibility inherits Accessibility Passport: reduced motion/flashing, captions, remappable/one-handed controls, readable HUD and alternate cues.
6. Add day/night/weather only after authoritative world state can synchronize it.

## Multiplayer runtime
CLIENT INPUT → AUTH SERVER → SESSION → AUTHORITATIVE TICK → VALIDATION → WORLD SNAPSHOT → CLIENT PREDICTION/RECONCILIATION → PERSIST CHECKPOINT.

Required:
- authenticated account/session
- rooms/instances
- party/matchmaking
- presence
- synchronized transforms/state
- event stream
- reconnect ticket
- disconnect grace period
- server-side movement/combat validation
- rate limiting/anti-cheat hooks
- world/zone interest management
- match/session capacity
- spectator/replay hooks

## Cloud account persistence
Canonical persistence writes:
- account/player profile
- current world
- checkpoint
- XP/level
- Beans
- inventory
- collectibles
- Faith Deck
- Holographic Deck
- achievements
- mission completion
- settings/accessibility
- last device/session

Conflict rule: server-authored save version wins; client may submit intent/delta but cannot overwrite authoritative progression with arbitrary values.

## Cross-device continuation
WEB / MOBILE / OMNI BOX / LATER VR-MR
→ sign in
→ resolve Passport/player profile
→ load latest cloud save
→ restore checkpoint/world
→ rejoin active session when eligible
→ continue.

## Gameplay expansion
After two launch levels are stable:
- vehicles and transit
- creator-built missions under moderation
- districts/world streaming
- NPC schedules/economy
- crews/parties
- tournaments and events
- housing/business spaces
- sports/minigames
- Holo Marketplace portals
- Community Missions
- AR/VR/MR clients

## Production status gates
- CONCEPT: future systems/hardware.
- CODED: authoritative domain model exists.
- INTEGRATED: server transport + auth + renderer + Supabase wired.
- TESTED: two or more real clients synchronize, reconnect and persist correctly.
- GATED: abuse/load/security checks pass.
- LIVE: production deployment and monitoring confirmed.

## Completion checklist
1. Apply/verify Supabase migrations and RLS.
2. Implement authenticated multiplayer server adapter (Socket.IO/WebSocket).
3. Wire `authoritativeMultiplayer.ts` to server process.
4. Wire existing renderer to snapshot interpolation/prediction.
5. Add cloud save adapter and version/conflict handling.
6. Implement Welcome to AMM City checkpoint flow.
7. Implement District Rescue co-op objective state.
8. Add matchmaking/party/reconnect UI.
9. Add anti-cheat/rate limit tests.
10. Add multi-client integration tests.
11. Add load test/zone sharding threshold.
12. Deploy authoritative server and verify production telemetry.

StreetVerse/GameVerse must not be called production multiplayer until steps 1–12 are evidenced.
