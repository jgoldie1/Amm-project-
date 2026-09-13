# TRYAMM Adaptive Render Fabric

This is TRYAMM's hardware-independent rendering architecture. It is inspired by modern neural rendering principles but does not copy or claim proprietary NVIDIA DLSS models.

## Hardware tiers

1. Safe/mobile node: phone/tablet/low-power GPU. Uses HTML/WebGL fallback, reduced internal resolution, spatial or temporal reconstruction, strict scene budgets, no generated frames.
2. Standard client GPU node: desktop/laptop integrated or discrete GPU. Uses WebGL2/WebGPU where available, temporal reconstruction, adaptive scene complexity and selective higher-cost effects.
3. High-end GPU node: modern discrete GPU with WebGPU/native renderer path. Uses higher internal scale, selective ray effects, hybrid reflections, larger crowd/traffic/foliage budgets.
4. Cloud render node: datacenter GPU instance for future streamed ultra-quality worlds. Game state remains server authoritative while only pixels/audio are streamed.

## Software path

Input/game state -> scene graph -> performance telemetry -> adaptive render policy -> dynamic resolution -> temporal reconstruction -> scene budget controller -> renderer -> display.

The same authoritative mission, identity, economy, inventory and ledger state is shared across every rendering tier.

## Front end contract

Browser clients listen for:
- `tryamm:adaptive-render-policy`
- `tryamm:dynamic-resolution`
- `tryamm:scene-budget`

The policy includes render scale, FPS target, reconstruction mode, shadows, reflections, ray-effects mode and budgets for NPCs, vehicles, foliage and particles.

## Back end contract

Future edge/cloud render services receive only the minimum session fields needed for rendering and transport: session token, world/area id, renderer tier, viewport, latency target and anonymized capability class. No raw private user activity should be retained beyond the defined operational window.

Server-authoritative gameplay stays separate from render acceleration. A cloud renderer must never become the authority for purchases, XP, rewards or payouts.

## Frame-generation rule

Synthetic frame generation remains disabled (`frameGeneration: false`) until TRYAMM has a tested motion-vector/depth pipeline, measured end-to-end latency, artifact scoring and a validated reconstruction model/runtime. Dynamic resolution, temporal reconstruction and adaptive scene complexity ship first.

## Hardware build target

A future TRYAMM render appliance can be built from standard components rather than custom silicon at first: high-core-count CPU, discrete GPU, ECC-capable memory where practical, NVMe cache, high-bandwidth networking, redundant power and telemetry/thermal management. Custom accelerator silicon is a later R&D path after workloads are measured.
