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

## 1A. Verified CC0 humanoid sources — free Standard versus paid full collections
- **Quaternius Universal Animation Library**: https://quaternius.itch.io/universal-animation-library. The full Source collection advertises 120+ clips; the *free Standard* ZIP downloaded here has **43 actual clip names** in `UAL1_Standard.glb`, including `Dance_Loop`.
- **Quaternius Universal Animation Library 2**: https://quaternius.itch.io/universal-animation-library-2. The full Source collection advertises 130+ clips; the *free Standard* ZIP has **43 actual clip names** in `UAL2_Standard.glb`. The included female mannequin GLB has no animation clips.
- Both downloaded free Standard archives and checksum receipts are saved in Google Drive: https://drive.google.com/drive/folders/1zTy63AkvKJa9OKA8kuS6mqLW76n-T-7c. Source acquisition run https://github.com/jgoldie1/Amm-project-/actions/runs/41879917623 completed successfully.
- Exact ZIP SHA-256 values: UAL1 `cc73fc4e495b82958207316596317a3f40b9fa38065bde1027937452da537724`; UAL2 `4008ea208a604773a2b2177d965f0f5d3195498b5bf838c3f5785d68e95f2a68`.
- The **86 free Standard clip names are not 86 dances**. The current 120-decade Soul Ascension reference catalog is not equivalent to 120 individually authored dance animation clips. Release-quality BJ animations require approved retargeting and visual tests; no weapon or boxing clips are imported to open-world gameplay.

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
