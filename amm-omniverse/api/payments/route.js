import {evaluateFraudRisk,fraudDecisionAllowsMoney} from '../_lib/fraud-shield.js'
import {requireUser} from '../_lib/security.js'

const PROVIDERS=[
 {id:'stripe',name:'Stripe',currencies:['USD','EUR','GBP','CAD','AUD'],methods:['card','bank_account','bank_transfer','tap_pay','payout'],env:['STRIPE_SECRET_KEY'],liveFlag:'TRYAMM_STRIPE_LIVE_ENABLED'},
 {id:'flutterwave',name:'Flutterwave',currencies:['NGN','GHS','KES','UGX','TZS','RWF','USD'],methods:['card','bank_transfer','mobile_money','ussd','qr','payout'],env:['FLUTTERWAVE_SECRET_KEY'],liveFlag:'TRYAMM_FLUTTERWAVE_LIVE_ENABLED'},
 {id:'paystack',name:'Paystack',currencies:['NGN','GHS','ZAR','KES','USD'],methods:['card','bank_transfer','bank_account','mobile_money','ussd','qr','payout'],env:['PAYSTACK_SECRET_KEY'],liveFlag:'TRYAMM_PAYSTACK_LIVE_ENABLED'},
 {id:'fincra',name:'Fincra',currencies:['NGN','GHS','KES','ZAR','USD','EUR','GBP'],methods:['bank_transfer','virtual_account','payout'],env:['FINCRA_SECRET_KEY'],liveFlag:'TRYAMM_FINCRA_LIVE_ENABLED'},
 {id:'kora',name:'Kora',currencies:['NGN','GHS','KES','ZAR','USD'],methods:['card','bank_transfer','mobile_money','payout'],env:['KORA_SECRET_KEY'],liveFlag:'TRYAMM_KORA_LIVE_ENABLED'},
 {id:'tingg',name:'Cellulant Tingg',currencies:['NGN','GHS','KES','UGX','TZS','ZMW','USD'],methods:['mobile_money','card','bank_transfer','payout'],env:['TINGG_CLIENT_SECRET'],liveFlag:'TRYAMM_TINGG_LIVE_ENABLED'},
 {id:'mpesa',name:'M-Pesa',currencies:['KES','TZS'],methods:['mobile_money','payout'],env:['MPESA_CONSUMER_SECRET'],liveFlag:'TRYAMM_MPESA_LIVE_ENABLED'},
 {id:'monnify',name:'Monnify',currencies:['NGN'],methods:['bank_transfer','virtual_account','card','ussd','payout'],env:['MONNIFY_SECRET_KEY'],liveFlag:'TRYAMM_MONNIFY_LIVE_ENABLED'},
 {id:'squad',name:'Squad',currencies:['NGN','USD'],methods:['card','bank_transfer','virtual_account','payout'],env:['SQUAD_SECRET_KEY'],liveFlag:'TRYAMM_SQUAD_LIVE_ENABLED'}
]

const priority=['mpesa','paystack','flutterwave','fincra','kora','tingg','monnify','squad','stripe']

const truthy=v=>String(v||'').toLowerCase()==='true'
const configured=p=>p.env.some(key=>Boolean(process.env[key]))
const productionReady=p=>configured(p)&&truthy(process.env[p.liveFlag])&&truthy(process.env.TRYAMM_PAYMENT_WEBHOOKS_VERIFIED)&&truthy(process.env.TRYAMM_PAYMENT_RECONCILIATION_VERIFIED)&&truthy(process.env.TRYAMM_PAYMENT_KYB_KYC_VERIFIED)

const candidates=({currency,method})=>PROVIDERS
 .filter(p=>p.currencies.includes(currency))
 .filter(p=>!method||p.methods.includes(method))
 .sort((a,b)=>priority.indexOf(a.id)-priority.indexOf(b.id))

export default async function handler(req,res){
 if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'})
 const user=await requireUser(req,res);if(!user)return
 const currency=String(req.body?.currency||'').toUpperCase()
 const method=String(req.body?.method||'')
 if(!currency)return res.status(400).json({error:'currency required'})
 const risk=await evaluateFraudRisk(req,user,{
  action:String(req.body?.action||'payment'),
  amountMinor:Number(req.body?.amountMinor||0),
  currency,
  recipientId:req.body?.recipientId,
  merchantId:req.body?.merchantId,
  creatorId:req.body?.creatorId,
  scoutId:req.body?.scoutId,
  deviceId:req.body?.deviceId
 })
 if(!fraudDecisionAllowsMoney(risk.decision)){
  return res.status(risk.decision==='BLOCK'?403:423).json({
    ok:false,
    code:'FRAUD_REVIEW_REQUIRED',
    risk,
    canMoveRealMoney:false,
    mode:'gated'
  })
 }
 const rails=candidates({currency,method})
 const available=rails.map(p=>({
   id:p.id,
   name:p.name,
   configured:configured(p),
   productionReady:productionReady(p),
   methods:p.methods,
   currencies:p.currencies
 }))
 const live=available.find(x=>x.productionReady)
 const configuredRail=available.find(x=>x.configured)
 return res.status(200).json({
   ok:true,
   currency,
   method:method||null,
   selected:live||configuredRail||available[0]||null,
   fallbacks:available.slice(1),
   canMoveRealMoney:Boolean(live),
   mode:live?'production':'gated',
   blockers:live?[]:[
     'Provider production enablement is incomplete.',
     'Verified KYC/KYB, signed webhooks and reconciliation are required before real-money movement.'
   ]
 })
}
