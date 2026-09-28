alter table public.passport_accessibility_preferences
  add column if not exists one_handed_mode boolean not null default false;