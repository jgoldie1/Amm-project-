# TryAMM Living Worlds Implementation

## What this branch adds

This branch establishes the first deployable foundation for the connected TryAMM universe:

- My World and We Are the World
- sports worlds and shared progression
- the Middleverse travel and commerce hub
- a Metaverse/Multiverse interoperability layer
- a public world-directory frontend
- backend routes for profiles, travel sessions and creator events
- Supabase tables, row-level security and seed data
- a Render deployment blueprint

## Required server registration

Register the world API in `server.js` before the `/api` 404 handler:

```js
require('./worlds-api')({
  app,
  auth,
  clean,
  id,
  getStore: () => store,
  saveStore,
  io
});
```

The portal is then available at `/worlds.html`.

## Production architecture

### Frontend

- Current MVP: static HTML/CSS/JavaScript served by Express.
- Next target: Next.js App Router client with WebGPU/Three.js for the world map and a Unity or Unreal streaming client for full 3D worlds.
- Accessibility requirements: one-hand mode, voice navigation, reduced motion, captions, high contrast and remappable controls.

### Backend

- Express API gateway and Socket.IO presence layer.
- Supabase Auth, Postgres, Realtime and Storage for persistent identity and world data.
- Dedicated authoritative game servers per sport/world for anti-cheat and simulation.
- Redis-compatible presence/cache layer before large-scale launch.
- Job queue for replay processing, AI coaching, moderation and highlight generation.

### World services

Every world should implement the same contract:

- identity and permissions
- travel/session creation
- inventory and economy
- missions and progression
- parties, guilds and teams
- events and matchmaking
- telemetry and moderation
- save-state/version migration

### Holographic layer

Build holographic support as a rendering adapter rather than a separate game. The same game state can render to:

- phone/tablet/desktop
- TV and console
- VR/AR headsets
- spatial displays and future TryAMM holographic hardware

## Sports upgrade

Use an original shared sports simulation framework inspired by modern sports-game capabilities without copying proprietary code, characters, leagues, logos or assets. Reusable systems should include:

- animation state machines and motion matching
- ball/puck physics
- fatigue, momentum and injury models
- AI coaching and tactical analysis
- franchise, career and street modes
- instant replay and spatial/holographic visualization
- cross-sport avatar attributes with sport-specific skill trees

Basketball should be the first complete vertical slice because it validates movement, physics, teams, arenas, progression, spectating and creator tournaments.

## Open-world upgrade

My World becomes the persistent everyday world. We Are the World becomes the cooperative global-mission world. Both share:

- property and business ownership
- logistics, jobs, vehicles and transportation
- social districts, concerts and sports venues
- creator-built missions and events
- AI citizens with schedules and memory
- dynamic seasons and world events

## Security and launch gates

Do not launch real-money trading, wagering or token redemption until legal review, age controls, KYC/AML requirements, tax handling, fraud monitoring and jurisdiction restrictions are implemented. Start with closed-loop virtual items and clearly labeled entertainment value.

## Next engineering milestones

1. Register `worlds-api.js` in `server.js` and extend smoke tests.
2. Connect Express authentication to Supabase Auth.
3. Replace JSON-file world persistence with Supabase repositories.
4. Build the basketball vertical slice and authoritative match server.
5. Add shared inventory, parties, matchmaking and world travel UI.
6. Add creator event tools and moderation dashboards.
7. Add a 3D Middleverse gateway with device-adaptive rendering.
