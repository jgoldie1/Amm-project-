# TryAMM Game Asset Libraries

This branch is prepared for two CC0 asset libraries for TryAMM games, prototypes, holographic interfaces, and the Living Worlds project.

## Included libraries

### Universal Animation Library Standard
Target location: `assets/third-party/universal-animation-library/Universal Animation Library[Standard]/`

- Unity FBX files
- Unreal/Godot GLB files
- Root-motion and non-root-motion versions
- Setup images and original license

Use the non-root-motion files when movement is controlled by gameplay code. Use `_RM` files when the animation itself should move the character.

### Kenney Platformer Kit 4.1
Target location: `assets/third-party/kenney-platformer-kit/`

- FBX, GLB, OBJ, and MTL model formats
- Platform blocks, terrain, characters, coins, keys, doors, hazards, props, plants, trees, and environmental objects
- Texture files and previews
- Original license

## Claude implementation instructions

1. Never delete or overwrite the original third-party source files.
2. Import only the formats required by the selected engine.
3. Prefer GLB for browser, Three.js, Babylon.js, or Godot workflows.
4. Prefer FBX for Unity and Unreal workflows when animation retargeting is required.
5. Create engine-specific prefabs, materials, colliders, and optimized copies outside `assets/third-party/`.
6. Add attribution in project credits even though both packs are CC0.
7. Optimize web builds by converting selected models to compressed GLB and loading assets on demand.
8. Do not ship every model in one web bundle.

## Recommended first vertical slice

Build a playable platformer test level using one Kenney character, grass and snow blocks, coins, a key, a locked door, a chest, a moving platform, spikes, a spring, and a finish flag. Apply Universal Animation Library idle, walk, run, jump, fall, land, and celebration animations.

Add keyboard, controller, and touch controls, checkpoints, a timer, collectible count, restart, pause, and a simple results screen.

## License status

Both libraries include Creative Commons Zero (CC0 1.0) licenses and can be used for personal, educational, and commercial projects. Keep the original license files with the assets.

## Upload status

The documentation and Git LFS configuration are committed on this branch. The binary FBX, GLB, OBJ, PNG, and related asset files must be uploaded with Git LFS because the connected GitHub text-file API cannot transfer binary files. Use the prepared upload package and script supplied with this change.