import {requireUser} from '../_lib/security.js'
import {evaluatePayoutProtection} from '../_lib/payout-protection.js'

export default async function handler(req,res){
 if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'})
 const user=await requireUser(req,res);if(!user)return
 const protection=await evaluatePayoutProtection(req,user,{
  amountMinor:req.body?.amountMinor,
  currency:req.body?.currency,
  role:req.body?.role,
  deviceId:req.body?.deviceId
 })
 return res.status(200).json({ok:true,protection})
}
