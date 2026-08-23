import {adminRest,json} from './_lib/supabase-admin.js';
import {requireUser} from './_lib/security.js';

export default async function handler(req,res){
  if(req.method!=='GET')return json(res,405,{error:'method_not_allowed'});
  try{
    const user=await requireUser(req,res);if(!user)return;
    let profiles=await adminRest('users',{query:{id:`eq.${user.id}`,select:'*',limit:1}});
    if(!profiles?.length){
      profiles=await adminRest('users',{method:'POST',body:{id:user.id,name:user.user_metadata?.full_name||user.user_metadata?.name||user.email?.split('@')[0]||'TRYAMM Player',email:user.email||null}});
    }
    let states=await adminRest('player_state',{query:{user_id:`eq.${user.id}`,select:'*',limit:1}});
    if(!states?.length){states=await adminRest('player_state',{method:'POST',body:{user_id:user.id,current_world_id:'streetverse',current_verse:'streetverse',xp:0,level:1,tokens:100,inventory:[],checkpoint:{},accessibility_profile:{},revision:0}})}
    const state=states?.[0]||{};
    return json(res,200,{ok:true,passport:{userId:user.id,displayName:profiles?.[0]?.name||user.email||'TRYAMM Player',avatar:state.avatar||'',avatarId:state.avatar_id||null,world:state.current_world_id||'streetverse',verse:state.current_verse||'streetverse',xp:Number(state.xp||0),level:Number(state.level||1),holoCredits:Number(state.tokens||0),inventory:Array.isArray(state.inventory)?state.inventory:[],checkpoint:state.checkpoint||{},accessibilityProfile:state.accessibility_profile||{},revision:Number(state.revision||0),updatedAt:state.updated_at||null}});
  }catch(error){return json(res,error.status||500,{error:error.message||'passport_failed'})}
}
