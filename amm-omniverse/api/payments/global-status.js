const PROVIDERS=[
 ['stripe','STRIPE_SECRET_KEY','TRYAMM_STRIPE_LIVE_ENABLED'],
 ['flutterwave','FLUTTERWAVE_SECRET_KEY','TRYAMM_FLUTTERWAVE_LIVE_ENABLED'],
 ['paystack','PAYSTACK_SECRET_KEY','TRYAMM_PAYSTACK_LIVE_ENABLED'],
 ['fincra','FINCRA_SECRET_KEY','TRYAMM_FINCRA_LIVE_ENABLED'],
 ['kora','KORA_SECRET_KEY','TRYAMM_KORA_LIVE_ENABLED'],
 ['tingg','TINGG_CLIENT_SECRET','TRYAMM_TINGG_LIVE_ENABLED'],
 ['mpesa','MPESA_CONSUMER_SECRET','TRYAMM_MPESA_LIVE_ENABLED'],
 ['monnify','MONNIFY_SECRET_KEY','TRYAMM_MONNIFY_LIVE_ENABLED'],
 ['squad','SQUAD_SECRET_KEY','TRYAMM_SQUAD_LIVE_ENABLED']
]
const truthy=v=>String(v||'').toLowerCase()==='true'
export default async function handler(req,res){
 if(req.method!=='GET')return res.status(405).json({error:'Method not allowed'})
 const globalChecks={
  kybKycVerified:truthy(process.env.TRYAMM_PAYMENT_KYB_KYC_VERIFIED),
  webhooksVerified:truthy(process.env.TRYAMM_PAYMENT_WEBHOOKS_VERIFIED),
  reconciliationVerified:truthy(process.env.TRYAMM_PAYMENT_RECONCILIATION_VERIFIED)
 }
 const providers=PROVIDERS.map(([id,key,flag])=>{
  const configured=Boolean(process.env[key])
  const productionReady=configured&&truthy(process.env[flag])&&Object.values(globalChecks).every(Boolean)
  return{id,configured,productionReady}
 })
 return res.status(200).json({
  ok:true,
  scope:'global-africa',
  providers,
  globalChecks,
  anyProductionReady:providers.some(x=>x.productionReady),
  productionBoundary:'Configured does not mean live. Real money requires provider approval, KYC/KYB, signed webhook verification, reconciliation and explicit production enablement.'
 })
}
