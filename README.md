# TRYAMM / StreetVerse

> **Project continuity for AI agents and future development sessions:** Read [AGENTS.md](./AGENTS.md) before modifying this repository. It preserves the owner's StreetVerse / New America, HoloVerse, CrossVerse, All American App Store, AI Café, After Dark, SportVerse, LIVE, and 111-business-template requirements, existing code anchors, and release safeguards. Inspect and reuse existing systems; never replace them without proof. For gameplay preservation see [the legacy mechanics audit](./docs/gameplay/STREETVERSE_LEGACY_MECHANICS_PRESERVATION_AUDIT_2026-10.md). Work from actual GitHub status and passing gameplay evidence rather than historical completion estimates.\n\n> **ChatGPT continuity limitation:** A README or AGENTS.md file is not automatically loaded into every unrelated ChatGPT conversation. In future sessions, ask ChatGPT to read this repository's README and AGENTS.md using the GitHub connection; the reference is durable in GitHub, but not an automatic memory-sync feature.\n\nTRYAMM is an immersive social, streaming, commerce, creator, logistics, learning, and world-simulation platform. The active architecture is built around **real authoritative services underneath and immersive presentation above them**.

## Three-layer internal blockchain architecture

TRYAMM uses three intentionally separated hash-chain layers:

1. **Layer 1 — StreetVerse Experience Chain**  
   Browser/game hash-chained ledger for demo assets, missions, rewards, rentals, purchases, ride requests, and drone missions. It is an experience/economy layer and is not authoritative real-money settlement.

2. **Layer 2 — TRYAMM Platform Internal Chain**  
   Server-side `internal_chain_blocks` plus `anchor_internal_chain_event`. It provides authoritative backend event anchoring and evidence references for platform operations. Browser users cannot directly create these anchors. Real money, inventory, customs, shipment, payout, and settlement truth still comes from the authoritative provider/service ledgers that own those facts.

3. **Layer 3 — Kingdom of Yahisrale — Set Apart Chain**  
   Separate server-only faith/community attestation chain for Sabbath, New Moon, covenant, ministry service, education, legacy, community, and charity/service records. A Layer 3 record may cross-reference a Layer 2 platform block hash for evidence linkage while remaining separate from commerce and payment authority.

Layer 3 is a faith/community and legacy record system. It does **not** by itself establish civil status, nationality, governmental recognition, tax exemption, legal sovereignty, payment authority, or regulated permissions.

## Platform principle

**REAL AUTHORITY BELOW → IMMERSIVE EXPERIENCE ABOVE**

- Payments and settlement: provider/server authoritative.
- Inventory and logistics: warehouse/logistics systems authoritative.
- Customs/compliance: approved broker/provider and regulatory evidence authoritative.
- Internal chains: immutable-style evidence anchoring and provenance, not a substitute for the authority that owns the underlying real-world fact.
- StreetVerse/TRYAMM LIVE/PropertyVerse/Twin Earth/Holoverse: presentation, interaction, simulation, discovery, and collaboration layers.

See `amm-omniverse/docs/THREE_LAYER_INTERNAL_BLOCKCHAIN.md` for the canonical chain model.
