# HoloCAD Quantum Sandbox — aerospace & robotics integration

2026-11-04 • Development branch `feature/holocad-living-systems-teardown` • draft PR #695

## What was implemented
- A new **⚛️ QUANTUM SANDBOX** button in the existing HoloCAD 3D teardown laboratory. It lazily loads the educational circuit panel; no additional paid services.
- A **local, classical 1–4-qubit state-vector simulator**, deliberately aligned with the payload and H/X/Z/S/T/CX gate semantics of the independent TRYAMM Quantum Server draft, PR #694.
- Four classroom circuits: one-qubit superposition, two-qubit Bell correlation, H–Z–H interference and T-gate interference.
- Adjustable shot sampling (64–1024 from the UI), edit/undo/reset gate controls, result histograms and numerical probabilities.
- Up to four simulated qubits, 48 gates and 2,048 shots as absolute runtime bounds.
- Lesson suggestion based on the opened subject, including aircraft, spacecraft, satellite, drone, robot dog, rover, humanoid, robotic arm and exoskeleton.

## What it does for HoloCAD
1. Students can inspect a rover, spacecraft, satellite, drone or robot in 3D and explore mathematical circuit properties in a separate panel.
2. It builds a low-cost pathway to richer classroom assignments and hybrid classical/quantum programming lessons without requiring physical quantum hardware or cloud compute.
3. The diagnostic panel reports only manually marked schematic faults. The quantum simulator **does not receive those faults as a physics sensor, predict failures, repair hardware, change game rewards, alter 3D anatomy or issue motor/flight commands.** The on-screen count is for lesson context only.
4. WebXR, accessibility controls, original CAD scenes and current gameplay remain unchanged.

## Relationship to TRYAMM Quantum Server draft
- The browser engine lives at `amm-omniverse/src/game/holocad/holocadQuantumSandbox.ts`, with UI `HoloCADQuantumSandboxPanel.tsx`.
- The server experiment remains in **separate draft PR #694**, branch `quantum-server-lab-v1`: `services/quantum-server/src/server.mjs`.
- This implementation is **offline/local, not a deployed server connection**. Both accept a `{qubits,gates,shots}` circuit request; both produce classical simulated state probabilities and measurement counts.
- The browser contains **no server bearer token, remote request, quantum-hardware access, hardware automation or paid cloud dependency**.
- A later secured backend-to-backend adapter can be considered only after server auth, CI, cost caps, rate limits and real deployment are verified. Do not expose the bearer token directly in browser code.

## Accurate claims
- A CPU-based numerical simulator reproduces ideal textbook probability distributions for small circuits. It does not implement realistic noise, true quantum device behaviour, physical entanglement, quantum advantage or a specialized quantum server.
- The HoloCAD 3D engineering models are **illustrative**. Simulation results cannot certify aerospace, robotic, medical, mechanical or electrical systems.
- Silver Hawk, antigravity, blue-energy or ambient-harvesting inventions remain unverified research concepts and are not validated by the quantum panel.

## Validation
- Mathematical and boundary tests: `node --test amm-omniverse/tests/streetverse-holocad-quantum-sandbox.test.mjs` on Node 24.
- Existing HoloCAD typecheck, source contracts and Vite build: `.github/workflows/streetverse-holocad-living-xr.yml`.
- Release gate: actual interactive desktop/mobile UI and WebXR device testing, input accessibility, performance and isolated gameplay regression, followed by separate deployment approval.
