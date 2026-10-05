import {lanePolicy,type TryammContentLaneId} from '../data/TryammContentLanes'

export type AbracadabraOutput=
  |'WORLD'
  |'MISSION'
  |'BUSINESS'
  |'HISTORY'
  |'HOLO'
  |'AR'
  |'VR'
  |'REEL'
  |'LIVE'
  |'MOD'

export type AbracadabraSpellPlan={
  schema:'tryamm.abracadabra-genii.v2'
  id:string
  createdAt:string
  intent:string
  lane:TryammContentLaneId
  outputs:AbracadabraOutput[]
  title:string
  era:string|null
  weather:string|null
  timeOfDay:string|null
  actors:string[]
  requestedAssets:Array<{kind:'character'|'vehicle'|'building'|'environment'|'prop'|'fx'|'audio';prompt:string;reason:string}>
  cityActions:Array<{kind:'investment'|'incident';districtId:string;action:string;intensity:number}>
  blocked:string[]
  receipts:string[]
  publishMode:'preview-first'
  productionMutation:false
}

type StoredState={history:AbracadabraSpellPlan[];last:AbracadabraSpellPlan|null}

const KEY='tryamm.abracadabra-genii.v2'
const MAX_HISTORY=60
const clean=(v:string)=>v.trim().replace(/s+/g,' ')
const lower=(v:string)=>clean(v).toLowerCase()
const uid=()=>typeof crypto!=='undefined'&&'randomUUID'in crypto?crypto.randomUUID():Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,8)

function readLaneFromContext(intent:string):TryammContentLaneId{
  const q=lower(intent)
  if(/kingdom|yahisrael|faithverse|saints|scripture|heaven on earth/.test(q))return'kingdom-yahisrael'
  if(/new america|action rp|combat lane/.test(q))return'streetverse-global-new-america'
  if(/after dark/.test(q))return'streetverse-after-dark'
  try{
    const stored=String(localStorage.getItem('tryamm.streetverse.content-lane')||'')
    if(['kingdom-yahisrael','faithverse','streetverse-global','streetverse-global-new-america','streetverse-after-dark'].includes(stored))return stored as TryammContentLaneId
  }catch{}
  return'streetverse-global'
}

function outputsFor(intent:string){
  const q=lower(intent)
  const out=new Set<AbracadabraOutput>(['WORLD'])
  if(/mission|quest|job|rescue|investigat|story/.test(q))out.add('MISSION')
  if(/business|store|shop|barber|restaurant|merchant|market/.test(q))out.add('BUSINESS')
  if(/history|historical|past|time machine|199\d|20[0-1]\d|18\d\d|19\d\d/.test(q))out.add('HISTORY')
  if(/holo|hologram|gallery|museum|exhibit/.test(q))out.add('HOLO')
  if(/\bar\b|augmented reality|place on my table|room overlay/.test(q))out.add('AR')
  if(/\bvr\b|virtual reality|headset|immersive/.test(q))out.add('VR')
  if(/reel|short video|clip|capture/.test(q))out.add('REEL')
  if(/live|stream|pk/.test(q))out.add('LIVE')
  if(/mod|crossverse|portable pack/.test(q))out.add('MOD')
  return [...out]
}

function districtFor(intent:string){
  const q=lower(intent)
  if(q.includes('pilsen'))return'pilsen'
  if(q.includes('taylor'))return'taylor-street'
  if(q.includes('roosevelt'))return'roosevelt-square'
  return'circle-park'
}

function parseEra(intent:string){
  const year=intent.match(/\b(1[6-9]\d{2}|20\d{2}|21\d{2})\b/)?.[1]
  if(year)return year
  const q=lower(intent)
  if(/future|cyber|neon/.test(q))return'future'
  if(/present|today|now/.test(q))return'present'
  return null
}

function parseWeather(intent:string){
  const q=lower(intent)
  if(q.includes('rain'))return'rain'
  if(q.includes('snow'))return'snow'
  if(q.includes('storm'))return'storm'
  if(q.includes('fog'))return'fog'
  if(q.includes('sunny'))return'sunny'
  return null
}

function parseTimeOfDay(intent:string){
  const q=lower(intent)
  if(q.includes('night'))return'night'
  if(q.includes('sunset')||q.includes('evening'))return'evening'
  if(q.includes('morning')||q.includes('sunrise'))return'morning'
  if(q.includes('daytime')||q.includes('day '))return'day'
  return null
}

function actorsFor(intent:string){
  const q=lower(intent)
  const actors:string[]=[]
  if(/\bbj\b|bj stubbs/.test(q))actors.push('bj-stubbs')
  if(/police|officer/.test(q))actors.push('public-safety-officers')
  if(/firefighter|fire crew/.test(q))actors.push('fire-rescue')
  if(/ems|paramedic|ambulance/.test(q))actors.push('ems')
  if(/business owner|merchant|store owner/.test(q))actors.push('business-owner')
  if(/resident|people|crowd|community/.test(q))actors.push('residents')
  if(/woman|women|female/.test(q))actors.push('female-residents')
  if(/child|children|family|families/.test(q))actors.push('families')
  return [...new Set(actors)]
}

function requestedAssetsFor(intent:string){
  const q=lower(intent)
  const assets:AbracadabraSpellPlan['requestedAssets']=[]
  if(/bj stubbs/.test(q))assets.push({kind:'character',prompt:'BJ Stubbs hero character using authorized TRYAMM reference',reason:'named-hero'})
  if(/woman|women|female resident/.test(q))assets.push({kind:'character',prompt:'original diverse female StreetVerse resident cast, game-ready, no real-person likeness',reason:'resident-cast'})
  if(/car|vehicle|traffic|police car|ambulance|firetruck/.test(q))assets.push({kind:'vehicle',prompt:'appropriate original or licensed StreetVerse vehicles for the requested scene',reason:'mobility'})
  if(/building|storefront|apartment|school|church|house/.test(q))assets.push({kind:'building',prompt:'original or licensed architecture matching gameplay function and district context',reason:'world-architecture'})
  if(/tree|bench|hydrant|dumpster|streetlight|traffic light/.test(q))assets.push({kind:'prop',prompt:'reuse pinned CC0 StreetVerse street props before generating new assets',reason:'free-asset-reuse'})
  if(/rain|snow|fog|storm|neon|hologram/.test(q))assets.push({kind:'fx',prompt:'non-destructive visual FX layer for requested environment conditions',reason:'visual-fx'})
  return assets
}

function cityActionsFor(intent:string){
  const q=lower(intent)
  const districtId=districtFor(intent)
  const actions:AbracadabraSpellPlan['cityActions']=[]
  if(/business|store|shop|restaurant|barber/.test(q))actions.push({kind:'investment',districtId,action:'business',intensity:.035})
  if(/school|education|classroom/.test(q))actions.push({kind:'investment',districtId,action:'education',intensity:.03})
  if(/park|basketball|playground|green space/.test(q))actions.push({kind:'investment',districtId,action:'park',intensity:.025})
  if(/road|traffic|transit|intersection/.test(q))actions.push({kind:'investment',districtId,action:'roads',intensity:.025})
  if(/police|public safety|security/.test(q))actions.push({kind:'investment',districtId,action:'police',intensity:.025})
  if(/fire station|fire coverage|rescue/.test(q))actions.push({kind:'investment',districtId,action:'fire',intensity:.025})
  if(/crime|shooting|robbery/.test(q))actions.push({kind:'incident',districtId,action:'crime',intensity:.05})
  if(/fire|burning building/.test(q))actions.push({kind:'incident',districtId,action:'fire',intensity:.05})
  return actions
}

function policyBlocks(intent:string,lane:TryammContentLaneId){
  const q=lower(intent)
  const policy=lanePolicy(lane)
  const blocked:string[]=[]
  if(/weapon|gun|shoot|combat|fight/.test(q)&&!policy.combatAllowed)blocked.push('combat-not-allowed-in-'+lane)
  if(/after dark|nightlife|adult lane/.test(q)&&!policy.afterDarkAllowed)blocked.push('after-dark-not-allowed-in-'+lane)
  if(/explicit sexual|porn|sex scene/.test(q)&&!policy.adultThemesAllowed)blocked.push('adult-content-not-allowed-in-'+lane)
  if(policy.setApart&&/gambling|casino|intoxicant/.test(q))blocked.push('set-apart-kingdom-policy')
  return blocked
}

export function compileAbracadabraSpell(intentRaw:string):AbracadabraSpellPlan{
  const intent=clean(intentRaw)
  const lane=readLaneFromContext(intent)
  const blocked=policyBlocks(intent,lane)
  const era=parseEra(intent)
  return{
    schema:'tryamm.abracadabra-genii.v2',
    id:'abracadabra-'+uid(),
    createdAt:new Date().toISOString(),
    intent,
    lane,
    outputs:outputsFor(intent),
    title:intent.slice(0,96)||'Untitled Abracadabra World Spell',
    era,
    weather:parseWeather(intent),
    timeOfDay:parseTimeOfDay(intent),
    actors:actorsFor(intent),
    requestedAssets:requestedAssetsFor(intent),
    cityActions:cityActionsFor(intent),
    blocked,
    receipts:['intent-captured','lane-policy-checked','free-assets-first','preview-first'],
    publishMode:'preview-first',
    productionMutation:false,
  }
}

function readState():StoredState{
  try{
    const raw=JSON.parse(localStorage.getItem(KEY)||'null')
    return{history:Array.isArray(raw?.history)?raw.history.slice(-MAX_HISTORY):[],last:raw?.last||null}
  }catch{return{history:[],last:null}}
}
function saveState(state:StoredState){try{localStorage.setItem(KEY,JSON.stringify({history:state.history.slice(-MAX_HISTORY),last:state.last}))}catch{}}

function emit(name:string,detail:unknown){window.dispatchEvent(new CustomEvent(name,{detail}))}

function executePlan(plan:AbracadabraSpellPlan){
  if(plan.blocked.length){
    emit('tryamm:abracadabra-blocked',{plan})
    return
  }
  emit('tryamm:content-lane-change',{detail:{lane:plan.lane,source:'abracadabra-genii'}})
  for(const action of plan.cityActions){
    emit(action.kind==='investment'?'tryamm:city-investment':'tryamm:city-incident',{
      districtId:action.districtId,
      kind:action.action,
      intensity:action.intensity,
      severity:action.intensity,
      source:'abracadabra-genii',
      spellId:plan.id,
    })
  }
  for(const asset of plan.requestedAssets){
    emit('tryamm:holoforge-request',{
      kind:asset.kind,
      prompt:asset.prompt+' • Source intent: '+plan.intent,
      tags:['abracadabra-genii','preview-first','free-assets-first',plan.lane],
      priority:'normal',
      previewOnly:true,
      requirements:{spellId:plan.id,reason:asset.reason,productionMutation:false,rightsReviewRequired:true},
    })
  }
  if(plan.outputs.includes('MISSION'))emit('tryamm:streetverse-mission-start',{detail:{
    id:plan.id+':mission',
    missionId:plan.id+':mission',
    title:'Abracadabra • '+plan.title,
    objective:plan.intent,
    source:'abracadabra-genii',
    dynamic:true,
  }})
  if(plan.outputs.includes('HISTORY'))emit('tryamm:time-machine-world-foundry-request',{detail:{
    id:plan.id,
    title:plan.title,
    era:plan.era||'unspecified',
    mode:'RECONSTRUCTION',
    description:plan.intent,
    objective:'Compile an evidence-labeled interactive scene from the Abracadabra intent.',
    source:'abracadabra-genii',
    cityId:'chicago',
    neighborhoodId:districtFor(plan.intent),
    autoPreview:true,
  }})
  if(plan.outputs.includes('HOLO')||plan.outputs.includes('AR')||plan.outputs.includes('VR')){
    emit('tryamm:holo-city-open',{detail:{source:'abracadabra-genii',spellId:plan.id,district:districtFor(plan.intent)}})
    emit('tryamm:omnifabric-job-request',{detail:{id:plan.id,lane:'render',kind:'abracadabra-world-preview',priority:'interactive',payload:plan}})
  }
  if(plan.outputs.includes('AR'))emit('tryamm:mod-pass-ar-place',{detail:{modId:'tryamm.west-side-cc0-starter',placementId:'place-tree',source:'abracadabra-genii'}})
  if(plan.outputs.includes('REEL'))emit('tryamm:open-reel-creator',{detail:{source:'abracadabra-genii',spellId:plan.id,title:plan.title,context:plan.intent}})
  if(plan.outputs.includes('MOD'))emit('tryamm:crossverse-mod-export',{detail:{id:'tryamm.west-side-cc0-starter',adapterId:'tryamm-native',source:'abracadabra-genii'}})
  if(/future|cyber|neon/i.test(plan.intent))emit('tryamm:neon-future-set',{detail:{enabled:true,source:'abracadabra-genii'}})
  if(plan.weather)emit('tryamm:abracadabra-weather-request',{detail:{weather:plan.weather,spellId:plan.id,source:'abracadabra-genii'}})
  if(plan.timeOfDay)emit('tryamm:abracadabra-time-request',{detail:{timeOfDay:plan.timeOfDay,spellId:plan.id,source:'abracadabra-genii'}})
  emit('tryamm:omnibox-save-request',{detail:{origin:'abracadabra-genii',contentId:plan.id,kind:'world-spell-receipt',payload:plan}})
  emit('tryamm:abracadabra-executed',{plan})
}

export function installAbracadabraGeniiRuntime(){
  if(typeof window==='undefined')return()=>{}
  const w=window as typeof window&{__TRYAMM_ABRACADABRA_GENII__?:{version:string;cast:(intent:string)=>AbracadabraSpellPlan;history:()=>AbracadabraSpellPlan[]}}
  if(w.__TRYAMM_ABRACADABRA_GENII__)return()=>{}
  let state=readState()

  const cast=(intent:string)=>{
    const plan=compileAbracadabraSpell(intent)
    state={history:[...state.history,plan].slice(-MAX_HISTORY),last:plan}
    saveState(state)
    emit('tryamm:abracadabra-plan',{plan})
    executePlan(plan)
    return plan
  }
  const onCast=(event:Event)=>{
    const d=(event as CustomEvent<{intent?:string}>).detail||{}
    if(d.intent)cast(String(d.intent))
  }
  const onRequest=()=>emit('tryamm:abracadabra-state',{history:state.history,last:state.last})

  addEventListener('tryamm:abracadabra-cast',onCast)
  addEventListener('tryamm:abracadabra-request-state',onRequest)
  w.__TRYAMM_ABRACADABRA_GENII__={version:'2.0.0',cast,history:()=>[...state.history]}
  emit('tryamm:abracadabra-ready',{
    version:'2.0.0',
    realitySpellCompiler:true,
    lanePolicy:true,
    freeAssetsFirst:true,
    holoForge:true,
    timeMachine:true,
    citySimulation:true,
    rpg:true,
    modPass:true,
    arVrHolo:true,
    omniboxReceipts:true,
    productionMutation:false,
  })
  return()=>{
    removeEventListener('tryamm:abracadabra-cast',onCast)
    removeEventListener('tryamm:abracadabra-request-state',onRequest)
    delete w.__TRYAMM_ABRACADABRA_GENII__
  }
}
