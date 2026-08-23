const express = require('express')

function createAdvancedWorldsRouter({ supabase }) {
  const router = express.Router()

  async function requireUser(req, res, next) {
    const auth = req.headers.authorization || ''
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : ''
    if (!token) return res.status(401).json({ error: 'Authentication required' })
    try {
      const { data, error } = await supabase.auth.getUser(token)
      if (error || !data?.user) return res.status(401).json({ error: 'Invalid session' })
      req.user = data.user
      next()
    } catch {
      res.status(401).json({ error: 'Authentication failed' })
    }
  }

  router.get('/space/bodies', async (_req,res) => {
    const {data,error}=await supabase.from('celestial_bodies').select('*').order('name')
    if(error)return res.status(500).json({error:error.message})
    res.json({bodies:data||[]})
  })

  router.get('/space/missions', requireUser, async (req,res) => {
    const {data,error}=await supabase.from('space_missions').select('*').eq('user_id',req.user.id).order('started_at',{ascending:false})
    if(error)return res.status(500).json({error:error.message})
    res.json({missions:data||[]})
  })

  router.post('/space/missions', requireUser, async (req,res) => {
    const {destinationSlug,missionType='exploration'}=req.body||{}
    if(!destinationSlug)return res.status(400).json({error:'destinationSlug required'})
    const {data,error}=await supabase.from('space_missions').insert({user_id:req.user.id,destination_slug:destinationSlug,mission_type:missionType,status:'active',state:{phase:'launch'}}).select('*').single()
    if(error)return res.status(500).json({error:error.message})
    res.status(201).json({mission:data})
  })

  router.patch('/space/missions/:id/advance', requireUser, async (req,res) => {
    const current=await supabase.from('space_missions').select('*').eq('id',req.params.id).eq('user_id',req.user.id).maybeSingle()
    if(current.error)return res.status(500).json({error:current.error.message})
    if(!current.data)return res.status(404).json({error:'Mission not found'})
    const m=current.data
    const fuel=Math.max(0,m.fuel-12), oxygen=Math.max(0,m.oxygen-8), supplies=Math.max(0,m.supplies-6), science=m.science+20
    const completed=science>=100||fuel===0||oxygen===0
    const {data,error}=await supabase.from('space_missions').update({fuel,oxygen,supplies,science,status:completed?'completed':'active',state:{phase:completed?'mission-complete':'science-operations'},completed_at:completed?new Date().toISOString():null}).eq('id',m.id).eq('user_id',req.user.id).select('*').single()
    if(error)return res.status(500).json({error:error.message})
    res.json({mission:data})
  })

  router.get('/chrono/scenarios', async (_req,res) => {
    const {data,error}=await supabase.from('chrono_scenarios').select('*').order('era')
    if(error)return res.status(500).json({error:error.message})
    res.json({scenarios:data||[]})
  })

  router.post('/chrono/runs', requireUser, async (req,res) => {
    const {scenarioId}=req.body||{}
    if(!scenarioId)return res.status(400).json({error:'scenarioId required'})
    const {data,error}=await supabase.from('chrono_runs').insert({user_id:req.user.id,scenario_id:scenarioId,status:'active',state:{checkpoint:0}}).select('*').single()
    if(error)return res.status(500).json({error:error.message})
    res.status(201).json({run:data})
  })

  router.get('/biosphere/species', async (_req,res) => {
    const {data,error}=await supabase.from('species_catalog').select('*').order('category').order('common_name')
    if(error)return res.status(500).json({error:error.message})
    res.json({species:data||[]})
  })

  router.post('/biosphere/runs', requireUser, async (req,res) => {
    const {activityType,regionKey='worldwide-1'}=req.body||{}
    const allowed=['photography','tracking','fishing','hunting-simulation','conservation','marine-research']
    if(!allowed.includes(activityType))return res.status(400).json({error:'Invalid activityType'})
    const {data,error}=await supabase.from('wilderness_runs').insert({user_id:req.user.id,activity_type:activityType,region_key:regionKey,status:'active',state:{observations:0}}).select('*').single()
    if(error)return res.status(500).json({error:error.message})
    res.status(201).json({run:data})
  })

  router.get('/city/districts', async (_req,res) => {
    const {data,error}=await supabase.from('city_districts').select('*').order('name')
    if(error)return res.status(500).json({error:error.message})
    res.json({districts:data||[]})
  })

  router.post('/city/activities', requireUser, async (req,res) => {
    const {districtId,activityKey,path}=req.body||{}
    const paths=['street','life-city','kingdom','business','creator','service']
    if(!districtId||!activityKey||!paths.includes(path))return res.status(400).json({error:'districtId, activityKey and valid path required'})
    const {data:errorDistrict}=await supabase.from('city_districts').select('crime_enabled').eq('id',districtId).single()
    if(path==='street'&&!errorDistrict?.crime_enabled)return res.status(400).json({error:'Street/action path disabled in this district'})
    const {data,error}=await supabase.from('city_activities').insert({user_id:req.user.id,district_id:districtId,activity_key:activityKey,path,status:'active',state:{step:1}}).select('*').single()
    if(error)return res.status(500).json({error:error.message})
    res.status(201).json({activity:data})
  })

  router.get('/cafe/digital-twin', async (_req,res) => {
    const {data:cafes,error}=await supabase.from('cafe_locations').select('*').order('name').limit(1)
    if(error)return res.status(500).json({error:error.message})
    const cafe=(cafes||[])[0]
    if(!cafe)return res.json({cafe:null,inventory:[]})
    const inv=await supabase.from('cafe_inventory').select('*').eq('cafe_id',cafe.id).order('category')
    if(inv.error)return res.status(500).json({error:inv.error.message})
    res.json({cafe,inventory:inv.data||[]})
  })

  router.post('/cafe/shifts', requireUser, async (req,res) => {
    const {cafeId,role='operator'}=req.body||{}
    if(!cafeId)return res.status(400).json({error:'cafeId required'})
    const {data,error}=await supabase.from('cafe_shifts').insert({user_id:req.user.id,cafe_id:cafeId,role,status:'active',state:{orders:[]}}).select('*').single()
    if(error)return res.status(500).json({error:error.message})
    res.status(201).json({shift:data})
  })

  router.get('/generations/profile', requireUser, async (req,res) => {
    const {data,error}=await supabase.from('generations_profiles').select('*').eq('user_id',req.user.id).maybeSingle()
    if(error)return res.status(500).json({error:error.message})
    res.json({profile:data||null})
  })

  router.post('/generations/train', requireUser, async (req,res) => {
    const {pathway}=req.body||{}
    if(!pathway)return res.status(400).json({error:'pathway required'})
    const current=await supabase.from('generations_progress').select('*').eq('user_id',req.user.id).eq('pathway',pathway).maybeSingle()
    if(current.error)return res.status(500).json({error:current.error.message})
    const xp=(current.data?.xp||0)+100
    const level=Math.floor(xp/500)+1
    const {data,error}=await supabase.from('generations_progress').upsert({user_id:req.user.id,pathway,xp,level,milestones:current.data?.milestones||[],updated_at:new Date().toISOString()},{onConflict:'user_id,pathway'}).select('*').single()
    if(error)return res.status(500).json({error:error.message})
    res.json({progress:data})
  })

  return router
}

module.exports={createAdvancedWorldsRouter}
