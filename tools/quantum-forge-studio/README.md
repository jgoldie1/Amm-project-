# Quantum Forge 8.0 — isolated Creator Studio

Status: prototype source committed, **not yet built or browser-tested**. No production route or assets changed.

## Local preview
The studio imports `three` and `three/addons/loaders/GLTFLoader.js`, which are installed in the existing `amm-omniverse` app. To preview without modifying production, use a separate Vite test configuration or copy the `tools/quantum-forge-*` modules into a Vite project that has Three.js installed. Opening `index.html` directly as a file will not resolve the bare `three` import.

## Implemented
- Twelve editable numeric design parameters and procedural 3D building mass
- Interactive Three.js viewer and local GLB visual inspection
- Browser image decoding to a grayscale heightfield
- Mesh topology check and prototype STL export for closed geometry
- WebXR immersive AR/VR capability check (not an XR session)

## Not implemented / requires real engineering
- Text/image-to-3D generative model (current text is rule-based, image is relief)
- Automatic skinning, skeleton creation, retargeting and gameplay animation controller
- VR/AR immersive session rendering and device testing
- Robust mesh healing, thickness verification, slicer integration and physical print tests
- 12D as physical dimensions (the controls are twelve ordinary design parameters)
- Licensing and safety checks for imported assets

## Next safe release gate
1. Build studio with Vite, fix bundling errors, test browser canvas and file import.
2. Run `node tools/quantum-forge-core.test.mjs`, `node tools/quantum-forge-pipeline.test.mjs`, `node tools/quantum-forge-bridge.test.mjs`.
3. Run existing StreetVerse smoke suite and confirm no regression.
4. Publish only behind a separate preview route after passing checks; keep production untouched.
