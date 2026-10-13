# BJ Stubbs → Epic MetaHuman → StreetVerse: production pathway

Status: **prepared integration only** (12 October 2026). A real MetaHuman head **has not** been built, exported, approved, or deployed in StreetVerse. The existing BJ V12 GLB remains the fallback.

## Why / what this addresses

MetaHuman is a character-authoring system. It helps with BJ and the StreetVerse cast: anatomically coherent head, eyes, teeth, skin, facial rig, locs, beard and compatible animation. It **does not** repair unrelated Vercel bills, website crashes, Stripe flows, Chicago buildings, vehicle physics, accessibility controllers or city rendering.

## Privacy and model authority

- Authoritative face reference: **the user's actual front and 2025/2026 side photographs**, NOT the earlier generated Chicago portrait used as a texture overlay.
- The photographs remain in a private reference workflow; never commit their pixels or embedded likeness meshes to public GitHub without explicit approval.
- A selected photograph is not an actual photogrammetry/3D head solve. Never mark `certifiedLikeness` or `likenessApproved` true until the user has reviewed real front/profile/3/4 renders.
- MetaHuman scan identities and export data may use Epic's processing services. Confirm consent before submitting someone else's likeness or footage.

## Authoring workstation

1. Install **Unreal Engine 5.6 or newer** with MetaHuman Creator and the corresponding content/plugins. The Creator is inside Unreal from UE5.6 onward; do not follow obsolete instructions to use only the legacy cloud webpage.
2. Create an isolated Unreal project called `TRYAMM_BJ_Identity_Workshop` on a capable **Windows workstation**. The web-based StreetVerse project stays untouched.
3. Enable **MetaHuman Creator** and **MetaHuman Animator**. When using a MetaHuman Identity from mesh or depth video, also install the depth-processing plugin required for that workflow. Check matching UE/plugin versions.
4. Build high-quality facial source from multiple views: the two user photos are excellent **visual references**, but a true likeness needs an accurate sculpt/scan/multiview capture (neutral + left/right; more views recommended). The earlier BJ V12 head is only a coarse geometry draft.
5. Use **Mesh to MetaHuman → MetaHuman Identity → solve → From Identity** to conform a fitted character, then manually compare nose depth, eye spacing, hairline, cheek/jaw contour, scalp, salt-and-pepper beard and loc geometry. Build as an editable MetaHuman Character.
6. Correct body proportions, custom shirt and pendant. Add properly authored skin maps, eye/teeth materials, loc and beard grooms/hair cards. Avoid the paper-flat photo-face projection from the experimental V5–V12.
7. Test **idle, walk, greet, blink, jawOpen, eye gaze** and speech animation. Standard webcam and audio facial captures are an alternative to an expensive TrueDepth setup; a depth capture is not required for every animation workflow.
8. Generate two outputs: `BJ_STUBBS_CINE` for film/cutscenes, `BJ_STUBBS_WEB_OPTIMIZED` for the web. UE Cine-sized MetaHuman assemblies are unsuitable as direct browser downloads. Bake textures/grooms and lower LODs for the web.

## Safe StreetVerse import contract

MetaHuman Creator's export tool is a DCC pipeline (geometry/DNA/materials/textures), **not a one-click GLB publish to Three.js**. Use Unreal/DCC tooling to generate an animated GLB with compatible PBR textures, skin, idle/walk clips, blink and jaw morph targets. Retarget or bake where Unreal-only rig logic cannot run in Three.js.

- Proposed same-origin web asset: `/tryamm-assets/metahuman/bj-stubbs/BJ_STUBBS_METAHUMAN_WEB_OPTIMIZED.glb`
- Dev/test opt-in: `document.documentElement.dataset.streetverseBjMetaHuman='preview'` **before** loading the Near West scene. A page refresh may be required to re-run the loader.
- The model must pass `auditBJMetaHumanForStreetVerse` (renderable triangles, skinned meshes, idle/walk, blink and mouth morphs). Rendering, morph deformation, ground contact and low-end iPhone performance must then be visually tested.
- A fallback continues to load the existing published BJ model if MetaHuman is unavailable or invalid. The old photo-matched head overlay is NOT applied to a MetaHuman preview.
- Do not mark production or likeness quality as certified based solely on structural checks. Require user approval in real rendered frontal and profile comparisons first.
- For older phones, choose 1 hero near camera and conservative resident budgets. Treat each size/FPS budget as **a test target**, not a verified performance claim.

## Release safety gate

Pass full TypeScript, import contracts, WebGL 3D renders, all three animation clips, head/eye/mouth morph playback, frame rate/memory smoke on an older phone, 404 fallback, and review by the person whose likeness it is. Deploy on a low-cost preview only after preflight; do **not** trigger unnecessary production Vercel builds.

## Epic references

- MetaHuman Creator in Unreal Engine: https://dev.epicgames.com/documentation/metahuman/metahuman-creator-in-unreal-engine
- MetaHuman from a mesh: https://dev.epicgames.com/documentation/metahuman/from-mesh
- MetaHuman Identity/from video: https://dev.epicgames.com/documentation/metahuman/from-video-footage
- Creator export tool: https://dev.epicgames.com/documentation/metahuman/metahuman-creator-export-tool-in-unreal-engine
- Character assembly and LOD: https://dev.epicgames.com/documentation/metahuman/assembly
- MetaHuman Animator: https://dev.epicgames.com/documentation/metahuman/metahuman-animator-in-unreal-engine
- License: https://www.metahuman.com/license
