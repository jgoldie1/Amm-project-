# October 22 business website release checklist

## Confirmed scope
- 20 individual vendor websites, not the All American Marketplace directory.
- Candidate initial fifteen from prior planning are not all verified as live projects.
- Last five recorded: #16 Alphonso Gregory (CNA staffing), #17 Michael Castner (carting & meal prep), #18 Silvia Caster (insurance), #19 Nekira Frances (logistics), #20 Raymond Jarreau (insurance, 401(k), infinite banking, trusts and legacy planning).
- Stubbs Security is an additional independently hosted referral partner; do not overwrite a numbered vendor.

## Common repair gates, each website
1. Confirm repository, owner, canonical name and public URL. Missing = NOT DEPLOYED/UNVERIFIED, not success.
2. Preserve approved original images/logo in durable source/assets and backup. Check file loads in deployed page.
3. Mobile: viewport, navigation, button tap targets, contrast, focus, alt text, no horizontal overflow.
4. Contact/quote: correct recipient, required field validation, no false 'sent' notice when only mailto; test actual delivery before claiming lead capture.
5. Payments: no 'paid' or commission status without verified processor event. Do not publish unapproved regulated service claims.
6. Referral: use sites/shared/partner-referrals.js only with owner-approved verified HTTPS URLs; use unique ref codes. No fabricated links.
7. Test production and preview independently, capture deployment ID, HTTP status, and form smoke result. Record regression baseline and rollback.
8. Leave TRYAMM production routing untouched.

## Known blockers
- Stubbs Security Vercel project creation returns 403; public hosting not confirmed.
- Stubbs photo and complete design in backed-up local package/Library, but binary assets not yet verified in GitHub hosted site.
- SculptifyLTD: deployment authorization blocked and draft PR outstanding; booking, payment, SEO and forms need checks.
- La Teasia Beauty House: production deployment previously reported ready, but billing/availability needs fresh verification.
- Other 18 sites: exact repo and public URL mapping must be verified before any claim of fixes or launches.

## Change record
- Shared referral widget committed; intentionally not auto-injected into all sites because owner approvals, verified URLs, and project locations are missing.
