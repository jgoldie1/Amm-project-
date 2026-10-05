import {requireUser,audit} from '../_lib/security.js'
const truthy=v=>String(v||'').toLowerCase()==='true'
export default async function handler(req,res){
 if(req.method!=='GET')return res.status(405).json({error:'Method not allowed'})
 const user=await requireUser(req,res);if(!user)return
 const readiness={
  stripeConfigured:Boolean(process.env.STRIPE_SECRET_KEY),
  webhookConfigured:Boolean(process.env.STRIPE_WEBHOOK_SECRET),
  liveChargingEnabled:truthy(process.env.TRYAMM_LIVE_CHARGING_ENABLED),
  sellerTransfersVerified:truthy(process.env.TRYAMM_SELLER_TRANSFERS_VERIFIED),
  reconciliationVerified:truthy(process.env.TRYAMM_RECONCILIATION_VERIFIED),
  studioPayoutDestinationConfigured:Boolean(process.env.ANIYAH_STUDIO_PAYOUT_DESTINATION_ID),
  studioPayoutEligibilityApproved:truthy(process.env.ANIYAH_STUDIO_PAYOUT_ELIGIBILITY_APPROVED),
 }
 const readyForCharges=readiness.stripeConfigured&&readiness.webhookConfigured&&readiness.liveChargingEnabled&&readiness.sellerTransfersVerified&&readiness.reconciliationVerified
 const readyForPayout=readyForCharges&&readiness.studioPayoutDestinationConfigured&&readiness.studioPayoutEligibilityApproved
 await audit(user.id,'aniyah_studio_readiness_view','info',{readyForCharges,readyForPayout})
 return res.status(200).json({ok:true,businessId:'aniyah-64-track-studio',readyForCharges,readyForPayout,readiness,message:readyForPayout?'Studio charging and payout prerequisites are marked ready.':'Studio is commercialized in code, but one or more live charging/payout prerequisites remain gated.'})
}