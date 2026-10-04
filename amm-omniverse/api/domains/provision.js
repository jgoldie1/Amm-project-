import {requireUser,audit} from '../_lib/security.js'

const truthy=v=>String(v||'').toLowerCase()==='true'
const provider=()=>String(process.env.TRYAMM_DOMAIN_REGISTRAR_PROVIDER||'').trim()
const configured=()=>Boolean(provider()&&process.env.TRYAMM_DOMAIN_REGISTRAR_API_KEY)
const live=()=>configured()&&truthy(process.env.TRYAMM_DOMAIN_REGISTRAR_LIVE_ENABLED)

export default async function handler(req,res){
 if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'})
 const user=await requireUser(req,res);if(!user)return
 const domain=String(req.body?.domain||'').trim().toLowerCase()
 const siteId=String(req.body?.siteId||'').trim()
 const registrant=req.body?.registrant||{}
 if(!domain||!siteId)return res.status(400).json({error:'domain and siteId required'})
 const required=['name','email','phone','address1','city','region','postalCode','country']
 const missing=required.filter(k=>!String(registrant?.[k]||'').trim())
 if(missing.length)return res.status(400).json({ok:false,state:'REGISTRANT_INFO_REQUIRED',missing})
 const readiness={provider:provider()||null,configured:configured(),live:live(),paymentVerified:Boolean(req.body?.paymentVerified),hostingTarget:String(req.body?.hostingTarget||process.env.TRYAMM_APP_URL||'https://tryamm.online')}
 await audit(user.id,'domain_provision_attempt','info',{domain,siteId,readiness})
 if(!readiness.live)return res.status(423).json({ok:false,state:'DOMAIN_PROVIDER_GATED',readiness,message:'Domain order prepared. Connect a supported registrar API and enable verified production provisioning before TRYAMM can purchase the domain automatically.'})
 if(!readiness.paymentVerified)return res.status(423).json({ok:false,state:'PAYMENT_VERIFICATION_REQUIRED',readiness,message:'Domain registration cannot proceed until the domain payment is verified server-side.'})
 return res.status(501).json({ok:false,state:'REGISTRAR_ADAPTER_REQUIRED',readiness,message:'Registrar credentials are present, but a provider-specific purchase/DNS adapter must be installed before a real domain order can be sent.'})
}