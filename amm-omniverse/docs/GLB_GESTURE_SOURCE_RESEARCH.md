# StreetVerse RP animation sources and compatibility gate

Research date: 2026-11-04. Scope: **BJ animation clips** for the open-world HOLO ACTIONS carousel. The **Shadow Box** belongs to a future dedicated boxing game and is not included here.

## 1. Verified GitHub asset source — CC0
- Repository: https://github.com/mrdoob/three.js
- Model folder: https://github.com/mrdoob/three.js/tree/dev/examples/models/gltf/RobotExpressive
- GLB: https://github.com/mrdoob/three.js/blob/dev/examples/models/gltf/RobotExpressive/RobotExpressive.glb
- License evidence: https://github.com/mrdoob/three.js/blob/dev/examples/models/gltf/RobotExpressive/README.md
- Model author Tomás Laulhé; modifications by Don McCurdy; model README explicitly states **CC0 1.0**.
- Known clips in the example: Dance, Death, Idle, Jump, No, Punch, Running, Sitting, Standing, ThumbsUp, Walking, WalkJump, Wave, Yes. Do not assume they work with BJ's skeleton.

This GLB is a small, lawful *test asset for clip discovery, imported 3D playback and retargeting*. It is a distinct robot rig. **Never copy its AnimationClip directly onto BJ without verified bone mapping and a visible movement test.** Punch is an animation in that asset, **not** permission to add combat or boxing to the StreetVerse carousel.

## 2. GitHub transformation tools (tool licenses do not license the source motions)
- https://github.com/matthewjberger/mixamo-to-gltf — Apache-2.0 code. Combine supplied character and motion files into a GLB, with a preview.
- https://github.com/enomie/Mixamo2GLBAnimationMerger — MIT code. Pipeline for combining FBX/Mixamo animations into GLB.
- Mixamo or any other content provider's asset license must be reviewed separately; a MIT/Apache-licensed converter does not make the imported motion CC0.

## 3. StreetVerse current integration status
- 17 named RP actions in `streetVerseRPActionCatalog.ts`.
- `StreetVerseMeshyBJHeroRuntime.playRPAction()` first searches the *mounted BJ GLB* for a true matching clip.
- Where compatible rig bones exist, `createStreetVerseBJRPProceduralAnimator()` offers bounded, locally computed **3D gestures** rather than pretending to have a missing animation file.
- `StreetVerseMobileWorld` subscribes to the RP PLAY/LOOP event; results are reported as `clip`, `procedural` or `unavailable`.
- `StreetVerseRPActionSearch` shows the result, rather than claiming an uninstalled GIF or GLB played.
- No raw third-party animation was copied into production; no claim of automated cross-skeleton retargeting is made.

## 4. Rules before importing into production
1. Save the source URL, pinned commit, model attribution, and per-asset license.
2. Verify the GLB is binary glTF v2, contains actual nonempty AnimationClips, and is safe to load.
3. Extract clip names and their animated bone/node tracks.
4. Match or retarget source bones to approved BJ skeleton *offline*; do not accidentally animate the robot mesh in place of BJ.
5. Reject missing-mapping and wrong-rig clips; retain existing BJ idle/walk/drive animations.
6. Test actual rendered motion, framerate on Chromebook/iPhone, reduced-motion behavior, loop duration, and accessibility.
7. Add each approved original/retargeted clip to the owned StreetVerse asset registry with source/version/license metadata before publishing.

Future boxing-specific techniques and Shadow Box are explicitly excluded from this milestone.
