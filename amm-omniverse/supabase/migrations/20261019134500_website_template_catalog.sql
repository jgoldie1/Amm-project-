create table if not exists public.tryamm_website_templates (
 id text primary key check (id ~ '^custom-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'),
 owner_user_id uuid not null references auth.users(id),
 data jsonb not null check (jsonb_typeof(data)='object' and octet_length(data::text)<=16000 and data->>'id'=id),
 status text not null default 'draft' check (status in ('draft','published','archived')),
 revision integer not null default 1 check (revision>0),
 rights_confirmed boolean not null default false,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 updated_by uuid not null references auth.users(id),
 constraint published_template_requires_rights check (status<>'published' or rights_confirmed)
);
create index if not exists tryamm_website_templates_status_created on public.tryamm_website_templates(status,created_at);
alter table public.tryamm_website_templates enable row level security;
revoke all on public.tryamm_website_templates from public,anon,authenticated;
grant select,insert,update on public.tryamm_website_templates to service_role;
comment on table public.tryamm_website_templates is 'Server-authorized template listings. Public API exposes validated published fields only; owner identities and drafts are private. Publishing does not enable payment.';
