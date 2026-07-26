# Victor + Lovable Handoff — Omniverse Sports

## Branch

`agent/omniverse-playable-sports`

## Playable entrypoint

`public/omniverse-sports.html`

Open the file through the existing static server or deployment. The prototype is self-contained and requires no API key.

## What is working now

- Shared player identity and saved display name
- Persistent XP, level, rank, coins, abilities and inventory
- Rank path from E through SSS, Legend, Mythic and Omniverse
- Playable basketball training loop: dribble, shoot, streak, energy and special shot
- Playable stylized combat loop: light attack, heavy attack, block, ultimate, health and victory reward
- Original men's, women's, mixed and wheelchair basketball league selectors
- Ability unlocking with ability points
- Special-item store with coin purchases
- Holographic HUD, broadcast commentary and impact overlays
- Large-text, reduced-motion, high-contrast and voice-feedback settings
- Local progress reset
- Mobile-responsive layout
- Asset/licensing and backend contract in `data/omniverse-sports-system.json`

## Important architecture decision

This repository currently contains mostly independent static modules. This vertical slice follows that architecture and does not force a React/Next.js migration. Lovable may redesign the screen, but it must preserve the state model and IDs until the production backend replaces local storage.

## Lovable instructions

1. Import/connect this GitHub repository.
2. Work from `agent/omniverse-playable-sports`.
3. Preserve all gameplay functions before changing the visual design.
4. Keep accessibility controls visible and keyboard reachable.
5. Do not insert protected NBA, WNBA, Space Jam, DramaBox or anime franchise assets.
6. Use original team names, uniforms, characters and visual effects.
7. Commit Lovable changes back to a separate branch such as `lovable/omniverse-sports-ui`.
8. Open a PR into `agent/omniverse-playable-sports` so changes can be reviewed without overwriting the playable baseline.

## Production backend wiring

The browser prototype intentionally uses localStorage. Production should move authoritative state to Supabase or the project's selected backend.

Recommended tables:

- `profiles`
- `game_progress`
- `abilities`
- `player_abilities`
- `items`
- `player_inventory`
- `matches`
- `leaderboards`
- `missions`
- `mission_progress`

Recommended secure reward endpoint:

`POST /api/game-results`

The server must calculate XP and coin rewards from validated actions or signed match results. It must reject client-submitted final balances.

## Acceptance test

1. Open `public/omniverse-sports.html`.
2. Save a player name.
3. Open Basketball, dribble and shoot until a basket is made.
4. Open Abilities and unlock `Sky Breaker` when available.
5. Return to Basketball and activate the special shot.
6. Open Combat and defeat the Holo Rival.
7. Buy an item from Special Item Vault.
8. Refresh the page and confirm name, rank, XP, coins, ability and item remain.
9. Enable large text and reduced motion.
10. Test at mobile width and keyboard-only navigation.

## Remaining production work

- Replace localStorage with authenticated server persistence
- Add authoritative multiplayer match services
- Add original 2D/3D asset packs and animation rigs
- Add controller and touch joystick input
- Add full 3v3 and 5v5 basketball simulation
- Add combat AI state machine and matchmaking
- Add creator livestream overlays
- Add moderation, anti-cheat and telemetry
- Add automated browser and API tests

This handoff is designed so Victor can review and merge rather than reconstruct the feature from conversation notes.
