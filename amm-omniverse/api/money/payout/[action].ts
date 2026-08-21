import { createClient } from '@supabase/supabase-js'
import { createSandboxPayoutProvider,submitVerifiedPayout } from '../../../src/economy/PayoutOrchestrator'

const cors=(res:any)=>{res.setHeader('Access-Control-Allow-Origin','*');res.setHeader('Access-Control-Allow-Headers','authorization,content-type');res.setHeader('Access-Control-Allow-Methods','POST,GET,OPTIONS')}
const clean=(v:unknown,max=256)=>String(v??'').trim().slice(0,max)
function clients(req:any){
 const url=process.env.SUPABASE_URL||process.env.VITE_SUPABASE_URL, anon=process.env.SUPABASE_ANON_KEY||process.env.VITE_SUPABASE_ANON_KEY, service=process.env.SUPABASE_SERVICE_ROLE_KEY
 if(!url||!anon||!service)return null
 const token=String(req.headers.authorization||'').replace(/^Bearer\s+/i,'')
 const user=createClient(url,anon,{global:{headers:{Authorization:`Bearer ${token}`}}})
 const admin=createClient(url,service,{auth:{persistSession:false,autoRefreshToken:false}})
 return {user,admin}
}
async function requireTrusted(req:any,res:any){const c=clients(req);if(!c){res.status(503).json({error:'Payout provider/database server configuration missing'});return null}const {data,error}=await c.user.auth.getUser();if(error||!data.user){res.status(401).json({error:'Authenticated session required'});return null}const trusted=(process.env.TRYAMM_PAYOUT_REVIEWER_USER_IDS||'').split(',').map(x=>x.trim()).filter(Boolean);if(!trusted.includes(data.user.id)){res.status(403).json({error:'Trusted payout reviewer required'});return null}return {...c,actor:data.user}}
async function loadApproved(admin:any,kind:'game-prize'|'service-share',id:string){
 const table=kind==='game-prize'?'game_prize_payouts':'service_share_payouts'
 const fields=kind==='game-prize'?'id,user_id,amount_cents,currency,state,idempotency_key,gate_evidence':'id,recipient_user_id,amount_cents,currency,state,idempotency_key,gate_evidence'
 const {data,error}=await admin.from(table).select(fields).eq('id',id).single()
 if(error||!data)throw new Error('Approved payout ledger row not found')
 if(data.state!=='approved')throw new Error('Payout must be approved before provider submission')
 const recipientRef=String(kind==='game-prize'?data.user_id:data.recipient_user_id||'')
 if(!recipientRef)throw new Error('Approved payout recipient is missing')
 return{table,row:data,recipientRef}
}

export default async function handler(req:any,res:any){cors(res);if(req.method==='OPTIONS')return res.status(204).end();const action=clean(req.query?.action,48)
 if(action==='health'&&req.method==='GET')return res.status(200).json({ok:true,providerConfigured:Boolean(process.env.TRYAMM_PAYOUT_PROVIDER||process.env.TRYAMM_PAYOUT_SANDBOX_ENABLED==='true'),reviewersConfigured:Boolean(process.env.TRYAMM_PAYOUT_REVIEWER_USER_IDS),serviceRoleConfigured:Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY)})
 const ctx=await requireTrusted(req,res);if(!ctx)return;const {admin,actor}=ctx
 if(action==='approve-game-prize'&&req.method==='POST'){const id=clean(req.body?.payoutId,128);if(!id)return res.status(400).json({error:'payoutId required'});const {data,error}=await admin.from('game_prize_payouts').update({state:'approved',updated_at:new Date().toISOString(),gate_evidence:{...(req.body?.gateEvidence||{}),approvedBy:actor.id,approvedAt:new Date().toISOString()}}).eq('id',id).eq('state','pending').select().maybeSingle();if(error)return res.status(500).json({error:error.message});if(!data)return res.status(409).json({error:'Payout not pending or not found'});return res.status(200).json({ok:true,payout:data})}
 if(action==='approve-service-share'&&req.method==='POST'){const id=clean(req.body?.payoutId,128);if(!id)return res.status(400).json({error:'payoutId required'});const {data,error}=await admin.from('service_share_payouts').update({state:'approved',updated_at:new Date().toISOString(),gate_evidence:{...(req.body?.gateEvidence||{}),approvedBy:actor.id,approvedAt:new Date().toISOString()}}).eq('id',id).eq('state','pending').select().maybeSingle();if(error)return res.status(500).json({error:error.message});if(!data)return res.status(409).json({error:'Service-share payout not pending or not found'});return res.status(200).json({ok:true,payout:data})}
 if(action==='sandbox-submit'&&req.method==='POST'){
  if(process.env.TRYAMM_PAYOUT_SANDBOX_ENABLED!=='true')return res.status(403).json({error:'Sandbox payout disabled'});const kind=clean(req.body?.kind,24) as 'game-prize'|'service-share',id=clean(req.body?.id,128);if(!['game-prize','service-share'].includes(kind)||!id)return res.status(400).json({error:'kind and approved payout id required'})
  try{const {table,row,recipientRef}=await loadApproved(admin,kind,id);const source=kind==='game-prize'?'game-prize':'pastor-kofi-service-share';const result=await submitVerifiedPayout(createSandboxPayoutProvider(),{id,source,recipientRef,amountCents:Number(row.amount_cents),currency:String(row.currency||'USD'),idempotencyKey:String(row.idempotency_key),gateEvidence:row.gate_evidence||{}});const {data,error}=await admin.from(table).update({state:result.state,provider_ref:result.providerRef,updated_at:new Date().toISOString()}).eq('id',id).eq('state','approved').select().single();if(error)throw new Error(error.message);return res.status(200).json({ok:true,record:data,result,sourceLedgerVerified:true})}catch(e:any){return res.status(400).json({error:e?.message||'Payout rejected'})}
 }
 if(action==='mark-submitted'&&req.method==='POST'){const kind=clean(req.body?.kind,24),id=clean(req.body?.id,128),providerRef=clean(req.body?.providerRef,256);if(!['game-prize','service-share'].includes(kind)||!id||!providerRef)return res.status(400).json({error:'kind,id,providerRef required'});const table=kind==='game-prize'?'game_prize_payouts':'service_share_payouts';const {data,error}=await admin.from(table).update({state:'submitted',provider_ref:providerRef,updated_at:new Date().toISOString()}).eq('id',id).eq('state','approved').select().maybeSingle();if(error)return res.status(500).json({error:error.message});if(!data)return res.status(409).json({error:'Record not approved or not found'});return res.status(200).json({ok:true,record:data})}
 if(action==='settle'&&req.method==='POST'){const kind=clean(req.body?.kind,24),id=clean(req.body?.id,128),finalState=clean(req.body?.state,16);if(!['game-prize','service-share'].includes(kind)||!['paid','failed','reversed'].includes(finalState)||!id)return res.status(400).json({error:'kind,id,state required'});const table=kind==='game-prize'?'game_prize_payouts':'service_share_payouts';const {data,error}=await admin.from(table).update({state:finalState,updated_at:new Date().toISOString()}).eq('id',id).in('state',['submitted','paid']).select().maybeSingle();if(error)return res.status(500).json({error:error.message});if(!data)return res.status(409).json({error:'Record not in settlement state'});return res.status(200).json({ok:true,record:data})}
 return res.status(404).json({error:'Unknown payout action'})
}
