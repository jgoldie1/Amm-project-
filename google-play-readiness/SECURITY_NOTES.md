# Security Integration Notes

- Never expose Supabase service-role keys, LiveKit secrets, Stripe secret keys, webhook secrets, or AI provider secrets in frontend/mobile bundles.
- Authorize every protected feature on the server using authenticated user identity plus persisted age/role state.
- Add rate limits to onboarding, reports, moderation, messaging, livestream token creation, uploads, authentication, and payment endpoints.
- Validate and sanitize all user-generated inputs and uploads.
- Use least-privilege database policies/RLS and explicit service-role boundaries.
- Log admin/moderator actions in an append-only audit trail where practical.
- Verify webhook signatures for payment/provider events.
- Do not trust client-provided age band, role, payment status, moderator status, or room access claims.
