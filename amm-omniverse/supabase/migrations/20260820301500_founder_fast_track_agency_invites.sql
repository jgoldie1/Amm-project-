create table if not exists public.tryamm_founder_fast_track_invites (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references auth.users(id) on delete cascade,
  code text not null unique,
  intended_email text,
  note text,
  max_uses integer not null default 1 check (max_uses > 0 and max_uses <= 25),
  uses integer not null default 0 check (uses >= 0),
  active boolean not null default true,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  last_redeemed_at timestamptz
);

alter table public.tryamm_founder_fast_track_invites enable row level security;
revoke all on public.tryamm_founder_fast_track_invites from anon, authenticated;

create or replace function public.tryamm_is_founder_admin()
returns boolean
language sql
stable
security definer
set search_path=public
as $$
  select coalesce((auth.jwt()->'app_metadata'->>'role') in ('founder','admin'), false)
$$;

revoke all on function public.tryamm_is_founder_admin() from public;
grant execute on function public.tryamm_is_founder_admin() to authenticated;

create policy "founder reads fast track invites" on public.tryamm_founder_fast_track_invites
for select to authenticated using (public.tryamm_is_founder_admin());

create or replace function public.create_founder_fast_track_invite(
  p_code text,
  p_intended_email text default null,
  p_note text default null,
  p_max_uses integer default 1,
  p_expires_at timestamptz default null
) returns public.tryamm_founder_fast_track_invites
language plpgsql
security definer
set search_path=public
as $$
declare
  v_user uuid := auth.uid();
  v_row public.tryamm_founder_fast_track_invites;
  v_code text := upper(regexp_replace(coalesce(p_code,''), '[^A-Za-z0-9_-]', '', 'g'));
begin
  if v_user is null or not public.tryamm_is_founder_admin() then raise exception 'Founder/admin permission required'; end if;
  if length(v_code) < 6 then raise exception 'Code must be at least 6 characters'; end if;
  if p_max_uses < 1 or p_max_uses > 25 then raise exception 'max uses must be 1..25'; end if;
  insert into public.tryamm_founder_fast_track_invites(created_by,code,intended_email,note,max_uses,expires_at)
  values(v_user,v_code,lower(nullif(trim(p_intended_email),'')),left(nullif(trim(p_note),''),500),p_max_uses,p_expires_at)
  returning * into v_row;
  return v_row;
end $$;

revoke all on function public.create_founder_fast_track_invite(text,text,text,integer,timestamptz) from public;
grant execute on function public.create_founder_fast_track_invite(text,text,text,integer,timestamptz) to authenticated;

create or replace function public.redeem_founder_fast_track_invite(p_code text)
returns jsonb
language plpgsql
security definer
set search_path=public
as $$
declare
  v_user uuid := auth.uid();
  v_email text := lower(coalesce(auth.jwt()->>'email',''));
  v_row public.tryamm_founder_fast_track_invites;
begin
  if v_user is null then raise exception 'Sign in required'; end if;
  select * into v_row from public.tryamm_founder_fast_track_invites
  where code=upper(regexp_replace(coalesce(p_code,''), '[^A-Za-z0-9_-]', '', 'g'))
  for update;
  if not found or not v_row.active then raise exception 'Fast-track code not found or inactive'; end if;
  if v_row.expires_at is not null and v_row.expires_at < now() then raise exception 'Fast-track code expired'; end if;
  if v_row.uses >= v_row.max_uses then raise exception 'Fast-track code usage limit reached'; end if;
  if v_row.intended_email is not null and v_row.intended_email <> v_email then raise exception 'This fast-track invite is assigned to another account'; end if;
  update public.tryamm_founder_fast_track_invites set uses=uses+1,last_redeemed_at=now() where id=v_row.id;
  return jsonb_build_object(
    'status','fast-track-approved',
    'can_start_agency',true,
    'skip_waitlist',true,
    'still_required',jsonb_build_array('identity/business verification when applicable','age/guardian rules','agency terms','payout/tax checks','Jacobie Vision security','carrier/compliance gates where relevant'),
    'truth','Founder approval accelerates onboarding but does not bypass legal, financial, safety, provider, or security requirements.'
  );
end $$;

revoke all on function public.redeem_founder_fast_track_invite(text) from public;
grant execute on function public.redeem_founder_fast_track_invite(text) to authenticated;
