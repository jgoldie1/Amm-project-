# StreetVerse AI Cafe Parallel Build Program

## Objective
Ship one verified StreetVerse vertical slice by parallelizing independent work while reusing canonical components and preserving compile/runtime/security gates.

## Parallel lanes

### Runtime lane
- Unity compile-clean core package
- One authoritative StreetVerseGameState
- Input actions, animation/audio contracts, save/load
- Scene bootstrap and dependency validation

### World lane
- World-cell streaming
- NPC scheduler and daily routines
- Traffic/pedestrian simulation
- Animals/weather/day-night
- Quarantine Zone and Omniverse After Dark world-state hooks

### Gameplay lane
- Missions and radiant mission graph
- Vehicles and shared vehicle interface
- Prison, bosses, celebrity encounters, Battle Royale
- Crew/companion command system

### Commerce lane
- Real SKU/product digital twins
- Inventory/cart/coupon contracts
- Server-side Guardian authorization
- Payment receipt verification
- Fulfillment/tracking/reorder adapters

### Creator lane
- Real gameplay capture adapter
- Reel editor/render/export pipeline
- Product/location tags
- Publish/creator attribution

### Assets lane
- HoloForge/GLE GLB/glTF registry
- LOD/collision/PBR validation
- Buildings, vehicles, interiors, products, NPCs, animals
- Unity/Unreal/Godot/Web adapters

### Guardian QA lane
- Compile gate
- Null-reference/dependency scan
- Age-lane/content separation
- Multiplayer authority tests
- Commerce/economy tamper tests
- Mobile performance and accessibility smoke tests

## Quantum Speed Engine rule
SEARCH BEFORE CREATE -> BUILD ONCE -> VERIFY ONCE -> REGISTER -> REUSE EVERYWHERE -> PARALLELIZE VARIANTS -> TEST DELTAS + REQUIRED SAFETY SMOKES -> MERGE ONCE -> DEPLOY -> TELEMETRY.

## Vertical-slice completion gate
PLAYER -> LIVING WORLD -> MISSION -> VEHICLE/NPC -> SAVE/LOAD -> MULTIPLAYER -> REAL PRODUCT -> CART -> VERIFIED PAYMENT -> FULFILLMENT -> XP/WALLET -> RECORD -> EDIT -> SAVE/PUBLISH -> CREATOR ATTRIBUTION -> REORDER.

## Release truth
A subsystem is GREEN only after source + compile + runtime + persistence/authority + provider integration when applicable + device test + production verification. Presence of code alone is not completion.
