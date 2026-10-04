import {requireUser} from '../_lib/security.js'
import {evaluateFraudRisk} from '../_lib/fraud-shield.js'

export default async function handler(req,res){
 if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'})
 const user=await requireUser(req,res);if(!user)return
 const risk=await evaluateFraudRisk(req,user,{
   action:req.body?.action,
   amountMinor:req.body?.amountMinor,
   currency:req.body?.currency,
   recipientId:req.body?.recipientId,
   merchantId:req.body?.merchantId,
   creatorId:req.body?.creatorId,
   scoutId:req.body?.scoutId,
   deviceId:req.body?.deviceId
 })
 return res.status(200).json({ok:true,risk})
}
