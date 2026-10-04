import {requireUser} from '../_lib/security.js'
const truthy=v=>String(v||'').toLowerCase()==='true'
const sources=[
 ['fedex',['FEDEX_CLIENT_ID','FEDEX_CLIENT_SECRET'],'TRYAMM_FEDEX_LIVE_ENABLED'],
 ['ups',['UPS_CLIENT_ID','UPS_CLIENT_SECRET'],'TRYAMM_UPS_LIVE_ENABLED'],
 ['usps',['USPS_CLIENT_ID','USPS_CLIENT_SECRET'],'TRYAMM_USPS_LIVE_ENABLED'],
 ['dhl',['DHL_API_KEY'],'TRYAMM_DHL_LIVE_ENABLED'],
 ['freight-3pl',['TRYAMM_3PL_API_KEY'],'TRYAMM_3PL_LIVE_ENABLED'],
 ['freight-broker',['TRYAMM_FREIGHT_BROKER_API_KEY'],'TRYAMM_FREIGHT_BROKER_LIVE_ENABLED']
]
export default async function handler(req,res){
 if(req.method!=='GET')return res.status(405).json({error:'Method not allowed'})
 const user=await requireUser(req,res);if(!user)return
 const integrations=sources.map(([id,keys,flag])=>{const configured=keys.every(k=>Boolean(process.env[k]));return{id,configured,live:configured&&truthy(process.env[flag])}})
 return res.status(200).json({
  ok:true,
  operatingFabric:{stubbsAI:true,lyonsTech:true,middleverseAI:true},
  integrations,
  canExternallyBookFreight:integrations.some(x=>['freight-3pl','freight-broker'].includes(x.id)&&x.live),
  productionBoundary:'Planning and simulation can run internally. Real freight booking requires approved carrier/broker/3PL credentials, an authoritative rate/quote, policy approval and provider confirmation.'
 })
}
