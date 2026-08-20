drop policy if exists world_player_state_self_write on public.world_player_state;
drop policy if exists world_player_state_self_update on public.world_player_state;

create or replace function public.game_move_player(
  p_instance_id uuid,
  p_display_name text,
  p_position jsonb,
  p_rotation jsonb default '{"x":0,"y":0,"z":0}'::jsonb,
  p_velocity jsonb default '{"x":0,"y":0,"z":0}'::jsonb,
  p_animation text default 'idle'
) returns public.world_player_state
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_prev public.world_player_state;
  v_now timestamptz := now();
  v_elapsed double precision;
  v_dx double precision; v_dy double precision; v_dz double precision;
  v_distance double precision; v_max_distance double precision; v_speed double precision;
  v_row public.world_player_state;
begin
  if v_user is null then raise exception 'authentication_required'; end if;
  if not exists (select 1 from public.world_members wm where wm.instance_id=p_instance_id and wm.user_id=v_user) then raise exception 'world_membership_required'; end if;
  if p_display_name is null or length(trim(p_display_name))=0 or length(p_display_name)>80 then raise exception 'invalid_display_name'; end if;
  if p_animation is null or length(p_animation)>40 then raise exception 'invalid_animation'; end if;
  perform ((p_position->>'x')::double precision + (p_position->>'y')::double precision + (p_position->>'z')::double precision);
  perform ((p_velocity->>'x')::double precision + (p_velocity->>'y')::double precision + (p_velocity->>'z')::double precision);
  v_speed := sqrt(power((p_velocity->>'x')::double precision,2)+power((p_velocity->>'y')::double precision,2)+power((p_velocity->>'z')::double precision,2));
  if v_speed > 140 then raise exception 'velocity_limit_exceeded'; end if;
  select * into v_prev from public.world_player_state where instance_id=p_instance_id and user_id=v_user for update;
  if found then
    v_elapsed := greatest(extract(epoch from (v_now-v_prev.updated_at)),0.05);
    v_dx := (p_position->>'x')::double precision - (v_prev.position->>'x')::double precision;
    v_dy := (p_position->>'y')::double precision - (v_prev.position->>'y')::double precision;
    v_dz := (p_position->>'z')::double precision - (v_prev.position->>'z')::double precision;
    v_distance := sqrt(v_dx*v_dx+v_dy*v_dy+v_dz*v_dz);
    v_max_distance := greatest(8.0, v_elapsed*160.0);
    if v_distance > v_max_distance then raise exception 'movement_limit_exceeded'; end if;
    update public.world_player_state set display_name=p_display_name,position=p_position,rotation=p_rotation,velocity=p_velocity,animation=p_animation,updated_at=v_now where instance_id=p_instance_id and user_id=v_user returning * into v_row;
  else
    insert into public.world_player_state(instance_id,user_id,display_name,position,rotation,velocity,animation,updated_at) values(p_instance_id,v_user,p_display_name,p_position,p_rotation,p_velocity,p_animation,v_now) returning * into v_row;
  end if;
  return v_row;
exception when invalid_text_representation or numeric_value_out_of_range then
  raise exception 'invalid_vector';
end;
$$;

revoke all on function public.game_move_player(uuid,text,jsonb,jsonb,jsonb,text) from public, anon;
grant execute on function public.game_move_player(uuid,text,jsonb,jsonb,jsonb,text) to authenticated;
