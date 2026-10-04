import {requireUser} from '../_lib/security.js'
const truthy=v=>String(v||'').toLowerCase()==='true'
export default async function handler(req,res){
 if(req.method!=='GET')return res.status(405).json({error:'Method not allowed'})
 const user=await requireUser(req,res);if(!user)return
 const configured=Boolean(process.env.EBAY_CLIENT_ID&&process.env.EBAY_CLIENT_SECRET&&process.env.EBAY_REFRESH_TOKEN)
 const live=configured&&truthy(process.env.TRYAMM_EBAY_LIVE_ENABLED)
 return res.status(200).json({
  ok:true,
  configured,
  live,
  capabilities:['catalog-sync','inventory-sync','order-import','auction-listing-adapter'],
  auctionExecutionEnabled:false,
  blockers:live?['Auction execution remains disabled until a separate tested seller-action adapter is approved']:['eBay OAuth seller credentials and explicit live enablement required']
 })
}
