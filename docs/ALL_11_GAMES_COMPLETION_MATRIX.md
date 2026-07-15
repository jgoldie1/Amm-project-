# TryAMM Eleven-Game Completion Matrix

This document prevents prototypes, design records and production games from being described as the same thing.

## Shared platform now defined

All eleven games share the following planned production services:

- authenticated player profiles
- accessibility profiles and one-handed control preferences
- cloud saves with versioning and checksums
- inventory and progression events
- matchmaking queue records
- server-authoritative match records
- achievements
- replay metadata
- leaderboards and tournaments
- controller presets
- anti-cheat telemetry and review signals
- cross-device account ownership
- moderation, reporting and audit requirements

The JavaScript domain foundation is in `services/game-platform-core.js`.
The PostgreSQL/RLS foundation is in `supabase/migrations/202607140015_shared_game_platform.sql`.

## Title matrix

| Game | Current playable level | Required title-specific work |
|---|---|---|
| Gridiron X | Web prototype | football rules, teams, playbooks, animation, AI, seasons, online matches |
| Court Kings | Web prototype | basketball rules, rosters, shot clock, movement, AI, online matches |
| Diamond Legends | Web prototype | baseball fielding, pitching, batting, innings, rosters, AI, online matches |
| Ice Storm | Web prototype | skating physics, puck logic, penalties, teams, AI, online matches |
| World Pitch | Web prototype | ball physics, formations, clubs, referee rules, AI, online matches |
| Fight Night Holo | Web/VR prototype | hit detection, stamina, judging, fighter animation, ranked matches |
| StreetVerse | Open-world combat prototype/design | 3D city, streaming, vehicles, missions, NPC schedules, interiors, police/risk system, economy, multiplayer |
| Battlefront Zero | Shooter design foundation | weapon system, maps, movement, squads, authoritative hit validation, anti-cheat, ranked play |
| Yogihoo Arena | AR/card-battle prototype | creature roster, deck rules, progression, AR placement, online battles, balancing |
| Volcano Racers | Racing prototype | vehicle physics, tracks, collision, tuning, ghost/replay, online racing |
| Kingdom Builders | Strategy prototype | construction rules, resources, units, AI, economy, persistence, multiplayer |

## Production gate for every title

A game may be labelled Release Candidate only when all of these are demonstrated:

1. Complete core gameplay loop.
2. Original or licensed art, animation, music and sound.
3. Stable save/load and account ownership.
4. Device-specific controls and remapping.
5. Accessibility review.
6. Tutorial and onboarding.
7. Progression and rewards that cannot duplicate value.
8. Server-authoritative online rules where multiplayer is enabled.
9. Matchmaking, disconnect recovery and moderation.
10. Anti-cheat review and abuse reporting.
11. Performance targets on supported devices.
12. Unit, integration, multiplayer, load and end-to-end tests.
13. Privacy, youth safety and commerce review.
14. Store page, screenshots, age rating and support procedures.
15. Staged release, monitoring and rollback.

## Recommended order

1. Complete Yogihoo Arena as the first polished small-scope release.
2. Complete Volcano Racers or one sports title using the shared match platform.
3. Complete Battlefront Zero as the first server-authoritative action title.
4. Build StreetVerse in districts, beginning with one dense playable neighborhood rather than an entire world.
5. Reuse the stabilized platform for the remaining sports and strategy games.

## Intellectual-property rule

StreetVerse may be described internally as an open-world action game. Do not use GTA 6 branding, protected maps, characters, logos, audio, missions or copied assets. Battlefront Zero and Yogihoo Arena must likewise use original names, creatures, characters, artwork and mechanics implementation.
