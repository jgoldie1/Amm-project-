# TRYAMM StreetVerse / HoloVerse Super App integration register
Status: **development plan and source integration**, NOT release certification. Never present a source contract as a verified customer transaction or native 3D asset.
Primary engine: existing **Three.js + React** world; use Rapier only where actually bound into the scene.

## Implemented in this PR
- [x] Three.js original mini-city meshes rendered within the existing Chicago 3D scene at courtyard (62,62).
- [x] Building footprint collision checked by both walking `canTraverse` and driving `canDrive`; no simulation of full city traffic/rigid bodies.
- [x] In-world proximity-only courtyard check-in, localStorage V1 mini-city progress, duplicate visit guard and cleanup.
- [x] One-hand, non-graphic BJ shot/stab gameplay testing via already-existing anatomy and staged rescue/hospital-discharge runtime events.
- [x] In-game launch controls for existing HoloGPT, Holographic Gallery and Creator Studio.
- [x] GitHub Actions unit/source-contract, TypeScript and Vite build workflow; **passing outcome pending**.
- [ ] Real Chromebook and iPhone scene acceptance and 3D evidence.

## Required connected playable journey
1. Start on an *existing* Chicago / Circle Park route; fly-in cinematic with clear **SKIP INTRO** and fallback (not implemented here).
2. Enter mini-city using controlled 3D coordinates. Player/cars cannot penetrate mini-city building footprints; check-in saves and reloads. Add NPCs, shop doors, traffic, accessible paths and durable server-world state in subsequent verified work.
3. BJ V15, Jacobie and LaTeasia must use actual licensed likeness references, skinned GLBs and validated walk/talk/sit/interact clips; character switch must not erase saved gameplay. V12's previously published zero-joint rig is **not acceptable**.
4. Fictional BJ medical scenario: shot OR stab → visible non-graphic injury cue → anatomy X-ray → dispatch → arrival → treatment → discharge → health recovery. The test controller does not claim real surgery, bullet tracking, hospital interior, emergency calling or medically accurate internal organs.
5. Drive to an NPC, carry a branded parcel, demonstrate inventory and single reward guard, save/reload, share a Reel.
6. Use CrossVerse catalog (PR #735) for Chicago, New York, Philadelphia, Atlanta, Dallas, Houston, Los Angeles, San Diego, Detroit, Las Vegas, Miami, Addis Ababa and Lagos. All beyond Chicago remain preview-only until owned map/physics/navigation assets are certified.
7. Use existing HoloVerse and Holographic Gallery routes as shared creator destinations; live gallery commerce and 3D city projection require a verified secure backend.
8. LiveKit room host on Chromebook and viewer on iPhone: signed ephemeral server tokens, mic and camera permissions, authorized recording, reconnect, viewer proof and data-retention controls. Account login alone isn't a working room.
9. HoloGPT, MiddleVerse and REA audit must use a single typed intent/event contract with explicit user authorization, idempotency, audit trail and server enforcement.
10. Sandbox checkout, lead notification, webhook signatures, per-tenant access control, offline/cloud save replay and isolated backup restore. Never process live funds with game credits.
11. **One exact GitHub SHA**: full CI, mini-city tests, BJ Family, scene Playwright, LiveKit tests and production release checks all green, then human review and gated deployment.

## External components: evaluated, NOT auto-installed
| Component | Benefit | Gate before adoption |
| --- | --- | --- |
| Blender glTF 2.0 exporter / Khronos glTF-Blender-IO | Export real skinned GLB, actions/NLA clips, morph targets; prepare BJ/Jacobie/LaTeasia and city meshes | Validate actual bone skin counts, animation channels, shape keys, sizes, licenses and Chrome/iPhone performance |
| Remotion (remotion-dev/remotion) | Render branded creator reels, ad templates, billboard videos and credits | Verify current company/commercial license, provider permissions and isolate rendering to backend |
| ffmpeg.wasm (ffmpegwasm/ffmpeg.wasm) | Optional short local clip trim/transcode in-browser | Memory/CPU limits on Chromebook/iPhone, codec licenses; keep optional and server fallback |
| LiveKit agents-js (livekit/agents-js) | Server-side AI voice director, multimodal streaming | Provider credentials in secure backend, token authorization, provider costs and two-device tests |
| LiveKit components-js (livekit/components-js) | React room/player UI for streaming | Same authenticated room and recording consent requirements |
| pmndrs/xr | React Three Fiber VR/AR controls when headset/browser WebXR is supported | Headset testing, comfort, fallbacks, no browser-only claims |
| Godot / Unity | Optional future client/editor pipelines | Not required for current Three.js game release; importing them now increases deployment risk |
| REA / code analysis | Read-only audit and targeted diagnosis | Source provenance, permission, legal/technical review; never install unknown reverse-engineered binaries into production |

## Release blockers currently known
- PR #729 whole-app evidence includes unverified live-service controls; cannot be bypassed.
- PR #734 CI/test repairs are draft until exact commit checks pass; BJ Family and scene visual evidence previously failed.
- PR #730 original city generator, Mycelium and mini-district preview; PR #723 flight routines remain unmerged and overlap numerous files.
- HoloVerse gallery exists but must be tested end-to-end with media, product rights and real authenticated sessions.
- Existing emergency/anatomy simulation is fictional and not a real hospital or clinical simulation.
- HTTP 402 on external services and missing rig authority must be resolved rather than ignored.

Do not merge this PR solely on the success of a source-only regex assertion. Its regression test has real transition/collision/persistence checks for a limited neighborhood; visual proof, per-device controls and cloud authority remain separate.
