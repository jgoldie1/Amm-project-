# OmniCash, Aniyah Cross Borders, Holo Credit, and Earth/Mycelium integration
Date: 2026-11-17. This is an implementation boundary and launch checklist, not a claim of an active banking service or an exact digital clone of Earth.

## Existing source identities (do not recreate these apps)
- `src/components/OmniCashLauncher.tsx` mounted by `src/main.tsx`: same launcher exposes `__showOmniCash` and `__showAniyahCrossBorder`. It displays a sandbox currency conversion/transfer intent. Its simulation does not prove provider settlement.
- `src/components/AniyahPayCenter.tsx`, `src/services/aniyahPay.ts`, `src/services/paymentRails.ts`: supported corridor/method previews and a sender-recipient sandbox flow. Quote values, fees and FX used in demonstrations must not be represented as bank quotes. A supported pair is **not** proof that any partner approves live remittance.
- `api/payments/route.js`, `api/payments/global-status.js`: server-side allow/gate of authorized real-money routes. Verification, sanctioned-country/counterparty policy, compliance and provider settlement must be live-tested under applicable laws before enabling transfers.
- `src/data/TryammHoloPlayCreditEconomy.ts`, `api/credits/wallet.js`, `api/credits/spend.js`: **two closed-loop game credit buckets** (`HOLO_EARNED`, `PLAY_PURCHASED`) and stored spend entitlements. The published policy sets `cashValueMinor:0`, `withdrawable:false`, `peerToPeerTransfer:false`. Never let credits pay real-world sellers, fund remittances, become cash, or purchase influence/fame. If platform rules permit, only fixed-price, deterministic, transparent digital utilities should spend credits; enforce anti-fraud/idempotency/refund in server RPC.
- `src/components/StreetVerseTwinWorld.tsx`: existing CesiumJS Earth-view, optional Google tiles key; this is **geographic visualization**, not a complete playable reconstruction. `src/runtime/StreetVerseHoloCityBridgeRuntime.ts` projects game-simulation economy and safety overlays.
- `src/components/StreetVerseWeatherSync.tsx`: existing server-fed weather with provenance, simulated/unavailable status and cache. Do not conflate current observations, forecasts, historical climate and synthetic gameplay weather.

## Desired 3-layer Mycelium / twin-city experience
1. **Earth geographic layer:** Cesium globe, licensed terrain/imagery/OSM-derived roads, imagery metadata (sensor, observedAt, retrievedAt, cloud cover, resolution, cache/license); show only approved basemap tiles. Use NASA GIBS time-stamped satellite overlays where dataset terms permit and acknowledge NASA. Satellite images are not automatically 3D buildings, up-to-the-second photographs, or people-tracking.
2. **Real weather + time layer:** server-side approved provider (NOAA/NWS for US where covered; licensed global data elsewhere). Every climate update has city/timezone, observation/forecast timestamp, provider, stale flag and fallback. Render rain, fog, clouds, wind and day/night as **game effects**; a weather forecast is uncertain and may not match street-level reality.
3. **Authoritative game layer:** scene meshes/GLBs from Blender, street graph, pathfinding, actual walking and vehicle colliders, NPC states, owned businesses, mission event ledger and save/reload. Link by typed `cityId,districtId,geoFeatureId` mappings. Don't treat a satellite basemap as collision authority. Predictable safe spawn and explicit return portal protect player progress.

## Player-visible value
- Select Chicago, Detroit, New York, Philadelphia, Georgia, Texas, California, Lagos or Addis Ababa in CrossVerse. Fly across a visual globe with a **SKIP INTRO** and performance fallback, then either land in a certified playable scene or display PREVIEW ONLY.
- Weather and daylight can influence optional missions (delivery rerouting, rain visibility, events). Always allow accessibility modes and avoid requiring users to play through dangerous real emergencies.
- Show store/gallery scenes and virtual billboards; use authorized creator media and licensed, attribution-compliant data.
- Mycelium event bus can carry `city.selected`, `weather.updated`, `mission.completed`, `reel.ready`, `live.room.joined`. Server validates durable events and ledger idempotency; never let a local event spend money.
- Earth twin + city economy helps educational geographic roleplay, entertainment, tourism previews and logistics planning scenarios. It is not an authoritative supply-chain tracker without carrier/warehouse integrations and verified transactions.

## External data policies and security
- NASA GIBS imagery WMTS: time-varying observations; retain visible attribution and layer timestamp; avoid claims of immediate live observation.
- OpenStreetMap: data attribution and ODbL; public OSM tile and Nominatim infrastructure is not a free unlimited commercial backend. Use licensed tiles/self-hosting/partner when usage requires.
- Open-Meteo: public free API non-commercial terms; commercial product requires eligible paid API or valid self-host route; comply with data and code license.
- Google map tiles, terrain and buildings: check current API contract, billing, caching, attribution and export restrictions before integrating into playable meshes.
- Never import live bank details, geolocation traces, real medical data, or licensed third-party media into shared game state without explicit informed authorization.

## Production gates
- Holo Credit: server-side inventory grant/spend, unique idempotency keys, no double entitlement, chargebacks and refund debt, 2-device wallet checks, never cash out.
- Aniyah/OmniCash: verified counterparty onboarding, global provider availability by jurisdiction, actual FX fee disclosures, transfer settlement and refunds, KYB/KYC, AML/sanctions screening and signed webhook reconciliation.
- Aniyah Studio: 64 tracks recording/export on actual Chromebook, project restore, permissions, session consent, media rights, LIVE room, booking and payouts independently verified.
- LiveKit: signed room tokens, agent process deployment with worker health, two-device room creation, host/viewer permissions, reconnect, moderation and recording consent; 'provider configured' != tested.
- Blender GLBs: verified rig/skin animations and attachment for BJ, Jacobie, LaTeasia. City optimized meshes with colliders/nav meshes.
- Exact commit: source audit, unit regression, whole-app release, mobile Playwright/Chromebook session, staged live-provider proof, and rollback/backup restore pass before production promotion.

## Recommended next integration
First stabilize StreetVerse PR #734; merge/rebase PR #736 mini-city and BJ injury/test; review PR #730 Mycelium district preview and #723 flight as small independent changes. Then connect Earth `cityId` selection to the CrossVerse catalog in #735 and implement one tested Chicago globe-fly-in → mini-city visit → mission → save/reload. Add external creator/rendering and licensed global live weather incrementally, not as forced dependencies on the Chromebook.
