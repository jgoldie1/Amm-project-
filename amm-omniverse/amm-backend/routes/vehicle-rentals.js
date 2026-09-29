'use strict'

const express=require('express')
const {RATES,quoteRental,rentalSplit}=require('../lib/vehicle-rental-economy')

const FOUNDER_ROLES=new Set(['owner'])
const OPERATOR_ROLES=new Set(['owner','admin','ops','fleet'])

function bearer(req){
  const h=String(req.headers.authorization||'')
  return h.startsWith('Bearer ')?h.slice(7).trim():''
}
function role(user){return String(user?.app_metadata?.role||'').trim().toLowerCase()}
function safeText(value,max=200){return String(value||'').trim().slice(0,max)}

function createVehicleRentalRouter({supabase}){
  const router=express.Router()

  router.use(async(req,res,next)=>{
    const token=bearer(req)
    if(!token)return res.status(401).json({error:'Authentication required'})
    const {data,error}=await supabase.auth.getUser(token)
    if(error||!data?.user)return res.status(401).json({error:'Invalid session'})
    req.user=data.user
    next()
  })

  async function hasCredential(userId,credentialId){
    if(!credentialId)return true
    const now=new Date().toISOString()
    const {data,error}=await supabase.from('tryamm_mobility_credentials')
      .select('id,credential_id,status,expires_at,source_type')
      .eq('user_id',userId).eq('credential_id',credentialId).eq('status','active').limit(1)
    if(error)throw error
    const cred=(data||[])[0]
    if(!cred)return false
    return !cred.expires_at||cred.expires_at>now
  }

  async function canControl(userId,rate){
    const credentialOk=await hasCredential(userId,rate.credential)
    return{credentialOk,requiredCredential:rate.credential}
  }

  router.get('/catalog',async(_req,res)=>{
    try{
      const {data,error}=await supabase.from('tryamm_vehicle_inventory')
        .select('id,vehicle_key,vehicle_class,display_name,status,rental_enabled,allow_self_drive,allow_passenger,required_credential,plasma_shield_enabled,owner_type,metadata')
        .eq('rental_enabled',true).neq('status','retired').order('vehicle_class').limit(500)
      if(error)throw error
      const availability={}
      for(const row of data||[]){
        const key=row.vehicle_class
        availability[key]=availability[key]||{available:0,total:0}
        availability[key].total+=1
        if(row.status==='available')availability[key].available+=1
      }
      res.json({rates:RATES,inventory:data||[],availability,realWorldRental:false})
    }catch(error){res.status(500).json({error:'Vehicle rental catalog unavailable'})}
  })

  router.get('/me',async(req,res)=>{
    try{
      const [{data:rentals,error:rentalError},{data:grants,error:grantError},{data:credentials,error:credentialError}]=await Promise.all([
        supabase.from('tryamm_vehicle_rentals')
          .select('id,vehicle_id,rental_mode,starts_at,ends_at,status,founder_comp,quoted_cents,deposit_hold_cents,currency,required_credential,credential_verified,metadata,tryamm_vehicle_inventory(vehicle_class,display_name,plasma_shield_enabled)')
          .eq('renter_user_id',req.user.id).order('created_at',{ascending:false}).limit(100),
        supabase.from('tryamm_vehicle_grants')
          .select('id,vehicle_class,inventory_vehicle_id,grant_kind,status,expires_at,bypass_control_certification,revenue_cents,metadata,created_at')
          .eq('recipient_user_id',req.user.id).order('created_at',{ascending:false}).limit(100),
        supabase.from('tryamm_mobility_credentials')
          .select('credential_id,status,source_type,source_ref,expires_at,created_at')
          .eq('user_id',req.user.id).eq('status','active').order('created_at',{ascending:false}),
      ])
      if(rentalError||grantError||credentialError)throw rentalError||grantError||credentialError
      res.json({rentals:rentals||[],grants:grants||[],credentials:credentials||[]})
    }catch(error){res.status(500).json({error:'Mobility account unavailable'})}
  })

  router.post('/quote',async(req,res)=>{
    try{
      const vehicleClass=safeText(req.body?.vehicleClass,80)
      const mode=safeText(req.body?.mode||'self-drive',30)
      const quote=quoteRental(vehicleClass,req.body?.hours)
      if(mode==='self-drive'&&!quote.selfDrive)return res.status(409).json({error:'Self-drive is not available for this class'})
      if((mode==='passenger'||mode==='chauffeur')&&!quote.passenger)return res.status(409).json({error:'Passenger rental is not available for this class'})
      const control=mode==='self-drive'?await canControl(req.user.id,quote):{credentialOk:true,requiredCredential:quote.credential}
      res.json({
        quote,
        mode,
        control,
        canBook:mode!=='self-drive'||control.credentialOk,
        passengerAlternative:!control.credentialOk&&quote.passenger,
        paymentRequired:true,
        depositIsGameRentalHold:true,
      })
    }catch(error){res.status(error.statusCode||500).json({error:error.message||'Could not quote rental'})}
  })

  router.post('/rent',async(req,res)=>{
    try{
      const vehicleId=safeText(req.body?.vehicleId,80)
      const mode=safeText(req.body?.mode||'self-drive',30)
      const paymentTransactionId=safeText(req.body?.paymentTransactionId,80)
      if(!vehicleId||!paymentTransactionId)return res.status(400).json({error:'vehicleId and verified paymentTransactionId required'})

      const {data:vehicle,error:vehicleError}=await supabase.from('tryamm_vehicle_inventory').select('*').eq('id',vehicleId).maybeSingle()
      if(vehicleError)throw vehicleError
      if(!vehicle||!vehicle.rental_enabled||vehicle.status!=='available')return res.status(409).json({error:'Vehicle is not currently available'})

      const quote=quoteRental(vehicle.vehicle_class,req.body?.hours)
      if(mode==='self-drive'&&!vehicle.allow_self_drive)return res.status(409).json({error:'Self-drive disabled for this vehicle'})
      if((mode==='passenger'||mode==='chauffeur')&&!vehicle.allow_passenger)return res.status(409).json({error:'Passenger service disabled for this vehicle'})
      const control=mode==='self-drive'?await canControl(req.user.id,quote):{credentialOk:true,requiredCredential:quote.credential}
      if(mode==='self-drive'&&!control.credentialOk)return res.status(403).json({error:'Required StreetVerse mobility certification is missing',requiredCredential:quote.credential,passengerAlternative:Boolean(quote.passenger)})

      const {data:tx,error:txError}=await supabase.from('commerce_payment_transactions')
        .select('id,buyer_id,amount_cents,currency,status,verified_at,provider,metadata')
        .eq('id',paymentTransactionId).maybeSingle()
      if(txError)throw txError
      if(!tx||tx.status!=='paid'||!tx.verified_at)return res.status(409).json({error:'Verified paid transaction required'})
      if(String(tx.buyer_id)!==String(req.user.id))return res.status(403).json({error:'Payment does not belong to renter'})
      if(String(tx.currency||'USD').toUpperCase()!=='USD')return res.status(409).json({error:'Rental payment currency mismatch'})
      if(Number(tx.amount_cents)<quote.rentalCents)return res.status(409).json({error:'Payment amount does not cover rental quote'})

      const now=new Date()
      const ends=new Date(now.getTime()+quote.hours*60*60*1000)
      const {data:conflicts,error:conflictError}=await supabase.from('tryamm_vehicle_rentals')
        .select('id').eq('vehicle_id',vehicle.id).in('status',['reserved','active','damage-hold'])
        .lt('starts_at',ends.toISOString()).gt('ends_at',now.toISOString()).limit(1)
      if(conflictError)throw conflictError
      if((conflicts||[]).length)return res.status(409).json({error:'Vehicle was just reserved by another renter'})

      const {data:rental,error:rentalError}=await supabase.from('tryamm_vehicle_rentals').insert({
        vehicle_id:vehicle.id,
        renter_user_id:req.user.id,
        rental_mode:mode,
        starts_at:now.toISOString(),
        ends_at:ends.toISOString(),
        status:'reserved',
        payment_transaction_id:tx.id,
        founder_comp:false,
        quoted_cents:quote.rentalCents,
        deposit_hold_cents:quote.deposit,
        currency:'USD',
        required_credential:quote.credential,
        credential_verified:Boolean(control.credentialOk),
        credential_snapshot:{required:quote.credential,verified:Boolean(control.credentialOk),mode},
        metadata:{paymentProvider:tx.provider,plasmaShield:Boolean(quote.plasmaShield),revenueSplit:rentalSplit(quote.rentalCents,vehicle.owner_type)},
      }).select('*').single()
      if(rentalError)throw rentalError

      const {error:reserveError}=await supabase.from('tryamm_vehicle_inventory').update({status:'reserved',updated_at:new Date().toISOString()}).eq('id',vehicle.id).eq('status','available')
      if(reserveError)throw reserveError
      res.status(201).json({rental,vehicle:{id:vehicle.id,vehicleClass:vehicle.vehicle_class,displayName:vehicle.display_name,plasmaShield:vehicle.plasma_shield_enabled},quote})
    }catch(error){res.status(error.statusCode||500).json({error:error.message||'Could not create vehicle rental'})}
  })

  router.post('/founder/comp',async(req,res)=>{
    try{
      if(!FOUNDER_ROLES.has(role(req.user)))return res.status(403).json({error:'Founder owner role required'})
      const recipientUserId=safeText(req.body?.recipientUserId,100)
      const vehicleId=safeText(req.body?.vehicleId,80)
      const mode=safeText(req.body?.mode||'passenger',30)
      if(!recipientUserId||!vehicleId)return res.status(400).json({error:'recipientUserId and vehicleId required'})
      const {data:vehicle,error:vehicleError}=await supabase.from('tryamm_vehicle_inventory').select('*').eq('id',vehicleId).maybeSingle()
      if(vehicleError)throw vehicleError
      if(!vehicle||vehicle.status!=='available')return res.status(409).json({error:'Vehicle unavailable'})
      const quote=quoteRental(vehicle.vehicle_class,req.body?.hours)
      const control=mode==='self-drive'?await canControl(recipientUserId,quote):{credentialOk:true,requiredCredential:quote.credential}
      if(mode==='self-drive'&&!control.credentialOk)return res.status(403).json({error:'Recipient needs the required mobility credential to control this vehicle',requiredCredential:quote.credential})
      const now=new Date(),ends=new Date(now.getTime()+quote.hours*60*60*1000)
      const {data:rental,error}=await supabase.from('tryamm_vehicle_rentals').insert({
        vehicle_id:vehicle.id,renter_user_id:recipientUserId,rental_mode:mode,starts_at:now.toISOString(),ends_at:ends.toISOString(),
        status:'reserved',founder_comp:true,quoted_cents:0,deposit_hold_cents:0,currency:'USD',
        required_credential:quote.credential,credential_verified:Boolean(control.credentialOk),
        credential_snapshot:{required:quote.credential,verified:Boolean(control.credentialOk),mode},
        metadata:{compedBy:req.user.id,plasmaShield:Boolean(quote.plasmaShield),revenueGenerated:false},
      }).select('*').single()
      if(error)throw error
      await supabase.from('tryamm_vehicle_inventory').update({status:'reserved',updated_at:new Date().toISOString()}).eq('id',vehicle.id).eq('status','available')
      res.status(201).json({rental,founderComp:true,revenueCents:0})
    }catch(error){res.status(error.statusCode||500).json({error:error.message||'Could not create Founder comp rental'})}
  })

  router.post('/founder/gift',async(req,res)=>{
    try{
      if(!FOUNDER_ROLES.has(role(req.user)))return res.status(403).json({error:'Founder owner role required'})
      const recipientUserId=safeText(req.body?.recipientUserId,100)
      const vehicleClass=safeText(req.body?.vehicleClass,80)
      const inventoryVehicleId=safeText(req.body?.vehicleId,80)||null
      if(!recipientUserId||!vehicleClass)return res.status(400).json({error:'recipientUserId and vehicleClass required'})
      const {data,error}=await supabase.from('tryamm_vehicle_grants').insert({
        recipient_user_id:recipientUserId,
        vehicle_class:vehicleClass,
        inventory_vehicle_id:inventoryVehicleId,
        grant_kind:'gift',
        status:'active',
        granted_by_user_id:req.user.id,
        bypass_control_certification:false,
        revenue_cents:0,
        metadata:{founderGift:true,ownershipGranted:true,controlCertificationStillRequired:true,note:safeText(req.body?.note,500)||null},
      }).select('*').single()
      if(error)throw error
      res.status(201).json({grant:data,revenueCents:0,controlCertificationStillRequired:true})
    }catch(error){res.status(500).json({error:'Could not create Founder vehicle gift'})}
  })

  router.post('/:id/activate',async(req,res)=>{
    try{
      const {data:rental,error}=await supabase.from('tryamm_vehicle_rentals').select('*').eq('id',req.params.id).eq('renter_user_id',req.user.id).maybeSingle()
      if(error)throw error
      if(!rental||rental.status!=='reserved')return res.status(409).json({error:'Reserved rental not found'})
      if(new Date(rental.ends_at)<=new Date())return res.status(409).json({error:'Rental window expired'})
      const {data,error:updateError}=await supabase.from('tryamm_vehicle_rentals').update({status:'active',updated_at:new Date().toISOString()}).eq('id',rental.id).eq('status','reserved').select('*').single()
      if(updateError)throw updateError
      await supabase.from('tryamm_vehicle_inventory').update({status:'rented',updated_at:new Date().toISOString()}).eq('id',rental.vehicle_id)
      res.json({rental:data})
    }catch(error){res.status(500).json({error:'Could not activate rental'})}
  })

  router.post('/:id/return',async(req,res)=>{
    try{
      const {data:rental,error}=await supabase.from('tryamm_vehicle_rentals').select('*').eq('id',req.params.id).eq('renter_user_id',req.user.id).maybeSingle()
      if(error)throw error
      if(!rental||!['reserved','active','damage-hold'].includes(rental.status))return res.status(409).json({error:'Returnable rental not found'})
      const returnState=req.body?.returnState&&typeof req.body.returnState==='object'?req.body.returnState:{}
      const damage=Boolean(returnState.damage)
      const nextStatus=damage?'damage-hold':'completed'
      const {data,error:updateError}=await supabase.from('tryamm_vehicle_rentals').update({status:nextStatus,return_state:returnState,updated_at:new Date().toISOString()}).eq('id',rental.id).select('*').single()
      if(updateError)throw updateError
      await supabase.from('tryamm_vehicle_inventory').update({status:damage?'maintenance':'available',updated_at:new Date().toISOString()}).eq('id',rental.vehicle_id)
      res.json({rental:data,vehicleState:damage?'maintenance':'available'})
    }catch(error){res.status(500).json({error:'Could not return rental'})}
  })

  router.post('/operator/inventory',async(req,res)=>{
    try{
      if(!OPERATOR_ROLES.has(role(req.user)))return res.status(403).json({error:'Fleet operator role required'})
      const vehicleClass=safeText(req.body?.vehicleClass,80)
      const vehicleKey=safeText(req.body?.vehicleKey,120)
      const displayName=safeText(req.body?.displayName,160)
      const rate=RATES[vehicleClass]
      if(!rate||!vehicleKey||!displayName)return res.status(400).json({error:'Supported vehicleClass, vehicleKey and displayName required'})
      const {data,error}=await supabase.from('tryamm_vehicle_inventory').insert({
        vehicle_key:vehicleKey,vehicle_class:vehicleClass,display_name:displayName,asset_key:safeText(req.body?.assetKey,160)||null,
        owner_type:safeText(req.body?.ownerType||'tryamm',40),owner_user_id:safeText(req.body?.ownerUserId,100)||null,
        status:'available',rental_enabled:true,allow_self_drive:Boolean(rate.selfDrive),allow_passenger:Boolean(rate.passenger),
        required_credential:rate.credential,plasma_shield_enabled:Boolean(rate.plasmaShield),
        metadata:req.body?.metadata&&typeof req.body.metadata==='object'?req.body.metadata:{},
      }).select('*').single()
      if(error)throw error
      res.status(201).json({vehicle:data})
    }catch(error){res.status(500).json({error:'Could not add rental vehicle'})}
  })

  return router
}

module.exports={createVehicleRentalRouter,FOUNDER_ROLES,OPERATOR_ROLES}
