# SKILL.md — TRYAMM Implementation Playbook

## Start here
Read `README.md`, `CLAUDE.md`, and `docs/TRYAMM_CANONICAL_ARCHITECTURE.md` before changing TRYAMM.

## Build order
1. Unified account and navigation.
2. Algorithm Router + Algorithm Studio.
3. Creator Project + rights model.
4. Money Engine integration and Creator Wallet views.
5. Passport achievements/credentials.
6. Creator Studio publishing into Reels/Music/Movies/Games/LIVE/Omni Box.
7. Search, notifications, collaboration and Talent/Opportunity matching.
8. Charts, certifications, voting, awards and Hall of Fame.
9. Production hardening, observability, accessibility and store/mobile QA.

## Algorithm Studio contract
Support basic sliders/toggles, visual weighted rules, and Stubbs AI natural-language generation. A saved algorithm contains owner, name, scope/surfaces, weights/rules, safety-policy version, visibility, remix attribution and version. Ranking output passes eligibility/safety filters before display. Include Why This?, More/Less, reset and activity-control feedback.

Suggested lanes: For You, Following, New, Local, Global, Faith, Music, Movies, Anime, Games, LIVE, Learn, Opportunities.

## Unified account/passport/wallet contract
Use one canonical user ID. Passport records TRYAMM achievements and verified platform credentials, with selective disclosure for sensitive external verification. Wallet exposes separate balances for creator earnings, seller earnings, prizes/rewards and promotional/game credits. Never label non-withdrawable credits as cash.

## Creator Project contract
Creator Project is the aggregate root. Child assets can include audio, video, Reel, film, series, anime, game, podcast, LIVE event, immersive experience, merchandise and Omni Box. Link rights assets and versioned split agreements rather than duplicating ownership rules.

## Money Engine contract
All posted journals balance. Keep platform revenue, creator/master/publishing/collaborator payables, prizes, taxes, refund reserves, sponsor-restricted funds, charity/legacy/ministry allocations, processing fees, reserves and settlement cash separate. State transitions: earned → pending → cleared → payable → sent → paid, with hold/reversal/refund/dispute/failure paths.

## Safety gates
Custom algorithms cannot bypass moderation. Real money cannot launch from UI-only balances. Government passport/driver-license credentials are external government-issued credentials; TRYAMM does not issue them. Payment cards/tap-to-pay require approved partners. Paid competitions require official rules and applicable jurisdiction/store compliance.

## Validation checklist
- Typecheck/build passes.
- RLS protects user/creator financial data.
- No client-side secret keys.
- Financial journals balance and rounding preserves every minor unit.
- Idempotent webhook/event handling.
- Unauthorized payout and split mutations fail.
- Accessibility works by keyboard/screen reader and supports reduced motion/captions where applicable.
- Feature flags distinguish demo/internal/alpha/beta/public and real-money OFF/ON states.
