# TRYAMM StreetVerse Vehicle + FaithVerse Creatures — Engineering Acceptance
Date: 2026-11-18 | Branch: feature/ai-commons-one-push-20261118 | Unmerged draft PR #744

## Existing system reused
- StreetVerseMobileWorld.tsx is the active Chicago 3D gameplay loop, not a detached vehicle demo.
- StreetVerseGamepadBridge.tsx already translates standard Gamepad API inputs; test on supported browsers with actual paired controller. This does NOT enable console-native PS5 functionality.
- StreetVerseVehicleDynamicsHUD.tsx and StreetVerseVehicleDynamics.mjs contain the existing physics tuning/control test. The current active driving loop has a distinct TypeScript deterministic live-world core, StreetVerseVehicleDynamics.ts. **Before release, reconcile and certify both cores against the same vehicle preset and input specification; no equivalence has been proven.**
- FaithVerseAncientCreature3D.tsx is the existing procedural skinned creature concept viewer; no duplicate viewer required.

## Newly connected to the active StreetVerse world
- Original low-poly rideable one-rider motorcycle near Circle Park, alongside existing cars and repair mission vehicle.
- Vehicle-specific state and kinematic handling: acceleration, braking, car reverse, motorcycle no reverse-throttle, steering lag, rolling resistance, wet grip, lean and collision stop/damage.
- Existing one-hand driving cap carried into vehicle physics; rider seated pose now follows motorcycle lean and vehicle occupancy event reports the correct type.
- Collision remains based on existing walk/drive clearance checks. This is **not** verified Rapier rigid-body wheel/suspension/traffic collision and must not be described as such.

## FaithVerse creature designs
- Nephilim: uneasy large stony silhouettes with asymmetrical shoulder forms and soft glowing eyes; refer to Genesis 6:1–4 and Numbers 13:32–33. Existence, origin, height and appearance remain debated.
- Watchers: symbolic dark draped figures with irregular feather-like wings and subdued eye glow; refer to 1 Enoch 6–15, a source with distinctive canon status, with Genesis 6 as comparison. No literal angel anatomy is claimed.
- Goliath: armored human Philistine warrior, period-inspired shield and spear; refer to 1 Samuel 17:1–58. Never relabel him a fallen angel or established Nephilim.
- Avoid graphic gore and equating ordinary human differences, cultures, disabilities, religious groups or ethnicities with monsters. Family default hides teen dramatic options. Distinguish original actor models from historical evidence.

## Automated and device acceptance
1. Execute `node test/faithverse-creature-canon-contract.test.js` at repo root.
2. After `npm ci` in `amm-omniverse`, execute `node tests/streetverse-vehicle-physics-runtime.mjs`, `npm run typecheck`, `npx vite build`.
3. Confirm unchanged existing StreetVerse release gate, first repair-car tutorial, delivery, NPC TALK, save/reload and mission receipts.
4. On Chromebook, test joystick, keyboard, Xbox/DualSense-compatible gamepad if connected, one-hand assist, accelerate/brake/reverse/lean, damp grip, collisions, exit/enter, low-power FPS and memory.
5. On iPhone, test touch steering and brake, safe area, graphics fallback, overlay priority, seat/exit transitions and relaunch.
6. FaithVerse: 2D fallback plus existing original WebGL creature rig on an actual device; check reduced motion, captioning, source comparison, teen filtering, voice accessibility and provenance. The 3D prototypes are not final asset-verified exportable GLBs.
7. Keep 3D/player-specific cloud multiplayer, voice NPC and authoritative Mycelium state flagged **unverified** until server-side tests.
8. No porting of GTA 6 proprietary animations/assets, no claim that browser WebGL includes hardware NVIDIA DLSS 5. Adaptive resolution is the immediate cross-platform graphics strategy.

## Remaining launch gates
- Single authoritative vehicle dynamics API and collision/physics integration
- Verified GLB humanoid and creature skin weights, animation clips and owner-approved appearance
- Production performance and accessibility acceptance on Chromebook/iPhone
- Signed multiplayer state, authorized AI agents, safe voice/captions
- Rights, source editorial reviews and creator approval for FaithVerse
- Merge, deployment and live-device evidence are separate explicit approvals
