# OpenClaw Integration — TRYAMM

Status: SANDBOXED / NOT PRODUCTION-AUTONOMOUS

## Purpose
Use OpenClaw as an agent-automation layer beneath HoloGPT and Command Nexus for repetitive operations, diagnostics, and multi-step workflows.

## Placement
HoloGPT -> Holo Gen -> Command Nexus -> OpenClaw Gateway -> scoped agents/tools

OpenClaw does not replace HoloGPT. HoloGPT remains the user-facing intelligence/orchestrator; OpenClaw is an optional worker/runtime layer.

## Allowed initial duties
- release monitoring and incident triage
- repository/build/log inspection
- create diagnostic summaries
- prepare candidate code changes for review
- documentation and runbook updates
- non-consequential content/admin workflows
- scheduled checks and exception reporting

## Explicitly denied without human approval
- sending money, refunds, payouts, wallet transfers
- changing payment provider settings
- deleting production data
- altering auth/RLS/security policy
- publishing production releases automatically
- contacting customers as a human impersonation
- changing legal/compliance settings
- physical-device actions (rides, drones, telecom provisioning)

## Security
- run OpenClaw in its own container/VM or isolated host
- use a dedicated low-privilege service identity
- deny unrestricted shell/network access by default
- pair only trusted channels
- keep secrets outside repo
- require audit logs for every tool call
- default to read-only GitHub/Vercel access
- all production-write capabilities gated by Command Nexus approval

## Beta release rule
OpenClaw is not on the StreetVerse critical rendering/gameplay path for the Thursday beta. Failure of OpenClaw must not prevent users from signing in, entering StreetVerse, using Quantum Zoom/Time/Sandbox, or using HoloGPT recovery mode.

## Expected benefit
OpenClaw should reduce founder/manual operational load by delegating repetitive multi-step tasks and routing exceptions to Command Nexus. It will not improve frame rate, asset quality, network latency, or AI model speed by itself.
