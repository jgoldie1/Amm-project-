create table if not exists public.contact_center_scripts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  campaign_key text not null,
  channel text not null default 'voice' check (channel in ('voice','sms','email','chat','social')),
  objective text not null,
  opening text not null,
  discovery jsonb not null default '[]'::jsonb,
  value_points jsonb not null default '[]'::jsonb,
  closing text not null,
  required_disclosures jsonb not null default '[]'::jsonb,
  prohibited_claims jsonb not null default '[]'::jsonb,
  status text not null default 'draft' check (status in ('draft','review','approved','retired')),
  version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.contact_center_rebuttals (
  id uuid primary key default gen_random_uuid(), script_id uuid references public.contact_center_scripts(id) on delete cascade,
  trigger_key text not null, customer_phrase text, approved_response text not null, follow_up_question text,
  escalation_required boolean not null default false,
  risk_level text not null default 'low' check (risk_level in ('low','medium','high','critical')),
  created_at timestamptz not null default now()
);
create table if not exists public.contact_center_agent_sessions (
  id uuid primary key default gen_random_uuid(), agent_user_id uuid not null, campaign_key text,
  status text not null default 'available' check (status in ('available','on_contact','wrap_up','break','training','offline')),
  started_at timestamptz not null default now(), ended_at timestamptz, metrics jsonb not null default '{}'::jsonb
);
create table if not exists public.contact_center_interactions (
  id uuid primary key default gen_random_uuid(), agent_user_id uuid not null,
  session_id uuid references public.contact_center_agent_sessions(id) on delete set null,
  campaign_key text, channel text not null check (channel in ('voice','sms','email','chat','social')),
  contact_ref text not null, consent_basis text, do_not_contact boolean not null default false,
  script_id uuid references public.contact_center_scripts(id) on delete set null,
  disposition text, summary text, sentiment text, objections jsonb not null default '[]'::jsonb,
  disclosures_given jsonb not null default '[]'::jsonb, recording_ref text,
  started_at timestamptz not null default now(), ended_at timestamptz, metadata jsonb not null default '{}'::jsonb
);
create table if not exists public.contact_center_escalations (
  id uuid primary key default gen_random_uuid(), interaction_id uuid not null references public.contact_center_interactions(id) on delete cascade,
  created_by_user_id uuid not null,
  escalation_type text not null check (escalation_type in ('supervisor','compliance','safety','billing','technical','sales_closer','legal','accessibility','other')),
  priority text not null default 'normal' check (priority in ('normal','urgent','critical')),
  reason text not null, status text not null default 'open' check (status in ('open','assigned','resolved','closed')),
  assigned_to_user_id uuid, resolution text, created_at timestamptz not null default now(), resolved_at timestamptz
);
create table if not exists public.contact_center_suppression (
  id uuid primary key default gen_random_uuid(), contact_hash text not null unique,
  reason text not null default 'do-not-contact', source text not null default 'customer-request', created_at timestamptz not null default now()
);
alter table public.contact_center_scripts enable row level security;
alter table public.contact_center_rebuttals enable row level security;
alter table public.contact_center_agent_sessions enable row level security;
alter table public.contact_center_interactions enable row level security;
alter table public.contact_center_escalations enable row level security;
alter table public.contact_center_suppression enable row level security;
revoke all on public.contact_center_scripts from anon, authenticated;
revoke all on public.contact_center_rebuttals from anon, authenticated;
revoke all on public.contact_center_agent_sessions from anon, authenticated;
revoke all on public.contact_center_interactions from anon, authenticated;
revoke all on public.contact_center_escalations from anon, authenticated;
revoke all on public.contact_center_suppression from anon, authenticated;
create index if not exists cc_scripts_campaign_status_idx on public.contact_center_scripts(campaign_key,status);
create index if not exists cc_rebuttals_script_trigger_idx on public.contact_center_rebuttals(script_id,trigger_key);
create index if not exists cc_sessions_agent_started_idx on public.contact_center_agent_sessions(agent_user_id,started_at desc);
create index if not exists cc_interactions_agent_started_idx on public.contact_center_interactions(agent_user_id,started_at desc);
create index if not exists cc_escalations_status_priority_idx on public.contact_center_escalations(status,priority,created_at desc);
