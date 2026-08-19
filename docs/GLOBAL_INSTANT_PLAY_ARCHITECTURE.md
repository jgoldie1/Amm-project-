# TRYAMM Global Instant-Play Architecture

Status: LOCKED GLOBAL DELIVERY SPECIFICATION

## Goal
Millions of people across countries, states/provinces, counties/regions and cities should be able to open TRYAMM, press PLAY, and immediately enter a real playable experience rather than only reading future-game descriptions.

## Global path
GLOBAL CDN FRONTEND → CUSTOM DOMAIN → LIGHTWEIGHT FIRST LOAD → API HEALTH CHECK → REGION/AUTH DISCOVERY → GAME MANIFEST → STREAMED/LAZY ASSETS → AUTHORITATIVE SESSION → PLAY.

## First-load rules
- ship a minimal shell first;
- defer nonessential video, 3D and creator assets;
- preload only the selected game/experience;
- show playable fallback content when high-end graphics are unavailable;
- cache versioned static assets at the edge/CDN;
- compress/bundle intelligently;
- prefer progressive loading over blocking startup on the full TRYAMM ecosystem.

## Global location model
Use hierarchical geography without assuming every country uses the word `county`:
COUNTRY → ADMIN-1 (state/province/region) → ADMIN-2 (county/district/prefecture where applicable) → CITY/LOCALITY.

Every location-aware feature must use standards-based country/region identifiers and provider-backed geocoding rather than hard-coded U.S.-only assumptions.

## Custom domains
TRYAMM domain/DNS layer can map tenant/business/world domains to CDN frontends. Domain health checks verify DNS, TLS/HTTPS, origin reachability and deployment version before marking a custom domain healthy.

## API health and fallback
Client startup performs a lightweight health/bootstrap request. Return:
- nearest/selected API region;
- auth/session availability;
- game/service capability flags;
- fallback region/provider;
- minimum compatible client version;
- maintenance/degraded state.

If a primary API region fails, route read-safe/bootstrap traffic to an approved fallback. Stateful game sessions must use explicit migration/reconnect logic; do not silently fork authoritative state.

## Instant-play game manifest
Each launchable game publishes a manifest:
- game id/version
- minimum client capabilities
- initial bundle size target
- optional asset packs
- multiplayer endpoint/session mode
- guest/demo availability
- accessibility metadata
- controller/touch/keyboard support
- supported languages
- maintenance/feature gate state

## Real game requirement
A game is labeled PLAYABLE only when the user can complete a meaningful gameplay loop. Concepts, trailers and future feature descriptions are labeled PREVIEW or COMING SOON.

## Scale path
EDGE/CDN STATIC → REGIONAL API → AUTH → MATCHMAKING → AUTHORITATIVE MULTIPLAYER → REALTIME STATE → PERSISTENCE → TELEMETRY → OBSERVABILITY.

Autoscale/stateless services where appropriate. Use queues/backpressure for expensive non-realtime work. Separate realtime gameplay from media rendering, AI generation and uploads so those workloads cannot starve game sessions.

## Cost sustainability
Global game delivery reports into Platform Sustainability Engine:
- CDN egress
- origin egress
- realtime session minutes
- compute/matchmaking
- database writes
- storage
- anti-abuse/security
- observability

The product target remains 3.00× eligible platform revenue per measured infrastructure dollar, with game-specific contribution visibility.

## Accessibility
Instant-play shell and games inherit Accessibility Passport: keyboard/controller remapping, one-handed presets, reduced motion/flashing, captions where applicable, scalable UI, color-independent cues and screen-reader-compatible shell/navigation.

## Release status
CONCEPT → SPECIFIED → CODED → INTEGRATED → TESTED → GATED → LIVE.
Global availability is never claimed until regional deployment, health checks, latency/error budgets and gameplay verification pass.
