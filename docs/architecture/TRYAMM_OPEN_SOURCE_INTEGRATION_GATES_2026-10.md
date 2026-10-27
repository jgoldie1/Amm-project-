# TRYAMM / StreetVerse — Open-source integration gates (October 2026)

Status: **candidate evaluation and implementation design only**. Nothing here implies that a third-party dependency is installed, licensed for resale, integrated, or deployed.

## Rules
- Preserve existing TRYAMM, StreetVerse Chicago, mobile controls, streaming, payments, and creator workflows.
- Commercial license review and third-party asset rights come before copying code/assets into the repo.
- Never rebuild/replace a running world to introduce an experiment.
- Feature flags default OFF; camera/microphone opt-in; local processing where possible; no raw recording by default.
- One-hand touch/voice/gamepad remains fully functional with all camera tracking disabled.
- Keep server authority over player rewards, purchases, missions, PvP hits and payouts. Never authorize these from camera detections alone.
- Benchmark Chromebook, iPhone and Android CPU/GPU/memory/battery. Keep a single active tracking backend, bounded frame rates, and optional worker isolation.
- Every install: pinned version, lockfile, security audit, rollback flag, production proof, and independent fallback.

## Candidates and destinations

| Candidate | Destination | Intended use | License/decision |
| --- | --- | --- | --- |
| MediaPipe Pose Landmarker | StreetVerse Universal Player Controller; SportVerse | Opt-in body-to-avatar mapping, accessibility gestures | Evaluate SDK and model licenses before implementation; preferred first prototype |
| MoveNet (Lightning/Thunder) | Universal Player Controller | Optional alternative on low-end phones | Evaluate model distribution and app licenses; not installed |
| RTMPose with MMPose research tools | Avatar recording pipeline | Advanced capture/retargeting after baseline works | Research only until validated |
| OpenPose | Research | Baseline comparison only | Do not copy into commercial stack without license review |
| System Animator Online/XR Animator | Research | Motion capture/XR design inspiration | CC BY-NC-SA 4.0 source adaptation: no commercial incorporation without separate rights |
| OpenWhispr | MiddleVerse AI accessibility, call-center and creator workflows | Reference privacy-first speech/dictation design | MIT; assess Electron runtime vs browser separately, not installed |
| OpenMontage | Omni Box / Isaiah AI TV / creator video | Optional isolated, reviewed media workflow | AGPLv3 source obligations: legal/architecture review before integration |
| Brutal game framework | R&D | Benchmark ideas | Do not replace Three.js / existing engine |

References: https://developers.google.com/edge/mediapipe/solutions/vision/pose_landmarker ; https://github.com/ButzYung/SystemAnimatorOnline ; https://github.com/OpenWhispr/openwhispr ; https://github.com/calesthio/OpenMontage .

## Universal Player Controller: proposed contract

Inputs: touch joystick, one-hand buttons, keyboard, gamepad, accessibility switches, voice intents, and optional camera landmarks.

Outputs: normalized `move`, `look`, `interact`, `emote`, `jump`, `pause`; context-bound actions require explicit confirmation. Player-2 profile supports distinct mappings and devices; split-screen and network sync are separate projects requiring capacity tests.

Camera input must be rate-limited and confidence-gated; use configurable gesture dwell, calibration, smoothing, clear cancel, and a timeout resetting movement to neutral when tracking is lost. Never make arms/standing mandatory. Disable all camera inputs in competitive ranked modes until anti-cheat reviewed.

## Rollout order
1. Finish PR #675 stabilization: storage HTTP 402 local NPC fallback, iPhone visual proof, security dependency audit. Do not merge without gates.
2. Add player input contract and unit tests with **no webcam dependency**; map to existing avatar and mission events.
3. Offer a feature-flagged MediaPipe adapter, no camera permission until user opts in. Retarget to existing rigs; no new world scene.
4. Accessibility QA: one-handed play without camera, voice, controller, no movement from missing tracking.
5. Optional player-2 local profile, then network authority and synchronization tests.
6. Benchmarks and staged mobile release; only then evaluate MoveNet/RTMPose.
7. Separately evaluate OpenWhispr and OpenMontage for creator systems, with legal review and costs.

## What is explicitly not done
No source files from the candidate projects copied. No commercial license is assumed. No new AI model, subscription, compute provider, SDK or payment gateway enabled. No new game world, production route, release, merge or deploy.
