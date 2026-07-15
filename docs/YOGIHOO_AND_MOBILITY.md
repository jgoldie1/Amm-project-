# Yogihoo Arena and Holo Mobility

## Completed playable game slice

Open `/yogihoo.html`.

Implemented:

- Touch D-pad movement
- Touch attack and skill buttons
- Basic turn-based creature battle
- Bluetooth/Gamepad API support
- Four marketplace-ready demo collectible records
- Holographic battle burst animation
- Server and local save-data paths
- Holo Arena lobby creation
- TV-casting capability detection
- WebXR AR/VR capability detection
- Mobile-first responsive layout
- Reduced-motion support

This is a browser vertical slice, not a completed commercial game. Production still requires original art, audio, animation, multiplayer authoritative servers, anti-cheat, authentication, cloud database storage, payments, parental controls, ratings review and engine optimization.

## Advanced mobility prototype

Implemented mock-safe records and APIs for:

- Driver and courier onboarding
- Identity-verification status
- Background-check status
- Driver-license and expiry tracking
- Insurance and expiry tracking
- Vehicle records
- Safety, accessibility and platform training
- Compliance eligibility gates
- Dispatch offers
- Trip lifecycle events
- Location-event records
- SOS and safety incidents
- Ride and delivery request drafts

These workflows do not authorize TryAMM to operate transportation or courier services. Launch requires licensed legal entities, country/state/city approvals, commercial insurance, provider contracts, real identity/background-check vendors, map and routing providers, secure real-time location infrastructure, emergency response procedures, tax review, accessibility policies, driver classification review and local counsel.

## API routes

- `GET /api/collectibles`
- `POST /api/game-saves/:gameId`
- `GET /api/game-saves/:gameId/:playerId`
- `POST /api/holo/arena/session`
- `POST /api/mobility/onboarding`
- `GET /api/mobility/workers/:id/compliance`
- `POST /api/mobility/dispatch`
- `POST /api/mobility/trip-events`
- `POST /api/mobility/safety-incidents`

## What this proves

The same TryAMM account architecture can eventually support a phone as the primary screen/controller, Bluetooth controllers, television casting, browser play, XR capability checks, arena sessions, cloud saves and future migration to the Volcano console. The mobility APIs prove the operational data model before connecting regulated providers.