# StreetVerse Music Rights & Release Engine

Status: ARCHITECTURE LOCKED / RUNTIME INTEGRATION BUILDING

## Purpose
No song, album, film/stage cue, immersive mix, remix or derivative release should move from Creator Studio to public distribution solely because audio exists. TRYAMM must verify the rights state first.

## Canonical flow
CREATE → RIGHTS SCAN → CLEARANCE → SPLITS → METADATA → ROYALTY ROUTING → IMMUTABLE RELEASE SNAPSHOT → DISTRIBUTION → MONITOR → COLLECT → CREATOR LEDGER → PAYOUT

## Rights Passport
Each releasable version carries a Rights Passport tied to the immutable project/version ID. It records master owners, writers, publishers, administrators, featured artists, performers/producers, shares, PRO affiliations, IPI/CAE when supplied, ISRC/UPC, territories, evidence references, sample provenance, AI/human provenance, Content ID review, synchronization permissions, distribution state and release snapshot.

## Sample / source classification
Every imported sound must be classified as original, commissioned, royalty-free library, public domain, cover, interpolation, third-party master sample, remix or unknown.

Third-party master samples require verified master-recording permission AND composition permission before release. Interpolations require composition-rights review. Unknown source audio blocks release. Royalty-free material still retains its source/license evidence and may have platform-specific Content ID restrictions.

## PRO and composition data
PRO metadata is affiliation-aware. TRYAMM does not assume a writer belongs to BMI, ASCAP or any other PRO and does not double-register a work automatically. Store the creator's actual affiliation, publisher/administrator and identifiers, then generate destination-specific registration/export tasks.

## Mechanical rights
Track U.S. digital mechanical registration/claim metadata separately from performance royalties. The MLC workflow is an external registration/claim destination where applicable; TRYAMM does not claim to register a work until an external confirmation is stored.

## Sound recording digital performance
Track featured-artist and sound-recording rightsholder metadata separately from songwriter/publisher data. SoundExchange status is an external registration/claim state, not an inferred TRYAMM state.

## Distribution adapters
DistroKid is an adapter, not the source of truth. Future distributors can implement the same release contract. A distributor may help license qualifying covers, but sample clearance remains a separate gate. Distribution success does not equal rights clearance.

## Royalty ledger buckets
- composition performance
- mechanical
- master streaming/sales
- sound-recording digital performance
- neighboring rights
- synchronization
- direct licenses
- creator/platform revenue

Never collapse these into a single generic royalty balance.

## Detrimental failures this system prevents
- releasing an uncleared sample or interpolation
- treating a cover license as sample permission
- publishing with missing/incorrect songwriter splits
- confusing master ownership with composition ownership
- losing license evidence or expiration/territory restrictions
- reusing one ISRC for a materially different recording
- submitting inconsistent metadata to distributor/PRO/mechanical/rightsholder systems
- claiming BMI/ASCAP/MLC/SoundExchange registration without confirmation
- enrolling in Content ID when source material/license terms make the recording ineligible
- overwriting the exact version that was cleared and released
- paying platform revenue as though it were songwriter/master royalty revenue
- releasing film/game/advertising uses without sync-rights review

## Release gate
BLOCK: missing master owner, invalid writer splits, uncleared third-party sample/interpolation, unknown audio origin, expired rights, or missing immutable release snapshot.
REVIEW: PRO, mechanical, SoundExchange, neighboring rights, sync, AI provenance, Content ID or identifier metadata still requires verification.
READY: no blockers and all required review items are resolved for the intended release/territories.

## Evidence and audit requirements
Store signed agreements/licenses outside Git as protected documents/object storage. Git stores schemas and code only. Rights records store stable evidence IDs, checksums, effective/expiration dates and territories. Keep an append-only audit history of who changed rights metadata, when, and why. Never silently rewrite a released Rights Passport.

## StreetVerse integration
Music Realm → CREATE → Music Creator Studio → Rights & Release → Upload/Publishing → Creator Ledger.
The Release & Earn action must call the release gate before any distribution adapter. UI statuses: LOCKED, BUILDING, REVIEW, BLOCKED, READY, LIVE.

## Important runtime work still required
Persistent database schema and access controls; protected agreement storage; identity/authorization for owners and collaborators; electronic split approvals; release-gate API; distributor adapters; external confirmation ingestion; ledger reconciliation; takedown/dispute workflow; DMCA/copyright complaint workflow; fraud/stream-manipulation controls; tax/payout onboarding; audit/export tools; privacy/retention rules; tests and legal review before production claims.
