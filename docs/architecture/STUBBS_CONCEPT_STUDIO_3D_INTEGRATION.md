# Stubbs Concept Studio 3D — unified production integration

Status: DESIGN CONTRACT ONLY. No third-party code, branded assets, camera feeds, Blender rendering workers, paid services or production routes are enabled.

## Why
One reusable original production surface for StreetVerse world building, Stubbs Motion Fusion avatar motion, Omni Box film production, Isaiah AI TV, Aniyah Studio music videos, creator ads, and business storefront 3D visualization. Avoid a separate competing world editor.

## Workflow
Brief / sketch / licensed reference → rights & provenance check → blockout → material and lighting recipe → Blender .blend previs → approved GLB asset → LOD/performance and accessibility QA → publish staging to StreetVerse or film timeline → final authorization.

## Integration boundaries
- Reuse `tools/blender/stubbs_film_scene.py` for a baseline offline scene, then extend to allow approved modular kit pieces and object placements only. No arbitrary scripts or remote executable imports.
- Reuse `src/runtime/StubbsFilmContinuityGate.ts` to verify continuity, approved shot, and asset permission prior to render.
- Reuse `src/runtime/StubbsFilmEnginePipeline.ts` for render/edit/export/storage/distribution stage records; code is not a running render queue.
- Reuse `src/runtime/StubbsMotionFusionCore.ts` for opt-in human-controlled animation; no camera access by default.
- Keep GLB game assets separate from video masters; require immutable clean master and validated transcodes.
- Ownership/licensing and partner attribution in a controlled Stubbs AI asset registry; no automated assumption of third-party image/likeness rights.
- Publish only through a reviewed asset manifest. Never modify production scenes or let a template upload execute Blender Python.
- Preview and creation accessible with touch, one-handed voice controls and keyboard; camera never required.
- Each business gets segregated workspace, approvals and storage references.
- Build per-client GPU, memory, and rendering cost caps, with CPU and low-quality previews available. No implication of free compute.
- Back up project .blend files, rights records, manifests, video, and public-safe previews.

## Candidate features
1. Concept board: prompts, sketches, approved references, style locking and variations.
2. City Kit: road grids, storefronts, street furniture, traffic, trees, weather presets; first target Chicago and Circle Park.
3. Character Kit: rig compatibility, original avatar materials, accessible gestures, motion retarget profiles.
4. Director Kit: camera blocking, shot plan, angles and approved continuity.
5. Product Kit: room/product placement for marketplace advertisements and virtual business showrooms.
6. Export Kit: staged GLB (game) and MP4 (video) with performance and license checks.
7. Creator license Kit: Stubbs AI catalog, derivative tracking, customer delivery and receipts once payment backend is verified.

## Release criteria
- Add schema for concept board and deterministic Blender scene generation tests.
- Run Blender headless smoke test and inspect generated .blend output (not yet done).
- Validate GLB import into a staging-only StreetVerse route, no regression to Chicago mobile UI.
- Verify FFmpeg exports and watermark-free commercial rights, media storage and retrieval, captions.
- Verify one-handed Chromebook/iPhone/Android workflow plus multiplayer performance.
- Clear prior StreetVerse storage 402 restriction, dependency security vulnerabilities and visual acceptance gates.
- Migrate via separate reviewed PR, staged deploy, and manual approval.

## Source attribution
An Instagram identity described as "concept studio3d / concept studio OMS" was not verified at time of authoring; do not attribute its products or assets to a specific vendor without confirming its exact profile. Inspiration is general concept-art-to-3D production practice only.
