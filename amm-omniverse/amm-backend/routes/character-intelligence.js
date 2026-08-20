const express = require('express')

function clamp(n,min,max){ return Math.max(min,Math.min(max,n)) }

function createCharacterIntelligenceRouter({ supabase }){
  const router=express.Router()

  async function requireUser(req,res,next){
    const auth=String(req.headers.authorization||'')
    const token=auth.startsWith('Bearer ')?auth.slice(7):''
    if(!token) return res.status(401).json({error:'Authentication required'})
    const {data,error}=await supabase.auth.getUser(token)
    if(error||!data?.user) return res.status(401).json({error:'Invalid session'})
    req.user=data.user
    next()
  }

  router.get('/capabilities',(_req,res)=>res.json({
    brains:['npc','mpc','world_citizen'],
    authority:'server',
    safeguards:['no_money_authority','no_inventory_authority','age_rules_preserved','panic_mode_override','deterministic_mission_validation'],
  }))

  router.post('/intent/validate',requireUser,async(req,res)=>{
    try{
      const body=req.body||{}
      const intent=body.intent||{}
      if(!intent.characterId||!intent.action||!intent.reason) return res.status(400).json({approved:false,error:'Incomplete intent'})
      const confidence=Number(intent.confidence)
      if(!Number.isFinite(confidence)||confidence<0||confidence>1) return res.status(400).json({approved:false,error:'Invalid confidence'})
      const forbidden=['move_money','grant_inventory','grant_paid_reward','disable_panic_mode','bypass_age_gate','control_haptic_unverified']
      if(forbidden.includes(String(intent.action))) return res.status(403).json({approved:false,error:'Action requires a dedicated authoritative service'})

      const awareness=body.awareness||{}
      const danger=clamp(Number(awareness.dangerLevel||0),0,1)
      if(danger>=.9 && !['seek_safety','warn_player','call_security','evacuate'].includes(String(intent.action))){
        return res.json({approved:false,reason:'High danger overrides non-safety intent',serverRevision:Date.now()})
      }

      const event={
        user_id:req.user.id,
        event_type:'CHARACTER_INTENT_VALIDATED',
        source:'character-intelligence',
        payload:{ characterId:String(intent.characterId).slice(0,120), action:String(intent.action).slice(0,120), confidence, approved:true }
      }
      try{ await supabase.from('platform_events').insert(event) }catch(_){ /* audit table may be unavailable in some environments */ }
      res.json({approved:true,reason:'Intent passed server authority and safety checks',serverRevision:Date.now()})
    }catch(err){ res.status(500).json({approved:false,error:err.message||'Character intent validation failed'}) }
  })

  return router
}

module.exports={createCharacterIntelligenceRouter}
