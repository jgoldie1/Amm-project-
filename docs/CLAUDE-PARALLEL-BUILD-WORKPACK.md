# Claude Parallel Build Workpack — TryAMM GameVerse / XR / Quantum Systems

## Goal
Use Claude as a parallel engineering worker that produces reviewable branches/files, tests, manifests and handoff reports for integration into TryAMM. Claude should not claim a feature is production-ready unless it is actually implemented, tested and deployable.

## Rules
1. Work on separate branches/worktrees to avoid collisions with Victor/current integration work.
2. Never overwrite secrets or commit API keys.
3. Reuse existing TryAMM contracts before inventing duplicates.
4. Every task must include: changed files, tests run, failures, remaining blockers and exact integration steps.
5. Preserve original IP; do not copy proprietary competitor code/assets/UI.
6. High-risk finance, identity, security and deployment changes require review before merge.

## Parallel Track A — GameVerse Runtime
Build one vertical slice first, then reusable systems for all 11 titles.
Deliver:
- Unity or Unreal starter project decision record and repo layout.
- player controller, input abstraction, mobile/web/desktop controller mapping.
- shared lobby/session bootstrap.
- save/progression interface.
- AI companion/NPC interface.
- casting/second-screen adapter contract.
- pause/resume on phone interruption design.
- performance budgets and accessibility hooks.
- automated smoke tests and build instructions.

## Parallel Track B — AR / VR / MR / HoloVerse
Deliver:
- OpenXR-centered abstraction where practical.
- device capability detection/fallback matrix.
- phone/tablet AR mode.
- VR/MR scene bootstrap.
- spatial anchors/placement abstraction.
- controller/gesture/voice input interfaces.
- holographic-display output abstraction without falsely claiming unsupported true volumetric hardware.
- shared asset format/LOD/texture budgets.
- latency/performance test plan.

## Parallel Track C — Quantum Speed Engine / Asset Forge
Treat “Quantum Speed Engine” as the TryAMM orchestration/optimization brand unless actual quantum hardware/software is explicitly integrated.
Deliver:
- provider adapter interface for Meshy and approved 3D providers.
- reuse-first Asset Vault lookup before generation.
- CostOps quote/authorization requirement.
- generation -> retopo/optimization -> textures -> rig -> animation -> validation -> Digital DNA -> Asset Vault pipeline.
- job queue and retry/idempotency design.
- provider cost reporting.
- export derivatives for web/mobile/Unity/Unreal/XR.

## Parallel Track D — 64-Track Recording Studio
Deliver:
- 64 logical track project schema.
- audio clip/take/comping data model.
- mixer/bus/send/insert automation contracts.
- non-destructive editing model.
- stem/bounce/export workflow.
- collaboration/version history.
- AI vocal coach service contract (pitch/rhythm/breath/diction/range practice) with safe disclaimers.
- teleprompter/lyrics/chords integration.
- TryAMM Music publishing handoff.

## Parallel Track E — Jacobie Vision Cybersecurity
Deliver defensive/security-only platform components:
- security posture dashboard data model.
- dependency/secrets/config scanning hooks.
- auth/MFA/RBAC review checklist.
- audit log integrity checks.
- incident intake/severity/response workflow.
- phishing/scam education module for Aniyah and Heirs/Legacy Kids.
- backup/recovery verification.
- no offensive exploitation tooling.

## Parallel Track F — Heirs / Legacy / Aniyah
Deliver:
- guardian/minor permission model proposal.
- family legacy profile schema.
- knowledge vault and succession-reference model.
- financial literacy curriculum/progress model.
- links to Digital DNA/Asset Vault ownership references without pretending to transfer legal title.
- privacy/export/delete flows.

## Required Handoff Format Back to ChatGPT/Victor
For every completed track, provide:
1. Branch name and commit SHA(s).
2. Files added/changed.
3. What actually works now.
4. Tests run and exact results.
5. Screenshots/logs where relevant.
6. Environment variables/dependencies needed.
7. Security/legal/licensing assumptions.
8. Remaining gaps ranked P0/P1/P2.
9. Exact merge/integration steps.
10. Do not say “100% complete” unless all acceptance criteria pass.

## Recommended Multitask Order
1. Shared auth/identity contracts and durable persistence interfaces.
2. One playable GameVerse vertical slice.
3. Shared XR abstraction and fallback matrix.
4. Asset Forge provider pipeline + CostOps.
5. 64-track studio project schema and audio engine proof-of-concept.
6. Jacobie Vision defensive security controls.
7. Heirs/Aniyah/Legacy data and permission model.
8. Integration tests across Passport -> CostOps -> Asset Vault -> Analytics -> OmniPay.
