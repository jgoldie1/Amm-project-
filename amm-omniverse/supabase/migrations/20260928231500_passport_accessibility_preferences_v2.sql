alter table public.passport_accessibility_preferences
  add column if not exists keyboard_only boolean not null default false,
  add column if not exists large_text boolean not null default false,
  add column if not exists transcripts boolean not null default false,
  add column if not exists audio_description boolean not null default false,
  add column if not exists speech_to_text boolean not null default false,
  add column if not exists text_to_speech boolean not null default false,
  add column if not exists simplified_ui boolean not null default false,
  add column if not exists extra_processing_time boolean not null default false,
  add column if not exists communication_preference text not null default 'none'
    check (communication_preference in ('text','voice','video','email','none')),
  add column if not exists opportunity_needs text[] not null default '{}'::text[];

comment on column public.passport_accessibility_preferences.opportunity_needs is
  'User-selected functional matching preferences only; never infer diagnoses or disability identity.';
