# Merge plan

Preferred path when the real TryAMM repo is available:

1. Copy policy engine and auth/feature guards first.
2. Add database migrations and persistence adapter.
3. Guard existing live/chat/DM/gift/marketplace/creator endpoints.
4. Update frontend onboarding and navigation to consume server-issued age band.
5. Run direct-API bypass tests for every restricted feature.
6. Wire reviewer accounts, deletion page, privacy/policy URLs.
7. Build Android AAB and complete internal/closed testing.

Do not merge blindly into production. Resolve route names and data models against the actual TryAMM code.
