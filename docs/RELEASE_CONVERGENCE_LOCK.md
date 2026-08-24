# TRYAMM Ecosystem Convergence Release Lock

Release branch: `release/ecosystem-convergence`

## Freeze rule

No new major product families until the existing platform passes build, deployment, navigation, device, payment, telecom, media, game, accessibility, and rollback certification. Fixes, wiring, tests, provider adapters, observability, and UX consolidation are allowed.

## Locked product surface

- Identity, auth, profile, accessibility passport
- HoloGPT and Holo command surfaces
- StreetVerse / GameVerse playable loop
- Phone, tablet, touch, keyboard, Bluetooth/USB gamepad OmniInput
- Phone/tablet-to-TV/PC controller pairing transport
- HoloVerse / AR / VR / MR / XR capability path
- Creator Studio, Reels, render, Save to Phone/Files
- All American Network, LIVE, OTT, Isaiah AI TV / StarVerse
- Aniyah 64-track studio and music tooling
- OmniCash and Aniyah Cross-Border Pay
- Business OS, AI Call Center, Holo Fon, Quantum Email
- Marketplace, global trade, Global Growth / Diaspora
- Nigeria, South Africa, Haiti/Caribbean business lanes
- Flutterwave, Paystack, Stripe provider gates and reconciliation
- Holo Ads, sponsorships, immersive commerce
- Global jobs and workforce pathways
- PropertyVerse, Section 8/HUD, farms, land bank, vehicle sharing, short-term-rental workflows
- 3D/holographic property walkthroughs
- SpaceOS / El Saturn space experiences
- AI Cafe multi-agent swarm

## Release truth policy

Provider-dependent systems must never present simulated state as real production service.

- Holo Fon: carrier/CPaaS/MVNO credentials and provisioning required for real numbers, voice, SMS, porting, eSIM, and data service.
- Payments: provider approval, production credentials, KYC/KYB/AML gates, signed webhooks, ledger posting, reconciliation, refunds, and payout tests required.
- XR: WebXR/runtime capability and physical-device certification required before VR/AR/MR is marked live.
- Cross-device controller: realtime signaling/transport and two-device test required before QR phone/tablet controller pairing is marked live.

## Certification sequence

1. `npm run check:all`
2. Build root app and `amm-omniverse`
3. Button/navigation audit
4. HoloGPT provider/runtime health
5. StreetVerse: open → load → move → mission → save → exit → return → restore
6. Keyboard/touch/gamepad device input
7. Phone/tablet remote controller → TV/PC runtime
8. Record → Reel → render → Save to Phone/Files
9. HoloVerse/XR capability and device checks
10. PropertyVerse/3D walkthrough and SpaceOS route checks
11. All American Network/LIVE/broadcast smoke test
12. Global Growth/Diaspora/Jobs/Holo Ads UI smoke test
13. Holo Fon provider-gated status and carrier integration test when credentials exist
14. OmniCash/Stripe/Flutterwave/Paystack sandbox tests and reconciliation
15. Accessibility, mobile, tablet, desktop, TV regression
16. Production deployment SHA verification
17. Post-deploy smoke test and rollback readiness

## Revenue loop to certify

`REAL USER → REAL SERVICE → REAL PURCHASE → VERIFIED PAYMENT → LEDGER → RECEIPT → CREATOR/BUSINESS VALUE → RETENTION → RECURRING REVENUE`

## Launch gate

Release is green only when build/test evidence exists for all non-provider-gated core flows and every provider-gated capability is labeled accurately. Production promotion must preserve rollback to the last known-good deployment.
