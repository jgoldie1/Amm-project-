'use strict'

const express=require('express')

const OPERATOR_ROLES=new Set(['owner','admin','ops','fleet','security'])
const RECOVERY_CREDENTIAL='vehicle-recovery-agent'
const TRANSITIONS={
  reported:['locating','cancelled'],
  locating:['located','cancelled'],
  located:['recovery-authorized','cancelled'],
  'recovery-authorized':['tow-assigned','impounded','cancelled'],
  'tow-assigned':['impounded','cancelled'],
  impounded:['returned'],
  returned:[],
  cancelled:[],
}

function bearer(req){
  const h=String(req.headers.authorization||'')
  return h.startsWith('Bearer ')?h.slice(7).trim():''
}
function role(user){return String(user?.app_metadata?.role||'').trim().toLowerCase()}
function safeText(v,max=200){return String(v||'').trim().slice(0,max)}
function safePosition(input){
  if(!input||typeof input!=='object')return null
  const x=Number(input.x),z=Number(input.z)
  if(!Number.isFinite(x)||!Number.isFinite(z))return null
  return{x:Math.max(-100000,Math.min(100000,x)),z:Math.max(-100000,Math.min(100000,z)),district:safeText(input.district,80)||null}
}

function createVehicleRecoveryRouter({supabase}){
  const router=express.Router()

  router.use(async(req,res,next)=>{
    const token=bearer(req)
    if(!token)return res.status(401).json({error:'Authentication required'})
    const {data,error}=await supabase.auth.getUser(token)
    if(error||!data?.user)return res.status(401).json({error:'Invalid session'})
    req.user=data.user
    next()
  })

  async function canReportVehicle(userId,vehicle,reason,requestRole){
    if(OPERATOR_ROLES.has(requestRole))return true
    if(reason==='overdue-rental'||reason==='fraud-hold'||reason==='owner-recall')return false
    if(String(vehicle.owner_user_id||'')===String(userId))return true
    const [{data:grantRows,error:grantError},{data:rentalRows,error:rentalError}]=await Promise.all([
      supabase.from('tryamm_vehicle_grants').select('id').eq('recipient_user_id',userId).eq('inventory_vehicle_id',vehicle.id).eq('status','active').limit(1),
      supabase.from('tryamm_vehicle_rentals').select('id').eq('renter_user_id',userId).eq('vehicle_id',vehicle.id).in('status',['reserved','active','damage-hold']).limit(1),
    ])
    if(grantError||rentalError)throw grantError||rentalError
    return Boolean((grantRows||[])[0]||(rentalRows||[])[0])
  }

  router.post('/report',async(req,res)=>{
    try{
      const vehicleId=safeText(req.body?.vehicleId,80)
      const reason=safeText(req.body?.reason||'stolen',40)
      if(!['stolen','overdue-rental','abandoned','fraud-hold','owner-recall'].includes(reason))return res.status(400).json({error:'Unsupported recovery reason'})
      const {data:vehicle,error:vehicleError}=await supabase.from('tryamm_vehicle_inventory').select('*').eq('id',vehicleId).maybeSingle()
      if(vehicleError)throw vehicleError
      if(!vehicle)return res.status(404).json({error:'Vehicle not found'})
      if(!(await canReportVehicle(req.user.id,vehicle,reason,role(req.user))))return res.status(403).json({error:'You are not authorized to report this vehicle'})
      const ownerUserId=String(vehicle.owner_user_id||'tryamm-system')
      const rewardXP=reason==='stolen'?350:220
      const rewardCredits=reason==='stolen'?650:400
      const {data,error}=await supabase.from('tryamm_vehicle_recovery_cases').insert({
        vehicle_id:vehicle.id,vehicle_key:vehicle.vehicle_key,vehicle_class:vehicle.vehicle_class,vehicle_label:vehicle.display_name,
        owner_user_id:ownerUserId,reporter_user_id:req.user.id,reason,status:'reported',
        last_known_game_position:safePosition(req.body?.lastKnownGamePosition),
        authorization_data:{reportedBy:req.user.id,serverAuthorized:false,gameOnly:true,nonviolentOnly:true},
        reward_xp:rewardXP,reward_credits:rewardCredits,payout_status:'blocked',
      }).select('*').single()
      if(error)throw error
      res.status(201).json({case:data,gameOnly:true,nonviolentRecovery:true})
    }catch(error){res.status(500).json({error:error.message||'Could not report vehicle'})}
  })

  router.get('/me',async(req,res)=>{
    try{
      const {data,error}=await supabase.from('tryamm_vehicle_recovery_cases')
        .select('*').or(`owner_user_id.eq.${req.user.id},reporter_user_id.eq.${req.user.id},assigned_agent_user_id.eq.${req.user.id}`)
        .order('created_at',{ascending:false}).limit(100)
      if(error)throw error
      res.json({cases:data||[]})
    }catch(error){res.status(500).json({error:'Recovery cases unavailable'})}
  })

  router.get('/open',async(req,res)=>{
    try{
      const operator=OPERATOR_ROLES.has(role(req.user))
      let agent=operator
      if(!agent){
        const {data,error}=await supabase.from('tryamm_mobility_credentials').select('id')
          .eq('user_id',req.user.id).eq('credential_id',RECOVERY_CREDENTIAL).eq('status','active').limit(1)
        if(error)throw error
        agent=Boolean((data||[])[0])
      }
      if(!agent)return res.status(403).json({error:'Recovery-agent credential required'})
      const {data,error}=await supabase.from('tryamm_vehicle_recovery_cases')
        .select('id,vehicle_class,vehicle_label,reason,status,last_known_game_position,reward_xp,reward_credits,created_at')
        .in('status',['reported','locating','located','recovery-authorized','tow-assigned'])
        .is('assigned_agent_user_id',null).order('created_at').limit(50)
      if(error)throw error
      res.json({cases:data||[],nonviolentOnly:true})
    }catch(error){res.status(500).json({error:'Open recovery jobs unavailable'})}
  })

  router.post('/:id/accept',async(req,res)=>{
    try{
      const operator=OPERATOR_ROLES.has(role(req.user))
      let agent=operator
      if(!agent){
        const {data,error}=await supabase.from('tryamm_mobility_credentials').select('id')
          .eq('user_id',req.user.id).eq('credential_id',RECOVERY_CREDENTIAL).eq('status','active').limit(1)
        if(error)throw error
        agent=Boolean((data||[])[0])
      }
      if(!agent)return res.status(403).json({error:'Recovery-agent credential required'})
      const {data,error}=await supabase.from('tryamm_vehicle_recovery_cases').update({
        assigned_agent_user_id:req.user.id,status:'locating',updated_at:new Date().toISOString(),
      }).eq('id',req.params.id).eq('status','reported').is('assigned_agent_user_id',null).select('*').maybeSingle()
      if(error)throw error
      if(!data)return res.status(409).json({error:'Recovery job is no longer available'})
      res.json({case:data,mission:'LOCATE VEHICLE • FOLLOW GAME RECOVERY BEACON',nonviolentOnly:true})
    }catch(error){res.status(500).json({error:'Could not accept recovery job'})}
  })

  router.post('/:id/advance',async(req,res)=>{
    try{
      const next=safeText(req.body?.status,40)
      const {data:item,error:readError}=await supabase.from('tryamm_vehicle_recovery_cases').select('*').eq('id',req.params.id).maybeSingle()
      if(readError)throw readError
      if(!item)return res.status(404).json({error:'Recovery case not found'})
      const operator=OPERATOR_ROLES.has(role(req.user))
      const actorIsAgent=String(item.assigned_agent_user_id||'')===String(req.user.id)
      const actorIsOwner=String(item.owner_user_id||'')===String(req.user.id)
      if(!operator&&!actorIsAgent&&!actorIsOwner)return res.status(403).json({error:'Not authorized for this recovery case'})
      if(!(TRANSITIONS[item.status]||[]).includes(next))return res.status(409).json({error:`Invalid recovery transition ${item.status} → ${next}`})
      if(next==='recovery-authorized'&&!operator&&!actorIsOwner)return res.status(403).json({error:'Owner or fleet operator authorization required before recovery'})
      const now=new Date().toISOString()
      const patch={status:next,updated_at:now,evidence:{...(item.evidence||{}),lastActionBy:req.user.id,lastActionAt:now}}
      if(next==='recovery-authorized')patch.authorization_data={...(item.authorization_data||{}),serverAuthorized:true,authorizedBy:req.user.id,authorizedAt:now}
      if(next==='returned'){patch.recovered_at=now;patch.payout_status='verified'}
      const {data,error}=await supabase.from('tryamm_vehicle_recovery_cases').update(patch).eq('id',item.id).eq('status',item.status).select('*').maybeSingle()
      if(error)throw error
      if(!data)return res.status(409).json({error:'Recovery case changed before update'})
      res.json({case:data,rewardEligible:next==='returned',payoutAutomatic:false})
    }catch(error){res.status(500).json({error:error.message||'Could not update recovery case'})}
  })

  return router
}

module.exports={createVehicleRecoveryRouter,OPERATOR_ROLES,RECOVERY_CREDENTIAL,TRANSITIONS}