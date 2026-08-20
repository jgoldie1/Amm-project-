# StreetVerse Life / World Memory Proof

Release rule: RECOVER → ADAPT → WIRE → MIGRATE → TEST → REPAIR → BENCHMARK → DEPLOY.

## End-to-end proof path

CREATE/CLAIM CHARACTER → SAVE BIOGRAPHY → LEAVE → WORLD CONTINUES → RETURN → SERVER GENERATES ELIGIBLE WORLD CHANGES → ARCHIVE MISSION → ORIGINAL CREATION → PROVENANCE → REJOIN → WORLD MEMORY RESTORES.

## Implemented

- Mounted `StreetVerseBiographyProofHub`
- Authenticated `/api/streetverse/life/*` API
- Server-side world-return change generation
- Supabase biography snapshots
- Supabase world changes
- Supabase archive mission progress
- Supabase original creator/provenance works
- Owner-scoped RLS and anon revocation
- Same-origin Vercel API fallback when `VITE_API_URL` is blank
- Static smoke contracts
- Production readiness contracts
- Playwright proof-shell/auth-boundary regression
- Reality Lab anon RPC execution revoked

## Must remain external proof gates

- Real authenticated browser saves biography successfully
- Second authenticated browser/device restores the same character state
- Real elapsed-time return produces expected World Memory changes
- Archive mission progress persists across sessions
- Original creator work/provenance persists across sessions
- Vercel preview/deployed `/api/streetverse/life/smoke` returns GREEN
- Physical mobile/controller/XR checks remain separate from CI simulation

Do not mark the full StreetVerse life slice production-proven until all required external gates are evidenced.
