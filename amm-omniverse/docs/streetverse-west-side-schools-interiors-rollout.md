# West Side / Village education and interior navigation rollout

This change is **staging**, not proof that all Chicago schools are modeled or that any school interior is playable.

## Source hierarchy
1. Chicago building footprints and street center lines already listed in `StreetVerseChicagoReconstructionSources.ts` for exterior footprints and route alignment.
2. Current CPS / ISBE / college and university directories for active status, address, public access and official names. Historical institutions are separate, clearly labeled.
3. User's Village/Circle Park blueprint and memories for *fictionalized* scene design; do not treat as a surveyed school interior.
4. No modeled interior is portrayed as a factual floor plan without authorized documentation. Protect students: no real schedules, private rooms, security procedures or personal information.

## Progressive delivery gates

A. **School discovery:** review directory entries and locate records on the existing Chicago grid. Expand to all CPS/ISBE schools through a validated import dataset; do not claim completeness from the initial manual list.

B. **Public exterior:** approved GLB exterior assets and entrances, collision, wayfinding and scene LOD; mark `exterior-staged` only after the model exists and its location is verified.

C. **Fictionalized accessible interior:** use `StreetVerseInteriorRouting.ts` for interior room/landing nodes and traversable edges. Every player route includes enter and exit, floor labels, stair routes and a step-free elevator or alternative when provided. If a real school does not permit access, only use fictionalized game interiors.

D. **Real 3D movement:** animate player physically along walk and stair path nodes; elevator requires doors, floor selection, cabin movement, obstruction rules, arrival and exit. A path result is NOT a movement animation.

E. **Mission & saving:** preserve the active mission and floor on entry/exit, pause or restore if the renderer fails; test against the StreetVerse Mobile game shell and the West Side fallback.

F. **Release:** unit test route graph, iPhone one-hand taps, VoiceOver labels, WebGL crash recovery and performance. No merge or Vercel deploy until blockers and CI failures are addressed.
