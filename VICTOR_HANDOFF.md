# Victor Implementation Handoff

## Purpose

Continue the TryAMM / All American Marketplace foundation as a secure, persistent, production-capable platform. The current branch provides Express routes, browser dashboards, configuration foundations, referral data, regional-market data, music-streaming foundations, Billboard chart foundations, billing requirements, AI game-planning queues, and community modules. It is not yet a finished production system, licensed global streaming service, payment processor, ride-share network, or completed AAA game suite.

## Branch and pull request

- Repository: `jgoldie1/Amm-project-`
- Branch: `agent/ai-game-faith-platform`
- Draft pull request: `#4`
- Keep the pull request in draft until production dependencies, tests, security review, licensing, payments, and deployment validation are completed.

## Business rules represented in code

- Holographic work uses an 80% creator / 20% platform revenue split.
- The Game Future Fund defaults to 25% of TryAMM's net gaming-platform share and must not reduce the creator's agreed share.
- Referrals default to $1.00 per qualified paid conversion.
- A qualified conversion requires a valid code, verified account, completed first paid month, cleared refund window, and fraud review.
- The referred customer receives buy 1 month, get 1 month free.
- Minimum referral payout defaults to $25.00.
- Promotions, rewards, payout thresholds, Game Future Fund percentage, billing settings, markets, ambassadors, groups, and additional referral partners must be configurable by authorized admins.

## Referral partners and communities

Initial people and community entries include:

James, Sarah, Jacobie, Isaiah, Aniyah, Al, Kevon, Don, Carlton, Kenny, Mike, Shawndell, Ashley, Delvell, Keshawn, Ashley 2, Niki, BJ, Toya, Sheanes, Latasha, Dea, De Angel, Dawn, Amy, Tasha, Adrian, Flexis, Natasha, Kya, Soraya, Leandra, Day Day, Solomand, Golden Ma, Take Monroe, and Pndand Mt.

Community groups include:

- Family
- General community
- TikTok Fam
- BIGO Fam
- Africa
- Asia
- Philippines

Names, spellings, groups, status, and codes must be editable by authorized admins. Do not treat the current spelling list as legally verified identity data.

## Regional and country launch codes

Current foundation codes include:

- `AFRICA-40`
- `ASIA-41`
- `PHILIPPINES-42`
- `NIGERIA-LAUNCH`
- `GHANA-LAUNCH`
- `KENYA-LAUNCH`
- `SOUTHAFRICA-LAUNCH`
- `INDIA-LAUNCH`
- `JAPAN-LAUNCH`

Markets currently represented include Nigeria, Ghana, Kenya, South Africa, India, Japan, the Philippines, and broader Africa/Asia campaign groups. Admins must be able to create additional countries, regions, communities, languages, currencies, codes, and ambassadors without source-code changes.

## International-market requirements

Before activating any market, complete:

- Country-specific legal and consumer-protection review
- Privacy, data-residency, retention, and child-safety review
- Licensed payment and payout provider support
- Currency, tax, refund, chargeback, and receipt handling
- Sanctions and restricted-party screening
- Identity verification and fraud controls
- Localized pricing and approved promotions
- Language translation and localized support
- Regional moderation and escalation teams
- Accessibility support
- Music territory and publishing-rights clearance
- Regional Billboard chart configuration
- Ambassador verification, contracts, commission rules, and payout statements

Do not treat Africa or Asia as single permanent markets. Country-level pricing, regulation, support, moderation, payments, music rights, and campaigns are required.

## Required production backend

Replace in-memory Maps and arrays with PostgreSQL/Supabase tables and migrations for:

- users
- roles
- permissions
- sessions
- platform_config
- promotion_campaigns
- referral_groups
- referral_partners
- referral_codes
- referral_events
- referral_qualifications
- referral_rewards
- referral_payouts
- regional_markets
- regional_codes
- ambassadors
- ambassador_contracts
- ambassador_commissions
- country_pricing
- supported_currencies
- localization_content
- moderation_regions
- game_future_fund_entries
- game_future_fund_disbursements
- billing_customers
- subscriptions
- invoices
- payments
- refunds
- chargebacks
- payout_accounts
- payout_batches
- ledger_accounts
- ledger_entries
- artists
- music_releases
- tracks
- ownership_splits
- licenses
- territories
- stream_events
- stream_fraud_reviews
- royalty_statements
- billboard_charts
- billboard_chart_entries
- chart_periods
- ai_production_jobs
- ai_job_steps
- human_approval_gates
- audit_logs

Add authentication, RBAC, rate limiting, idempotency keys, secure secret management, encryption, immutable financial ledgers, webhook verification, reconciliation, refund and chargeback handling, fraud review, tax reporting, royalty accounting, and admin audit history.

## Required production frontend

Build authenticated, accessible pages for:

- Admin configuration
- Promotion campaign creation and scheduling
- Referral partner creation, editing, suspension, and code rotation
- Referral group and country management
- Referral conversion status
- Referral payout statements
- Ambassador onboarding and verification
- Ambassador market assignment and commission statements
- Global Market Center
- Country pricing, currency, language, and launch-readiness controls
- Regional moderation configuration
- Game Future Fund dashboard
- Fund allocation and public transparency reports
- AI game-production job queue
- Human approval gates
- Artist profile and release upload
- Rights, ownership-split, territory, and licensing intake
- Music-streaming player and library
- Artist analytics and royalty statements
- The All American Billboard global, regional, country, genre, faith, independent, and emerging-artist charts
- Stream-fraud review dashboard
- Billing, invoices, refunds, disputes, taxes, and payouts
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

## The All American Billboard

The chart system should support:

- Global chart
- Regional charts
- Country charts
- Genre charts
- Faith and gospel charts
- Independent-artist chart
- Emerging-artist chart
- Music-video chart
- Livestream-performance chart
- Fan-voted chart separated from verified consumption charts

Chart calculations must use verified, deduplicated events. Do not count bots, paid manipulation, self-stream farms, abnormal looping, or fraudulent traffic. Publish chart methodology, eligibility rules, audit processes, correction policy, and dispute procedure.

## Music streaming and artist system

Required production capabilities:

- Artist and label onboarding
- Track and release upload
- Audio transcoding and waveform generation
- Object storage and CDN delivery
- Metadata validation
- ISRC, UPC, songwriter, publisher, PRO, ownership, and split collection
- Territory and license restrictions
- Takedown and dispute workflow
- Content identification and duplicate detection
- Explicit-content and youth-safety controls
- Stream-event verification
- Anti-bot and anti-fraud scoring
- Royalty calculation and statements
- Tax documentation and payout reconciliation
- Lyrics, captions, translation, accessibility, and clean versions where available

Do not publicly promise per-stream payout rates until licensing, revenue, territory, fraud, reserve, and accounting rules are approved.

## All American Billing

Connect a PCI-compliant provider rather than storing card data. Required capabilities include:

- Subscriptions and free-month promotions
- Creator purchases and marketplace sales
- Game purchases
- Music and holographic services
- Referral and ambassador rewards
- Faith plans
- Refunds and chargebacks
- Taxes and receipts
- Multi-currency display and settlement
- Double-entry ledger
- Webhook signature verification
- Idempotent transaction processing
- Reconciliation and payout statements

## AI game-production agent

The AI agent should perform heavy drafting and analysis for:

1. Design briefs
2. Level planning
3. Asset budgets
4. Enemy and NPC placement
5. Dialogue drafts
6. Difficulty balancing
7. Device performance budgets
8. LOD and texture optimization suggestions
9. Automated test-case drafts
10. Build and regression reports

Human approval is mandatory for gameplay, art direction, safety, licensing, monetization, youth protections, dialogue, cultural review, accessibility, and final builds.

## Game quality and progression

Use a shared framework for the 11 game concepts. Start with one polished 12-level vertical slice, then expand to 25 seasonal levels, 50 campaign levels, and up to 100 levels where supported by the game design. Prioritize art-direction consistency, animation, audio, lighting, responsiveness, accessibility, network stability, and frame rate over polygon count.

Never claim the games are AAA-complete until playable builds, original or licensed assets, networking, performance tests, security review, accessibility testing, content ratings, and release certification are finished.

## Fair engagement requirements

- No pay-to-win competitive power
- No purchased loot boxes for minors
- No deceptive scarcity or false countdowns
- No punishment for taking breaks
- Parent controls and youth-safe social lanes
- Transparent odds and pricing where randomized rewards are legally permitted
- Spending limits, cooling-off tools, self-exclusion, and refund support

## Faith Premium

- Default Faith Premium price: $14.99/month
- Default campaign: buy 1 month, get 1 month free
- Ministry invitation campaign requires verification
- Campaign terms, dates, eligibility, redemption limits, and abuse controls must be configurable
- Do not imply tax-deductible giving unless legal requirements are satisfied

## Set Apart Ride Share

Do not launch until driver screening, insurance, licensing, maps, dispatch, location safety, emergency support, accessibility, payments, driver payouts, incident response, and applicable transportation-law review are complete.

## Validation and deployment still required

- Run `npm run check`
- Run `npm test`
- Unit and integration tests
- Database migration tests
- Payment sandbox tests
- Referral and ambassador fraud tests
- Authorization and privilege-escalation tests
- Music-rights and territory tests
- Stream-fraud and Billboard-calculation tests
- Load and concurrency tests
- Accessibility review
- Security review
- Privacy and retention review
- Game-engine worker integration
- AI provider integration
- Storage/CDN and transcoding tests
- Deployment, monitoring, backup, disaster-recovery, and rollback testing

## Completion rule

The code and handoff are committed to the feature branch, but production is not complete until the database, authentication, payments, payouts, music licensing, royalties, international compliance, game workers, tests, deployment, and operational support are connected and validated. Keep PR #4 in draft until that work is completed and verified.