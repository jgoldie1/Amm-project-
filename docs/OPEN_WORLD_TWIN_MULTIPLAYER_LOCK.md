# TRYAMM Open World / Twin World — Canonical Multiplayer Baseline

Status: LOCKED BASELINE

Do not replace this architecture with a client-authoritative shortcut.

## Core loop
CLIENT INPUT → AUTHENTICATED SERVER → SESSION → SERVER TICK → VALIDATION → WORLD SNAPSHOT → CLIENT RECONCILIATION → CLOUD CHECKPOINT.

Authoritative state includes at minimum:
- health
- position/rotation/velocity
- Faith Deck
- Holographic Deck
- inventory
- collectibles
- XP
- Beans
- mission state
- party state
- district/zone state
- anti-cheat/security metadata

## Player journey
SOLO TUTORIAL → SHARED CITY → FIRST CO-OP MISSION → REWARD → CLOUD SAVE → CONTINUE ON ANOTHER DEVICE.

Primary first shared experience: `Welcome to AMM City`.
Primary first co-op mission: `District Rescue`.

## Quality modes
PERFORMANCE → BALANCED → CINEMATIC.

Clients: WEB / MOBILE / OMNI BOX / later VR-MR.

## Authoritative multiplayer completion path
1. Supabase migration + RLS verification.
2. Authenticated Socket.IO/WebSocket server.
3. Server runtime integration and fixed authoritative tick.
4. Renderer snapshot interpolation + local prediction/reconciliation.
5. Cloud-save/checkpoint adapter.
6. Welcome to AMM City persistence.
7. District Rescue shared/co-op mission state.
8. Matchmaking, party, reconnect and session-resume UI.
9. Anti-cheat/security validation and exploit tests.
10. Multi-client functional tests.
11. Load + zone-sharding tests.
12. Deployed authoritative server.

## Map / Twin World
Real-world mapping/satellite/terrain layers are provider adapters, not gameplay authority. The authoritative world server owns player/game state even if the renderer uses external map, satellite, terrain or 3D-tile providers.

Twin World can combine:
- open-world fictional districts
- opt-in real-world map/terrain context
- user-created worlds
- business/store/world twins
- mission overlays
- HoloGPT/JARVIS guidance

External maps imagery, satellite data, addresses and routing must obey provider licensing and attribution requirements.

## Security
Never trust client claims for health, XP, Beans, collectibles, inventory, rewards, mission completion, teleporting or payment-linked rewards. Server validates input rate, movement envelope, state transitions, mission eligibility and reward issuance.

## Status language
`AUTHORITATIVE MULTIPLAYER CORE — CODED` means domain/runtime code exists.
`CODED → INTEGRATED` requires the client and server to exchange authenticated real-time state and persist checkpoints.
`TESTED` requires real multi-client evidence.
`LIVE` requires deployed authoritative infrastructure and monitoring.
