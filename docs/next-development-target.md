# Next Development Target

## Build sequence
CONSTRUCT ENGINE v0.1 -> BMO-class desktop prototype -> room-scale construct demonstration -> Automan-class low-speed vehicle.

## Software work that can be built now
- Construct Engine request/safety/plan contracts.
- Construct registry and digital-twin linkage.
- Device-adapter interfaces for XR, projection, haptics, robotics and vehicle telemetry.
- Production readiness gates that prevent unfinished capabilities from being marked live.
- StreetVerse integration surfaces for construct creation and City of Light simulation.
- Persistence contracts for passport/world state and save/rejoin.
- Provider adapters for HoloGPT, payments, telecom/eSIM and broadcast/distribution.

## External/device verification still required
1. Physical phone/controller: real iOS/Android movement, controls, accessibility and runtime-error verification.
2. Save/rejoin: server-side persistence plus second-session/device rejoin proof.
3. XR/worlds: real XR capability/device tests and graceful fallback paths.
4. HoloGPT production: provider credential, health checks, timeout/fallback and telemetry.
5. Payments/payouts: sandbox purchase, server verification, ledger/payable balance and creator payout eligibility.
6. Telecom/eSIM: carrier/provider agreement, credentials, activation, billing and support flow.
7. Broadcast/distribution: provider credentials, ingest test, rights metadata and delivery receipts.

## Hardware stages
### BMO-class desktop prototype
Mini computer, display, camera, microphone, speaker, power system, microcontroller, sensors, enclosure and optional small motors. The first unit proves local voice/vision/UI/device orchestration.

### Room-scale construct demo
XR/projection, tracking, optional haptics/robotic support, defined safety boundary and Construct Engine adapters. It demonstrates an interactive construct without claiming light is solid matter.

### Automan-class low-speed vehicle
Use a conventional electric engineering mule with battery/BMS, motor controller, steering, braking, emergency stop, charging, telemetry and a visual/AR construct layer. Initial testing is in a controlled environment. Road use requires applicable engineering, compliance and approvals.

## Release rule
A feature is not production-ready because code exists. A gate reaches PASS only when required real-device, provider, payment, rights, security and operational evidence exists.

## What this creates
One engineering chain from virtual intent to verified physical output while keeping the current TRYAMM/StreetVerse release process honest. It also connects the Construct Engine roadmap to the 12D City of Light architecture without making the live app depend on unproven hardware or external partners.
