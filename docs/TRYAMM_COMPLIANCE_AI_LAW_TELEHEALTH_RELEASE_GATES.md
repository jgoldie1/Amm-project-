# TRYAMM Compliance & AI Law Department — release gates (working draft)
Status: INTERNAL DESIGN, NOT LEGAL ADVICE, NOT CERTIFIED HIPAA COMPLIANCE. Owner: unassigned. Review date: 2026-11-18.

## Scope, legal status and accountable humans
- Compliance AI is a research, inventory, evidence-collection and alert assistant only. It must never claim attorney status, privilege, legal representation, license, certification or final approval.
- Appoint named Privacy Officer, Security Officer, product owner, incident-response lead and external licensed counsel. Determine for each health flow whether TRYAMM is a covered entity, business associate, subcontractor, or a consumer-health product outside HIPAA. Jurisdiction and workflows determine applicable law.
- Clinical care is not authorized by a preview page, GitHub checkbox or vendor advertisement. Clinical care requires verified licensed professionals, payer/payment review, local telehealth, consent, malpractice and prescribing rules, including location-of-patient rules and scope-of-practice review.
- Consumer health information may fall under FTC Act/Health Breach Notification Rule or state privacy laws even when HIPAA does not apply.

## HIPAA control checklist — must be evidenced and approved before PHI use
1. Document data inventory, purpose, data-flow maps, controller/processor relationships, PHI classification, minimum-necessary analysis, permitted uses and disclosures.
2. Complete enterprise-wide HIPAA Security Rule risk analysis and management plan; establish policies, designated officials, workforce training, sanctions and periodic review.
3. Review all vendors/subprocessors that create, receive, maintain, or transmit PHI. Execute BAAs where required BEFORE PHI enters systems, including video, hosting, storage, email, analytics, logs, AI models and transcription providers. A BAA alone does not establish compliance.
4. Separate health tenant, identity provider, encryption keys, databases, backups, logs and network controls from StreetVerse, ads, analytics, trading and AI agent memory. Default deny cross-tenant access.
5. Implement unique user identities, MFA, least-privilege access, break-glass authorization and review, lifecycle revocation, session timeout, audited administrative changes, and secure audit trails without unnecessary PHI.
6. Protect ePHI in transit and at rest following documented risk analysis; manage keys, secrets, endpoint safety, malware defenses, patching, vulnerability scanning and supply-chain dependencies.
7. Test availability, disaster recovery, encrypted backup restore, secure deletion, retention, data export and access requests.
8. Create incident reporting, response, breach assessment and lawful notification procedures; tabletop exercise and document evidence. Legal breach deadlines must be reviewed per applicable law and contract.
9. Produce verified accessibility and language access testing, privacy notices, clinical informed consent workflows, telehealth vendor disclosures, patient rights, authorized guardians, and appropriate safeguards for minors.
10. Review AI data use: no model training on PHI by default, no PHI in prompts/logging or game agent memory, no diagnostic/triage AI without independently approved validated clinical workflow.
11. Require independent security and privacy review, clinician workflow test, real Chromebook/iPhone test, and signed go-live authorization. Never equate code tests to certification.

## AI Law Department — modules and review queue
- Regulatory tracker: HIPAA/HITECH, FTC consumer health/advertising, ADA/WCAG, state telehealth/privacy laws, COPPA/FERPA for K-12 where applicable, AI transparency/discrimination rules, EU AI Act if serving applicable markets, copyright/IP, music/creator licenses, payments/AML/KYC, broker/adviser and sanctions.
- Evidence register: control ID, responsible owner, system, jurisdiction, obligation, evidence URL/hash, test date, reviewer, disposition and expiry. Store evidence in secured, appropriately authorized systems.
- Model register: owner, use case, provider, data classification, evaluation, allowed actions, human overseer, vendor terms, incident and rollback plan.
- Professional signoff: law department routes questions to qualified counsel. It may summarize public laws and flag risks, but cannot give binding legal opinions.
- Human approval gates: contract execution, payouts, real trades, prescribing, medical advice, diagnosis, treatment, regulatory filing, high-impact eligibility decisions and public revenue claims.

## Architecture
PUBLIC BUSINESS WORLD / STREETVERSE / MIDDLEVERSE:
  non-sensitive referral token only -> isolated authorized partner handoff
REGULATED HEALTH ZONE (NOT DEPLOYED):
  verified identity + privacy consent -> authorized provider appointment -> approved telehealth environment
FINANCIAL ZONE (NOT DEPLOYED):
  fictional paper trades only until separate broker/legal/financial/security review
An event fabric may carry generic outcome flags only after a lawful authorization review. Never copy clinical notes, diagnoses, treatment events or patient identities into Mycelium or creator analytics.

## Readiness and commercial strategy
- Launch low-risk creator storefront, authorized subscription, booking inquiry and transparent revenue accounting before clinical or live trading.
- Agents may draft listings, research opportunities, route opt-in leads, schedule approved reminders, do non-sensitive QA and prepare invoices. Payment collection and execution belong to authorized services.
- No guarantees of passive income or market return; retain audit trails, customer consent, price disclosure, refunds and human oversight.

## Source references (verify current versions at review)
- https://www.hhs.gov/hipaa/for-professionals/security/guidance/guidance-risk-analysis/index.html
- https://telehealth.hhs.gov/providers/telehealth-policy/hipaa-for-telehealth-technology
- https://www.hhs.gov/hipaa/for-professionals/privacy/guidance/business-associates/index.html
- https://www.ftc.gov/business-guidance/resources/health-breach-notification-rule-basics-business
- https://www.finra.org/investors/investing/investment-products/stocks/know-risks-auto-trading-services-offered-unregistered-entities
- https://ai-act-service-desk.ec.europa.eu/en/ai-act/eu-ai-act-implementation-timeline
