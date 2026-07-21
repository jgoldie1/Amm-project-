# Production-only gaps

These cannot be honestly completed in this repository without the real TryAMM production source and credentials:

1. Supabase table/RLS migration against the actual production project.
2. LiveKit room-token integration against current room code.
3. Stripe and Google Play Billing wiring against current purchase flows.
4. Existing Next.js/React screens/navigation/feed integration.
5. Android package/AAB signing and Play Console upload.
6. Real reviewer/demo accounts and final policy URLs.

Everything else in this folder is structured to minimize Victor's integration work once the real repo is accessible.
