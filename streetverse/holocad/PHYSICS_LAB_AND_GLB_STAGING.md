# HoloCAD Physics Lab and GLB Asset Staging

**Development only** · 2026-11-04 · draft GitHub PR #695

## Added to HoloCAD

Within **StreetVerse → HOLO CAD / TEARDOWN**, the two new buttons are:

### ⚙️ PHYSICS LAB

Four simple, bounded classroom calculators, implemented entirely in the browser with no paid dependencies or external API key:

| Lesson | Formula/model | What it can demonstrate | What it cannot validate |
|---|---|---|---|
| Robot joint torque | \(\tau = m g L |\sin(\theta)|\) | Approximate gravity torque magnitude and load-times-angular-speed power | Motor selection, dynamic controls, gearing, safe human interaction |
| One-axis static balance | Weighted load offset + \(h\tan(\theta)\); compare to half support width | Center-of-mass projection relative to a simple contact width | Real robot locomotion, biped balance, sloped terrain and wind |
| Ideal circular orbit | \(v=\sqrt{\mu/r}\), \(T=2\pi\sqrt{r^3/\mu}\) | Earth's idealized circular orbit velocity and period at altitude | Launch trajectory, orbit perturbations, spaceflight navigation, safety |
| Steady energy | \(P_{net} = P_{load}-\eta P_{solar}\), runtime = Wh / positive net draw | Simple electric consumption and assumed solar offset | Actual battery chemistry, night/clouds, charging safety, perpetual energy |

Default lesson follows the selected HoloCAD subject (e.g. spacecraft → orbital model, robotic arm → torque). The selected part name is displayed as context; **the live model mesh is not used as a physical parameter source**. Numerical results are separate from the quantum-circuit emulator, robotics commands, real-world diagnostics, and StreetVerse reward logic.

If solar input exceeds the assumed constant load, the energy example **does not** return an infinite runtime; it says the duration cannot be inferred from this simple steady-state model.

### 📦 INSPECT GLB ASSET

- Choose a **local** binary glTF 2.0 (`.glb`) file up to 24 MiB. Unzip the approved archive before choosing the inner `.glb`.
- Inspect glTF header, chunks, asset version, mesh count, scene count, nodes, skins, materials, animation clip labels and channel counts.
- Flag external resource references for additional review.
- The file is **not uploaded**, rendered into StreetVerse, retained, automatically trusted, licensed, retargeted to BJ, or converted into a manufacturing file.
- Does not read ZIP files or `.gltf` JSON-plus-external-assets packages.
- Inspected metadata cannot establish that a skeleton binds correctly, a mesh is visually correct, a texture is safe, or an animation is approved for commercial use.

The downloaded Quaternius Universal Animation Library Standard archives were previously saved to the dedicated Google Drive Soul Ascension folder. To inspect one, download the Drive archive bundle, unzip the outer bundle, unzip the original Quaternius ZIP, then select a `.glb` file in HoloCAD. This action remains local; it does not link the Drive account, auto-import third-party clips, or grant rights.

## Source files and verification
- Mathematics: `amm-omniverse/src/game/holocad/holocadPhysicsSandbox.ts`
- Panel: `amm-omniverse/src/components/HoloCADPhysicsSandboxPanel.tsx`
- GLB validator: `amm-omniverse/src/game/holocad/holocadGLBInspector.ts`
- GLB inspector UI: `amm-omniverse/src/components/HoloCADGLBAssetInspector.tsx`
- Tests: `amm-omniverse/tests/streetverse-holocad-physics-sandbox.test.mjs` and `streetverse-holocad-glb-inspector.test.mjs`
- CI: `.github/workflows/streetverse-holocad-living-xr.yml` runs unit tests, TypeScript, and web app build.

## Next release gates
1. Pass GitHub Actions for the final branch head and keep the PR in draft until the base HoloCAD v24 branch and StreetVerse pilot are ready.
2. Browser QA on Chromebook: switching 13 models, physics sliders, GLB file size guard, invalid file handling, AR/VR fallback.
3. Ground-truth a small set of approved GLBs through a separate GLTFLoader viewer and rig/track validator.
4. Later add an optional high-fidelity robotics engine (e.g. Gazebo or Isaac Sim) on a capable workstation; no physical motors, drones or assistive equipment should be connected without an explicit safety and permission review.

**Reality boundary:** These are idealized classical physics demonstrations and local asset metadata checks. They do not validate unproven antigravity, moon-energy, quantum harvesting, aerospace qualifications, spacecraft operations, robotics safety, or clinical claims.
