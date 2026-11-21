# Quantum Forge 8.0 — Release blockers and benchmark plan (2026-10-30)
## Evidence
- Standalone HTML preview created and JavaScript syntax checked locally. Existing procedural pipeline test passed locally.
- The GitHub character module and test are committed but have not been executed in CI.
- Headless Chromium browser execution timed out in this environment; **no browser-pass claim**.
- Existing 12 GLB filenames are inventoried; original BJ character identity and rig are **not verified**.
- No changes to production StreetVerse routes, deployments or storage objects.

## Critical blockers (priority order)
1. **Real browser E2E**: test startup, 12 controls, drag/touch, import errors, STL export, accessibility keyboard/focus, and mobile memory; capture console errors and screenshots.
2. **Real asset inspection**: download preserved original GLBs through approved Drive access, verify SHA-256 manifest, parse meshes/skins/animation clips, inspect licenses and preview without replacing originals.
3. **Animation**: skeleton retarget mapping, coordinate/scale normalization, foot grounding, idle/walk/run blending, movement/collision, one-handed controls, tests.
4. **Security**: sanitize uploaded model/image files, size and vertex limits, content moderation, no client-side secret AI keys, signed URLs, tenancy and licensing.
5. **3D printing**: manifold checks alone do not certify printability; robust mesh healing, actual thickness/scale analysis, printer/slicer profiles, overhang/support checks, physical calibration.
6. **XR**: real WebXR sessions with permission and device fallback, motion comfort, low-end mobile performance and device matrix.
7. **Generation backend**: authenticated job queue, budget limits, provider consent, asynchronous progress, cancel/retry, quality validation and own-model training only if economical.
8. **Release**: isolated preview build, automated test matrix, production regression suite, rollback, feature flag, bill/deployment clearance.

## Competitor benchmark (no ungrounded winner claim)
Compare equal prompts and image inputs across services with rights-respecting test data. Record time to first usable GLB, human-rated geometry and texture quality, rig quality, triangle count, size, import success in StreetVerse, mobile FPS, accessibility, cost per accepted asset, printability and commercial licensing. Repeat >=10 samples per category; publish methodology, raw outputs and failure rates. Current local geometry microbenchmarks cannot be compared to AI generation quality or cost.

## Practical moat
One-click game-ready asset preparation; one-hand creator UX; safe cross-publishing to StreetVerse, commerce sites, XR and printable exports; versioned original asset preservation. These are goals, not yet shipped capabilities.
