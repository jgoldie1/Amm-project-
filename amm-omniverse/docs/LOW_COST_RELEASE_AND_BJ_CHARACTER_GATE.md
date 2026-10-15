# TRYAMM / StreetVerse — Low-cost release and BJ character acceptance gate

Updated October 14, 2026. Engineering release policy; NOT a provider-enforced hard billing cap.

## Vercel cost control
- Do not create a Vercel deployment per conversation, screenshot, minor fix, or Blender/GLB revision.
- Build assets off Vercel using existing authorized subscriptions. Check provider workspace credits and task pricing before submitting a credit-consuming generation.
- Require local TypeScript, full release build, asset integrity, WebGL visual screenshots, and mobile fallback tests BEFORE one manually approved Vercel release.
- Prefer GitHub source reviews and browser/local renders. Batch reviewed changes into one release; avoid repeated paid build failures.
- Project previews should be disabled by default; explicitly re-enable for major, approved release testing.
- Set an on-demand spend threshold with alerts through Vercel Spend Management. Production pause may show HTTP 503; this does not cap seats or third-party charges.
- Review Build CPU Minutes daily. Never remove a developer's paid seat without owner approval.
- Retain known-good rollback deployment and original backed-up 3D assets.

## BJ Stubbs visual-quality gates
- Approved REAL head and profile photos govern likeness. Do not use an invented movie-poster face as proof.
- Hosted 3D editing project: https://higgsfield.ai/3d-jutsu/d25c495c-32f8-4388-ab0c-63bc727c7c0e (revision 5 inspected 2026-10-14).
- Check recognizable forehead, hairline/loc silhouette, brow/eyes, nose, beard/grays, skin, outfit and height in front and side renders.
- Skeleton/morph existence and GLB-loader success do NOT imply resemblance or on-screen gameplay visibility.
- Render the real model in Circle Park StreetVerse, not only a standalone viewer. Supply iPhone 390px screenshots and compare to approved reference images.
- Keep one-hand movement, accessible camera control, and finite load/retry states; ensure old procedural animation cannot override GLB skinning.
- Check dimension, frustum, backface, skin weights, GLB download size, GPU memory, draw calls and Safari performance.
- Do not call procedural geometry GTA 6 or MetaHuman realism until actual render/likeness review passes.

## Release evidence ladder
1. SAVED: 3D project or GitHub artifact exists.
2. CODE TESTED: typecheck, full build, no-regression tests pass.
3. WEBGL REVIEWED: rendered comparison and gameplay screenshots prove visible change.
4. IPHONE VERIFIED: physical-device test of character, fallback, joystick and camera.
5. LIVE: confirmed production commit, domain alias, and user review.

Record GLB revision, Git commit, render snapshots, spend/cost-risk choice and remaining blockers. Never promote a lower evidence level into a higher claim.
