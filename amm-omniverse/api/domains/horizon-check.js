import {requireUser,audit} from '../_lib/security.js'
import {runHorizonSandboxLookup,validateDomainName} from '../_lib/opensrs-horizon.js'

// This endpoint can ONLY use the OpenSRS Horizon test server.
// No live registrar calls, registrations, payments, transfers or DNS edits.
export default async function handler(req,res){
 res.setHeader('Cache-Control','no-store')
 if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'})
 const user=await requireUser(req,res);if(!user)return
 // Owner-only: no admin configuration means no access; a general user cannot spend test/API quota.
 const admins=String(process.env.TRYAMM_DOMAIN_RESELLER_ADMIN_EMAILS||'').toLowerCase()
  .split(',').map(x=>x.trim()).filter(Boolean)
 if(!admins.length||!admins.includes(String(user.email||'').toLowerCase()))return res.status(403).json({ok:false,state:'RESELLER_ADMIN_REQUIRED'})
 if(String(process.env.TRYAMM_OPENSRS_HORIZON_ENABLED||'')!=='true')
  return res.status(423).json({ok:false,state:'HORIZON_NOT_ENABLED',message:'Owner must enable test mode after OpenSRS account verification.'})
 const username=process.env.TRYAMM_OPENSRS_HORIZON_USERNAME||''
 const apiKey=process.env.TRYAMM_OPENSRS_HORIZON_API_KEY||''
 if(!username||!apiKey)return res.status(423).json({ok:false,state:'HORIZON_CREDENTIALS_REQUIRED',message:'Server-only Horizon test credentials have not been set.'})
 let domain
 try{domain=validateDomainName(req.body?.domain)}
 catch{return res.status(400).json({ok:false,state:'INVALID_DOMAIN'})}
 try{
  const result=await runHorizonSandboxLookup(domain,{username,apiKey})
  await audit(user.id,'opensrs_horizon_test_lookup','info',{domain,resultStatus:result.availability})
  return res.status(200).json({ok:true,...result,
   canCharge:false,canRegister:false,canTransfer:false,canEditDns:false,
   notice:'HORIZON TEST DATA ONLY. No real availability or retail price confirmed. No domain purchased.'})
 }catch(e){
  await audit(user.id,'opensrs_horizon_test_failure','info',{domain,reason:String(e?.message||'horizon_failure').slice(0,70)})
  return res.status(503).json({ok:false,state:'HORIZON_TEST_UNAVAILABLE',message:'Sandbox lookup unavailable. No domain registration or DNS change occurred.'})
 }
}
