# TRYAMM OriginQ Quantum Provider Adapter

Status: ISOLATED / EXPERIMENTAL / NOT RELEASE-BLOCKING

## Purpose

Add OriginQ/PyQPanda3 as an optional quantum-computing provider behind TRYAMM's provider-neutral Quantum Router without increasing congestion on PR #171.

Upstream reference: OriginQ/pyqpanda3-skill (Apache-2.0). The upstream project is a reference/development dependency only; TRYAMM must not claim ownership of OriginQ technology or imply an official partnership unless one exists.

## Architecture

HoloGPT / Stubbs AI
  -> TRYAMM Quantum Router
  -> workload classifier
  -> classical baseline OR quantum provider adapter
  -> OriginQ/PyQPanda3 adapter
  -> local simulator by default
  -> authorized QCloud/hardware only when configured
  -> normalized result + provenance + timing
  -> TRYAMM UI

## Provider contract

A QuantumProvider adapter should expose:

- health/capabilities
- circuit validation
- local simulation
- transpilation/compilation when supported
- job submission only to explicitly authorized remote providers
- job status/result retrieval
- cancellation when supported
- normalized errors/timeouts/rate limits
- provenance: provider, backend, simulator/hardware, algorithm version, timestamps

Provider credentials and remote hardware tokens remain server-side. Client code never receives provider secrets.

## Initial workloads

Safe experimental candidates:

- routing and scheduling optimization experiments
- resource-allocation experiments
- mission/economy simulation research
- education and developer labs
- circuit/algorithm demonstrations
- benchmark comparisons between classical baseline and quantum/hybrid approaches

Candidate algorithms can include QAOA, Grover-style search demonstrations, VQE experiments, QSVM and quantum clustering when technically appropriate. An algorithm name is not evidence that it outperforms the classical baseline.

## Performance rule

Quantum is NOT placed in the latency-critical path for rendering, StreetVerse movement, chat, LIVE/PK, authentication, payments, inventory, ledgers, settlements, payouts, emergency/safety services, or ordinary database operations.

Every production candidate must be benchmarked against a classical baseline. The router uses the quantum path only when policy permits it and evidence supports the workload. Otherwise it falls back to classical compute.

## Congestion isolation

This work remains isolated from `foundation/aaa-golden-order-world-rollout` / PR #171 until the foundation convergence and CI release gates are green.

No OriginQ integration commit should be copied into PR #171 merely to increase feature count.

Admission gate:

1. PR #171 synchronization/convergence blocker resolved.
2. Exact-head CI evidence exists and required checks pass.
3. Omniverse production build/deployment gate passes.
4. Quantum adapter has independent unit/contract tests.
5. Local simulator path passes without cloud credentials.
6. Remote QCloud/hardware path remains disabled unless explicitly authorized and configured.
7. License/attribution/security review passes.

## Throughput strategy

Use two independent lanes:

- RELEASE BRIDGE: PR #171 receives only stabilization, reconciliation, CI and release-critical fixes.
- QUANTUM LAB: this branch develops and tests the OriginQ adapter independently.

This prevents experimental quantum work from increasing the release bridge's changed-file surface or conflict rate.

## Speed strategy

To speed TRYAMM development rather than slow it down:

- keep the adapter small and provider-neutral
- develop against a local simulator first
- cache immutable capability metadata
- use asynchronous jobs for long quantum workloads
- impose timeouts and circuit/job size limits
- maintain classical fallback
- benchmark before routing production traffic
- collect minimal de-identified operational metrics
- keep all commerce and safety authority outside the quantum layer

## Release labels

Founder Command Center should report:

- OriginQ adapter: EXPERIMENTAL while only architecture/tests exist
- OriginQ simulator: READY only after local end-to-end tests pass
- OriginQ QCloud/hardware: PROVIDER ACCESS REQUIRED until authorized credentials and a permitted end-to-end hardware job are verified
- Quantum optimization: RESEARCH until a benchmark demonstrates a useful result for a defined workload

Do not label TRYAMM a quantum computer. The accurate claim is that TRYAMM can support optional quantum/hybrid computing providers through its Quantum Router when verified.