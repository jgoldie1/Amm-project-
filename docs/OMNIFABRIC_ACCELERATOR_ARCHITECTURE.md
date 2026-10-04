# TRYAMM OmniFabric Accelerator Architecture

## Status

OmniFabric is a **software-defined accelerator/control-plane architecture** today. It is not fabricated silicon.

The purpose is to make the software stable before choosing FPGA, accelerator-card, chiplet, or custom-silicon implementation.

## Workload lanes

- Render: world rendering, neural reconstruction, LOD/streaming, lighting helpers
- Physics: collision/vehicle/world simulation batches
- AI: NPC inference, HoloGPT/Stubbs AI workers, vision, planning
- World simulation: traffic, crowds, weather, digital-twin jobs
- Media: Reels, LIVE transcoding, Holo Drama, audio/video generation
- Commerce: non-authoritative analytics/routing only; money remains server-ledger authoritative
- Accessibility: speech/sign/translation/assistive inference

## Data-center role

Player devices should do latency-critical work locally. Heavy jobs go to approved accelerator nodes.

Phone/browser -> OmniFabric Router -> GPU/accelerator pool -> result/artifact -> OmniBox/StreetVerse

This lets TRYAMM scale without making an iPhone render an entire photoreal city or run every AI model locally.

## Hardware path

1. Software workload telemetry
2. GPU nodes in the data center
3. FPGA prototype for stable kernels
4. Accelerator card
5. Chiplet design
6. Custom silicon only when measured workloads justify it

## Relationship to NVIDIA-like systems

The design goal is functionally similar to a heterogeneous accelerator fabric, not a clone of NVIDIA IP.

TRYAMM-specific differentiation is the combination of:
- world rendering
- physics/world simulation
- creator media
- AI inference/training workers
- accessibility acceleration
- TRYAMM event/state fabric

## Safety/authority

Accelerators never mint spendable balances. Commerce settlement remains on the authoritative backend ledger.
