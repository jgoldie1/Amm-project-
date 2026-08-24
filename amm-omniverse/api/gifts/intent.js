import {json} from '../_lib/supabase-admin.js'
import {requireUser} from '../_lib/security.js'

const GIFT_TYPES=new Set([
  'spark','rose','heart','fire','confetti','mic-drop','vinyl','boombox','gold-record',
  'america250','eagle','liberty-bell','stars-stripes','crown','diamond','private-jet','supercar','yacht',
  'lion','twelve-tribes','shofar','set-apart-scroll','jerusalem-gate','menorah-light','ark','judah','galaxy','supernova',
  'pk-ko','pk-comeback','pk-crown','portal','streetverse-car','mars-drop','starverse-stage','omnibox-premiere','world-takeover'
])
const SPATIAL_MODES=new Set(['screen','ar','vr'])
const SAFE_CUES=new Set([
  'spark','rose','heart','fire','confetti','mic','vinyl','boombox','goldrecord','america250','eagle','bell','stars',
  'crown','diamond','jet','car','yacht','lion','tribes','shofar','scroll','jerusalem','menorah','ark','royal','galaxy','supernova',
  'pkko','pkcomeback','pkcrown','portal','streetcar','mars','stage','premiere','world'
])

export default async function handler(req,res){
  if(req.method!=='POST')return json(res,405,{error:'method_not_allowed'})
  const user=await requireUser(req,res);if(!user)return
  const giftType=String(req.body?.giftType||'spark').toLowerCase()
  const recipientId=String(req.body?.recipientId||'').trim()
  const amountMinor=Math.max(0,Math.floor(Number(req.body?.amountMinor||0)))
  const requestedMode=String(req.body?.spatialMode||'screen').toLowerCase()
  const requestedCue=String(req.body?.musicCue||'spark').toLowerCase()
  const spatialMode=SPATIAL_MODES.has(requestedMode)?requestedMode:'screen'
  const musicCue=SAFE_CUES.has(requestedCue)?requestedCue:'spark'
  if(!GIFT_TYPES.has(giftType))return json(res,400,{error:'unsupported_gift_type'})
  if(!recipientId)return json(res,400,{error:'recipient_required'})
  if(amountMinor>100000)return json(res,400,{error:'tip_amount_above_client_intent_limit'})
  const intentId=`gift_${Date.now()}_${Math.random().toString(36).slice(2,10)}`
  return json(res,201,{
    ok:true,
    intent:{
      id:intentId,
      senderId:user.id,
      recipientId,
      giftType,
      amountMinor,
      currency:'USD',
      spatialMode,
      musicCue,
      visualEffectReady:true,
      moneyMoved:false,
      withdrawable:false,
      settlementStatus:amountMinor>0?'provider_verification_required':'visual_only',
      createdAt:new Date().toISOString()
    }
  })
}
