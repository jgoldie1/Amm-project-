# Quantum Racer 3D v0.5

Status: SPECIFIED / CONTINUATION OF v0.4

## Preserved baseline
- persistent garage and car selection
- GO SPEED mode with 5 AI opponents
- Battle Racing pickups
- damage system
- weather + day/night
- pause / restart / garage flow
- Node.js authoritative-server scaffold
- Kenosha family drivers/cars
- GO Monkey
- 10 worlds
- loops, corkscrews, wall rides, sky roads, holographic routes
- mods
- Race Radio
- championships
- shared Championship Engine
- Legacy / charity ledgers

## v0.5 target
Move from developer-alpha racing loop to a complete multiplayer race-session loop:
`MATCHMAKE → LOBBY → GRID → COUNTDOWN → CHECKPOINT/LAP VALIDATION → POWERS → FINISH → RESULTS → XP/REWARDS → CLOUD SAVE → NEXT RACE`.

## 1. Authoritative multiplayer
Server is authoritative for:
- room/match creation
- player identity and selected vehicle loadout
- race start time/countdown
- checkpoint order
- lap count
- finish eligibility
- pickup spawn/claim
- power activation/cooldown
- results placement
- XP/reward grants
- disconnect/reconnect state

Client predicts local movement for responsiveness but cannot award itself a lap, pickup, finish, XP, currency, or prize.

## 2. Matchmaking
Queues:
- Quick Race
- Battle Race
- Ranked Championship
- Friends/Family Crew
- Private Room
- Practice with AI fill

Match preferences:
- world/track pool
- assist level
- controller/accessibility needs
- cross-platform capability
- region/latency target

Do not use accessibility settings as a negative skill/rank factor.

## 3. Checkpoints and lap integrity
Each track declares an ordered checkpoint graph plus finish gate.
Server tracks `lastValidCheckpoint`, lap, wrong-way state and checkpoint timestamps.
Skipping or reversing checkpoints does not complete a lap.
Recovery/reset returns the racer to a safe validated point with a fair time penalty where competitive rules require it.

## 4. Battle Racing powers
Power types can include shield, boost, EMP-style temporary disruption, repair, decoy, traction assist and track-specific fantasy powers.
Rules:
- server grants pickup
- client requests activation
- server validates possession/cooldown/target/race state
- no power can permanently disable another player
- reduced-flashing/photosensitivity alternatives
- ranked modes use a fixed approved power set

## 5. Results + progression
Result record:
- match ID
- player ID
- car/loadout ID
- finish position
- finish time
- best lap
- checkpoints completed
- penalties
- disconnect/reconnect state
- XP earned
- achievements
- championship points
- legacy/community/charity allocation metadata where the event rules enable it

## 6. Cloud save
Persist:
- garage ownership/unlocks
- car cosmetics and approved mods
- control/accessibility settings
- XP/level
- championships
- track/world unlocks
- achievements
- crew membership
- Race Radio preferences

Money/prize balances remain separate from gameplay XP and are never client-authoritative.

## 7. Championship Engine
Event types:
- daily cups
- weekly championships
- family/crew cups
- world tour
- creator/community events
- charity showcase events
- esports/ranked season later

Official rules govern eligibility, scoring, ties, disconnections, prizes, geographic restrictions and sponsor/charity allocations. Real-money or prize competition stays gated until legal/provider approval exists.

## 8. Vehicle JARVIS integration
Vehicle JARVIS acts as the in-race assistant layer:
- navigation/track callouts
- pit/repair suggestions
- weather/traction warnings
- accessibility voice commands
- energy/boost status
- strategy suggestions

It cannot secretly steer/brake in competitive play unless an explicitly defined assist mode permits it. Assist modes are disclosed in matchmaking/rules.

## 9. Accessibility
- remappable controls
- one-handed presets
- switch/controller/keyboard abstraction where supported
- voice commands for menus and selected non-timing-critical actions
- hold/toggle alternatives
- scalable HUD
- high contrast
- non-color-only indicators
- reduced motion
- photosensitivity filters
- subtitle/caption support for Race Radio/commentary
- adjustable single-player difficulty

## 10. Anti-cheat / trust
- authoritative checkpoints/laps/results
- rate limits for gameplay events
- impossible-speed/teleport sanity checks
- duplicate pickup prevention
- signed session identity
- reconnect tokens
- replayable race telemetry for disputes
- moderation/reporting for multiplayer chat/voice

## 11. Monetization boundary
Safe launch monetization can include cosmetics, car skins, garage themes, Race Radio cosmetics/content where licensed, battle-pass-like seasonal cosmetic progression only if transparent, and sponsorships.
Avoid pay-to-win performance advantages in ranked competition.
Real-money prizes, betting or lottery mechanics are separate gated products and are not enabled by this racing spec.

## 12. What v0.5 completion means
CODED is not LIVE.
For v0.5 to be called TESTED:
- 2+ real clients complete a server-authoritative race
- reconnect works
- checkpoint skipping fails
- pickup double-claim fails
- results are deterministic
- XP/cloud-save writes are idempotent
- accessibility smoke tests pass
- no client can directly grant itself rewards
