import {requireUser} from '../_lib/security.js'

// Read-only readiness for TRYAMM's proposed domain reseller program.
// Never return registrar secrets, claim availability, or trigger a purchase.
export default async function handler(req,res){
 res.setHeader('Cache-Control','no-store')
 if(req.method!=='GET')return res.status(405).json({ok:false,error:'Method not allowed'})
 const user=await requireUser(req,res);if(!user)return
 const provider=String(process.env.TRYAMM_DOMAIN_REGISTRAR_PROVIDER||'').trim()||null
 const keyConfigured=Boolean(process.env.TRYAMM_DOMAIN_REGISTRAR_API_KEY)
 const providerConfigured=Boolean(provider&&keyConfigured)
 const horizonCredentials=Boolean(process.env.TRYAMM_OPENSRS_HORIZON_USERNAME&&process.env.TRYAMM_OPENSRS_HORIZON_API_KEY)
 const horizonEnabled=process.env.TRYAMM_OPENSRS_HORIZON_ENABLED==='true'
 return res.status(200).json({
  ok:true,
  service:'TRYAMM Domains',
  mode:'PREPARATION_ONLY',
  provider,
  checks:{
   registrarAccount:providerConfigured?'CREDENTIALS_PRESENT_UNVERIFIED':'NOT_CONNECTED',
   opensrsHorizon:horizonCredentials&&horizonEnabled?'TEST_CREDENTIALS_PRESENT_NOT_YET_PROVEN':'NOT_CONNECTED',
   liveQuote:'NOT_VERIFIED',
   resellerAgreement:'NOT_VERIFIED',
   authenticatedCheckout:'NOT_CONNECTED_TO_DOMAIN_ORDER',
   serverVerifiedPayment:'NOT_CONNECTED_TO_DOMAIN_ORDER',
   providerPurchaseAdapter:'NOT_INSTALLED',
   customerDns:'NOT_VERIFIED',
   tlsAndPublicSite:'NOT_VERIFIED'
  },
  canChargeForDomains:false,
  canRegisterDomains:false,
  canChangeDns:false,
  message:'Domain requests are preparatory only. Do not pay for a registration through this page until a registrar reseller account, signed agreement, real-time quote, server-verified checkout, provider order confirmation, DNS and SSL checks have passed.'
 })
}
