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

## 1A. Better CC0 source for fifty *real* humanoid motions
- **Quaternius Universal Animation Library** — 120+ humanoid animations, CC0: https://quaternius.itch.io/universal-animation-library
- **Quaternius Universal Animation Library 2** — 130+ more humanoid animations, CC0: https://quaternius.itch.io/universal-animation-library-2
- These are commercially usable free Standard editions, with a common retarget-friendly humanoid rig. Their downloaded assets must still be mapped and tested on BJ before being marked "PLAYED".
- The **robot model's fourteen clips** and **our fifty original procedural recipes** are separate from these source packs.
- The browser import is intentionally not automatic: no source ZIP has been downloaded, no fifty retargeted motion clips are stored in the game, and no unpaid/private-source conversion should be presumed.
- Required integration after authorized asset download: inventory GLB clips, choose fifty non-boxing actions, pin per-file CC0 license evidence, retarget to BJ, verify in Three.js, retain current player walking/driving rig, and publish only tested assets.

## 2. GitHub transformation tools (tool licenses do not license the source motions)
- https://github.com/matthewjberger/mixamo-to-gltf — Apache-2.0 code. Combine supplied character and motion files into a GLB, with a preview.
- https://github.com/enomie/Mixamo2GLBAnimationMerger — MIT code. Pipeline for combining FBX/Mixamo animations into GLB.
- Mixamo or any other content provider's asset license must be reviewed separately; a MIT/Apache-licensed converter does not make the imported motion CC0.

## 3. StreetVerse current integration status
- **67 RP actions** in `streetVerseRPActionCatalog.ts`: 17 original actions and **50 new original gesture recipes** from `streetVerseRPExtra50.ts` (not 50 imported GLBs).
- The new recipes are mapped to real BJ rig bone rotations with distinct tempo, amplitude and phase; they only execute when the appropriate bones exist.
- `StreetVerseRPActionSearch` provides pagination through the catalog in addition to search/filter. Runtime results distinguish GLB clips, procedural gestures, and unavailable actions.
- `StreetVerseMeshyBJHeroRuntime.playRPAction()` first searches the *mounted BJ GLB* for a true matching clip.
- Where compatible rig bones exist, `createStreetVerseBJRPProceduralAnimator()` offers bounded, locally computed **3D gestures** rather than pretending to have a missing animation file.
- `StreetVerseMobileWorld` subscribes to the RP PLAY/LOOP event; results are reported as `clip`, `procedural` or `unavailable`.
- `StreetVerseRPActionSearch` shows the result, rather than claiming an uninstalled GIF or GLB played.
- No raw third-party animation was copied into production; no claim of automated cross-skeleton retargeting is made.

## 3A. What fifty new gesture recipes do — and do not do
- They offer original short BJ gestures for social interaction, dancing, construction, maintenance, public safety, sports, creator and faith scenes.
- They **do not** create props, interaction physics, real repairs, weapons, boxing, or completion of mission objectives.
- The CC0 RobotExpressive GLB still has its original 14 animations. It has a robot skeleton, and no unretargeted robot clips have been published as BJ's.
- Release-quality gestures can later be replaced by separately licensed and tested retargeted GLB motion clips.

## 4. Rules before importing into production
1. Save the source URL, pinned commit, model attribution, and per-asset license.
2. Verify the GLB is binary glTF v2, contains actual nonempty AnimationClips, and is safe to load.
3. Extract clip names and their animated bone/node tracks.
4. Match or retarget source bones to approved BJ skeleton *offline*; do not accidentally animate the robot mesh in place of BJ.
5. Reject missing-mapping and wrong-rig clips; retain existing BJ idle/walk/drive animations.
6. Test actual rendered motion, framerate on Chromebook/iPhone, reduced-motion behavior, loop duration, and accessibility.
7. Add each approved original/retargeted clip to the owned StreetVerse asset registry with source/version/license metadata before publishing.

Future boxing-specific techniques and Shadow Box are explicitly excluded from this milestone.
