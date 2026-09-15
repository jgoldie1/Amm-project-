# TRYAMM Three-Layer Internal Blockchain

## Purpose

TRYAMM uses three deliberately separated hash-chain layers so immersive gameplay, authoritative platform evidence, and Set Apart faith/community records do not collapse into one authority domain.

The rule is simple:

**Experience evidence is not settlement truth. Platform evidence is not faith authority. Faith/community attestations are not civil/governmental authority.**

## Layer 1 — StreetVerse Experience Chain

Runtime: browser/game client.

Current implementation: `src/runtime/OmniverseAssetLedger.ts`.

Uses a SHA-256-linked local ledger for experience events including genesis, mission rewards, purchases, rentals, marketplace activity, subscriptions, transfers, ride requests, and drone missions.

Use it for:
- StreetVerse demo ownership/provenance
- experience receipts
- mission/reward history
- game asset history
- local verification and tamper detection

Do not use it as proof of:
- real-money settlement
- real inventory ownership
- customs clearance
- regulated permission
- external/public-chain finality

## Layer 2 — TRYAMM Platform Internal Chain

Runtime: server/Supabase authority layer.

Current implementation: `public.internal_chain_blocks` and server-only `public.anchor_internal_chain_event`.

Use it for:
- authoritative platform event anchoring
- SHA-256 payload evidence
- idempotent event receipts
- backend provenance
- links between authoritative service events and immutable-style evidence

Only trusted server authority may create anchors. Browser users do not receive direct execution authority.

Real-world facts remain owned by their authoritative service:
- payment/settlement → payment and money ledgers/providers
- inventory → warehouse/inventory authority
- shipment → logistics/carrier authority
- customs → broker/customs authority
- creator/seller payouts → settlement authority

Layer 2 anchors evidence about those facts; it does not replace those systems.

## Layer 3 — Kingdom of Yahisrale — Set Apart Chain

Runtime: separate server-only attestation chain.

Current implementation: `public.set_apart_chain_blocks` and server-only `public.anchor_set_apart_chain_event`.

Network label: `tryamm-set-apart-kingdom-chain-v1`.

Allowed attestation categories:
- Sabbath
- New Moon
- covenant
- ministry service
- education
- legacy
- community record
- charity/service

Layer 3 blocks include their own previous-block hash and may optionally cross-reference a Layer 2 `platform_block_hash`. This creates a chain-of-evidence relationship without allowing the faith/community chain to mutate commerce or settlement.

Use it for:
- Set Apart community history
- ministry/service attestations
- educational completion/legacy records when appropriate
- Sabbath/New Moon community records
- covenant/community provenance
- voluntary legacy records

Layer 3 does **not** by itself create or prove:
- citizenship or nationality
- governmental recognition
- civil jurisdiction
- legal sovereignty
- tax exemption
- regulated licenses
- payment authority
- title to real-world property
- external public-blockchain finality

Those claims require the appropriate real-world authority and evidence.

## Visible Set Apart Passport

The visible product surface lives in `src/components/StaysAgencyFamilyHub.tsx` as the **Set Apart Passport** tab and is reachable directly from Command Nexus.

The Passport is intentionally read-only in the browser:
- client write authority: none
- Layer 3 anchor authority: trusted server/service role only
- raw Layer 3 table access: RLS protected
- direct browser calls to `anchor_set_apart_chain_event`: prohibited

### Authenticated receipt projection

Current implementation:
- protected raw chain: `public.set_apart_chain_blocks`
- private projection: `public.set_apart_passport_receipts`
- trusted publisher: `public.publish_set_apart_passport_receipt`
- browser reader: `src/services/setApartPassportPersistence.ts`
- receipt UI: `src/components/SetApartPassportReceipts.tsx`

The projection is an **authenticated, owner-only read projection**. An authenticated user receives `SELECT` access only to rows where `owner_user_id = auth.uid()`. Browser users receive no insert, update, delete, truncate, or publisher execution authority.

Only trusted server authority may project an existing Layer 3 event into a user's Passport. The publisher does not create a Layer 3 block; it copies approved display fields and evidence identifiers from an already-existing protected chain event into a private receipt row.

The visible receipt intentionally shows only approved projection data such as display title/summary, attestation category, classification, attested time, resource reference, and a shortened block-hash preview. The browser does not query raw Layer 3 rows or receive service credentials.

Despite the product name, the Set Apart Passport is a voluntary TRYAMM faith/community credential only. It is **not** a government passport, citizenship or nationality record, tax status, civil jurisdiction, legal sovereignty, regulated license, payment authority, or title to real-world property.

## Cross-layer rule

A typical evidence flow may be:

`user experience → Layer 1 receipt → authoritative service action → Layer 2 anchor → optional Set Apart/community attestation → Layer 3 cross-anchor → optional private Passport projection`

The reverse must not occur. A Layer 3 attestation or Passport projection cannot create a payment, customs clearance, payout, inventory mutation, or other regulated/financial state.

## Security boundary

- Layer 1: local/client; useful for experience verification, not authoritative real-world settlement.
- Layer 2: server-only anchoring; RLS protected; service-role execution only.
- Layer 3: separate server-only anchoring; RLS protected; service-role execution only.
- Passport projection: authenticated owner-only `SELECT`; publishing remains service-role only.
- No client service-role keys.
- No browser direct anchoring of Layer 2 or Layer 3.
- No chain layer or Passport projection may bypass provider, regulatory, settlement, inventory, customs, or safety authority.

## Product meaning

This makes TRYAMM an internal-chain-backed Web3 platform with three evidence domains:

**PLAY / CREATE / OWN EXPERIENCE → VERIFY PLATFORM EVENTS → PRESERVE SET APART COMMUNITY & LEGACY RECORDS**

The architecture can later bridge selected proofs to an external/public chain, but such a bridge is a separate provider/security/legal project and is not implied by the three-layer internal system.
