# GoogleX / Googolplex Memory → GitHub Continuity Bridge

Status: **repository instructions and a proposed retrieval interface**. This file does not assert that ChatGPT reads GitHub automatically or that the GoogleX memory service is connected to the ChatGPT product.

## Preserve the owner's existing memory design
- **Googolplex / GoogleX Memory:** permissioned long-term project memory for the HoloGPT / TRYAMM universe. Hot = session working memory; warm = searchable project/context graph; cold = authenticated/versioned archives and checkpoints. Structured records include provenance, owner, consent, freshness, hashes, deletion and access rights.
- **Shared Quantum Memory:** `amm-omniverse/src/runtime/SharedQuantumMemoryRuntime.ts` persists compact player/world state locally and via an authenticated Supabase-backed memory session. This is NOT the same as ChatGPT remembering a repository.
- **HoloGPT consent memory:** persist only scoped pointers to secure media (consent ID, object URI, hash, version, permitted use, expiry/revocation). Do not copy private videos, faces, voice samples, passwords or sexual-device sessions into public README, GitHub or a global index.
- **Github truth:** README.md and root AGENTS.md are project source-of-truth pointers; implementation facts are confirmed by inspecting source, test logs and deployed evidence. The repo is not an automatic ChatGPT memory feed.

## Canonical retrieval sequence for project-connected AI workers
1. Read root `README.md`, then `AGENTS.md`.
2. Read `docs/gameplay/STREETVERSE_LEGACY_MECHANICS_PRESERVATION_AUDIT_2026-10.md`.
3. Resolve the requested component to existing paths and current PRs before writing code.
4. Query GoogleX index / HoloGPT context graph **only when authenticated, authorized, connected, and data is relevant**. Filter by user/organization, business, project, consent, expiration and sensitivity.
5. Cite matching repository paths and latest commits with confidence. Never elevate unverified GoogleX records to authoritative shipped status.
6. For each repair, append a reviewable development log entry (issue, changed file, red test, green test, device visual evidence, PR, rollout/rollback); do not auto-merge or overwrite history.
7. Keep CrossVerse, HoloVerse, All American App Store, StreetVerse, SportVerse, New America, After Dark, AI Café, Omni LIVE, Omni Box and 111 websites as separate surfaces with scoped links.

## Intended interfaces (future connector work)
- `retrieveProjectContext(project,query,authScope)` → minimal source refs, commit links, timestamp, permissions; no secrets or raw media.
- `checkpointBuildState(project,version,commit,checks,authScope)` → immutable evidence pointer.
- `restoreProjectContext(checkpoint,authScope)` → preview first, no unapproved code or save-state writes.
- `revokeConsent(pointerId,authScope)` → revoke references and enforce downstream invalidation.

## What does NOT happen automatically
- A future ChatGPT chat does **not** automatically ingest README.md, AGENTS.md, Supabase or GoogleX just because they exist.
- GoogleX is not equivalent to Google Drive or ChatGPT Memory; do not claim accounts are connected when not verified.
- Browser localStorage does not guarantee cross-device sync.
- Existing GitHub agent instructions apply to agents/tools that actually read them, not every model call.

## Practical continuation prompt
`Continue TRYAMM. Read the current README.md, AGENTS.md and GoogleX continuity bridge from jgoldie1/Amm-project-. Verify current PR #675 / #676 and prioritize unfinished gameplay integration without overwriting existing systems.`

## Next implementable milestone
A permissioned GoogleX retrieval endpoint plus a repository-aware AI Café worker that reads these files on session startup and reports which sources it consulted. Protect all personal content and avoid unlimited-token fetching with bounded results.
