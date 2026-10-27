# StreetVerse gameplay preservation + integration audit — 2026-10-26

This ledger prevents existing game logic from being silently replaced, while distinguishing code, visual proof, and actual playable functionality. It is not an assertion that all features are shipped.

| Requested mechanic | Existing evidence in repository | Required playable proof / missing link |
|---|---|---|
| Circle Park gated entrance, gate opening and hopping/climbing | `src/components/StreetVerseTaylorFillmoreGate.tsx` has 3D gate motion; notes explicitly state decorative until collision/navigation authored | Verify gate approach, sign-in/out, jumping/climbing and collision from both sides; permit fictionalized safe routes, never reproduce real access-control vulnerabilities |
| Ellington location/story request | User-provided narrative reference, not verified in this inspection | Search existing location/mission registries for exact naming and identify intended location, characters and interactions before implementation; no invented geography |
| Drug/alcohol effects | `src/runtime/StreetVerseAdultSubstanceRuntime.ts` dispatches impairment/body-effects events and blocks driving when impaired | Verify adult-only gating, real vehicle movement honors drivingBlocked, cooldown/recovery and saved state; avoid real-world procurement |
| Consensual adult romantic/intimate relationships | `src/data/OmniverseAdultAfterDark.ts` and `src/game/characters/meetTheStubbsRelationshipMemory.ts` | Verify adult-only eligibility, consent, fade-to-black intimacy, privacy, moderation, no sexual content involving minors |
| Daily routines and relationships | `meetTheStubbsRelationshipMemory.ts`, Chicago pedestrian/traffic routines | Confirm NPCs visibly move, converse, change routines and persist choices on real device |
| World missions and reward/reel handoff | `StreetVerseMissionLedgerBridge.ts`, `StreetVerseMobileMissionRewardRuntime.ts`, `StreetVerseMissionWorldBridge.tsx` | Verify one complete mission with server-validated reward, reel event, return/rejoin and no double payouts |
| SportVerse | `SportVerseWorldGamesHub.tsx`, `SportVerseCompetitionEngine.ts`, existing basketball/football components | One complete played and scored match with results validation |
| Full Chicago / connected districts | `StreetVerseChicagoDistrictGenerator.ts`, `StreetVerseChicagoStreamingPlanner.ts`, `StreetVerseChicagoDistrictTravelGate.ts` | Current real renderer transition between Circle Park and Taylor, save and collision, no fake geographic certainty |
| One-hand input and mobile | `StreetVerseInputRuntime.ts`, `StreetVerseMobilePlayableWorld.tsx` | iPhone visual-evidence suite; verify joystick, BJ View, enter/exit, HUD no overlap |
| Assets and persistence | Meshy character fallbacks and Supabase storage links | Resolve recurring HTTP 402; prove fallback and verified asset license; prevent lost progress |
| Creator/business crossover | Universal Creation Graph, OmniBox, LIVE and 111 template surfaces | Rights-approved asset visible across game, showroom and video, with independent ownership/payments |

## Highest-value missing behavior tests
1. Circle Park: stand near gate → tap JUMP / CLIMB → cross safely → show state change, no collision exploit or freeze.
2. Gate opens visually **and** navigation/collision agree, including one-handed alternate action and seated driving.
3. Adult-only optional story branch: eligible verified adult + mutual consent → private fade-to-black scene → relationship state saved; never exposed to minors.
4. Intoxication effect → actual vehicle input disabled, recover → controls restored, no simulated impairment advantage.
5. Ellington: locate exact authored mission before editing; do not confuse similarly named geography or invent individuals.
6. Verify NPC routines, mission chain, radio, camera, Reel, SportVerse and business entrances all join the same game save.
7. Run visual regression tests on iPhone, plus offline/failure mode while Supabase 402 persists.

## Integration rules
- Do not delete, overwrite or abandon existing modules because another system duplicates a concept.
- Map each old subsystem to **one authoritative live controller**, with adapters for legacy events; no uncontrolled double installers or duplicated rewards.
- Prefer red/green contract and browser tests that actually exercise player-visible behavior, not merely text-presence tests.
- Keep real estate, gate/security, identities and private family data fictionalized and authorized for gameplay; don't expose real-world security layouts.
- Separate minors from mature content and require voluntary age assurance and consent.
- Retain GitHub review and release gates; never auto-merge, deploy or spend money.
- Next engineering priority is the failing phone visual gate (BJ View) and HTTP 402 character delivery, not more detached feature catalogs.
