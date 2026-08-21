import { createClient } from '@supabase/supabase-js'
import { createSandboxPayoutProvider,submitVerifiedPayout } from '../../src/economy/PayoutOrchestrator'

const cors=(res:any)=>{res.setHeader('Access-Control-Allow-Origin','*');res.setHeader('Access-Control-Allow-Headers','authorization,content-type');res.setHeader('Access-Control-Allow-Methods','POST,OPTIONS')}
function sbFor(req:any){const url=process.env.SUPABASE_URL||process.env.VITE_SUPABASE_URL;const anon=process.env.SUPABASE_ANON_KEY||process.env.VITE_SUPABASE_ANON_KEY;if(!url||!anon)return null;const token=String(req.headers.authorization||'').replace(/^Bearer\s+/i,'');if(!token)return null;return createClient(url,anon,{global:{headers:{Authorization:`Bearer ${token}`}}})}
function adminSb(){const url=process.env.SUPABASE_URL||process.env.VITE_SUPABASE_URL;const key=process.env.SUPABASE_SERVICE_ROLE_KEY;if(!url||!key)return null;return createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}})}
async function authed(req:any,res:any){const sb=sbFor(req);if(!sb){res.status(401).json({error:'Authenticated session required'});return null}const {data,error}=await sb.auth.getUser();if(error||!data.user){res.status(401).json({error:'Invalid authentication'});return null}return{sb,user:data.user}}
async function authoritativePayout(source:'game-prize'|'pastor-kofi-service-share',id:string){const admin=adminSb();if(!admin)throw new Error('Server payout database unavailable');if(!id)throw new Error('Payout ledger id required')
 if(source==='pastor-kofi-service-share'){
  const {data,error}=await admin.from('service_share_payouts').select('id,beneficiary_ref,amount_cents,currency,state,idempotency_key,gate_evidence').eq('id',id).single();if(error||!data)throw new Error('Service-share payout not found');if(data.state!=='approved')throw new Error('Service-share payout is not approved');return{recipientRef:String(data.beneficiary_ref),amountCents:Number(data.amount_cents),currency:String(data.currency),idempotencyKey:String(data.idempotency_key),gateEvidence:data.gate_evidence||{}}
 }
 const {data,error}=await admin.from('game_prize_payouts').select('id,user_id,amount_cents,currency,state,idempotency_key,gate_evidence').eq('id',id).single();if(error||!data)throw new Error('Game-prize payout not found');if(data.state!=='approved')throw new Error('Game-prize payout is not approved');return{recipientRef:String(data.user_id||''),amountCents:Number(data.amount_cents),currency:String(data.currency),idempotencyKey:String(data.idempotency_key),gateEvidence:data.gate_evidence||{}}
}
async function persistSandboxResult(source:'game-prize'|'pastor-kofi-service-share',id:string,result:any){const admin=adminSb();if(!admin)throw new Error('Server payout database unavailable');const table=source==='pastor-kofi-service-share'?'service_share_payouts':'game_prize_payouts';const {error}=await admin.from(table).update({state:result.state,provider_ref:result.providerRef,updated_at:new Date().toISOString()}).eq('id',id);if(error)throw new Error(error.message)}

export default async function handler(req:any,res:any){cors(res);if(req.method==='OPTIONS')return res.status(204).end();if(req.method!=='POST')return res.status(405).json({error:'POST required'})
 const auth=await authed(req,res);if(!auth)return;const {user}=auth;const action=String(req.query?.action||'');const body=req.body||{}
 if(action==='sandbox-submit'){
  if(process.env.TRYAMM_PAYOUT_SANDBOX_ENABLED!=='true')return res.status(403).json({error:'Sandbox payout disabled'})
  const source=body.source==='pastor-kofi-service-share'?'pastor-kofi-service-share':'game-prize';const id=String(body.id||'')
  try{const ledger=await authoritativePayout(source,id);if(ledger.recipientRef!==user.id&&process.env.TRYAMM_PAYOUT_ADMIN_USER_ID!==user.id)return res.status(403).json({error:'Admin required for another recipient'});const reqObj={id,source,...ledger};const result=await submitVerifiedPayout(createSandboxPayoutProvider(),reqObj);await persistSandboxResult(source,id,result);return res.status(200).json({ok:true,result,sourceLedgerVerified:true})}catch(e:any){return res.status(400).json({error:e?.message||'Payout rejected'})}
 }
 if(action==='sandbox-reverse'){
  if(process.env.TRYAMM_PAYOUT_SANDBOX_ENABLED!=='true')return res.status(403).json({error:'Sandbox payout disabled'})
  if(process.env.TRYAMM_PAYOUT_ADMIN_USER_ID!==user.id)return res.status(403).json({error:'Admin required'})
  const provider=createSandboxPayoutProvider();const ref=String(body.providerRef||'');const amount=Number(body.amountCents||0);if(!ref||!Number.isInteger(amount)||amount<=0)return res.status(400).json({error:'Invalid reversal request'})
  const result=await provider.reverse!(ref,amount,String(body.currency||'USD'));return res.status(200).json({ok:true,result})
 }
 return res.status(404).json({error:'Unknown payout action'})
}
