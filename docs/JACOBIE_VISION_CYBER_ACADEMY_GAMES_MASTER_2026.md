# Jacobie Vision Cyber Academy™ + Cyber Games™ Master Blueprint

Status: Architecture locked for implementation planning. This document does not claim production deployment of unfinished features.

## Purpose
Jacobie Vision Cyber Academy™ is the cybersecurity education, competition, workforce, and business-development division within the TRYAMM / StreetVerse / All American University ecosystem.

Its mission is to turn safe cybersecurity learning into demonstrated mastery, public recognition, employer access, paid apprenticeships, business creation, and recurring cybersecurity services.

## All American University Mastery Standard™
Every program follows the same loop:

DISCOVER → LEARN → WATCH → PRACTICE → PLAY → TEST → EXPLAIN IT BACK → PERFORM IT → REPEAT IT → VERIFY MASTERY → BADGE/CERTIFICATE → APPRENTICESHIP → PAID WORK → BUSINESS OWNERSHIP → MENTOR OTHERS.

Completion is not mastery. A learner must understand the skill, perform it, explain it, adapt to a changed scenario, and repeat it successfully.

## StreetVerse Career City Integration
Jacobie Vision Cyber Academy is a playable business and career location inside StreetVerse.

Example progression:
- Cyber Fundamentals
- Help Desk / Identity Protection
- SOC Analyst
- Incident Responder
- Network Defender
- Secure Application / API Defender
- Cloud Security
- Privacy / Data Retention Auditor
- Security Engineer
- Security Architect
- Cyber Business Owner

All offensive exercises must run only against authorized, intentionally vulnerable sandbox systems. No challenge should require or reward attacking real third-party systems, accounts, businesses, or infrastructure without explicit authorization.

## Jacobie Vision Cyber Games™
Create recurring Red vs. Green/Blue defensive competitions using isolated cyber ranges.

Competition formats may include:
- phishing defense
- account takeover response
- API authorization defense
- secure configuration
- network incident response
- cloud security
- fraud and bot detection
- privacy/data-expiration audits
- AI-agent security
- business continuity and recovery
- timed team defense exercises

The Red Team is limited to the competition environment. Green/Blue Teams detect, contain, recover, document, and explain what happened.

## Cyber Games Operating Model
Each event should be reproducible and auditable:

1. Publish challenge category, rules, eligibility, sponsor, prize pool, and judging criteria.
2. Provision isolated disposable range environments for every team.
3. Confirm identity/age/consent requirements before prize eligibility.
4. Run preflight checks so challenges cannot route into real production systems.
5. Start challenge clock and capture only the minimum telemetry needed for scoring, integrity, and safety.
6. Score defense, recovery, explanation, teamwork, and repeat performance.
7. Require teach-back before final mastery recognition.
8. Run integrity review and human approval before high-value prizes.
9. Publish opted-in winners and verified skills results.
10. Expire eligible temporary competition telemetry under TRYAMM retention rules.

## Competition Divisions
- Youth / Student Division
- College / Career Starter Division
- Professional Division
- Small Business Defense Division
- Franchise Defense Division
- AI Security Division
- Privacy & Ephemeral Data Division
- Team Championship Division

Age-restricted or professional divisions must use eligibility controls and appropriate guardian/consent workflows where required.

## Sponsors, Advertising, and Prize Economy
Approved sponsors may fund tournaments, scholarships, equipment, apprenticeships, cash prize pools, and training resources.

Commercial inventory may include:
- arena naming sponsorship
- StreetVerse venue branding
- livestream sponsorship
- Omniverse Radio sponsorship
- Holo display advertising
- event reels and social content
- scholarship naming rights
- employer recruiting booths
- challenge sponsorships

Prize programs may include cash, scholarships, equipment, TRYAMM rewards, paid apprenticeships, and employer-sponsored training. Contest rules, eligibility, taxation, age restrictions, and prize administration require legal review before public launch.

## Sponsor Ladder — Planning Model
These are planning targets, not published offers until validated:
- Challenge Sponsor: $2,500–$5,000
- Division Sponsor: $10,000–$25,000
- Championship Sponsor: $25,000–$100,000+
- Scholarship / Apprenticeship Sponsor: custom
- Recruiting Partner: recurring or event-based package

Sponsor money should be separated into clearly accounted buckets for production, prize pool, scholarships, marketing, and TRYAMM/Jacobie Vision operating revenue.

## Prize Ledger
All prize economics must be server-authoritative:

SPONSOR FUNDS → ESCROW/CONTROLLED PRIZE ACCOUNT → ELIGIBILITY VERIFIED → COMPETITION RESULT VERIFIED → FRAUD/INTEGRITY REVIEW → APPROVAL → PAYOUT → ACCOUNTING/TAX RECORD.

The game client must never decide that real money is owed. Game rewards and real cash awards remain separate accounting classes.

## Verified Skills Profile™
Participants may opt in to a portable verified-skills profile containing evidence such as:
- competencies demonstrated
- challenge levels completed
- repeat-performance score
- incident-response score
- defensive analysis score
- teach-back mastery result
- teamwork / leadership evidence

Students control whether their profile is shared with employers.

## Employer Pipeline
Build a Jacobie Vision Cyber Career Fair™ connecting verified participants to employers through:

TRAIN → COMPETE → VERIFY SKILLS → BUILD PORTFOLIO → EMPLOYER INTRODUCTION → INTERVIEW → INTERNSHIP / APPRENTICESHIP / CONTRACT / FULL-TIME OPPORTUNITY.

TRYAMM should promise access and opportunity, not guaranteed employment.

## Employer Portal — Planned Capabilities
Participating employers may:
- sponsor a challenge
- define skill categories they recruit for
- browse only opted-in candidate profiles
- request interviews
- offer internships or apprenticeships
- post approved cybersecurity opportunities
- fund scholarships
- host mentor sessions
- invite candidates into supervised business-defense projects

Candidates decide whether to disclose their real identity and profile to a recruiter.

## Jacobie Vision as a Business
Jacobie Vision first protects TRYAMM through the TRYAMM Guardian Architecture™, then becomes a sellable cybersecurity service for businesses and franchises.

Potential services:
- identity and access protection
- cybersecurity monitoring
- vulnerability-management coordination
- secure application/API reviews
- employee security training
- incident-response readiness
- privacy and retention verification
- franchise security services
- restaurant/creator/business security packages

Illustrative planning tiers, subject to market validation:
- Guardian Starter: $49/month
- Guardian Business: $149/month
- Guardian Pro: $299/month
- Restaurant/Creator Security: $99–$299/month
- Franchise Security: $299–$999/month/location
- Security Assessments: $500–$2,500+
- Enterprise: custom

## How Jacobie Can Be Paid
Compensation and ownership must be documented separately.

Possible structures include:
- employee compensation for actual work
- contractor compensation where appropriate
- performance bonuses
- defined revenue participation in Jacobie Vision products
- documented equity/IP participation after legal and tax review

No percentage is established by this blueprint; ownership and compensation require written agreements.

## TRYAMM Guardian Architecture™
Jacobie Vision is the security layer for:
- customers
- employees
- creators
- businesses
- franchisees
- payments and earnings ledgers
- StreetVerse
- Holo Menu
- Holo Fridge / Holo Storage
- Marketplace
- Holo Delivery
- Holo Ads
- AI agents such as Benny
- Founder Command Center
- physical TRYAMM facilities

Core principles:
- zero trust
- least privilege
- individual identities; no shared admin accounts
- server-authoritative financial decisions
- segmented networks
- API/object-level authorization
- rate limiting and abuse protection
- human approval for high-risk AI actions
- fraud and bot monitoring
- incident-response procedures
- backup/recovery verification

## Cyber Range Isolation Standard
Competition systems must be separated from production using multiple controls:
- separate cloud projects/accounts where practical
- separate credentials and secrets
- no production database credentials
- outbound network restrictions appropriate to the exercise
- per-team disposable environments
- short-lived credentials
- resource quotas/rate limits
- logging for competition integrity
- automatic environment teardown after the event
- manual emergency kill switch

## TRYAMM Ephemeral Data Architecture™
Security and privacy use data minimization by default.

Lifecycle:
CREATE → USE → SETTLE → LEARN → DE-IDENTIFY/AGGREGATE → DESTROY.

Identifiable/raw user activity is retained only for a defined legitimate period and then automatically deleted or irreversibly de-identified where appropriate. Required accounting, tax, fraud/security, contractual, food-safety, legal, or other compliance records follow their required retention schedules.

Backups, analytics stores, logs, and derived systems must participate in retention enforcement so deletion is not merely cosmetic.

Biometric and other highly sensitive information must receive special legal/security treatment and must not be casually monetized.

## Data Value Without Permanent Surveillance
TRYAMM can retain useful aggregate intelligence after eligible identifiable records expire. Examples:
- demand by time and area
- kitchen utilization
- inventory consumption
- delivery performance
- advertising conversion
- franchise benchmarks
- business trends

The platform goal is intelligence without unnecessary permanent behavioral surveillance.

## Career Recognition
Participants may earn:
- mastery levels
- verified badges
- seasonal rankings
- trophies / championship recognition
- Holo Hall of Fame placement where opted in
- interviews / highlight reels
- mentor status

Public identity and public rankings should be opt-in.

## Expansion Model
The same All American University mastery engine can later power culinary, creator/media, Holo advertising, fabrication, logistics, facilities, entrepreneurship, and franchise-management academies.

One student's business can generate another student's mission: restaurants need advertising, cybersecurity, content, logistics, packaging, and technology support. This creates an interconnected playable workforce economy.

## 30-Day Build Track
Week 1 — Schema and safety foundations
- AAU competency schema
- Career Passport data model
- challenge manifest format
- competition rules template
- prize ledger data model
- retention classes

Week 2 — Range and scoring prototype
- disposable sandbox provisioning
- first defensive challenge
- scoring service
- teach-back rubric
- admin review workflow

Week 3 — Career and sponsor layer
- Verified Skills Profile
- sponsor package data model
- employer opt-in directory
- candidate-sharing consent
- prize eligibility workflow

Week 4 — Pilot and hardening
- internal pilot tournament
- range escape tests
- fraud/integrity tests
- accessibility review
- privacy/retention test
- incident-response drill
- go/no-go decision for public demo

## 2026 Opportunity
NIST Cybersecurity Career Week is scheduled for October 19–24, 2026. NIST encourages activities including CTF competitions, career panels, workplace tours, mentoring, workshops, and career-pathway exploration. A Jacobie Vision Cyber Games / career-awareness event can be planned to align with that week if TRYAMM can complete the legal, technical, sponsor, accessibility, and safety requirements in time.

NIST also lists a September 22, 2026 Cybersecurity Career Week kick-off event focused on the cyber workforce. TRYAMM can use the timing as a planning milestone, without implying NIST sponsorship, endorsement, or affiliation.

## Public Pilot Definition
A minimum viable public-facing pilot should contain:
- 1 isolated cyber range
- 3–5 defensive challenges
- 1 teach-back assessment
- team scoring
- opt-in leaderboard
- sponsor placement
- prize rules and eligibility
- Verified Skills Profile
- employer-interest form
- accessibility support
- data-retention/deletion controls
- post-event security review

## Definition of Done
This architecture is not production-complete merely because this document exists. Public launch requires working code, isolated challenge infrastructure, security review, legal contest rules, sponsor agreements, payment/prize controls, privacy controls, testing, and deployment verification.
