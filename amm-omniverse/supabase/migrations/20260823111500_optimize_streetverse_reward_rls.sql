-- Mirrors the production migration applied to project fxluchtdfpediivhoksl.
-- Keeps auth checks stable at scale by evaluating auth.uid() once per statement.

drop policy if exists player_state_self_insert on public.player_state;
create policy player_state_self_insert on public.player_state
for insert to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists player_state_self_read on public.player_state;
create policy player_state_self_read on public.player_state
for select to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists player_state_self_update on public.player_state;
create policy player_state_self_update on public.player_state
for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists game_reward_intents_self_read on public.game_reward_intents;
create policy game_reward_intents_self_read on public.game_reward_intents
for select to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists game_reward_claims_read_own on public.game_reward_claims;
create policy game_reward_claims_read_own on public.game_reward_claims
for select to authenticated
using ((select auth.uid()) = user_id);
