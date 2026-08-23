const express=require('express')

function createModerationRouter({supabase}){
  const router=express.Router()
  async function requireUser(req,res,next){
    try{
      const auth=req.headers.authorization||''
      const token=auth.startsWith('Bearer ')?auth.slice(7):''
      if(!token)return res.status(401).json({error:'Authentication required'})
      const {data,error}=await supabase.auth.getUser(token)
      if(error||!data?.user)return res.status(401).json({error:'Invalid session'})
      req.user=data.user
      next()
    }catch(_){return res.status(401).json({error:'Authentication failed'})}
  }

  const validTargets=new Set(['user','live','reel','post','comment','dm','game','marketplace','ride','delivery','business','other'])
  const validReasons=new Set(['harassment','hate','threat','sexual-content','minor-safety','violence','self-harm','scam-fraud','impersonation','spam','copyright','privacy','unsafe-driving','wrong-driver-vehicle','payment-abuse','cheating','misinformation','other'])

  router.post('/report',requireUser,async(req,res)=>{
    try{
      const targetType=String(req.body?.targetType||'').trim()
      const targetId=String(req.body?.targetId||'').trim().slice(0,500)
      const reason=String(req.body?.reason||'').trim()
      const details=String(req.body?.details||'').trim().slice(0,4000)||null
      const reportedUserId=req.body?.reportedUserId||null
      if(!validTargets.has(targetType))return res.status(400).json({error:'Invalid targetType'})
      if(!targetId)return res.status(400).json({error:'targetId is required'})
      if(!validReasons.has(reason))return res.status(400).json({error:'Invalid reason'})
      const critical=['threat','minor-safety','violence','self-harm','unsafe-driving','wrong-driver-vehicle'].includes(reason)
      const severity=critical?'critical':['harassment','hate','sexual-content','scam-fraud','privacy','payment-abuse'].includes(reason)?'urgent':'standard'
      const evidence={
        contentId:req.body?.contentId||targetId,
        roomName:req.body?.roomName||null,
        messageIds:Array.isArray(req.body?.messageIds)?req.body.messageIds.slice(0,50):[],
        mediaRefs:Array.isArray(req.body?.mediaRefs)?req.body.mediaRefs.slice(0,20):[],
        context:req.body?.context&&typeof req.body.context==='object'?req.body.context:{},
      }
      const {data,error}=await supabase.from('moderation_reports').insert({
        reporter_user_id:req.user.id,target_type:targetType,target_id:targetId,reported_user_id:reportedUserId,
        reason,details,evidence_window_seconds:120,evidence,severity,status:'open'
      }).select('id,status,severity,evidence_window_seconds,created_at').single()
      if(error)throw error
      res.status(201).json({report:data,next:'submitted-for-review'})
    }catch(err){res.status(500).json({error:err.message||'Could not submit report'})}
  })

  router.get('/my-reports',requireUser,async(req,res)=>{
    try{
      const {data,error}=await supabase.from('moderation_reports').select('id,target_type,target_id,reason,severity,status,created_at,updated_at').eq('reporter_user_id',req.user.id).order('created_at',{ascending:false}).limit(100)
      if(error)throw error
      res.json({reports:data||[]})
    }catch(err){res.status(500).json({error:'Could not load reports'})}
  })

  router.post('/appeal',requireUser,async(req,res)=>{
    try{
      const reportId=String(req.body?.reportId||'').trim()
      const statement=String(req.body?.statement||'').trim().slice(0,5000)
      if(!reportId||!statement)return res.status(400).json({error:'reportId and statement are required'})
      const {data:report,error:reportError}=await supabase.from('moderation_reports').select('id,reporter_user_id,reported_user_id,status').eq('id',reportId).maybeSingle()
      if(reportError)throw reportError
      if(!report)return res.status(404).json({error:'Report not found'})
      if(report.reporter_user_id!==req.user.id&&report.reported_user_id!==req.user.id)return res.status(403).json({error:'Not eligible to appeal this case'})
      const {data,error}=await supabase.from('moderation_appeals').insert({report_id:reportId,appellant_user_id:req.user.id,statement,evidence:req.body?.evidence||{},status:'pending'}).select('id,status,created_at').single()
      if(error)throw error
      await supabase.from('moderation_reports').update({status:'appealed',updated_at:new Date().toISOString()}).eq('id',reportId)
      res.status(201).json({appeal:data})
    }catch(err){res.status(500).json({error:err.message||'Could not submit appeal'})}
  })

  async function setRelationship(req,res,changes){
    try{
      const targetUserId=String(req.params.userId||'').trim()
      if(!targetUserId)return res.status(400).json({error:'userId is required'})
      if(targetUserId===req.user.id)return res.status(400).json({error:'You cannot block or mute yourself'})
      const {data:existing,error:readError}=await supabase.from('user_safety_relationships').select('blocked,muted').eq('owner_user_id',req.user.id).eq('target_user_id',targetUserId).maybeSingle()
      if(readError)throw readError
      const row={
        owner_user_id:req.user.id,target_user_id:targetUserId,
        blocked:changes.blocked??Boolean(existing?.blocked),
        muted:changes.muted??Boolean(existing?.muted),
        reason:String(req.body?.reason||'').slice(0,500)||null,
        source:String(req.body?.source||'user-action').slice(0,80),
        updated_at:new Date().toISOString(),
      }
      const {data,error}=await supabase.from('user_safety_relationships').upsert(row,{onConflict:'owner_user_id,target_user_id'}).select('target_user_id,blocked,muted,updated_at').single()
      if(error)throw error
      res.json({ok:true,relationship:data})
    }catch(err){res.status(500).json({error:err.message||'Could not update safety relationship'})}
  }

  router.post('/block/:userId',requireUser,(req,res)=>setRelationship(req,res,{blocked:true}))
  router.post('/unblock/:userId',requireUser,(req,res)=>setRelationship(req,res,{blocked:false}))
  router.post('/mute/:userId',requireUser,(req,res)=>setRelationship(req,res,{muted:true}))
  router.post('/unmute/:userId',requireUser,(req,res)=>setRelationship(req,res,{muted:false}))

  router.get('/relationships',requireUser,async(req,res)=>{
    try{
      const {data,error}=await supabase.from('user_safety_relationships').select('target_user_id,blocked,muted,reason,source,updated_at').eq('owner_user_id',req.user.id).or('blocked.eq.true,muted.eq.true').order('updated_at',{ascending:false}).limit(500)
      if(error)throw error
      res.json({relationships:data||[]})
    }catch(err){res.status(500).json({error:'Could not load safety relationships'})}
  })

  router.get('/relationship/:userId',requireUser,async(req,res)=>{
    try{
      const {data,error}=await supabase.from('user_safety_relationships').select('target_user_id,blocked,muted,updated_at').eq('owner_user_id',req.user.id).eq('target_user_id',req.params.userId).maybeSingle()
      if(error)throw error
      res.json({relationship:data||{target_user_id:req.params.userId,blocked:false,muted:false}})
    }catch(err){res.status(500).json({error:'Could not load safety relationship'})}
  })

  return router
}

module.exports={createModerationRouter}
