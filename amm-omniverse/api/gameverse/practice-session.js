import {adminRest,json} from '../_lib/supabase-admin.js'
import {requireUser,audit} from '../_lib/security.js'
import {cleanGameVersePracticeState} from '../_lib/gameverse-practice-state.js'
const allowed=new Set(['spades-practice','pool-practice'])
const gameIdFrom=req=>String(req.query?.gameId||req.body?.gameId||'').slice(0,40)
export default async function handler(req,res){
 res.setHeader('Cache-Control','no-store')
 if(req.method!=='GET'&&req.method!=='POST')return json(res,405,{error:'Method not allowed'})
 const user=await requireUser(req,res);if(!user)return
 const gameId=gameIdFrom(req)
 if(!allowed.has(gameId))return json(res,400,{error:'Unsupported practice game'})
 if(req.method==='GET'){
  try{
   const rows=await adminRest('tryamm_gameverse_practice_sessions',{query:{user_id:'eq.'+user.id,game_id:'eq.'+gameId,limit:1}})
   const row=rows?.[0]
   return json(res,200,{ok:true,gameId,session:row?{revision:row.revision,state:row.state,updatedAt:row.updated_at}:null,serverVerifiedRanked:false,currencyAwarded:0})
  }catch{return json(res,503,{error:'GameVerse cloud save unavailable; local practice remains playable'})}
 }
 const raw=req.body?.state
 if(JSON.stringify(raw||null).length>16000)return json(res,413,{error:'Snapshot exceeds size limit'})
 const clean=cleanGameVersePracticeState(gameId,raw)
 if(!clean)return json(res,400,{error:'Invalid non-monetary practice snapshot'})
 const expected=req.body?.expectedRevision
 if(!Number.isInteger(expected)||expected<0||expected>100000)return json(res,400,{error:'Valid expectedRevision required'})
 try{
  const existing=await adminRest('tryamm_gameverse_practice_sessions',{query:{user_id:'eq.'+user.id,game_id:'eq.'+gameId,limit:1}})
  const prior=existing?.[0],actual=prior?.revision||0
  if(expected!==actual)return json(res,409,{error:'Cloud revision changed; reload before saving',revision:actual})
  const row={user_id:user.id,game_id:gameId,revision:actual+1,state:clean,updated_at:new Date().toISOString()}
  const saved=prior?await adminRest('tryamm_gameverse_practice_sessions',{method:'PATCH',query:{user_id:'eq.'+user.id,game_id:'eq.'+gameId,revision:'eq.'+actual},body:row}):
   await adminRest('tryamm_gameverse_practice_sessions',{method:'POST',body:row})
  if(prior&&!saved?.length)return json(res,409,{error:'Concurrent update; reload before saving'})
  await audit(user.id,'gameverse_practice_snapshot_saved','info',{gameId,revision:row.revision})
  return json(res,200,{ok:true,gameId,revision:row.revision,serverVerifiedRanked:false,currencyAwarded:0,transactionCreated:false})
 }catch{return json(res,503,{error:'Cloud save unavailable; no purchases or rewards were created'})}
}
