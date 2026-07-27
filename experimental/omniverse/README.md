# TryAMM Omniverse Prototype Modules

These files were reviewed from the uploaded `tryamm-omniverse-platform.zip` and preserved as experimental modules so they do not overwrite the working TryAMM livestream application.

## Included

- `HolographicMaterial.js`: experimental Three.js shader material
- `MissionSystem.js`: in-memory mission prototype
- `MissionHUD.js`: browser HUD prototype
- `telemetry.js`: renderer memory counters and world-entry logging
- `.env.example`: variable names only, with no credentials

## Not imported into production yet

These modules are not proof of a complete Living Worlds runtime. Before production integration they still need:

1. A committed Three.js renderer, scene, camera, avatar and animation loop.
2. Bundler support for ES modules and the `three` dependency.
3. Input validation and safe HTML rendering for mission text.
4. Persistent mission storage tied to authenticated player accounts.
5. Real telemetry export rather than console logging.
6. Renderer disposal tests using `renderer.info` before and after world transitions.
7. Accessibility controls and reduced-motion behavior.
8. Unit and integration tests that exercise real behavior.

## Excluded from GitHub

- The uploaded `.env.production` was not committed because environment files may contain credentials.
- The uploaded alternate `server.js` was not used because it exposed only four worlds and would replace the existing livestream backend.
- The uploaded Kubernetes file was not used because it deployed `latest`, lacked probes/resources/security controls, and did not provide real multi-region orchestration.
- The uploaded acceptance test only asserted `true === true`, so it was not treated as evidence that the platform works.

Status: **prototype code preserved; runtime integration not verified**.
