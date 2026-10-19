-- DRAFT FOR REVIEW AND TESTING. Not applied to production.
-- Generate a managed migration with the Supabase CLI before activation.
create table public.tryamm_support_tickets (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 client_request_id uuid not null,
 subject text not null check (char_length(subject) between 3 and 160),
 description text not null check (char_length(description) between 10 and 5000),
 category text not null check (category in ('website-setup','technical','accessibility','billing','other')),
 status text not null default 'open' check (status in ('open','in_review','waiting_customer','resolved')),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 unique(user_id,client_request_id)
);
create index tryamm_support_owner_created on public.tryamm_support_tickets(user_id,created_at desc);
alter table public.tryamm_support_tickets enable row level security;
revoke all on public.tryamm_support_tickets from public,anon,authenticated;
grant select on public.tryamm_support_tickets to authenticated;
grant select,insert,update,delete on public.tryamm_support_tickets to service_role;
create policy support_read_own on public.tryamm_support_tickets for select to authenticated
 using ((select auth.uid())=user_id);
-- Browser clients cannot insert, change ownership or mark tickets resolved.
-- API POST uses verified user identity and a server-only role.
-- Before enabling: run owner/other-user/anonymous RLS tests and database advisors,
-- configure an operator queue and retention policy, and verify create/retry/history.
