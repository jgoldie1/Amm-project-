# TryAMM Open World + Supabase Beta Foundation

## Open-world vertical slice

Route: `/openworld.html`

Implemented proof features:

- original TryAMM city-sandbox presentation
- touch and keyboard combat controls
- Bluetooth/Gamepad API button mapping
- attack, heavy attack, block, shield and dodge
- health, shield, stamina, faith energy and combo state
- Faith Deck: Courage, Wisdom Guard, Unity Pulse and Restoration
- Holographic Deck: Holo Decoy, Photon Lance, Prism Wall and Quantum Scan
- browser vibration/haptic patterns where supported
- generated Web Audio sound cues for combat actions
- Quantum Beat™ audio-mode branding and production hook
- local playable fallback when the server combat route is unavailable

This is not a GTA clone and must not use Rockstar maps, assets, characters, code, audio, missions or branding.

## Production game work still required

- Three.js or game-engine world renderer
- character controller, vehicles, traffic and pedestrian AI
- missions, quests, police/response systems and economy
- authoritative multiplayer and anti-cheat
- original 3D models, animation, music and sound library
- spatial audio, accessibility mixer and licensed voice performances
- cloud saves and authenticated ownership
- moderation, parental controls and age ratings
- performance testing on mobile, TV, laptop and XR hardware

## Supabase Beta foundation

Migration:

`supabase/migrations/202607140001_tryamm_beta_core.sql`

Server helper:

`services/supabase.js`

The migration creates owner-scoped tables and RLS for:

- profiles
- content items
- game saves
- collectibles and ownership
- orders
- call-center interactions
- DAW projects

## Activation steps

1. Create a Supabase project.
2. Add `SUPABASE_URL`, `SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY` to the deployment secrets.
3. Apply the migration with the Supabase CLI or SQL editor.
4. Replace JSON-file writes with authenticated Supabase queries.
5. Require bearer authentication on owner-scoped API routes.
6. Add integration tests proving users cannot read or modify another user's records.

The service-role key must never be exposed to browser code.
