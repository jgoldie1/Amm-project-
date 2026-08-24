import {json} from '../_lib/supabase-admin.js'
import {requireUser} from '../_lib/security.js'

const GIFT_TYPES=new Set([
  'spark','rose','heart','fire','confetti','kiss-me','air-kiss','holo-hug','high-five','wink','laugh-burst','boo','heartbreak','cartoon-punch','cartoon-slap','mic-drop','vinyl','boombox','gold-record',
  'america250','eagle','liberty-bell','stars-stripes','crown','diamond','private-jet','supercar','yacht',
  'lion','twelve-tribes','shofar','set-apart-scroll','jerusalem-gate','menorah-light','ark','judah','galaxy','supernova',
  'pk-ko','pk-comeback','pk-crown','portal','streetverse-car','mars-drop','starverse-stage','omnibox-premiere','world-takeover',
  'world-unity','peace-orbit','global-love','all-nations','africa-rise','afrobeats-wave','caribbean-sun','carnival-wave','latin-fiesta','latin-stars','euro-crown','euro-festival','east-asia-lantern','east-asia-dragon','south-asia-lights','south-asia-dance','mena-stars','mena-gate','first-nations-sky','earth-keeper','pacific-wave','island-flower','canada-north','mexico-celebration','usa-unity',
  'face-holo','face-crown','face-kiss','face-hug','face-lion','face-avatar'
])
const SPATIAL_MODES=new Set(['screen','ar','vr'])
const SAFE_CUES=new Set([
  'spark','rose','heart','fire','confetti','kiss','hug','highfive','wink','laugh','boo','heartbreak','punch','slap','mic','vinyl','boombox','goldrecord','america250','eagle','bell','stars',
  'crown','diamond','jet','car','yacht','lion','tribes','shofar','scroll','jerusalem','menorah','ark','royal','galaxy','supernova',
  'pkko','pkcomeback','pkcrown','portal','streetcar','mars','stage','premiere','world',
  'unity','peace','love','nations','africa','afrobeats','caribbean','carnival','latin','latinstars','europe','festival','lantern','dragon','lights','rhythm','mena','gate','firstnations','earth','pacific','flower','canada','mexico','usa','face','facecrown','facekiss','facehug','facelion','faceavatar'
])
const FACE_GIFTS=new Set(['face-holo','face-crown','face-kiss','face-hug','face-lion','face-avatar'])

export default async function handler(req,res){
  if(req.method!=='POST')return json(res,405,{error:'method_not_allowed'})
  const user=await requireUser(req,res);if(!user)return
  const giftType=String(req.body?.giftType||'spark').toLowerCase()
  const recipientId=String(req.body?.recipientId||'').trim()
  const amountMinor=Math.max(0,Math.floor(Number(req.body?.amountMinor||0)))
  const requestedMode=String(req.body?.spatialMode||'screen').toLowerCase()
  const requestedCue=String(req.body?.musicCue||'spark').toLowerCase()
  const faceAssetUrl=String(req.body?.faceAssetUrl||'').trim()
  const faceConsent=Boolean(req.body?.faceConsent)
  const spatialMode=SPATIAL_MODES.has(requestedMode)?requestedMode:'screen'
  const musicCue=SAFE_CUES.has(requestedCue)?requestedCue:'spark'
  if(!GIFT_TYPES.has(giftType))return json(res,400,{error:'unsupported_gift_type'})
  if(!recipientId)return json(res,400,{error:'recipient_required'})
  if(amountMinor>100000)return json(res,400,{error:'tip_amount_above_client_intent_limit'})
  if(FACE_GIFTS.has(giftType)&&(!faceConsent||!faceAssetUrl))return json(res,400,{error:'face_gift_requires_authorized_face_and_consent'})
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
      faceAssetUrl:FACE_GIFTS.has(giftType)?faceAssetUrl:null,
      faceConsentRequired:FACE_GIFTS.has(giftType),
      visualEffectReady:true,
      moneyMoved:false,
      withdrawable:false,
      settlementStatus:amountMinor>0?'provider_verification_required':'visual_only',
      createdAt:new Date().toISOString()
    }
  })
}
