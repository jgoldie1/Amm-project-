drop policy if exists "family owner or member reads group" on public.tryamm_family_groups;

create policy "family owner reads group"
on public.tryamm_family_groups for select
to authenticated
using (owner_user_id = (select auth.uid()));
