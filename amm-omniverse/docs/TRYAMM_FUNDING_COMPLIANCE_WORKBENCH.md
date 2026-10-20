# TRYAMM Business Launch + Funding Readiness + Compliance Workbench (Oct 20, 2026)

## Mission
Turn the public TRYAMM business application into a *business launch and funding preparation* platform. Preserve StreetVerse as an **optional, independent route**. Give every built-in website template (54 categories) the same full-page business design plus a funding/workflow link. No new paid API or project, no changes to Supabase tables or billing, no production deploy in this change.

## Shipped on this branch
- A first-party, account-free Funding & Compliance Hub embedded on \`/business-app.html\`, anchored at \`#funding-hub\`.
- Template-aware funding start links on **all 54** catalog listings and **all 54** standalone full-site demos.
- Profiles: business type, name, one of 50 states or D.C., stage, projected funding need, customer segment, revenue model, competition, operating costs, owner experience, milestones.
- Baseline 12-step business-readiness checklist plus two activity-specific review questions for each of 10 sectors. Owner checkmarks are **self-asserted**, never labeled as certification or verified eligibility.
- Browser-only output: download plain-text business plan/funding draft (not sent to any third party); no sensitive records stored, no loan application, no application submission.
- Official links to SBA Lender Match, Microloan program, SBA limited grants, SAM registration, IRS EIN, and regulator reference sites.
- Public API calls not required; works when Supabase and AI services are restricted; no account or credit pull.
- Browser accessibility and responsive layout; iPhone WebKit and Android Chromium acceptance added to existing mobile workflow.

## Never claim without independent verification
- Loan or grant award, lender matching/qualification or approval.
- IRS EIN, secretary-of-state registration, SAM registration, city license, medical/legal/security/cosmetology professional license, governmental certification or HIPAA compliance.
- That rules and permit lists are exhaustive for a given state/municipality or country.
- Paid Stripe checkout, invoices, tax filing, insured business, bank account, active media publishing, customer data retention/hosting or legal advice.
- That a business plan outline itself meets the requirements of a particular funder.

## Next production phases (not implemented here)
1. Independent QA/accuracy review of state- and activity-specific compliance material, and authoritative rule update dates.
2. Private, secure document vault with per-user server authorization, encryption, signed access, retention and purge policies; no confidential IDs on public clients.
3. Matching grant/loan directory with verified deadlines, geographies and eligibility, official links, freshness, and transparent source/unknown eligibility (no paid 'guaranteed grant' representations).
4. Consent-based assisted application workflow to submit to supported lenders/programs *only with user approval* and signed permissions; no hidden application or document transmission.
5. Financial worksheet: transparent use-of-funds categories, historical financial upload (private), forecast assumptions and export to PDF; CPA review where appropriate.
6. Field-tested production deployment with domain/build parity, account access tests, rollback, and media/payment prerequisites verified.

## Source references checked October 20, 2026
- https://www.sba.gov/counseling/launch-your-business/
- https://www.irs.gov/businesses/small-businesses-self-employed/get-an-employer-identification-number
- https://www.sba.gov/loans/microloans/
- https://www.sba.gov/loans/lender-match/
- https://www.sba.gov/loans/additional-funding-opportunities/grants/
- https://sam.gov/entity-registration
- https://www.ftc.gov/business-guidance/advertising-marketing

## Acceptance
- All existing website demo tests and new funding hub tests pass in browser simulations; no StreetVerse 3D on business page.
- User selects a template from catalog and full website, arrives with selected business in hub.
- Owner checklist changes progress with unverified label; direct download is clearly DRAFT/NOT SUBMITTED.
- No user-entered business data uploaded, no government credentials collected.
- Existing production alias remains untouched until preservation/release baseline is reconciled and actual iPhone testing succeeds.
