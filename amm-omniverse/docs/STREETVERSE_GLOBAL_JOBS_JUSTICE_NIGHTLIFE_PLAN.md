# StreetVerse Global: Nightlife, Academy, Justice & Careers — implementation specification
Status: DESIGN ONLY. No production integration, gameplay implementation, deployment, or QA certification implied.
Owner repository: jgoldie1/Amm-project-. Preserve existing mission, payment and world code.

## Non-negotiable architecture
- Independent StreetVerse multiplayer server authoritative for characters, missions, inventories, economy, legal cases, and permissions.
- Three-layer chain model from repository README: game rewards are fictional; provider ledger alone owns real money. No conversion of contraband proceeds into cash.
- Keep FiveM adapter optional, separate from independent engine. No GTA proprietary assets or copied scripts.
- Accessible keyboard, gamepad, and one-hand controls; every action has visible button, focus state and feedback.
- All NPC AI outputs are suggestions; server validates permissions, evidence, outcomes and financial effects.
- All mature themes subject to age gating, moderation and non-graphic depiction. No real drug-production procedures.

## Venue registry (proposed names)
- kevon-capital-nights: Kevon; nightclub, bar, VIP, DJ booking, simulated forex academy; staff: manager, bartender, DJ, promoter, security, tutor.
- lateasia-monroe-after-dark: LaTeasia; nightclub, beauty/fashion events, bar, bookings; staff: manager, stylist, promoter, bartender, DJ, security.
- nikki-frances-skyline: Nikki Frances; nightclub, bar, rooftop events, legitimate logistics contracts; staff: manager, bartender, DJ, dispatcher, driver, security.
- nikki-logistics-hub: freight/dispatch warehouse; linked to venue inventory.
All venue names are placeholders pending owner confirmation.

## Career registry
correctional_officer_academy; public_defender; medical_examiner; emergency_dispatch; prison_healthcare; parole_officer; investigative_journalist; civilian_oversight; police_officer; court_clerk; judge; prosecutor; defense_attorney; firefighter; ems; mechanic; driver; freight_dispatcher; stylist; bartender; dj; promoter; security; hospitality; forex_student; forex_tutor; rehabilitation_counselor.
Each career requires: eligibility, training, role-based permissions, shift/job contract, objective, server-validated payout, reputation, progression and audit log. Public authority roles require admin-approved assignment and conflict-of-interest checks.

## HoloGPT JARVIS Academy
Modules: forex fundamentals (pairs, pips, spreads, leverage, position sizing, stop-loss, risk); simulated order entry; trade journal; P/L; professional training; legal procedure; dispatch; logistics; workplace safety; quizzes; accessible text/voice captions. Demo accounts and historical/synthetic quotes only by default; no brokerage connection or investment recommendations.
Academy API contract: enroll, get_lesson, submit_answer, issue_in_game_certificate, practice_trade. Server owns state; explicit simulation labels.

## Justice and corrections
Events: incident -> dispatch -> investigation -> evidence custody -> booking -> counsel -> hearing -> trial -> verdict -> sentence/appeal -> corrections -> parole/reentry.
Features: prison watchtowers, guard schedules, cell assignment, counts, supervised lockdown events, healthcare, commissary, education, visits, legal access, parole, rehab. Manhunt and SWAT as fictional moderated missions; no tactical real-world instruction. Non-graphic references to capital punishment only; no playable execution procedures.
Evidence objects: id, case_id, origin, collected_at, collected_by, integrity_hash, custody_transfers, visibility_acl, review_status. Every prosecution outcome requires an auditable case and appeal option.
Safety: bounded RP detention time, anti-abuse moderation, appeals, staff accountability, reporting, adult-only mature zones, consent controls, non-graphic sex/violence, abstract contraband crafting with no real recipes.

## Minimum persistent data model
players(id, passport_id, character_id, accessibility_settings)
businesses(id, owner_id, venue_type, region_id, permissions)
jobs(id, business_id, profession, objective_schema, wage_game_currency, status)
shifts(id, player_id, job_id, start_at, end_at, approved_by)
wallets(id, player_id, balance_game_currency)
ledger_entries(id, wallet_id, amount, reason, idempotency_key, mission_id, created_at)
inventory_items(id, owner_id, item_type, quantity, fiction_only, provenance)
incidents(id, region_id, status, reported_at, assigned_dispatcher)
cases(id, incident_id, legal_status, jurisdiction, assigned_counsel)
evidence(id, case_id, integrity_hash, custody_log)
court_events(id, case_id, hearing_type, outcome, appeal_window)
sentences(id, case_id, fictional_duration, release_conditions)
academy_progress(id, player_id, module_id, score, certificate)
audit_events(id, actor_id, action, target_id, created_at)
Require RLS/ACL, transactions, idempotent payouts, server-side validations and backup/rollback.

## First vertical-slice mission: Three Clubs, One City
1. Spawn BJ with verified GLB and responsive one-hand controller.
2. Enter vehicle and drive to Nikki logistics hub; accept approved delivery job.
3. Load a fictional legitimate shipment; validate inventory transfer.
4. Drive to Marcus garage for inspection; repair minigame.
5. Deliver to Kevon Capital Nights; trigger AI NPC dialogue, staff shift, in-game wage payout.
6. Visit LaTeasia Monroe After Dark; complete event staffing assignment.
7. Trigger fictional nightclub incident -> dispatch -> evidence -> court hearing -> bounded rehab/reentry epilogue.
8. Save mission, wallet, job history, case, and unlock next chapter.
Never hardcode real payment credentials or expose private case data.

## Release gates
- Verified real BJ character GLB, rig and animation clips; no placeholder claimed as BJ.
- Walk/enter/drive/exit/re-enter and passengers work on Chromebook and mobile.
- All three venue doors/interiors/NPCs load and return to street.
- Job payout exactly once, survives reload; no real-money payout.
- Evidence custody and legal outcomes survive reload; permissions enforced.
- No user trapped in jail due to UI failure; emergency exit and moderation path.
- Accessibility, performance budgets, telemetry, rate limits, abuse tests, restore test.
- Build/test locally, then staging; production only after Vercel suspension resolved and explicit deployment approval.

## Sequencing
Phase A: repo/asset inventory + regression baseline.
Phase B: registry, fictional wallet, job contracts, academy simulator.
Phase C: three enterable clubs and one complete family delivery mission.
Phase D: dispatch/evidence/court/corrections/reentry vertical slice.
Phase E: multiplayer load tests, AI NPCs, international regions, MiddleVerse/MetaVerse/MultiVerse portals.
