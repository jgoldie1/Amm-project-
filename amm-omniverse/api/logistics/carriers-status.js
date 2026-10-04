import {requireUser} from '../_lib/security.js'

const truthy=v=>String(v||'').toLowerCase()==='true'
const defs=[
 ['fedex',['FEDEX_CLIENT_ID','FEDEX_CLIENT_SECRET'],'TRYAMM_FEDEX_LIVE_ENABLED'],
 ['ups',['UPS_CLIENT_ID','UPS_CLIENT_SECRET'],'TRYAMM_UPS_LIVE_ENABLED'],
 ['usps',['USPS_CLIENT_ID','USPS_CLIENT_SECRET'],'TRYAMM_USPS_LIVE_ENABLED'],
 ['dhl',['DHL_API_KEY'],'TRYAMM_DHL_LIVE_ENABLED']
]
export default async function handler(req,res){
 if(req.method!=='GET')return res.status(405).json({error:'Method not allowed'})
 const user=await requireUser(req,res);if(!user)return
 const carriers=defs.map(([id,keys,flag])=>{
  const configured=keys.every(key=>Boolean(process.env[key]))
  return{id,configured,live:configured&&truthy(process.env[flag])}
 })
 return res.status(200).json({
  ok:true,
  carriers,
  native:[
   {id:'supplier-direct',configured:true,live:true},
   {id:'holo-local',configured:true,live:true},
   {id:'third-party-3pl',configured:true,live:false}
  ],
  productionBoundary:'External carrier integration is live only after credentials, account approval, quote/label/tracking tests and explicit enablement. Native TRYAMM tracking never impersonates a carrier scan.'
 })
}
