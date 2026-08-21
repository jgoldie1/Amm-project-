import { createClient } from '@supabase/supabase-js'
import { createSandboxPayoutProvider,submitVerifiedPayout } from '../../src/economy/PayoutOrchestrator'

const cors=(res:any)=>{res.setHeader('Access-Control-Allow-Origin','*');res.setHeader('Access-Control-Allow-Headers','authorization,content-type');res.setHeader('Access-Control-Allow-Methods','POST,OPTIONS')}
function sbFor(req:any){const url=process.env.SUPABASE_URL||process.env.VITE_SUPABASE_URL;const anon=process.env.SUPABASE_ANON_KEY||process.env.VITE_SUPABASE_ANON_KEY;if(!url||!anon)return null;const token=String(req.headers.authorization||'').replace(/^Bearer\s+/i,'');if(!token)return null;return createClient(url,anon,{global:{headers:{Authorization:`Bearer ${token}`}}})}
async function authed(req:any,res:any){const sb=sbFor(req);if(!sb){res.status(401).json({error:'Authenticated session required'});return null}const {data,error}=await sb.auth.getUser();if(error||!data.user){res.status(401).json({error:'Invalid authentication'});return null}return{sb,user:data.user}}

export default async function handler(req:any,res:any){cors(res);if(req.method==='OPTIONS')return res.status(204).end();if(req.method!=='POST')return res.status(405).json({error:'POST required'})
 const auth=await authed(req,res);if(!auth)return;const {user}=auth;const action=String(req.query?.action||'');const body=req.body||{}
 if(action==='sandbox-submit'){
  if(process.env.TRYAMM_PAYOUT_SANDBOX_ENABLED!=='true')return res.status(403).json({error:'Sandbox payout disabled'})
  const source=body.source==='pastor-kofi-service-share'?'pastor-kofi-service-share':'game-prize'
  const reqObj={id:String(body.id||''),source,recipientRef:String(body.recipientRef||user.id),amountCents:Number(body.amountCents||0),currency:String(body.currency||'USD'),idempotencyKey:String(body.idempotencyKey||''),gateEvidence:body.gateEvidence||{}}
  if(reqObj.recipientRef!==user.id&&process.env.TRYAMM_PAYOUT_ADMIN_USER_ID!==user.id)return res.status(403).json({error:'Cannot submit payout for another user'})
  try{const result=await submitVerifiedPayout(createSandboxPayoutProvider(),reqObj);return res.status(200).json({ok:true,result})}catch(e:any){return res.status(400).json({error:e?.message||'Payout rejected'})}
 }
 if(action==='sandbox-reverse'){
  if(process.env.TRYAMM_PAYOUT_SANDBOX_ENABLED!=='true')return res.status(403).json({error:'Sandbox payout disabled'})
  if(process.env.TRYAMM_PAYOUT_ADMIN_USER_ID!==user.id)return res.status(403).json({error:'Admin required'})
  const provider=createSandboxPayoutProvider();const ref=String(body.providerRef||'');const amount=Number(body.amountCents||0);if(!ref||!Number.isInteger(amount)||amount<=0)return res.status(400).json({error:'Invalid reversal request'})
  const result=await provider.reverse!(ref,amount,String(body.currency||'USD'));return res.status(200).json({ok:true,result})
 }
 return res.status(404).json({error:'Unknown payout action'})
}
