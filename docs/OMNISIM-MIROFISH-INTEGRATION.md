# TRYAMM OmniSim — MiroFish Integration

## Goal

Add a simulation layer to TRYAMM without coupling the production application directly to third-party AGPL source code. TRYAMM talks to OmniSim through an adapter contract. A MiroFish deployment can sit behind that adapter when configured.

## Architecture

TRYAMM DATA → KNOWLEDGE GRAPH → OMNISIM → MULTI-AGENT PROVIDER → PARALLEL WORLD → SCENARIO BRANCHES → RISK / OPPORTUNITY REPORT → BENNY → FOUNDER COMMAND CENTER → HUMAN APPROVAL → PRODUCTION

## Phase 1 — control plane

Implemented in this branch:

- `GET /api/omnisim/status`
- `POST /api/omnisim/plan`
- `POST /api/omnisim/dispatch`
- Founder / StreetVerse / Business / Movie / Holo Ads / Global Market / Mission / Benny use-case labels
- Baseline / upside / downside scenario branches
- human approval guardrail before production decisions
- 40-round default ceiling for initial cost and load control
- provider timeout and provider failure handling
- provider endpoint stays optional so TRYAMM remains deployable while OmniSim is BUILDING

## Environment

- `OMNISIM_PROVIDER_ENDPOINT` — full HTTPS endpoint for the isolated simulation service
- `OMNISIM_PROVIDER_NAME` — defaults to `MiroFish`
- `OMNISIM_DEFAULT_ROUNDS` — defaults to 12 and is capped at 40
- `OMNISIM_TIMEOUT_MS` — defaults to 60000 and is capped at 120000

Do not store provider credentials in source. If the chosen provider later requires an API key, add it only through deployment secrets and update the adapter to send it server-side.

## Product integrations

### Founder Decision Simulator

Compare launch price, membership, giveaway, product and feature scenarios before approval.

### StreetVerse

Use simulation outputs to inform population behavior, businesses, events and missions. Do not put the external simulator in the real-time movement/render loop.

### Business Digital Twins

Model customer response, competitor behavior, pricing, promotion and operations scenarios.

### Movie / Drama

Rehearse audience response, plot branches, character interactions and product-placement scenarios before production.

### Holo Ads

Compare advertising concepts and simulated audience segments. Simulation outputs are estimates, not actual performance metrics.

### Global Market

Model supplier, payment-rail, geography, disruption and market-entry scenarios. Financial, compliance and safety decisions still require authoritative data and human review.

### Mission Generator

Use scenario results as source material for dynamic missions and events while keeping game rewards and payments under the existing authoritative reward contracts.

### Benny

Benny can summarize competing simulation branches and explain risks/opportunities. Benny should never present simulated outcomes as facts.

## Status model

- `BUILDING`: adapter exists but no provider endpoint is configured.
- `READY`: provider endpoint is configured.
- `DISPATCHED`: a simulation request was accepted by the provider.
- Production metrics must remain separate from simulation output.

## License boundary

The upstream MiroFish repository is licensed under GNU AGPL-3.0. This integration intentionally does not copy MiroFish source into TRYAMM. If TRYAMM modifies or directly incorporates AGPL-covered source, a license review is required before production release. Running an isolated, separately managed service does not by itself remove every possible licensing obligation; obtain legal review before commercial deployment.

## Next engineering phases

1. Deploy an isolated MiroFish-compatible service and verify its real API contract.
2. Add an adapter mapping for the provider's confirmed request/response schema.
3. Add durable simulation jobs, status polling and report storage.
4. Add Founder Command Center UI: SIMULATE → COMPARE → RISK → OPPORTUNITY → APPROVE → DEPLOY → MEASURE.
5. Add Benny explanation UI.
6. Add Business Digital Twin and Holo Ads templates.
7. Add StreetVerse asynchronous world-event ingestion after production gameplay remains stable.
