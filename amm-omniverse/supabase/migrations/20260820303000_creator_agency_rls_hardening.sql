-- Lock creator/agency attribution and invite accounting to server-authoritative paths.
-- This migration intentionally follows the creator invite + founder priority migrations.

-- Attribution is immutable first-touch state and must only be created by the
-- SECURITY DEFINER redeem_creator_invite() transaction after its auth checks.
revoke insert, update, delete on public.tryamm_creator_attribution from authenticated;
drop policy if exists "attribution self insert" on public.tryamm_creator_attribution;

-- Invite usage, source attribution and agency binding must not be directly
-- editable from the browser. New invites may still be created through the
-- existing insert policy; redemption updates `uses` through the server RPC.
revoke update, delete on public.tryamm_creator_invites from authenticated;
drop policy if exists "invite owner update" on public.tryamm_creator_invites;

-- Membership updates stay owner-managed, but lock the updated row to the same
-- agency ownership boundary with an explicit WITH CHECK.
drop policy if exists "agency owner updates memberships" on public.tryamm_agency_memberships;
create policy "agency owner updates memberships"
on public.tryamm_agency_memberships
for update to authenticated
using (
  exists (
    select 1 from public.tryamm_agencies a
    where a.id = agency_id
      and a.owner_user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1 from public.tryamm_agencies a
    where a.id = agency_id
      and a.owner_user_id = (select auth.uid())
  )
);

-- Explicitly preserve the intended Data API privileges after hardening.
grant select on public.tryamm_creator_attribution to authenticated;
grant select, insert on public.tryamm_creator_invites to authenticated;

comment on table public.tryamm_creator_attribution is
'Immutable first-touch attribution. Browser clients can read their own attribution but cannot manufacture it; creation occurs only inside redeem_creator_invite().';
