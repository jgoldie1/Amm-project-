create table if not exists public.passport_accessibility_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  language_tag text not null default 'en-US',
  sign_language_tag text,
  one_hand text check (one_hand is null or one_hand in ('left','right')),
  captions boolean not null default false,
  voice boolean not null default false,
  switch_control boolean not null default false,
  screen_reader boolean not null default false,
  large_targets boolean not null default false,
  reduced_motion boolean not null default false,
  high_contrast boolean not null default false,
  plain_language boolean not null default false,
  updated_at timestamptz not null default now()
);
alter table public.passport_accessibility_preferences enable row level security;
drop policy if exists "passport_access_select_own" on public.passport_accessibility_preferences;
create policy "passport_access_select_own" on public.passport_accessibility_preferences for select to authenticated using (auth.uid()=user_id);
drop policy if exists "passport_access_insert_own" on public.passport_accessibility_preferences;
create policy "passport_access_insert_own" on public.passport_accessibility_preferences for insert to authenticated with check (auth.uid()=user_id);
drop policy if exists "passport_access_update_own" on public.passport_accessibility_preferences;
create policy "passport_access_update_own" on public.passport_accessibility_preferences for update to authenticated using (auth.uid()=user_id) with check (auth.uid()=user_id);
drop policy if exists "passport_access_delete_own" on public.passport_accessibility_preferences;
create policy "passport_access_delete_own" on public.passport_accessibility_preferences for delete to authenticated using (auth.uid()=user_id);
comment on table public.passport_accessibility_preferences is 'User-owned interface/language preferences only; do not store diagnoses or raw biometric/sign capture.';
