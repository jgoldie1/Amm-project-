-- TryAMM row-level security baseline
-- Apply after 20260802_tryamm_kernel.sql.
-- The server service-role bypasses RLS; authenticated users receive least-privilege access.

alter table public.experience_profiles enable row level security;
alter table public.teleport_sessions enable row level security;
alter table public.payment_intents enable row level security;
alter table public.webhook_events enable row level security;
alter table public.payouts enable row level security;
alter table public.ledger_entries enable row level security;
alter table public.audit_events enable row level security;

-- Users can read and update only their own experience profile.
create policy "experience profile owner select"
on public.experience_profiles for select
to authenticated
using (user_id = auth.uid()::text);

create policy "experience profile owner update"
on public.experience_profiles for update
to authenticated
using (user_id = auth.uid()::text)
with check (user_id = auth.uid()::text);

-- Users can inspect only their own teleport sessions and payment intents.
create policy "teleport owner select"
on public.teleport_sessions for select
to authenticated
using (user_id = auth.uid()::text);

create policy "payment intent owner select"
on public.payment_intents for select
to authenticated
using (user_id = auth.uid()::text);

create policy "payout owner select"
on public.payouts for select
to authenticated
using (user_id = auth.uid()::text);

-- Financial ledger, webhook and audit writes remain server-only.
-- No authenticated insert/update/delete policies are intentionally created.
-- Add explicit admin reporting views later rather than exposing raw provider payloads.

comment on policy "experience profile owner select" on public.experience_profiles is
'Users may read only their own age-lane and accessibility profile.';
comment on policy "payment intent owner select" on public.payment_intents is
'Users may inspect only payment intents linked to their own identity.';
