# Meshy AI, Game Quality, Wallet and Identity

## Meshy AI production role

Meshy is used as an asset accelerator, not as a substitute for game design or engineering. The production pipeline covers original concept prompts, preview generation, human approval, refinement, texturing, retopology, LOD creation, rigging preparation, collision, engine export and license review.

Supported asset categories include characters, NPCs, creatures, vehicles, weapons, props, buildings, environments, outfits, shoes, accessories, collectibles and arenas.

Production targets include web, mobile, Unity, Unreal, Godot, WebXR, VR, MR and marketplace viewers.

## Quality impact across all eleven games

Meshy can increase asset volume, visual consistency and iteration speed. It can help create original stadium props, player drafts, creatures, vehicles, buildings, arenas, costumes and collectibles. Every asset still requires human review, optimization, original-IP review and engine integration.

The quality profiles are in `services/game-quality.js`.

- Gridiron X: uniforms, players, stadiums, broadcast props and ball assets.
- Court Kings: players, courts, arenas, uniforms and replay presentation.
- Diamond Legends: stadiums, players, bats, balls and environment variants.
- Ice Storm: players, rinks, sticks, pucks and ice environments.
- World Pitch: players, kits, stadiums and ball assets.
- Fight Night Holo: fighters, gloves, robes, arenas and hit-effect assets.
- StreetVerse: citizens, vehicles, buildings, props and outfits.
- Battlefront Zero: original soldiers, creatures, vehicles, equipment and arenas.
- Yogihoo Arena: original creatures, cards, arenas and evolution variants.
- Volcano Racers: vehicles, drivers, tracks and environment sets.
- Kingdom Builders: buildings, citizens, animals, terrain and transportation.

## Honest game-quality level

Current browser proofs are prototype quality. Meshy scaffolding improves the asset pipeline but does not yet provide finished AAA rendering, mocap animation, cinematic lighting, authoritative multiplayer, advanced destruction, crowd simulation, full physics, final sound or console certification.

A realistic quality ladder is:

1. Browser proof: functional mechanics with placeholder art.
2. Vertical slice: polished original art, one arena or district, final controls and stable performance.
3. Strong beta: multiplayer, progression, multiple environments and complete UI/audio.
4. Commercial release: full content, certification, security, operations and accessibility testing.
5. AAA-scale title: multi-year production with specialized teams and major infrastructure.

## Wallet and payments

The wallet architecture supports balances, token balances, holds, refunds, payouts and an immutable ledger. Marketplace charges must be confirmed by signed Stripe, Flutterwave or Paystack webhooks before value is credited or an order is fulfilled.

Apple Pay and Google Pay should be exposed through approved payment-provider SDKs. TryAMM must not handle raw card data.

Tap to Pay requires a supported provider such as Stripe Terminal or another approved acquiring partner, eligible devices, merchant onboarding, device attestation and regional approval. The current module is an integration contract, not a live card-present terminal.

## Identification

The identity layer stores verification status and credential hashes, not raw government IDs or biometric templates. It can support creator ID, vendor ID, driver-platform permit, event passes and loyalty membership.

A TryAMM digital credential is not a legal replacement for a state driver license or passport unless an authorized government issuer and jurisdiction explicitly support the credential. Government mobile IDs and passports require issuer partnerships, standards compliance, legal review and supported device-wallet programs.

## Supabase tables

Migration `202607140004_wallet_identity.sql` adds:

- `wallets`
- `wallet_ledger`
- `identity_profiles`
- `digital_credentials`
- `wallet_passes`

All owner-facing tables use row-level security.

## Remaining production gate

- Mount authenticated wallet and credential APIs.
- Implement webhook-driven ledger posting and double-entry reconciliation.
- Add provider idempotency and dispute handling.
- Complete Apple Pay and Google Pay domain and merchant verification.
- Complete Tap to Pay merchant onboarding and device testing.
- Select KYC and identity-verification providers by country.
- Add sanctions, AML, age and fraud controls.
- Add wallet pass signing for Apple Wallet and Google Wallet.
- Add checkout, refund, payout and transaction-history interfaces.
- Add encryption, audit, retention and incident-response testing.
- Run Meshy assets through human art direction, optimization and original-IP review.
- Create one polished vertical slice before scaling asset generation across all eleven games.
