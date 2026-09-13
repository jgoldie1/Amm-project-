const INVENTORY_OWNER='TRYAMM'
const PUBLISHER_SHARE_BPS=10000

export default async function handler(req,res){
 res.setHeader('Cache-Control','no-store')
 if(req.method==='GET')return res.status(200).json({ok:true,inventoryOwner:INVENTORY_OWNER,revenueOwner:INVENTORY_OWNER,publisherShareBps:PUBLISHER_SHARE_BPS,thirdPartyRevenueShareBps:0,surfaces:['billboard','digital-billboard','holographic-billboard','storefront','vehicle','arena','holo-drama','ar-placement','sponsored-mission'],activation:'server-authoritative-after-payment-and-policy-approval'})
 if(req.method!=='POST')return res.status(405).json({ok:false,error:'method_not_allowed'})
 const body=req.body||{}
 if(!body.inventoryId||!body.campaignId)return res.status(400).json({ok:false,error:'inventoryId_and_campaignId_required'})
 // Reservation only. Activation must be performed by the verified payment/webhook and ad-policy pipeline.
 return res.status(202).json({ok:true,status:'RESERVED',inventoryId:String(body.inventoryId).slice(0,128),campaignId:String(body.campaignId).slice(0,128),inventoryOwner:INVENTORY_OWNER,revenueOwner:INVENTORY_OWNER,publisherShareBps:PUBLISHER_SHARE_BPS,thirdPartyRevenueShareBps:0,active:false,next:'verified-payment-and-policy-approval'})
}
