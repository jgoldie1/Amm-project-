# StreetVerse RP Competitive Learning

Status: EXPERIMENTAL / DESIGN INPUT ONLY
Branch: feature/streetverse-chicago-premium-world-20260919
Rule: learn from public patterns; do not copy third-party code, maps, models, textures, branding, characters, dialogue, trade dress, or proprietary assets.

## Public comparison context

A likely adjacent public project is Swaggy's Evolutions / Swaggy Sity RP, which publishes large-scale FiveM maps and RP environments. Public listings emphasize:
- full city layouts;
- detailed interiors;
- highways and road networks;
- downtown business districts;
- suburban neighborhoods;
- stadium and concert venues;
- roleplay-oriented government / police / retail / residential interiors;
- memberships, early access and developer-community access.

The exact TikTok creator referenced by the founder has not been independently verified, so this document treats the public FiveM material only as adjacent-market learning, not as a claim about a specific TikTok account.

## Chicago-specific adjacent benchmark: Windy City

Public listings for Swaggy's Evolutions now include a Chicago-inspired FiveM environment called Windy City. Its public positioning is directly adjacent to StreetVerse Chicago: connected downtown corridors, neighborhood streets, suburbs, industrial/residential districts and RP-oriented city services.

Publicly listed addon categories include examples such as police facilities, hospital, suburban expansion, convenience retail, fire service, church, maps/navigation and other server content.

Important differentiation observations:
- Windy City is distributed as FiveM content; StreetVerse is being built as its own web/mobile experience rather than requiring a GTA V/FiveM installation.
- The public Windy City listing instructs users to maximize FiveM texture budget and use Normal texture quality. StreetVerse should instead use adaptive quality tiers and automatically fit the device budget.
- Windy City sells the city and add-ons as content packages. StreetVerse should make buildings and districts programmable gameplay systems connected to residents, missions, creators, businesses and the authoritative ledger.
- A free minimap with street names/postal variants demonstrates that navigation is part of the product experience. StreetVerse should ship first-party navigation, mission routing, accessible directions and transit-aware wayfinding.
- Public Windy City messaging emphasizes civilian, business, law-enforcement and street-life RP. StreetVerse should support those broad role families while adding creator, athlete, performer, delivery/rideshare, education/work, accessibility and persistent resident-life loops.
- StreetVerse should not reuse Windy City names, maps, layouts, models, GTA brands, fictional brands, screenshots or assets. The learning target is the abstract product pattern only.

### Beat the map-pack model with a living-city model

For every static RP map feature, StreetVerse should have a systemic equivalent:

| Map/content pattern | StreetVerse living-system target |
| --- | --- |
| Police / fire / hospital building | service careers, schedules, missions, traffic priority, training simulations |
| Convenience/store addon | player/business inventory, creator promotions, delivery, purchases and ledger |
| Church/community building | scheduled gatherings, community missions, creator events and permitted ministry programming |
| Studio/venue | recording/live performance, audience simulation, tickets, sponsor inventory and Reel capture |
| Residential district | homes, resident schedules, relationships, errands, property/service loops |
| Highway/road network | traffic graph, rideshare/delivery, transit, racing/drifting, event detours |
| Mini map | accessible navigation, mission route, transit route, business discovery and district state |
| City expansion | streamed district pack with a repeatable performance/accessibility/certification gate |

StreetVerse wins this category only when the systems actually run reliably; visual breadth without collision, pathfinding, device performance and E2E proof is not enough.

## What StreetVerse should learn

### 1. A city must contain reasons to roleplay

Map size alone is not a gameplay loop. Every premium district should contain a balanced set of:
- home / residential destinations;
- jobs and businesses;
- civic and service locations;
- recreation and sports;
- music / entertainment venues;
- transit and mobility nodes;
- social gathering spaces;
- creator stages;
- discoverable side spaces;
- mission-generating interiors.

World-building should be scored by useful destinations per minute of travel, not square kilometers.

### 2. Enterable interiors multiply a neighborhood

A building that can be entered can support several role states:
- customer;
- worker;
- owner;
- creator;
- investigator;
- performer;
- delivery driver;
- emergency responder.

StreetVerse should use modular interior templates with district-specific dressing, rather than relying only on exterior façades.

### 3. Transportation must connect gameplay

Highways, streets and transit are valuable when they connect meaningful loops:
- rideshare pickup -> destination -> rating / earnings;
- delivery pickup -> route -> handoff;
- business supply run;
- event crowd movement;
- commute schedules for residents;
- race / drift routes;
- emergency response simulation;
- transit-to-venue creator missions.

Do not build roads merely as scenery.

### 4. Venues should be programmable systems

A stadium, church, club, studio, school, theater or concert venue should expose:
- schedule;
- capacity;
- audience state;
- ticketing hooks;
- creator slots;
- vendor slots;
- sponsor inventory;
- lighting/audio state;
- security/safety state;
- replay/highlight markers;
- district traffic/crowd effects.

This turns a static venue into reusable gameplay.

### 5. Community and membership can support development

Adjacent RP ecosystems monetize access through memberships, early access, premium community roles and developer streams.

TRYAMM adaptation:
- keep core StreetVerse playable without requiring a premium pass;
- Founder / Creator membership can provide early-access test realms, cosmetic recognition, creator tooling or business analytics;
- developer/world-building streams can become community events;
- never make economic payouts, safety or accessibility depend on premium membership.

### 6. Test before selling or promoting

Public RP-map discussions show strong demand for preview/test servers before purchase.

StreetVerse should provide:
- public or invite-only preview realm;
- clearly labeled ALPHA / BETA / READY states;
- device and browser support matrix;
- district quality scorecard;
- changelog;
- known-issues list;
- automated telemetry for crashes/stalls without retaining unnecessary identifiable activity.

### 7. Collision and navigation are release blockers

Public user reports in the broader FiveM map market describe clipping, falling through terrain, map collisions and broken roads. Treat those reports as market lessons, not verified defects in any one product.

StreetVerse premium gates must include:
- no walkable holes;
- no vehicle fall-through;
- no unreachable mission marker;
- no spawn inside geometry;
- no collision mismatch at streamed chunk seams;
- no resident route through blocked geometry;
- no responder/traffic route deadlock;
- automated traversal probes;
- mobile-safe fallback when 3D navigation fails.

### 8. AI pathfinding and ambient population are differentiators

Public discussion around large RP maps explicitly asks for AI pathfinding and ambient NPC/vehicle activity.

StreetVerse should make this first-class:
- nav graph per district;
- pedestrian route graph;
- road/intersection graph;
- event-aware detours;
- schedule-aware resident destinations;
- traffic signal state;
- emergency lane priority;
- low-cost distant simulation;
- deterministic fallback routes;
- no dependence on live surveillance data.

### 9. Performance must be proven, not advertised

For each district, record:
- draw calls;
- triangles;
- active residents;
- active vehicles;
- texture memory;
- JS heap trend;
- longest main-thread task;
- frame pacing;
- load-to-playable time;
- network transfer;
- low-power/mobile fallback activation.

Premium status requires measured thresholds, not a visual impression.

### 10. Support quality is part of the game

RP communities live or die on trust. StreetVerse should connect:
- in-game report;
- issue category;
- reproducible location/state snapshot;
- privacy-safe diagnostics;
- visible ticket state;
- release note linking the fix;
- rollback when a district update introduces a regression.

## StreetVerse differentiation

StreetVerse should not compete merely by having a larger Chicago map.

It should combine:
1. persistent resident simulation;
2. role-state gameplay;
3. server-authoritative economy;
4. creator-native capture / Reel / live systems;
5. businesses that players can operate;
6. mobility and delivery;
7. sports and events;
8. investigations and fictional story missions;
9. first-responder training simulations;
10. accessible mobile-safe parity;
11. cross-district event fabric;
12. world-state director;
13. verified production quality gates.

## Chicago pilot: Hyde Park

For the Hyde Park premium slice, add in this order:
1. pedestrian + road nav graphs;
2. collision/traversal certification;
3. 24-hour lightweight resident schedules;
4. storefront/interior interaction shells;
5. creator venue + business venue + civic/service venue;
6. CTA/transit activity hooks;
7. weather/time/world-state director;
8. event-aware crowd + traffic reactions;
9. mission director with Resident / Creator / Driver / Business role variants;
10. one-click Reel highlight after a meaningful event.

## Social roleplay quality

StreetVerse needs systems that create unscripted stories:
- proximity conversation;
- consent-aware interaction invitations;
- emotes;
- party/family/agency groups;
- player-run businesses;
- community events;
- reputation;
- neighborhood affinity;
- scheduled creator shows;
- optional role queues;
- moderation and anti-griefing;
- safe teen/adult lane separation.

A successful RP system creates reasons for players to interact even when no authored mission is active.

## Creator-led growth loop

One in-world event can become:
world event -> player choice -> memorable moment -> Reel/live clip -> share -> viewer joins -> viewer enters same district -> business/event conversion -> creator ledger attribution.

This is a strategic advantage over a map-only RP product because the content distribution loop is built into StreetVerse.

## Competitive safeguard

Never ingest or reuse leaked third-party FiveM files. Only use:
- original TRYAMM assets;
- properly licensed assets;
- public-domain assets;
- creator-submitted assets with clear rights;
- procedural/generated assets with documented commercial-use rights.

If a public competitor demonstrates a useful mechanic, reimplement the abstract gameplay idea independently within TRYAMM architecture.
