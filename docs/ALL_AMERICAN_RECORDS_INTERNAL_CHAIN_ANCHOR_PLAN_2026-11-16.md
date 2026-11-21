# All American Records — internal blockchain integration
Date: 2026-11-16
Status: design + integration handoff; **no on-chain proof or real-world registration created by this document**.

## Preserve existing three layers
Use existing `amm-omniverse/docs/THREE_LAYER_INTERNAL_BLOCKCHAIN.md`:
- Layer 1 OmniverseAssetLedger: local StreetVerse/demo receipts **only**.
- Layer 2 `public.internal_chain_blocks`, trusted server-only `anchor_internal_chain_event`: authoritative **evidence anchor**, never private document storage, copyright registration, provider settlement, or proof of actual copyright title.
- Layer 3 Set Apart faith/community ledger: **do not** store unrelated commercial rights transactions or recording royalty settlement here.

## Music rights and release evidence events (Layer 2 only)
- `MUSIC_RELEASE_DRAFT_CREATED`
- `MUSIC_SAMPLE_CLEARANCE_REQUEST_AUTHORIZED` (artist approval, not dispatched)
- `MUSIC_SAMPLE_CLEARANCE_SUBMISSION_RECORDED` (only with verified external receipt)
- `MUSIC_SAMPLE_MASTER_LICENSE_VERIFIED` and `MUSIC_SAMPLE_COMPOSITION_LICENSE_VERIFIED` (signed documents & human reviewer)
- `MUSIC_SAMPLE_CLEARANCE_REVOKED` / `MUSIC_SAMPLE_CLEARANCE_EXPIRED`
- `MUSIC_DISTRIBUTION_ARTIST_APPROVED` and `MUSIC_DISTRIBUTOR_DELIVERY_CONFIRMED` (only after actual partner response)
- `MUSIC_ROYALTY_STATEMENT_RECONCILED`, `MUSIC_ROYALTY_PAYOUT_CONFIRMED` (only after authoritative provider evidence)
- `MUSIC_DIGITAL_LIKENESS_CONSENT_GRANTED` or `REVOKED` for licensed digital-twin performances.

Each anchor: stable idempotency key, actor account, trusted operator role, event timestamp, scope, nonsecret release/clearance reference, SHA-256 hash of a canonical rights event, evidence artifact hash, and server-origin verified status. Do not publish plaintext artist PII, recipient email, licensing prices, private recordings or signed contracts into shared chain blocks. Source evidence belongs in encrypted, access-controlled storage with KMS, backups, scanning, retained signed versions and an audited key rotation/revocation process.

## Security and legal
- No customer may call service-role RPC, anchor a rights confirmation, or alter approved license documents.
- Rights-holding remains a legal/factual question. A hash proves *which document bytes were anchored* but not that a claimed copyright holder had authority or consented.
- Sample approval requires signed master and composition licenses as applicable, territorial/media/term scope and independent reviewer. Expiry or revocation must block playback/delivery and start takedown process.
- Financial provider and distributor remain authoritative for payout and actual delivery; chain is an evidence mirror, not a money movement mechanism.
- No automatic AI cloning or training rights included in music distribution.

## Existing components to connect
- `lib/holoverse-artist-desk-routes.js`: encrypted pilot intake, attached docs, correspondence draft, artist authorization, manually recorded external submission and human review, sandbox distribution approval. NO automatic email, charge or DSP submission.
- `amm-omniverse/src/runtime/sampleClearanceSubmission.mjs`: intake and permissions policy.
- `music-api.js`: draft-only new publication pending review.
- `public/music-hub.html`: streaming and artist catalog.
- `amm-omniverse/src/runtime/holoversePilotAccounting.mjs`: simulated rights and allocations.

## Required operational steps
1. Migrate the artist desk's temporary encrypted JSON state to private object storage and a transactional relational database. `HOLOVERSE_VAULT_KEY` is required for the pilot; never check it into Git.
2. Validate external email contacts and authority with rights-holder research, approved outgoing-mail connector, per-contact consent/approval, deliverability status and inbound replies.
3. Verify signed docs against requested media/territories/expiration and legal counsel review before `CLEARED`.
4. Add server-only Layer 2 adapter with real RPC, idempotent anchor response and retry queue. Check Supabase configuration, RLS and availability first; do not bypass 402/provider outage.
5. Use a licensed aggregator/distributor until negotiated direct DSP ingestion. Track each partner's actual store receipts and takedowns. Do not promise better coverage than Sony, Universal or Warner without evidence.
6. Operator-controlled release readiness: rights clearance + artist sign-off + distributor acceptance + playback license + payment-ledger reconciliation. No public production release before these pass.
7. Run unit tests, abuse tests, Chromebook touch/accessibility and two-account tenant-isolation tests.

## Differentiation
All American Records' possible competitive advantage: artist-owned masters, optional 75/25 managed-service deal, sample-clearance assistance, rights data portability, opt-in sync licenses and AI likeness, accessible recording tools, live/virtual shows, reporting transparency and clear contract exits. Licensing and real execution—rather than the chain alone—must substantiate claims.
