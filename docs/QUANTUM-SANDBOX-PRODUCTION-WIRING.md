# Quantum Sandbox Production Wiring

The Quantum Sandbox is the controlled experimentation layer for App Cafe, Stubbs AI agents, plugins, games, Middleverse worlds, education and optional quantum workloads.

## Production boundary
Experimental code and agents do not execute in the main TryAMM application process. Use an isolated execution-provider adapter with ephemeral environments, quotas, scoped credentials, metering, logs, artifact export and automatic cleanup.

## Core services
- Sandbox Orchestrator: create/run/stop/expire jobs.
- Capability Service: temporary least-privilege tool/data grants.
- Job Store: durable job state, ownership, timestamps and provenance.
- Metering: CPU/memory/storage/network/AI/provider cost records.
- Evaluation Runner: tests, policy checks and quality gates.
- Artifact Registry: versioned outputs and publication status.
- Jacobie Security: risk events, audit records and emergency disable controls.
- Quantum Provider Gateway: optional simulator/hardware access through provider adapters.

## Job lifecycle
DRAFT -> VALIDATE -> BUDGET CHECK -> APPROVAL WHEN REQUIRED -> ISOLATED RUN -> EVALUATE -> ARTIFACT -> STAGING -> FEATURE FLAG/CANARY -> PRODUCTION APPROVAL.

## Quantum workloads
Every backend declares one execution type: classical_simulator, quantum_simulator, or quantum_hardware. UI and receipts display this value. Hardware jobs require explicit approval and cost controls. Results retain provider/backend/job provenance.

## App Cafe
Agents may use sandbox challenges for training, plugin development, game/world prototypes and benchmark competitions. Production credentials and unrestricted money-moving tools are unavailable in training sandboxes.

## Required UI
- New Sandbox Job
- workload/template selector
- execution type/provider/backend
- estimated cost and budget
- run/stop status
- logs
- results
- artifacts
- evaluation report
- publish-to-staging action
- owner/admin approval state

## Release blockers
Do not call the Quantum Sandbox production-ready until durable job storage, real authentication/RBAC, isolated runtime integration, quotas, metering, cleanup, audit logging, provider credential isolation, staging tests and emergency kill controls are verified.
