# TRYAMM Mandatory Build Checkpoint + Rollback Policy

Effective: 2026-08-22

This policy is mandatory for all meaningful TRYAMM / HoloGPT / Holoverse engineering work.

## Rule

Every meaningful build, repair, migration, route change, AI-provider change, auth/state change, service-worker change, deployment change, or release-gate change must end with a Git commit before new work begins.

No chat message, memory, local browser state, or deployment dashboard is the source of truth. Git is the source/release history.

## Required checkpoint sequence

1. Inspect the current branch and current commit SHA.
2. Make one coherent set of changes for one engineering objective.
3. Run or schedule the relevant checks for that objective.
4. Commit the changes with a descriptive message.
5. Record the resulting commit SHA in the project state / proof matrix when it changes a release gate.
6. For major milestones, create a dedicated immutable-style checkpoint branch pointing at the known-good commit.
7. Deploy from the committed source only.
8. Verify the deployed commit before calling the milestone GREEN.
9. If a regression appears, restore from the last known-good checkpoint instead of rebuilding from memory.

## Checkpoint naming

Major rollback branches use:

`checkpoint/YYYY-MM-DD-short-description`

Examples:

- `checkpoint/2026-08-22-hologpt-green-proof`
- `checkpoint/2026-08-22-auth-persistence`
- `checkpoint/2026-08-22-holoverse-route-map`

## Commit discipline

Commit messages should describe what changed, not vague progress.

Good:

- `Fix HoloGPT provider failover and live health reporting`
- `Mount canonical route coordinator with persistent Holoverse bridge`
- `Bust stale PWA cache for HoloGPT production rollout`

Avoid:

- `update`
- `continue`
- `stuff`
- `final`

## Rollback rule

Before changing a subsystem that is already working, identify the last known-good commit. For a high-risk or major milestone, create a checkpoint branch before the next change.

Rollback means moving/deploying back to a known-good commit or checkpoint branch. Do not delete history and do not force-rewrite a shared branch unless an explicit emergency decision is made.

## GREEN proof rule

A commit is not the same as a successful release.

`COMMITTED` = source is safely recorded.

`DEPLOYED` = committed source reached the target environment.

`VERIFIED` = live checks proved the intended behavior.

`GREEN` = all required release gates passed with evidence.

The release sequence remains:

ALL PAGES → ONE ROUTE MAP → API HEALTH → HOLOGPT FULL RESPONSE → AUTH → PERSISTENT STATE → SERVICE WORKER/CACHE → DEPLOYMENT → LIVE SMOKE TEST → GREEN PROOF

## Anti-loop rule

Do not recreate a component, route, provider adapter, HoloGPT instance, Holoverse state layer, auth layer, or deployment path just because a later session cannot remember it. Search Git first. Extend or repair the canonical implementation.

When work resumes in a new session, first read the latest checkpoint policy, GREEN proof matrix, AI orchestration config, route registry, and branch head before writing code.
