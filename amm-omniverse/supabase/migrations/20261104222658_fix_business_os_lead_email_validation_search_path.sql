-- Matches the deployed Supabase migration 20261104222658.
-- Public customer-intake RPC may insert validated leads only. It must never expose rows.
-- Repair the case-sensitive email regex against a normalized lowercase address.
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
set search_path = ''
as $fn$
declare
 v_id uuid;
 v_name text := btrim(coalesce(p_name,''));
 v_email text := lower(btrim(coalesce(p_email,'')));
 v_business text := btrim(coalesce(p_business_name,''));
 v_plan text := btrim(coalesce(p_plan,''));
 v_notes text := nullif(btrim(coalesce(p_notes,'')),'');
 v_source text := btrim(coalesce(p_source,'business-os'));
begin
 if char_length(v_name) < 1 or char_length(v_name) > 120 then raise exception 'invalid_name'; end if;
 if char_length(v_email) < 3 or char_length(v_email) > 254
     or v_email !~ '^[a-z0-9._%+-]+@[a-z0-9.-]+[.][a-z]{2,}$' then
   raise exception 'invalid_email';
 end if;
 if char_length(v_business)>160 then raise exception 'invalid_business_name'; end if;
 if char_length(v_plan)<1 or char_length(v_plan)>80 then raise exception 'invalid_plan'; end if;
 if char_length(v_source)<1 or char_length(v_source)>80 then raise exception 'invalid_source'; end if;
 if v_notes is not null and char_length(v_notes)>1500 then raise exception 'invalid_notes'; end if;
 insert into public.business_os_leads(name,email,business_name,plan_id,source,notes)
 values(v_name,v_email,v_business,v_plan,v_source,v_notes) returning id into v_id;
 return v_id;
end;
$fn$;

revoke all on function public.submit_business_os_lead(text,text,text,text,text,text) from public;
grant execute on function public.submit_business_os_lead(text,text,text,text,text,text) to anon, authenticated;

-- Important: public traffic still needs abuse controls, CAPTCHA and monitoring.
-- RLS on public.business_os_leads remains enabled; there is no public SELECT policy.
