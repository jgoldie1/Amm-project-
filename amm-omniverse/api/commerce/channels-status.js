import {requireUser} from '../_lib/security.js'

const truthy=v=>String(v||'').toLowerCase()==='true'
export default async function handler(req,res){
 if(req.method!=='GET')return res.status(405).json({error:'Method not allowed'})
 const user=await requireUser(req,res);if(!user)return

 const shopifyConfigured=Boolean(process.env.SHOPIFY_STORE_DOMAIN&&process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN)
 const shopifyLive=shopifyConfigured&&truthy(process.env.TRYAMM_SHOPIFY_LIVE_ENABLED)
 const ebayConfigured=Boolean(process.env.EBAY_CLIENT_ID&&process.env.EBAY_CLIENT_SECRET&&process.env.EBAY_REFRESH_TOKEN)
 const ebayLive=ebayConfigured&&truthy(process.env.TRYAMM_EBAY_LIVE_ENABLED)

 return res.status(200).json({
  ok:true,
  channels:{
   tryamm:{configured:true,live:true},
   streetverse:{configured:true,live:true},
   shopify:{configured:shopifyConfigured,live:shopifyLive,blockers:shopifyLive?[]:['Shopify store domain/token and explicit live enablement required']},
   ebay:{configured:ebayConfigured,live:ebayLive,blockers:ebayLive?[]:['eBay OAuth seller credentials and explicit live enablement required']},
   liveShoppingTwin:{configured:true,live:true,officialQvcHsnConnection:false}
  }
 })
}
