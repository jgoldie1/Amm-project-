# Living Worlds Runtime Milestone Report

## WORLD RUNTIME MILESTONE STATUS
Verified in an offline Node test using the exact runtime files from the branch patch. The test covers registry validation, portal transition, memory release, and budget enforcement.

## BRANCH / LOCAL COMMIT / GIT STATUS
- Branch: `agent/world-runtime`
- Main branch: unchanged by this milestone
- Deployment: not performed
- Local verification environment could not reach GitHub directly, so the acceptance test was executed from the generated runtime archive that matches the branch files.

## FILES CREATED / UPDATED
- `contracts/world-registry.schema.json`
- `data/worlds.json`
- `src/worlds/world-registry.js`
- `src/worlds/world-loader.js`
- `src/worlds/world-api.js`
- `src/worlds/world-persistence.js`
- `src/worlds/presence-adapter.js`
- `public/world-runtime-client.js`
- `test/world-runtime.test.js`
- `docs/worlds/RUNTIME_INVENTORY.md`
- `docs/worlds/MILESTONE_REPORT.md`
- `server.js`
- `package.json`

## EXISTING MODULES REUSED
- Existing Express application
- Existing authentication middleware
- Existing JSON store and serialized save queue
- Existing server process
- Existing renderer/scene/avatar/camera are required through dependency injection; the runtime never creates a second renderer

## WORLDS LOADED
- `faith-hub`
- `lion-kingdom-gate`

## PORTAL TRANSITION VERIFIED
Yes. The test places the avatar inside the configured `faith-hub` portal radius and asserts that the current world becomes `lion-kingdom-gate`.

## MEMORY RELEASED ON UNMOUNT
Yes, under the mocked `renderer.info.memory` acceptance test.

- Initial baseline: geometries `0`, textures `0`
- `faith-hub` mount: geometry count increased above baseline
- Before `lion-kingdom-gate` mounted: the new world's recorded baseline was geometries `0`
- Final unmount: geometries `0`, textures `0`

The transition method refuses to mount the target world if the previous world's counts do not return to baseline.

## BUDGET ENFORCEMENT VERIFIED
Yes.

- A `planned` world is refused as not enterable.
- A test world with `maxGeometries: 1` attempts to mount two geometries.
- Mount is rejected with the specific error containing `geometry ceiling 1`.
- Resources created by the rejected mount are disposed and geometry count returns to `0`.

## TEST COMMAND / RESULTS
```bash
node --check src/worlds/world-registry.js
node --check src/worlds/world-loader.js
node --check src/worlds/world-api.js
node --check src/worlds/world-persistence.js
node --check src/worlds/presence-adapter.js
node --check public/world-runtime-client.js
node test/world-runtime.test.js
```

Result:
```text
Living Worlds runtime tests passed: registry, portal transition, memory release and budget enforcement.
```

## HOW TO RUN THE WORLD LOCALLY
1. Install the project dependencies.
2. Start the existing TryAMM server.
3. Import `WorldLoader` and create the registry.
4. Pass the existing Living City renderer, scene, avatar, camera and `THREE` instance into the client boot function.
5. Start with `faith-hub`.

The runtime must be integrated where the real Living City objects are created. It intentionally does not create replacements.

## HOW TO ADD WORLD #3
Adding a third world requires a registry row only. Example:

```json
{
  "slug": "chicago-commons",
  "name": "Chicago Commons",
  "status": "live",
  "version": 1,
  "ageLane": "all",
  "spawn": { "x": 0, "y": 1, "z": 0 },
  "budget": { "maxGeometries": 20, "maxTextures": 10 },
  "environment": {
    "kind": "primitive",
    "fallback": {
      "shape": "box",
      "size": [28, 1, 28],
      "color": "#1f4e79"
    }
  },
  "portals": []
}
```

No loader code changes are needed.

## KNOWN LIMITATIONS
- The renderer-memory test uses a deterministic mocked renderer because a headless WebGL context is not available in this execution environment.
- Exact production integration still needs the repository paths where the existing Living City renderer, scene, avatar and camera are instantiated.
- GLTF asset loading is a dependency-injected seam and currently falls back to primitive geometry when no asset loader is supplied.
- Multiplayer is intentionally not built. Only the presence adapter interface and solo-ambient implementation are included.
- Supabase persistence was not introduced because the current app uses its existing JSON store. The client includes a local fallback.

## NEXT MILESTONE
Connect the dependency-injected runtime to the exact existing Living City creation point, then run the optional browser/WebGL integration test against the real renderer and assets before merging.