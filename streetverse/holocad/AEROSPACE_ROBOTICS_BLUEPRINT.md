# StreetVerse HoloCAD — Aerospace, Robotics & Smart-Systems Laboratory
**Development blueprint • 2026-11-04**  
Repository branch: `feature/holocad-living-systems-teardown` • draft PR #695  
Existing safe HoloCAD v24 building pilot and AR/VR teardown UI preserved; no production deployment.

## Implemented in the development branch
Nine additional **original low-poly schematics** with **129 detachable parts**, alongside the prior four presets and 81 parts. Total: **13 subjects / 210 parts**.

| Subject | Parts | Layered systems and experiments |
|---|---:|---|
| Aircraft | 16 | Exterior, wings, engines, avionics, sensors, landing gear |
| Spacecraft | 14 | Habitat, energy, propulsion concept, life support, thermal, comms |
| Satellite | 13 | Bus, solar panels, instruments, reaction-wheel concept, antenna |
| Drone / UAS | 15 | Four rotors, battery, camera, flight-processor illustration |
| Humanoid robot | 16 | Body, joints, limb actuation, sensors, power and controller |
| Robotic dog | 13 | Quadruped limbs, lidar concept, compute, battery, safety indicators |
| Planetary rover | 16 | Six wheels, linkages, camera mast, science arm, solar array |
| Mobility exoskeleton | 13 | Illustrative harness, hip/knee joints, sensing, battery, safe-stop concept |
| Industrial robotic arm | 13 | Base, arm links, wrist, end effector, sensor and controller |

Every subject inherits the existing 3D exploded diagram, inspect/select, layer filtering, detached-part marking, simulated fault toggles, reassembly, and JSON training-manifest export.

The lab includes opt-in **real WebXR immersive AR/VR sessions when supported** and regular Chromebook browser fallback. Selected parts can be inspected with XR controller input, but the models are not actual AR surface-anchored or depth-aware objects.

## New sandbox diagnostics
The `diagnoseHoloCADTraining` function examines **only the model's own detached/fault flags**, groups them by subsystem layer, calculates an **exercise completeness percentage** and suggests training steps to reinstall/reset components.

It does **not** diagnose real engines, aircraft, spacecraft, robots, medical patients, animals or buildings. No hardware probes, mission-critical sensor data, or cloud telemetry are connected.

## Recommended next engineering milestones (not yet implemented)
1. **Physics visualization sandbox:** explain lift/thrust concepts, mass/center-of-mass, torque, joint kinematics, orbital motion and energy budgets as classroom simulations. Do not use the output to control real craft or certify designs.
2. **3D model asset pipeline:** safely import verified creator-owned GLB/GLTF/CAD references, validate mesh/rig structures, source licenses, bounding boxes and units, then use original part hierarchy rather than generic schematic primitives.
3. **ROS 2 / Jetson digital-twin adapter:** receive opted-in simulated robot joint state, battery and sensor topics through authenticated local gateways, never direct unrestricted command outputs to motors.
4. **Mission sandbox:** teacher-assigned virtual repair missions for damaged rover wheels, sensors, robotic arms, satellite solar-panel deployment and drone inspection. Reward state must remain server-authoritative in StreetVerse.
5. **Research testing board:** track proofs and failure modes for speculative programs such as Silver Hawk, antigravity, ambient/blue energy harvesting, lunar power, and 12D printing. These are **unverified R&D concepts**, not demonstrated working systems. Each needs measurements, independent reproducibility and safety review before engineering or marketing claims.
6. **Collaborative HoloCAD classroom:** consent-driven instructor sessions, guided AR/VR lessons, private room access, accessible one-hand/keyboard operations and secure records of completed *simulation* exercises.
7. **Simulation-to-manufacturing gateway:** read-only 3D export, material/bill-of-materials drafts, BOM estimates and professional design review. Do not auto-generate G-code, operate manufacturing hardware or claim structural/material tolerance certification.

## Cost and safety
- Use existing Three.js and WebXR stack; no new paid runtime service is needed for the browser-lab prototype.
- Source-level tests, TypeScript and Vite build must pass before a playable preview is called ready.
- Live robotics, drones, aircraft and medical/wearable devices require dedicated safety engineering, authentication, human oversight, regulatory and vendor testing.
- Clinical/veterinary anatomy, vehicle repairs and aerospace instructions must never be treated as validated based on these shapes.
- The "Quantum Server" is currently a **separate CPU classical quantum-circuit simulator prototype**, not an actual quantum processor or an authoritative flight/robot controller.
- Shadow Box remains reserved for the future boxing game.

## Development entry point
HoloCAD viewer: `amm-omniverse/src/components/StreetVerseHoloCADLivingSystemsLab.tsx`.  
Data: `amm-omniverse/src/game/holocad/aerospaceRoboticsPresets.ts`, `livingSystemsPresets.ts`.  
Diagnostics: `amm-omniverse/src/game/holocad/holocadTrainingDiagnostics.ts`.  
Contracts: `amm-omniverse/tests/streetverse-holocad-living-xr-contract.mjs`, `streetverse-holocad-aerospace-robotics-contract.mjs`.  
Workflow: `.github/workflows/streetverse-holocad-living-xr.yml`.
