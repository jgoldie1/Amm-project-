# StreetVerse / TRYAMM — Game Development Tool Inventory and Work Orders
Date: 2026-11-03 | Device: Chromebook 32 GB storage | Work branch: `streetverse-chromebook-workbench`

## Status vocabulary
- **Found in source** means code exists in the repository, NOT that a game feature is usable in production.
- **Validated** means a stated, reproducible test passed in a specified environment.
- **Blocked** means a needed asset, service, test, or credential is missing.
- **Production-ready** requires real ChromeOS/mobile testing, payment/live service checks, access controls and the main release gate. No inspected system is certified by this inventory.

## Existing systems — reuse, do not reinvent
| Existing tool | Source path | Observed capability | Status / next action |
|---|---|---|---|
| StreetVerse West Side World Builder | `amm-omniverse/src/components/StreetVerseWestSideWorldBuilder.tsx` | Defines Circle Park, Roosevelt, Taylor Street, UIC, 77-area / state / world scales, props and mission tools | **Source found**; source contract tests available. Validate live 3D scene and collision on Chromebook |
| Visible Forge Bridge | `src/runtime/StreetVerseVisibleForgeBridge.ts` | Clones existing loaded native meshes; park/street/storefront placement, undo, local storage | **Source found**; 24-placement limit; requires native asset layer to load |
| Quantum World Builder Orchestrator | `src/runtime/StreetVerseQuantumWorldBuilderOrchestrator.ts` | Dependency plans, rights review, zone compilation, certification gates | **Source found**; planning, not automatic city publishing |
| World Forger | `src/game/forger/StreetVerseWorldForger.ts` | Code-defined world building pipeline | **Source found**; separate integration tests needed |
| Native Asset Foundry | `scripts/tryamm-native-asset-foundry.mjs` + `src/data/TryammNativeRuntimeAssetCatalog.ts` | Generates native WebGL GLB objects and city placements without Meshy credits | **Source found**; generated asset output directory absent from branch; run authorized build then inspect GLBs |
| Free asset catalog + sync | `src/data/TryammCc0FreeAssetCatalog.ts`, `scripts/sync-cc0-free-assets.mjs` | 29 catalog entries (verify count with worker), pinned third-party Kenney CC0 candidate pack | **Blocked**: `public/free-assets/kenney/` absent in branch; verify source/license/URL and fetch to cloud as needed |
| AI Café browser coordination | `src/runtime/AICafeMultiAgentRuntime.ts` | Has roles including asset engineer, world builder, controls, XR, release guardian; queues local browser events | **Source found**: queue alone executes no model or server coding task |
| AI Café server worker | `api/_lib/ai-cafe-executor.js`, `scripts/ai-cafe-worker.mjs` | Leased DB jobs for `website-draft` and `city-build-plan` | **Blocked** for coding jobs, requires Supabase service role and cloud runtime; not an arbitrary code agent |
| BJ hero GLTF/animation loader | `src/runtime/StreetVerseMeshyBJHeroRuntime.ts`, `src/components/StreetVerseMobileWorld.tsx` | V15 remote reference; V12/V7/V6 local fallback; GLTFLoader, AnimationMixer, face pose hooks | **Source found**; V15 URL/live file inaccessible from current test environment; must verify likeness and playback on device |
| BJ-owned GLB publisher | `scripts/publish-bj-owned-v7-glb.mjs` | Copies owned native hero to V6/V7/V12 target if generated GLB exists | **Blocked** unless native hero foundry output exists, no photo-likeness claim |
| BJ Articulated Animated v3 asset | `BJ_Articulated_Animated_v3_PROTOTYPE.glb` (Drive) | 216 KB GLB, 126 meshes, six animation clips, 15,420 triangles of static geometry | **Validated** geometry parsing, **not** face likeness, rig playback, or mobile GPU use |
| Chromebook WebGL game v4 | `public/chromebook-streetverse-3d-v4-bj.html` | Own BJ v3 static mesh embedded; mission repair → drive → NPC → building → second floor; one-hand buttons | **Validated** offline mocked WebGL mission; browser/GPU test remains necessary |
| StreetVerse main 3D world | `src/components/StreetVerseMobileWorld.tsx`, `StreetVerseMobilePlayableWorld.tsx` | Production Three.js gameplay/cameras/missions | **Source found**; existing release workflow failures and missing original asset remain blockers |
| Quest/social/commerce | `src/runtime/StreetVerseMissionDiscoveryRuntime.ts`, `OmniLiveWorldReactionBridge.ts`, `StreetVerseCommerceWorldRuntime.ts` | Missions, LIVE links, business/store state | **Source found**; no proven LIVE billing or Stripe checkout readiness |

## Free asset choices, lowest storage first
1. **Your owned native foundry and confirmed original assets** — preferred. Generates assets cloud-side; no Meshy generation credits for native props. Preserve originals in Drive; only small optimized assets go to browser.
2. **Kenney City Kits, Car Kit, Furniture, Nature** — upstream CC0 allows use in commercial games, with no attribution required. Existing project includes a pinned sync script, but the files are not currently present in the branch. See https://kenney-assets.itch.io/car-kit and https://kenney-assets.itch.io/city-kit-suburban. Verify download source / exact licensing before publication.
3. **Poly Haven** — PBR textures, HDRI and environment models under CC0: https://polyhaven.com/license. Download compressed resolutions appropriate for Chromebook.
4. **Mixamo** — free Adobe ID, free humanoid rigging and animation permitted in commercial video games per official FAQ: https://helpx.adobe.com/creative-cloud/faq/mixamo-faq.html. Re-target animation to verified BJ rig; keep rights/usage records.
5. **Quaternius** — free assets and commercial game integration, but as of Aug 28, 2026 current site references Quaternius Asset License v1.0 (QAL), **not blanket CC0**. Do not resell stand-alone assets; keep asset-specific license with each download: https://github.com/Quaternius/quaternius.github.io/blob/main/license.html.

## Our real no-subscription game-dev CI workers
- `docs/STREETVERSE_AI_CAFE_GAME_DEV_QUEUE.json`: explicit allow-listed work orders.
- `amm-omniverse/scripts/streetverse-ai-cafe-game-dev-workers.mjs`: executes bounded source checks / offline WebGL gameplay tests; creates a draft Circle Park native placement JSON; generates missing-assets, AI Café scope and release-blocker reports.
- `.github/workflows/streetverse-ai-cafe-game-dev-workers.yml`: on an approved work-order commit, GitHub Actions runs Node 24, no dependency install, no API secrets, 4-minute timeout, read-only repo, 5-day artifacts.
- Reports appear in the workflow's **Artifacts** section; they are evidence of what passed/blocked, not proof a commercial game was released.
- No LLM model API is used; **these are deterministic coding/QA/build workers**, not autonomous agents capable of inventing new features from open-ended requests. ChatGPT can prepare changes to the branch for the human to review.
- Browser-local `tryamm:ai-cafe-task` events are **not yet connected** to GitHub's queue. To submit a work order today, ask ChatGPT to update the GitHub JSON; this is a real cloud execution trigger when Actions is enabled.

## Highest-value repairs in order
1. ChromeOS v4 BJ-prototype 3D movement / one-hand joystick acceptance, with WebGL fallback.
2. Get real V15 BJ file (authorized self likeness) and audit hash, skeleton, material, animation and download performance. Do not substitute an NPC.
3. Run native asset foundry and curated Kenney sync in the cloud with verified license, no bulk Chromebook downloads.
4. Bind the verified BJ GLB to the full `StreetVerseMobileWorld.tsx` Three.js loader, not just the standalone proof.
5. Fix actual missing Taylor Street button / NPC and BJ family browser test if real QA still fails.
6. Instrument business sale and cost dashboards; Stripe live mode remains gated, and artist music/likeness rights are separate from BJ's self-consent.

## Release protections
Never remove failing release gates, merge automatically to `main`, create cloud subscriptions, post to the wrong Metricool account, issue payments/creator payouts, or claim automated coding AI generated a finished game without evidence. User-approved BJ self-likeness can be used in the game; archive originals safely and do not expose unnecessary personal reference photos publicly.