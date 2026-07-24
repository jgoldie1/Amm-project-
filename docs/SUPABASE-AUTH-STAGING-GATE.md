# Supabase/Auth Staging Gate

## Added on `agent/tryamm-production-integration`
- `lib/supabase-server.js`
- `middleware/require-auth.js`
- `supabase/migrations/202607240500_auth_creator_ledger_core.sql`

## Required environment variables
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Never expose the service-role key to browser code.

## Apply migration in staging
Apply all repository migrations in order to the staging Supabase/Postgres project.

## Verification checklist
1. Create a staging user through Supabase Auth.
2. Confirm trigger creates:
   - `profiles` row
   - `creator_progress` row
   - `value_balances` row
3. Sign in and obtain a real access token.
4. Call an authenticated backend endpoint with `Authorization: Bearer <token>`.
5. Confirm invalid/missing token returns 401.
6. Confirm authenticated user can read only their own profile/progress/balance/ledger through RLS.
7. Confirm a different authenticated user cannot read another user's rows.
8. Confirm browser code cannot use the service-role key.
9. Confirm backups/restore policy is configured.
10. Record evidence in the production integration status registry before changing `auth` or `database` to `VERIFIED`.

## Gate rule
Do not mark `auth` or `database` VERIFIED based solely on the existence of these files. Verification requires the real staging Supabase project and successful tests above.
