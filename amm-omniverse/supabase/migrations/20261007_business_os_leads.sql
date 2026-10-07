create table if not exists public.business_os_leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null check (char_length(name) between 1 and 120),
  email text not null check (char_length(email) between 3 and 254),
  business_name text not null default '' check (char_length(business_name) <= 160),
  plan_id text not null check (char_length(plan_id) between 1 and 80),
  source text not null default 'business-os' check (char_length(source) between 1 and 80),
  notes text check (notes is null or char_length(notes) <= 1500),
  status text not null default 'new' check (status in ('new','contacted','qualified','won','lost'))
);

alter table public.business_os_leads enable row level security;

revoke all on table public.business_os_leads from anon, authenticated;

create index if not exists business_os_leads_created_at_idx on public.business_os_leads (created_at desc);
create index if not exists business_os_leads_status_idx on public.business_os_leads (status);
create index if not exists business_os_leads_email_idx on public.business_os_leads ((lower(email)));

create or replace function public.submit_business_os_lead(
  p_name text,
  p_email text,
  p_business_name text,
  p_plan text,
  p_notes text default null,
  p_source text default 'business-os'
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
  v_name text := btrim(coalesce(p_name,''));
  v_email text := lower(btrim(coalesce(p_email,'')));
  v_business text := btrim(coalesce(p_business_name,''));
  v_plan text := btrim(coalesce(p_plan,''));
  v_notes text := nullif(btrim(coalesce(p_notes,'')),'');
  v_source text := btrim(coalesce(p_source,'business-os'));
begin
  if char_length(v_name) < 1 or char_length(v_name) > 120 then
    raise exception 'invalid_name';
  end if;
  if char_length(v_email) < 3 or char_length(v_email) > 254
     or v_email !~ '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$' then
    raise exception 'invalid_email';
  end if;
  if char_length(v_business) > 160 then
    raise exception 'invalid_business_name';
  end if;
  if char_length(v_plan) < 1 or char_length(v_plan) > 80 then
    raise exception 'invalid_plan';
  end if;
  if char_length(v_source) < 1 or char_length(v_source) > 80 then
    raise exception 'invalid_source';
  end if;
  if v_notes is not null and char_length(v_notes) > 1500 then
    raise exception 'invalid_notes';
  end if;

  insert into public.business_os_leads(name,email,business_name,plan_id,source,notes)
  values(v_name,v_email,v_business,v_plan,v_source,v_notes)
  returning id into v_id;

  return v_id;
end;
$$;

revoke all on function public.submit_business_os_lead(text,text,text,text,text,text) from public;
grant execute on function public.submit_business_os_lead(text,text,text,text,text,text) to anon, authenticated;

comment on table public.business_os_leads is
  'Private Stubbs AI Business OS sales leads. Public clients cannot read rows; submission occurs only through the validated RPC.';
