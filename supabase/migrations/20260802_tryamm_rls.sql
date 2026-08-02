-- TryAMM row-level security baseline.
-- The current app uses its own server-side authentication and the Supabase service role.
-- Therefore all exposed public tables are RLS-protected with no direct anon/authenticated write access.

alter table public.experience_profiles enable row level security;
alter table public.teleport_sessions enable row level security;
alter table public.payment_intents enable row level security;
alter table public.webhook_events enable row level security;
alter table public.ledger_entries enable row level security;
alter table public.payouts enable row level security;
alter table public.audit_events enable row level security;
alter table public.entitlements enable row level security;
alter table public.receipts enable row level security;
alter table public.settlements enable row level security;
alter table public.refunds enable row level security;
alter table public.disputes enable row level security;

-- No public policies are intentionally created yet.
-- The trusted TryAMM server uses the service-role key, which must never be exposed to browsers.
-- When the platform migrates to Supabase Auth, add owner-specific SELECT policies using auth.uid()
-- only after user IDs are mapped to Supabase auth identities.

revoke all on table public.experience_profiles from anon, authenticated;
revoke all on table public.teleport_sessions from anon, authenticated;
revoke all on table public.payment_intents from anon, authenticated;
revoke all on table public.webhook_events from anon, authenticated;
revoke all on table public.ledger_entries from anon, authenticated;
revoke all on table public.payouts from anon, authenticated;
revoke all on table public.audit_events from anon, authenticated;
revoke all on table public.entitlements from anon, authenticated;
revoke all on table public.receipts from anon, authenticated;
revoke all on table public.settlements from anon, authenticated;
revoke all on table public.refunds from anon, authenticated;
revoke all on table public.disputes from anon, authenticated;
