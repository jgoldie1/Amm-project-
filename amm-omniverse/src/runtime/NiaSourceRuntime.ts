export type NiaSourceKind='game'|'creator'|'commerce'|'telecom'|'finance'|'security'|'global'|'faith'|'operations'|'custom'
export type NiaSourceStatus='connected'|'degraded'|'offline'|'simulated'

export type NiaSourceDefinition={
  id:string
  label:string
  kind:NiaSourceKind
  description:string
  status:NiaSourceStatus
  freshnessSeconds:number
  pii:boolean
  owner:string
  metrics:string[]
  dimensions:string[]
  capabilities:string[]
}

export type SemanticMetric={
  id:string
  label:string
  description:string
  unit:'count'|'currency'|'percent'|'seconds'|'score'|'level'|'custom'
  sourceIds:string[]
  aggregation:'sum'|'avg'|'max'|'min'|'last'|'count'
  formula?:string
}

const REGISTRY_KEY='tryamm_niasource_registry_v1'
const METRIC_KEY='tryamm_niasource_metrics_v1'
let installed=false

const BUILTIN_SOURCES:NiaSourceDefinition[]=[
  {id:'streetverse',label:'StreetVerse Living World',kind:'game',description:'Player progression, missions, city travel, performance, world memory, creator moments and community outcomes.',status:'connected',freshnessSeconds:5,pii:false,owner:'TRYAMM GameVerse',metrics:['active_players','mission_completion','avg_level','faith_score','world_fps'],dimensions:['city','country','continent','mode','level','faith_tier'],capabilities:['realtime','event-stream','world-state']},
  {id:'creator',label:'Creator Studio',kind:'creator',description:'Capture, reels, edits, publishing, attribution and creator growth.',status:'connected',freshnessSeconds:15,pii:false,owner:'TRYAMM Creator',metrics:['reels_created','publish_rate','views','engagement','creator_revenue'],dimensions:['creator','format','city','campaign'],capabilities:['realtime','content-lineage','attribution']},
  {id:'commerce',label:'Marketplace & Commerce',kind:'commerce',description:'Marketplace orders, vendors, inventory, conversion and local commerce.',status:'connected',freshnessSeconds:30,pii:false,owner:'TRYAMM Commerce',metrics:['gmv','orders','conversion_rate','active_vendors','avg_order_value'],dimensions:['vendor','category','city','country'],capabilities:['semantic-model','forecast-ready','anomaly-ready']},
  {id:'hologpt',label:'HoloGPT Intelligence',kind:'operations',description:'AI requests, provider health, response quality, latency and automation outcomes.',status:'degraded',freshnessSeconds:15,pii:false,owner:'TRYAMM AI',metrics:['ai_requests','ai_success_rate','ai_latency','provider_availability'],dimensions:['provider','model','feature'],capabilities:['natural-language','agent-ready','quality-gates']},
  {id:'global-city',label:'Global CityVerse',kind:'global',description:'Continent, country, region, city and district context for travel and localization.',status:'connected',freshnessSeconds:60,pii:false,owner:'TRYAMM World',metrics:['city_sessions','country_sessions','travel_events'],dimensions:['continent','country','region','city','district'],capabilities:['geo-hierarchy','localization','culture-context']},
  {id:'faith-life',label:'Faith Life Simulation',kind:'faith',description:'Faith tiers, service, mentorship, community missions and legacy progression.',status:'connected',freshnessSeconds:10,pii:false,owner:'TRYAMM Faith',metrics:['faith_score','faith_tier','service_missions','mentorship_actions'],dimensions:['faith_tier','level','city','mission_type'],capabilities:['progression','mission-context','legacy']},
  {id:'security-guardian',label:'Security Guardian',kind:'security',description:'Community safety, prevention, de-escalation, safe passage and event support outcomes.',status:'connected',freshnessSeconds:10,pii:false,owner:'TRYAMM Security',metrics:['safe_passage_missions','deescalations','protected_events','community_risk_score'],dimensions:['city','district','mission','guardian'],capabilities:['risk-signals','community-outcomes','nonviolent-safety']},
]

const BUILTIN_METRICS:SemanticMetric[]=[
  {id:'platform_health',label:'Platform Health',description:'Composite operational health across runtime, AI, creator and game systems.',unit:'score',sourceIds:['streetverse','creator','hologpt'],aggregation:'last',formula:'weighted(success_rate, availability, fps, latency)'},
  {id:'community_impact',label:'Community Impact',description:'Service, mentorship, safe-passage and positive mission completion.',unit:'score',sourceIds:['faith-life','security-guardian','streetverse'],aggregation:'sum',formula:'service_missions + mentorship_actions + safe_passage_missions + deescalations'},
  {id:'creator_economy',label:'Creator Economy',description:'Creator publishing and revenue activity across TRYAMM.',unit:'currency',sourceIds:['creator','commerce'],aggregation:'sum',formula:'creator_revenue + attributed_gmv'},
  {id:'global_reach',label:'Global Reach',description:'Distinct geographic usage and travel across the global city hierarchy.',unit:'count',sourceIds:['global-city','streetverse'],aggregation:'count',formula:'distinct(continent,country,city)'},
]

function loadSources(){
  try{
    const saved=JSON.parse(localStorage.getItem(REGISTRY_KEY)||'null')
    return Array.isArray(saved)?saved as NiaSourceDefinition[]:BUILTIN_SOURCES
  }catch{return BUILTIN_SOURCES}
}
function loadMetrics(){
  try{
    const saved=JSON.parse(localStorage.getItem(METRIC_KEY)||'null')
    return Array.isArray(saved)?saved as SemanticMetric[]:BUILTIN_METRICS
  }catch{return BUILTIN_METRICS}
}
function save(sources:NiaSourceDefinition[],metrics:SemanticMetric[]){
  try{localStorage.setItem(REGISTRY_KEY,JSON.stringify(sources));localStorage.setItem(METRIC_KEY,JSON.stringify(metrics))}catch{}
}
function publish(sources:NiaSourceDefinition[],metrics:SemanticMetric[]){
  save(sources,metrics)
  window.dispatchEvent(new CustomEvent('tryamm:niasource-state',{detail:{schema:'tryamm.niasource.v1',sources,metrics,features:['semantic-layer','lineage','freshness','pii-flags','quality-status','natural-language-ready','agent-ready','geo-hierarchy','realtime-events'],at:Date.now()}}))
}

export function installNiaSourceRuntime(){
  if(installed||typeof window==='undefined')return
  installed=true
  let sources=loadSources();let metrics=loadMetrics()
  queueMicrotask(()=>publish(sources,metrics))
  window.addEventListener('tryamm:niasource-request',()=>publish(sources,metrics))
  window.addEventListener('tryamm:niasource-register',(event:Event)=>{
    const source=(event as CustomEvent<NiaSourceDefinition>).detail
    if(!source?.id)return
    sources=[...sources.filter(s=>s.id!==source.id),source]
    publish(sources,metrics)
  })
  window.addEventListener('tryamm:niasource-status',(event:Event)=>{
    const d=(event as CustomEvent<{id:string;status:NiaSourceStatus}>).detail
    if(!d?.id)return
    sources=sources.map(s=>s.id===d.id?{...s,status:d.status}:s)
    publish(sources,metrics)
  })
  window.addEventListener('tryamm:niasource-metric-register',(event:Event)=>{
    const metric=(event as CustomEvent<SemanticMetric>).detail
    if(!metric?.id)return
    metrics=[...metrics.filter(m=>m.id!==metric.id),metric]
    publish(sources,metrics)
  })
}
