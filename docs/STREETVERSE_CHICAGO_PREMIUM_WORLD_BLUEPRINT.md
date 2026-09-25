# StreetVerse Chicago Premium World Blueprint

Status: EXPERIMENTAL / NOT A RELEASE DEPENDENCY
Pilot: Hyde Park mobile + Living World
Goal: make StreetVerse Chicago feel like a premium, reactive, persistent city rather than a large static map.

## Quality principle

StreetVerse does not need to imitate a survival-horror game. The transferable benchmark is premium execution: dense environments, strong atmosphere, deliberate pacing, responsive controls, believable NPC behavior, cinematic presentation, meaningful exploration, and high production polish.

The target is a Chicago life-simulation / creator / commerce / mission world that can deliver multiple distinct play states in the same city.

## 1. Chicago World Director

Create a world-state director that coordinates:
- time of day and sunrise/sunset transitions;
- weather, wet roads, fog, wind, snow and heat-state presentation;
- pedestrian density, traffic density and transit activity;
- district events, storefront state and venue activity;
- mission escalation/de-escalation;
- ambient audio and music intensity;
- lighting, signs, windows, headlights and emergency lighting;
- safe deterministic fallbacks for low-power mobile devices.

Every subsystem must read the same compact world-state snapshot instead of inventing its own clock/weather/event state.

## 2. Role-state gameplay

A single block should support multiple experiences. Initial role states:
- RESIDENT — explore, relationships, errands, housing, community progression;
- CREATOR — shoot Reels, stream, music, performance, product placement;
- DRIVER — cars, powersports, delivery, rideshare, racing, drifting;
- BUSINESS — own/operate businesses, inventory, hiring, delivery, ads;
- INVESTIGATOR — fictionalized cases, clues, interviews, puzzle chains;
- FIRST_RESPONDER — safety/de-escalation training simulations and rescue events;
- ATHLETE — basketball, track, sports challenges and tournaments;
- PERFORMER — music, comedy, fashion, live events and holographic shows;
- AFTER_DARK — nightlife, venues, music, social missions and adult-safe gated content.

Role state changes mission availability, NPC dialogue, UI, audio, incentives and city reactions without loading a separate Chicago.

## 3. Perspective and camera quality

Support camera profiles instead of one fixed camera:
- third-person exploration;
- first-person immersion;
- cinematic vehicle camera;
- accessibility close/medium/far camera distances;
- reduced motion mode;
- aim/interact focus mode where relevant.

Camera switching must preserve input, collision, audio perspective, UI readability and mission state.

## 4. Resident intelligence

Upgrade residents from moving population to lightweight simulated lives:
- home/work/leisure schedules;
- district affinity and preferred locations;
- short-term memory of player interactions;
- relationship/reputation state;
- group behavior and crowd reaction;
- weather/event reactions;
- traffic, siren, collision and emergency reactions;
- creator/business reactions such as attending events or visiting stores.

Use bounded memory and deterministic summaries. Do not retain unnecessary identifiable user activity.

## 5. Dense environmental storytelling

Prioritize density over map size:
- readable storefront interiors and windows;
- alleys, courtyards, transit stops, lobbies and rooftops;
- local signage and fictionalized businesses where rights are not cleared;
- props that communicate neighborhood function;
- discoverable micro-stories and clues;
- interactive doors, elevators, terminals, vending, seating and transit;
- day/night differences in who is present and what is open.

Hyde Park is the pilot quality slice before expanding the same standard to additional districts.

## 6. Mission Director: tension and release

Use a pacing director so every mission is not the same intensity:
1. discovery;
2. choice or preparation;
3. complication;
4. high-intensity sequence;
5. consequence;
6. reward / social / creator moment.

Mission families:
- creator and music;
- delivery and rideshare;
- business and marketplace;
- sports;
- racing and vehicle;
- mystery/investigation;
- rescue/de-escalation;
- neighborhood exploration;
- social/relationship;
- live events;
- fictional crime/court storylines;
- After Dark nightlife.

Avoid filler objectives whose only purpose is travel or repetitive collection.

## 7. High-impact audiovisual layer

Lighting:
- wet-surface reflections;
- window and storefront emissive lighting;
- volumetric-looking fog using performance-safe techniques;
- vehicle headlights and brake lights;
- traffic signals and signage;
- event lighting;
- emergency lighting;
- district-specific night palettes;
- quality tiers for desktop and mobile.

Audio:
- layered traffic beds;
- CTA/transit pass-bys;
- crowd zones;
- footsteps by surface;
- interior/exterior occlusion;
- siren distance and direction;
- weather;
- venue bleed;
- mission score intensity;
- quiet zones that make busy zones feel stronger.

Replace placeholder synth blips over time with rights-cleared or generated production assets while preserving lightweight fallback audio.

## 8. Animation and interaction polish

Create shared interaction standards:
- acceleration/deceleration instead of snapping;
- turn anticipation;
- enter/exit vehicle transitions;
- resident head/torso look-at;
- idle variation;
- collision reactions;
- door and object interactions;
- camera-aware interaction prompts;
- animation blending;
- haptic hooks where supported;
- consistent 44px+ mobile touch targets.

## 9. Vehicles and Chicago mobility

Build on current driving/powersport systems:
- traffic rules and intersection state;
- better suspension/weight transfer illusion;
- wet/low-grip surface response;
- vehicle classes;
- parking and pickup/dropoff;
- delivery/rideshare loops;
- transit nodes;
- police/fire/ambulance traffic reactions used for simulation, not real-world surveillance;
- race and drift events;
- damage presentation that does not require destructive simulation on low-end devices.

## 10. Chicago activity fabric

A world event bus should let one event affect many systems:
- weather changes road grip, clothing, crowd density, audio and missions;
- a creator event changes crowd routes, business traffic, ads and live-stream opportunities;
- a sports event changes transit/crowd/merchant activity;
- an emergency simulation changes traffic/sirens/responder routes and NPC reactions;
- a neighborhood celebration changes music, lighting, vendors and creator missions.

Use fictionalized or licensed events by default. Any real-time city-data integration must be separately reviewed for reliability, privacy and safety.

## 11. Creator-native gameplay

Make creation part of the game loop:
- one-tap Reel capture after mission moments;
- cinematic replay markers;
- photo mode;
- auto-highlight candidates;
- music/performance capture;
- holographic product placement with rights/advertiser controls;
- virtual production stages;
- creator-safe brand inventory;
- export/save-to-phone certification on physical devices.

## 12. Business and economy

Business gameplay should be server-authoritative:
- storefront ownership/management;
- delivery and pickup;
- ads and sponsorships;
- events and tickets;
- creator collaborations;
- staff/agent workflows;
- marketplace purchases;
- transparent ledger entries;
- no client-authoritative balances, rewards or payouts.

Economic simulation must remain sandboxed unless a real-money provider path is explicitly verified.

## 13. Accessibility as a premium feature

Maintain:
- keyboard, touch and controller parity;
- large touch targets;
- captions and non-audio cues;
- reduced motion;
- camera distance options;
- first/third person choice where practical;
- remappable controls target;
- high contrast/readability;
- screen-reader semantics for non-3D controls;
- low-complexity mobile-safe world;
- clear recovery when WebGL stalls or is lost.

## 14. Performance strategy

Desktop premium path:
- streamed chunks;
- asset instancing;
- texture/mesh LOD;
- occlusion/frustum culling;
- object pooling;
- distance-based NPC simulation;
- dynamic quality tiers;
- separate render and simulation budgets.

Mobile-safe path:
- HTML/2D fallback remains a first-class playable experience;
- bounded resident/traffic counts;
- simplified physics;
- reduced shadows/reflections;
- lower audio concurrency;
- mission/gameplay parity even when graphics differ.

## 15. Premium quality gates

Do not call a district premium until it passes:
- stable spawn / walk / talk / drive / mission / reward / Reel loop;
- desktop and mobile E2E;
- 30-minute soak without memory runaway;
- responsive controls;
- no dead interaction prompts;
- no inaccessible required control;
- acceptable frame pacing on target devices;
- no placeholder text exposed unintentionally;
- audio does not clip or stack uncontrollably;
- world state survives expected navigation/reload;
- server authority preserved for economy/rewards;
- physical-device Reel/save proof where required.

## 16. Aura AI sandbox

Aura may be used only as an experimental prototyping accelerator:
- generate isolated mission/block prototypes;
- explore environment layouts;
- test alternative gameplay loops;
- export concepts for manual review.

Aura output must never auto-merge to production. Before adoption, check code quality, licenses/asset rights, security, accessibility, performance and compatibility with the current Vite/React/Three.js architecture.

## 17. Implementation order

Phase 0 — finish current production certification.
Phase 1 — Hyde Park premium slice: World Director + lighting/audio + role-state hooks.
Phase 2 — resident schedules/memory + interaction polish.
Phase 3 — camera profiles + mission pacing director.
Phase 4 — creator replay/highlight layer + event fabric.
Phase 5 — business/venue simulation + server-authoritative economy connections.
Phase 6 — expand district by district only after the quality gate is repeatable.

Success is not “largest map.” Success is a Chicago block where the player can stand still for 60 seconds and see/hear believable life, then interact with that life in multiple meaningful ways.
