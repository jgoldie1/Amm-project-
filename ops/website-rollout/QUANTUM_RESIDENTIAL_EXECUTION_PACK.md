# TRYAMM Quantum Towers Residential Pilot — Operating Pack
Status: development-only. NOT live service, installed network, assigned installer, contracted ISP or active checkout.
## A. Upstream connectivity partnership
Partner options: homeowner's existing ISP under contract terms; authorized ISP reseller; building-wide agreement; sponsoring ISP. Never resell or share upstream without written permission. Ask providers for service address eligibility, 300Mbps/1Gbps symmetric or asymmetric tiers, monthly recurring and installation costs, SLA, static IP/CGNAT, data cap, router compatibility, reseller permission, service-level escalation and cancellation.
Qualification gate: supplier authorization, actual tested wired performance, written pricing and coverage before representing any speed.
## B. Installer recruitment and acceptance
Recruit a Chicago-area insured low-voltage/network installer with references, background-screening method appropriate to work in homes, documented credentials and accessible communication. Verify permits/licensing where relevant, proof of insurance, rate card, travel surcharge, quality and dispute process. No partner is designated or approved yet.
Installer worksheet: contact __; legal company __; credentials __; insurance verified __; service region __; availability __; diagnostic rate __; installation rate __; privacy policy __; customer consent __.
## C. Residential pilot
Site: voluntary owner or tenant with landlord permission where needed. Signed access/measurement/privacy consent, no passwords collected, no unpublished exact home address in marketing. No physical tower is needed for the first home pilot.
1. Record ISP plan and wired speed baseline (3 tests off peak / 3 at peak) plus wireless speed near router and dead zone.
2. Record p50/p95 latency, jitter, packet loss and device performance before any modifications.
3. With written permission, tune placement, firmware settings, spectrum/channel choices and SQM; optional certified customer-approved equipment only.
4. Repeat same tests, deliver report without guarantees. Obtain separate opt-in for anonymized case study.
## D. $49/$99 checkout/fulfillment gates
- Do not create or publish a live Stripe payment link before legal merchant identity, sales tax treatment, refund terms, support email, qualified assessor, evidence collection and privacy policy are ready.
- Distinct product scope: $49 simple remote homeowner report; $99 extended remote multi-room/gaming report; business $99 report.
- Order states: INQUIRY -> QUALIFIED -> QUOTED -> ACCEPTED -> CHECKOUT_PENDING -> PAYMENT_VERIFIED (server webhook) -> SCHEDULED -> DELIVERED -> COMPLETE; FAILED/REFUNDED handled separately.
- Fulfillment is never triggered by return URL alone. Use verified Stripe payment event and idempotent fulfillment reference.
- Report delivered securely and customer confirmation logged. Hardware and ISP service only via separately approved quotes.
## E. Real-world readiness verification
[ ] signed ISP permission or network-owner existing-plan consent
[ ] technician qualified/available
[ ] pilot host signed consent
[ ] calibrated repeatable baseline and post-change report
[ ] Stripe test-mode order and webhook signature validation
[ ] refund, duplicate event and failure tests
[ ] live support coverage/complaint escalation
[ ] production release gates pass
No claim that these boxes are completed.

## Founder home pilot — selected first test site (planning only)
- First pilot participant: TRYAMM founder, own home. Exact address, Wi-Fi SSID/password, router admin credentials, personal device identifiers and unredacted speed-test IPs stay OFF GitHub.
- Testing is remote/self-guided initially; there is NO installer appointment, hardware installation or active network service yet.
- One-handed baseline: (1) verify Wi-Fi on phone/Chromebook, (2) note ISP advertised tier and router model without credentials, (3) run 3 speed/latency tests near router and 3 in problem room, (4) optionally compare a wired test if safely available, (5) repeat during peak hours. Record date/time, location label only (e.g. living room), download/upload Mbps, idle/loaded ping, packet loss if measured, and device type.
- No router configuration changes before baseline, consent and rollback plan; avoid logging into ISP account or sharing router passwords.
- Next steps: compare measurements, isolate ISP vs Wi-Fi vs device/app rendering, prioritize free changes, then re-test and document evidence. Obtain explicit opt-in before publishing anonymized results for marketing.
- Claimed outcome: none until real measured before/after results are recorded.
