# TryAMM Integration Checklist

- [ ] Mount `/api/onboarding` with `createOnboardingRouter`
- [ ] Mount `/api/safety` with `createSafetyRouter`
- [ ] Provide production `db` adapter functions used by both routers
- [ ] Ensure `requireAuth` hydrates `req.user.id` and `req.user.age_band`
- [ ] Ensure `requireModerator` verifies a server-side moderator/admin role
- [ ] Apply and review `schema.sql`
- [ ] Port `age-gate.html` logic into production React/Next.js UI
- [ ] Add separate Family, Teen, and Adult navigation/discovery policies
- [ ] Apply feature guards to livestream, DMs, marketplace, gifting, mature content, and monetization APIs
- [ ] Add persistent report/block/mute controls to all UGC surfaces
- [ ] Add moderator termination controls for livestreams
- [ ] Wire account deletion request to actual data deletion/retention workflow
- [ ] Publish privacy policy, terms, community guidelines, safety policy, support, and deletion pages
- [ ] Audit SDK/data collection for Google Play Data Safety form
- [ ] Audit digital payments against current Google Play billing requirements
- [ ] Build signed Android AAB and test Android permissions/deep links
- [ ] Create reviewer/demo accounts for each permitted experience
- [ ] Run child, teen, adult, moderator, deletion, reporting, livestream, and payment tests
