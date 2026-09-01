import { getAuthenticatedUserId, getSupabaseClient } from './supabaseClient'

function sb() {
  const client = getSupabaseClient()
  if (!client) throw new Error('Supabase not configured')
  return client
}

export interface CelestialBody { id:string; slug:string; name:string; body_type:string; parent_slug:string|null; gravity:number; atmosphere:string; temperature_c:number|null; description:string; metadata:Record<string,unknown> }
export interface SpaceMission { id:string; destination_slug:string; mission_type:string; status:string; fuel:number; oxygen:number; supplies:number; science:number; state:Record<string,unknown> }
export interface ChronoScenario { id:string; slug:string; name:string; era:string; scenario_type:string; evidence_level:string; description:string }
export interface Species { id:string; slug:string; common_name:string; category:string; habitat:string[]; diet:string[]; conservation:string }
export interface WildernessRun { id:string; activity_type:string; region_key:string; status:string; conservation_score:number; state:Record<string,unknown> }
export interface CafeLocation { id:string; slug:string; name:string; city:string; format:string }
export interface CafeInventoryItem { id:string; cafe_id:string; item_key:string; name:string; category:string; quantity:number; reorder_level:number; unit_cost:number; sell_price:number }
export interface GenerationsProgress { id:string; pathway:string; level:number; xp:number; milestones:unknown[] }
export interface CityDistrict { id:string; slug:string; name:string; city_key:string; district_type:string; crime_enabled:boolean; economy:Record<string,unknown>; services:Record<string,unknown> }

async function userId() {
  const id = await getAuthenticatedUserId()
  if (!id) throw new Error('Authentication required')
  return id
}

export async function listCelestialBodies(): Promise<CelestialBody[]> {
  const { data,error } = await sb().from('celestial_bodies').select('*').order('name')
  if (error) throw error
  return (data??[]) as CelestialBody[]
}

export async function listSpaceMissions(): Promise<SpaceMission[]> {
  const id = await userId()
  const { data,error } = await sb().from('space_missions').select('*').eq('user_id',id).order('started_at',{ascending:false})
  if (error) throw error
  return (data??[]) as SpaceMission[]
}

export async function startSpaceMission(destinationSlug:string, missionType='exploration'): Promise<SpaceMission> {
  const id = await userId()
  const { data,error } = await sb().from('space_missions').insert({user_id:id,destination_slug:destinationSlug,mission_type:missionType,status:'active',state:{phase:'launch'}}).select('*').single()
  if (error) throw error
  return data as SpaceMission
}

export async function advanceSpaceMission(mission:SpaceMission): Promise<SpaceMission> {
  const id = await userId()
  const nextFuel=Math.max(0,mission.fuel-12), nextOxygen=Math.max(0,mission.oxygen-8), nextSupplies=Math.max(0,mission.supplies-6)
  const science=mission.science+20
  const complete=science>=100 || nextFuel===0 || nextOxygen===0
  const { data,error } = await sb().from('space_missions').update({fuel:nextFuel,oxygen:nextOxygen,supplies:nextSupplies,science,status:complete?'completed':'active',state:{phase:complete?'mission-complete':'science-operations'},completed_at:complete?new Date().toISOString():null}).eq('id',mission.id).eq('user_id',id).select('*').single()
  if(error) throw error
  return data as SpaceMission
}

export async function listChronoScenarios(): Promise<ChronoScenario[]> {
  const {data,error}=await sb().from('chrono_scenarios').select('*').order('era')
  if(error) throw error
  return (data??[]) as ChronoScenario[]
}

export async function startChronoRun(scenarioId:string) {
  const id=await userId()
  const {data,error}=await sb().from('chrono_runs').insert({user_id:id,scenario_id:scenarioId,status:'active',state:{checkpoint:0}}).select('*,chrono_scenarios(*)').single()
  if(error) throw error
  const scenario=(data as any)?.chrono_scenarios||{}
  if(typeof window!=='undefined')window.dispatchEvent(new CustomEvent('tryamm:chrono-run-started',{detail:{runId:(data as any)?.id,scenarioId,scenario,slug:scenario.slug,name:scenario.name,era:scenario.era,scenarioType:scenario.scenario_type,evidenceLevel:scenario.evidence_level,description:scenario.description,checkpoint:0,returnPoint:'advanced-worlds'}}))
  return data
}

export async function listSpecies(): Promise<Species[]> {
  const {data,error}=await sb().from('species_catalog').select('*').order('category').order('common_name')
  if(error) throw error
  return (data??[]) as Species[]
}

export async function startWildernessRun(activityType:string,regionKey='worldwide-1'): Promise<WildernessRun> {
  const id=await userId()
  const {data,error}=await sb().from('wilderness_runs').insert({user_id:id,activity_type:activityType,region_key:regionKey,status:'active',state:{observations:0}}).select('*').single()
  if(error) throw error
  return data as WildernessRun
}

export async function completeWildernessRun(run:WildernessRun,score:number): Promise<WildernessRun> {
  const id=await userId()
  const {data,error}=await sb().from('wilderness_runs').update({status:'completed',conservation_score:score,state:{...run.state,completed:true},completed_at:new Date().toISOString()}).eq('id',run.id).eq('user_id',id).select('*').single()
  if(error) throw error
  return data as WildernessRun
}

export async function getCafeTwin() {
  const {data:cafes,error}=await sb().from('cafe_locations').select('*').order('name')
  if(error) throw error
  const cafe=(cafes??[])[0] as CafeLocation|undefined
  if(!cafe) return {cafe:null,inventory:[] as CafeInventoryItem[]}
  const {data:inventory,error:ie}=await sb().from('cafe_inventory').select('*').eq('cafe_id',cafe.id).order('category')
  if(ie) throw ie
  return {cafe,inventory:(inventory??[]) as CafeInventoryItem[]}
}

export async function startCafeShift(cafeId:string,role='creator-table') {
  const id=await userId()
  const {data,error}=await sb().from('cafe_shifts').insert({user_id:id,cafe_id:cafeId,role,status:'active',state:{orders:[]}}).select('*').single()
  if(error) throw error
  return data
}

export async function completeCafeShift(shiftId:string,ordersCompleted:number,wasteScore:number,customerScore:number) {
  const id=await userId()
  const {data,error}=await sb().from('cafe_shifts').update({status:'completed',orders_completed:ordersCompleted,waste_score:wasteScore,customer_score:customerScore,completed_at:new Date().toISOString()}).eq('id',shiftId).eq('user_id',id).select('*').single()
  if(error) throw error
  return data
}

export async function getGenerationsProfile() {
  const id=await userId()
  const existing=await sb().from('generations_profiles').select('*').eq('user_id',id).maybeSingle()
  if(existing.error) throw existing.error
  if(existing.data) return existing.data
  const {data,error}=await sb().from('generations_profiles').insert({user_id:id,age_lane:'adult',guardian_required:false,skill_tree:{},legacy_goals:{}}).select('*').single()
  if(error) throw error
  return data
}

export async function listGenerationsProgress(): Promise<GenerationsProgress[]> {
  const id=await userId()
  const {data,error}=await sb().from('generations_progress').select('*').eq('user_id',id).order('pathway')
  if(error) throw error
  return (data??[]) as GenerationsProgress[]
}

export async function trainGenerationsPathway(pathway:string): Promise<GenerationsProgress> {
  const id=await userId()
  const existing=await sb().from('generations_progress').select('*').eq('user_id',id).eq('pathway',pathway).maybeSingle()
  if(existing.error) throw existing.error
  const xp=(existing.data?.xp??0)+100
  const level=Math.floor(xp/500)+1
  const row={user_id:id,pathway,xp,level,milestones:existing.data?.milestones??[] as unknown[] ,updated_at:new Date().toISOString()}
  const {data,error}=await sb().from('generations_progress').upsert(row,{onConflict:'user_id,pathway'}).select('*').single()
  if(error) throw error
  return data as GenerationsProgress
}

export async function listCityDistricts(): Promise<CityDistrict[]> {
  const {data,error}=await sb().from('city_districts').select('*').order('name')
  if(error) throw error
  return (data??[]) as CityDistrict[]
}

export async function startCityActivity(districtId:string,activityKey:string,path:'street'|'life-city'|'kingdom'|'business'|'creator'|'service') {
  const id=await userId()
  const {data,error}=await sb().from('city_activities').insert({user_id:id,district_id:districtId,activity_key:activityKey,path,status:'active',state:{step:1}}).select('*').single()
  if(error) throw error
  return data
}