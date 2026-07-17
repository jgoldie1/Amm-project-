# Victor Implementation Handoff

## Purpose

Continue the TryAMM foundation as a secure, persistent, production-capable platform. The current branch provides working Express routes and a browser dashboard, but it is not a finished production system or a completed AAA game suite.

## Business rules now represented in code

- Holographic work uses an 80% creator / 20% platform revenue split.
- The Game Future Fund defaults to 25% of TryAMM's net gaming-platform share. It must not reduce the creator's agreed share.
- Family/community referrals default to $1.00 per qualified paid conversion.
- A qualified conversion requires a valid code, verified account, completed first paid month, cleared refund window, and fraud review.
- The referred customer receives buy 1 month, get 1 month free.
- Minimum referral payout defaults to $25.00.
- Promotions, referral rewards, minimum payout, Game Future Fund percentage, and additional referral partners must be configurable by authorized admins.

## Initial referral partners

James, Sarah, Jacobie, Isaiah, Aniyah, Al, Kevon, Don, Carlton, Kenny, Mike, Shawndell, Ashley, Delvell, Keshawn, and a second Ashley entry are represented with unique codes. Admins can add more partners later.

## Required production backend

Replace all in-memory Maps and arrays with PostgreSQL/Supabase tables and migrations for:

- platform_config
- promotion_campaigns
- referral_partners
- referral_codes
- referral_events
- referral_qualifications
- referral_rewards
- referral_payouts
- game_future_fund_entries
- game_future_fund_disbursements
- ai_production_jobs
- ai_job_steps
- human_approval_gates
- audit_logs

Add authentication, role-based authorization, rate limiting, idempotency keys, secure secret management, encrypted sensitive fields, immutable financial ledgers, webhook signature verification, reconciliation, refunds, chargeback handling, fraud review, tax reporting, and admin audit history.

## Required production frontend

Build authenticated pages for:

- Admin configuration
- Promotion campaign creation and scheduling
- Referral partner creation, suspension, and code rotation
- Referral conversion status
- Referral payout statements
- Game Future Fund dashboard
- Fund allocation and public transparency reports
- AI game-production job queue
- Human approval gates
- Family business dashboard
- Creator mentorship
- Scholarship and education fund
- Community grants
- Volunteer program
- Creator incubator
- AI Training Academy
- Public roadmap
- Beta testing community
- Bug bounty
- Accessibility testing panel
- Creator advisory council
- Faith advisory council

## AI game-production agent

The AI agent should perform heavy drafting and analysis for:

1. Design brief
2. Level planning
3. Asset budget
4. Enemy and NPC placement
5. Dialogue drafts
6. Difficulty balancing
7. Device performance budget
8. LOD and texture optimization suggestions
9. Automated test-case drafts
10. Build and regression reports

Human approval is mandatory for gameplay, art direction, safety, licensing, monetization, youth protections, and final builds.

## Game quality target

Use a shared game framework for the 11 game concepts. Start with one polished 12-level vertical slice, then expand to 25 seasonal levels, 50 campaign levels, and eventually 100 levels where the game design supports it. Prioritize art-direction consistency, animation, audio, lighting, responsiveness, accessibility, and stable frame rate over raw polygon count.

Never claim the games are AAA-complete until playable builds, assets, networking, performance tests, security review, accessibility testing, content ratings, and release certification are finished.

## Fair engagement requirements

- No pay-to-win competitive power.
- No purchased loot boxes for minors.
- No deceptive scarcity or false countdowns.
- No punishment for taking breaks.
- Parent controls and youth-safe social lanes.
- Transparent odds and pricing where randomized rewards are legally permitted.
- Spending limits, cooling-off tools, self-exclusion, and refund support.

## Faith Premium

- Default Faith Premium price: $14.99/month.
- Default campaign: buy 1 month, get 1 month free.
- Ministry invitation campaign requires verification.
- Campaign terms, dates, eligibility, redemption limits, and abuse controls must be configurable.
- Do not imply tax-deductible giving unless legal requirements are satisfied.

## Set Apart Ride Share

Do not launch until driver screening, insurance, licensing, maps, dispatch, location safety, emergency support, accessibility, payments, driver payouts, incident response, and applicable transportation-law review are complete.

## Validation still required

- Unit and integration tests
- Database migration tests
- Payment sandbox tests
- Referral fraud tests
- Authorization tests
- Load tests
- Accessibility review
- Security review
- Privacy and retention review
- Game-engine worker integration
- AI provider integration
- Deployment and rollback testing

Keep this pull request in draft until these production dependencies are honestly documented and the implemented subset is tested.
