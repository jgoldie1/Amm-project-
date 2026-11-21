# StreetVerse Open World Engine (S-OWE) — original TRYAMM architecture

**This is not Rockstar's RAGE engine.** RAGE and GTA are proprietary. We are
building original StreetVerse gameplay atop existing Three.js, Rapier, character
GLB, Living City and Mycelium systems. REA (https://github.com/morluto/rea)
is an optional lawful diagnostic/research tool; there is no GTA executable
analysis, RAGE source reuse or REA tool install in this PR.

## Current integrated contracts
| Layer | Existing owned module | Evidence and limit |
|---|---|---|
| Rendering | StreetVerseMobileWorld + Three.js | Existing scene and native GLB loader; device screenshot still required |
| Asset placement | StreetVerseVisibleForgeBridge | Can place loaded park/storefront/street prefabs; local visual-only records |
| Physics | StreetVerseRapierPhysicsRuntime | Existing Rapier adapter; not yet authority for every vehicle and NPC |
| Vehicle | StreetVersePhysicalVehicleRigRuntime | Mesh seat, steering, brake lighting hooks; independent real driving acceptance required |
| Simulation | StreetVerseOriginalOpenWorldKernel | New 60Hz deterministic contract, bounded motion, brake-before-exit and once-only mission finish |
| Procedural layout | StreetVerseLivingCityGenerator | Synthetic roads, buildings, bridge, spawn and mission records, not full production geography |
| Event mesh | StreetVerseMyceliumNetwork | Bounded event fanout and locally stored simulation receipts, not multiplayer or financial transactions |
| AI operations | AICafeMultiAgentRuntime | Existing task event integration; human approvals still required |
| Backend | /api/agents/jobs | Authenticated preview-only city plan; no live claim without job read-back |
| HoloGPT / MiddleVerse | HoloGPTAssistant / LivingWorldsBridge | Buttons open existing assistants; conversational intelligence is dependent on working providers |
| Store / missions | LivingStore, HoloDelivery | Fictional credits and delivery contracts; no real purchases |

## What pressing the buttons does
1. **BUILD VISIBLE CHICAGO + TEST CONNECTIONS:** request four existing
   3D native street objects through the active mobile renderer, test the
   district layout and Mycelium graph, enqueue an AI Café task, and submit a
   no-charge city plan if studio authentication is available. Missing models
   or backend responses appear as blocked, never silently passed.
2. **TEST OUR OPEN WORLD ENGINE:** run an isolated deterministic state
   simulation with throttle, steering, braking, stopped exit and mission
   completion. It never claims the actual on-screen driving physics passed.
3. **ASK HOLOGPT / MIDDLEVERSE AI:** open the pre-existing approved
   interfaces; they do not automatically purchase, deploy or publish.

## Release gates before public beta
- Full TypeScript, focused and main StreetVerse CI pass.
- iPhone and Chromebook see the same live 3D canvas without control overlap.
- BJ production GLB rig and walk/drive/exit animations verified visually.
- Real vehicle collision, steering, suspension, seat/door and recovery tested.
- 3D city prefabs actually loaded and placed with grounded collision/nav.
- Authenticated backend job submitted, completed and read back.
- Mycelium server storage, reconciliation and cross-device save proven; no
  duplicate rewards. No MLP inference claim until actual model interface exists.
- Approved owner review of credentials, billing, rollback and publishing.

## REA-assisted workflow
Run REA only on TRYAMM-owned builds or duly authorized material. Record evidence
(trace, source path, test, screenshot), build the feature cleanly from original
StreetVerse code, and retest at the UI. Avoid proprietary GTA binaries/assets,
unauthorized bypasses, private-source copying and unlicensed soundtracks.
