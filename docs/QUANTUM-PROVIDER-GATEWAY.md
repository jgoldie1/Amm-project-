# Optional Real Quantum Provider Gateway

## Purpose
Provide an optional, provider-agnostic gateway from the TryAMM Quantum Sandbox to approved external quantum-computing services. This is separate from ordinary sandbox compute.

## Truthful labeling
Every job must be labeled as one of:
- classical simulation
- quantum simulator
- real quantum hardware

The UI, logs, invoices, and results must preserve that distinction. Do not claim quantum advantage, speedup, or production suitability unless independently measured for the specific workload.

## Gateway flow
Wallet Passport ID -> authorized tenant/project -> Quantum Sandbox -> workload validation -> provider selection -> budget check -> human approval when required -> submit job -> poll/receive result -> provenance record -> result storage -> evaluation -> optional publication.

## Provider adapter contract
Each adapter implements:
- listBackends()
- describeBackend()
- estimateCost(job)
- validateJob(job)
- submitJob(job)
- getJobStatus(providerJobId)
- getJobResult(providerJobId)
- cancelJob(providerJobId) when supported

Provider-specific SDKs and credentials stay behind adapters. No provider credentials are exposed to users or agents.

## Job fields
- tenantId
- projectId
- requestedBy
- workloadType
- provider
- backendId
- executionMode: simulator | hardware
- circuit/workload reference
- shots/repetitions where relevant
- resource estimate
- estimatedCost
- approvedBudget
- status
- providerJobId
- submittedAt/completedAt
- result provenance
- error details

## Initial workload categories
- education and circuit experimentation
- hybrid optimization research
- algorithm benchmarking
- chemistry/material research where supported by the chosen provider
- cryptography and post-quantum migration research

These categories are research/experimental pathways, not guaranteed production improvements.

## Cost controls
Compute Cost Manager enforces:
- per-job budget caps
- daily/monthly tenant limits
- provider cost estimates before submission
- approval thresholds for expensive jobs
- automatic rejection when budget is exceeded
- complete billing/audit records

## Security and governance
- provider credentials stored in managed secrets
- least-privilege service accounts
- per-tenant quotas
- immutable audit events
- no production customer data in quantum jobs unless explicitly approved and legally permitted
- data minimization/redaction before submission
- regional/data-residency restrictions where applicable
- Jacobie Cybersecurity monitoring
- emergency provider kill switch

## Results and provenance
Every result records provider, backend, execution mode, submission/result timestamps, provider job reference, software/adapter version, input hash, result hash, and evaluation notes.

## Failure handling
Provider outage, queue delay, cancellation, cost change, invalid workload, and partial results are explicit states. The gateway must never silently switch a hardware job into simulation without user-visible disclosure and approval when material.

## Monetization
Optional pass-through provider cost plus clearly disclosed TryAMM service/platform fee, enterprise private gateway plans, education/research credits, and managed experiment services where legally/commercially appropriate.
