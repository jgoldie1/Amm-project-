export type StreetVerseDistrictId='circle-park'|'roosevelt-square'|'taylor-street'|'pilsen'

export type StreetVerseCityDistrict={
  id:StreetVerseDistrictId
  label:string
  population:number
  jobs:number
  businesses:number
  housingUnits:number
  roadCapacity:number
  roadConnectivity:number
  power:number
  safety:number
  fireCoverage:number
  health:number
  education:number
  parks:number
  cleanliness:number
  traffic:number
  landValue:number
  happiness:number
  housingDemand:number
  businessDemand:number
}

export type StreetVerseCitySimulationState={
  version:1
  tick:number
  month:number
  year:number
  treasury:number
  taxRate:number
  revenue:number
  upkeep:number
  netFlow:number
  population:number
  jobs:number
  businesses:number
  unemployment:number
  traffic:number
  landValue:number
  happiness:number
  districts:Record<StreetVerseDistrictId,StreetVerseCityDistrict>
  updatedAt:string
}

export type StreetVerseCityInvestmentKind='housing'|'business'|'roads'|'power'|'police'|'fire'|'health'|'education'|'park'|'cleanup'
export type StreetVerseCityIncidentKind='crime'|'fire'|'outage'|'traffic'|'blight'

const SAVE_KEY='tryamm.streetverse.city-sim.v1'
const TICK_MS=8000
const clamp=(v:number,min=0,max=1)=>Math.max(min,Math.min(max,v))
const finite=(v:unknown,fallback:number)=>Number.isFinite(Number(v))?Number(v):fallback
const round=(v:number,digits=2)=>Number(v.toFixed(digits))

function district(id:StreetVerseDistrictId,label:string,seed:number):StreetVerseCityDistrict{
  return {
    id,label,
    population:Math.round(420+seed*180),
    jobs:Math.round(190+seed*120),
    businesses:Math.round(18+seed*9),
    housingUnits:Math.round(260+seed*90),
    roadCapacity:Math.round(820+seed*260),
    roadConnectivity:clamp(.82+seed*.035),
    power:.88,
    safety:clamp(.66+seed*.025),
    fireCoverage:clamp(.58+seed*.03),
    health:clamp(.61+seed*.025),
    education:clamp(.57+seed*.03),
    parks:clamp(.50+seed*.04),
    cleanliness:clamp(.63+seed*.025),
    traffic:.28,
    landValue:.48,
    happiness:.62,
    housingDemand:.52,
    businessDemand:.45,
  }
}

export function createInitialStreetVerseCitySimulation():StreetVerseCitySimulationState{
  const districts={
    'circle-park':district('circle-park','Circle Park / ABLA',1),
    'roosevelt-square':district('roosevelt-square','Roosevelt Square',2),
    'taylor-street':district('taylor-street','Taylor Street',3),
    'pilsen':district('pilsen','Pilsen Arts Corridor',4),
  } satisfies Record<StreetVerseDistrictId,StreetVerseCityDistrict>
  return recompute({
    version:1,
    tick:0,
    month:10,
    year:2026,
    treasury:25000,
    taxRate:.09,
    revenue:0,
    upkeep:0,
    netFlow:0,
    population:0,
    jobs:0,
    businesses:0,
    unemployment:0,
    traffic:0,
    landValue:0,
    happiness:0,
    districts,
    updatedAt:new Date().toISOString(),
  })
}

function cloneState(state:StreetVerseCitySimulationState):StreetVerseCitySimulationState{
  return {
    ...state,
    districts:Object.fromEntries(
      Object.entries(state.districts).map(([key,value])=>[key,{...value}]),
    ) as Record<StreetVerseDistrictId,StreetVerseCityDistrict>,
  }
}

function normalizeDistrict(d:StreetVerseCityDistrict){
  d.population=Math.max(0,Math.round(d.population))
  d.jobs=Math.max(0,Math.round(d.jobs))
  d.businesses=Math.max(0,Math.round(d.businesses))
  d.housingUnits=Math.max(1,Math.round(d.housingUnits))
  d.roadCapacity=Math.max(1,Math.round(d.roadCapacity))
  d.roadConnectivity=clamp(d.roadConnectivity)
  d.power=clamp(d.power)
  d.safety=clamp(d.safety)
  d.fireCoverage=clamp(d.fireCoverage)
  d.health=clamp(d.health)
  d.education=clamp(d.education)
  d.parks=clamp(d.parks)
  d.cleanliness=clamp(d.cleanliness)
}

function recomputeDistrict(d:StreetVerseCityDistrict){
  normalizeDistrict(d)
  const service=(d.safety+d.fireCoverage+d.health+d.education+d.parks+d.cleanliness)/6
  const workers=d.population*.48
  const employmentRatio=workers>0?clamp(d.jobs/workers):1
  const housingPressure=d.housingUnits>0?d.population/(d.housingUnits*2.15):0
  d.traffic=clamp((d.population*.55+d.jobs*.72)/(d.roadCapacity*1.65))
  d.landValue=clamp(
    .20+
    service*.30+
    d.roadConnectivity*.14+
    d.power*.10+
    d.parks*.12+
    d.cleanliness*.09-
    d.traffic*.18
  )
  d.happiness=clamp(
    .20+
    service*.36+
    employmentRatio*.16+
    d.landValue*.14+
    d.power*.10-
    d.traffic*.12-
    Math.max(0,housingPressure-1)*.16
  )
  d.housingDemand=clamp(
    .38+
    Math.max(0,d.jobs-workers)*.0016+
    d.happiness*.28+
    d.landValue*.14-
    Math.max(0,housingPressure-.9)*.38
  )
  d.businessDemand=clamp(
    .30+
    d.population*.00042+
    d.landValue*.22+
    d.roadConnectivity*.16-
    d.businesses*.008-
    d.traffic*.12
  )
  d.traffic=round(d.traffic,4)
  d.landValue=round(d.landValue,4)
  d.happiness=round(d.happiness,4)
  d.housingDemand=round(d.housingDemand,4)
  d.businessDemand=round(d.businessDemand,4)
}

function recompute(state:StreetVerseCitySimulationState):StreetVerseCitySimulationState{
  for(const d of Object.values(state.districts))recomputeDistrict(d)
  const districts=Object.values(state.districts)
  state.population=districts.reduce((sum,d)=>sum+d.population,0)
  state.jobs=districts.reduce((sum,d)=>sum+d.jobs,0)
  state.businesses=districts.reduce((sum,d)=>sum+d.businesses,0)
  const workers=state.population*.48
  state.unemployment=round(workers>0?clamp(1-state.jobs/workers):0,4)
  state.traffic=round(districts.reduce((sum,d)=>sum+d.traffic,0)/districts.length,4)
  state.landValue=round(districts.reduce((sum,d)=>sum+d.landValue,0)/districts.length,4)
  state.happiness=round(districts.reduce((sum,d)=>sum+d.happiness,0)/districts.length,4)
  state.revenue=round((state.population*.72+state.jobs*.93+state.businesses*18)*(state.taxRate/.09),2)
  state.upkeep=round(districts.reduce((sum,d)=>sum+
    d.roadCapacity*.012+
    (d.safety+d.fireCoverage+d.health+d.education+d.parks)*130,0),2)
  state.netFlow=round(state.revenue-state.upkeep,2)
  state.updatedAt=new Date().toISOString()
  return state
}

export function evolveStreetVerseCityMonth(state:StreetVerseCitySimulationState){
  for(const d of Object.values(state.districts)){
    const service=(d.safety+d.fireCoverage+d.health+d.education)/4
    const popDelta=(d.housingDemand-.48)*12+(d.happiness-.55)*8+(d.roadConnectivity-.75)*4
    d.population=Math.max(0,d.population+Math.round(popDelta))
    const businessDelta=(d.businessDemand-.5)*1.8+(d.landValue-.5)*.8
    if(businessDelta>.55)d.businesses+=1
    else if(businessDelta<-.65&&d.businesses>1)d.businesses-=1
    const targetJobs=d.businesses*11+Math.round(d.population*.14*(.55+service*.45))
    d.jobs=Math.max(0,Math.round(d.jobs+(targetJobs-d.jobs)*.12))
    if(d.housingDemand>.68)d.housingUnits+=2
    if(d.housingDemand<.22&&d.housingUnits>100)d.housingUnits-=1
    d.cleanliness=clamp(d.cleanliness+(d.traffic>.7?-.008:.004))
  }
  state.tick+=1
  state.month+=1
  if(state.month>12){state.month=1;state.year+=1}
  recompute(state)
  state.treasury=round(state.treasury+state.netFlow,2)
  return state
}

export function applyStreetVerseCityInvestment(
  state:StreetVerseCitySimulationState,
  districtId:StreetVerseDistrictId,
  kind:StreetVerseCityInvestmentKind,
  intensity=.08,
){
  const d=state.districts[districtId]
  if(!d)return state
  const amount=clamp(finite(intensity,.08),.01,.35)
  if(kind==='housing')d.housingUnits+=Math.round(12+amount*80)
  if(kind==='business')d.businesses+=Math.max(1,Math.round(amount*12))
  if(kind==='roads'){d.roadCapacity+=Math.round(90+amount*500);d.roadConnectivity=clamp(d.roadConnectivity+amount*.55)}
  if(kind==='power')d.power=clamp(d.power+amount)
  if(kind==='police')d.safety=clamp(d.safety+amount)
  if(kind==='fire')d.fireCoverage=clamp(d.fireCoverage+amount)
  if(kind==='health')d.health=clamp(d.health+amount)
  if(kind==='education')d.education=clamp(d.education+amount)
  if(kind==='park')d.parks=clamp(d.parks+amount)
  if(kind==='cleanup')d.cleanliness=clamp(d.cleanliness+amount)
  return recompute(state)
}

export function applyStreetVerseCityIncident(
  state:StreetVerseCitySimulationState,
  districtId:StreetVerseDistrictId,
  kind:StreetVerseCityIncidentKind,
  severity=.1,
){
  const d=state.districts[districtId]
  if(!d)return state
  const amount=clamp(finite(severity,.1),.01,.35)
  if(kind==='crime')d.safety=clamp(d.safety-amount)
  if(kind==='fire'){d.fireCoverage=clamp(d.fireCoverage-amount*.35);d.cleanliness=clamp(d.cleanliness-amount*.3)}
  if(kind==='outage')d.power=clamp(d.power-amount)
  if(kind==='traffic')d.roadCapacity=Math.max(120,Math.round(d.roadCapacity*(1-amount*.35)))
  if(kind==='blight'){d.cleanliness=clamp(d.cleanliness-amount);d.housingUnits=Math.max(80,d.housingUnits-Math.round(amount*15))}
  return recompute(state)
}

function load():StreetVerseCitySimulationState{
  if(typeof window==='undefined')return createInitialStreetVerseCitySimulation()
  try{
    const raw=JSON.parse(localStorage.getItem(SAVE_KEY)||'null')
    if(raw?.version===1&&raw?.districts){
      const next=createInitialStreetVerseCitySimulation()
      next.tick=finite(raw.tick,0)
      next.month=Math.max(1,Math.min(12,Math.round(finite(raw.month,10))))
      next.year=Math.max(2026,Math.round(finite(raw.year,2026)))
      next.treasury=Math.max(0,finite(raw.treasury,25000))
      next.taxRate=clamp(finite(raw.taxRate,.09),.02,.20)
      for(const id of Object.keys(next.districts) as StreetVerseDistrictId[]){
        const incoming=raw.districts?.[id]
        if(incoming)next.districts[id]={...next.districts[id],...incoming,id,label:next.districts[id].label}
      }
      return recompute(next)
    }
  }catch{}
  return createInitialStreetVerseCitySimulation()
}

function save(state:StreetVerseCitySimulationState){
  if(typeof window==='undefined')return
  try{localStorage.setItem(SAVE_KEY,JSON.stringify(state))}catch{}
}

function emit(state:StreetVerseCitySimulationState,reason:string){
  if(typeof window==='undefined')return
  const snapshot=cloneState(state)
  window.dispatchEvent(new CustomEvent('tryamm:city-simulation-state',{detail:{...snapshot,reason}}))
  window.dispatchEvent(new CustomEvent('tryamm:city-simulation-pulse',{detail:{
    reason,
    tick:snapshot.tick,
    population:snapshot.population,
    jobs:snapshot.jobs,
    businesses:snapshot.businesses,
    unemployment:snapshot.unemployment,
    traffic:snapshot.traffic,
    landValue:snapshot.landValue,
    happiness:snapshot.happiness,
    treasury:snapshot.treasury,
    netFlow:snapshot.netFlow,
  }}))
}

function resolveDistrict(detail:Record<string,unknown>):StreetVerseDistrictId{
  const raw=String(detail.districtId||detail.placeId||detail.missionId||detail.id||detail.label||'').toLowerCase()
  if(raw.includes('pilsen'))return'pilsen'
  if(raw.includes('taylor'))return'taylor-street'
  if(raw.includes('roosevelt'))return'roosevelt-square'
  return'circle-park'
}

export function installStreetVerseCitySimulation(){
  let state=load()
  let disposed=false
  const publish=(reason:string)=>{recompute(state);save(state);emit(state,reason)}
  const invest=(districtId:StreetVerseDistrictId,kind:StreetVerseCityInvestmentKind,intensity=.08)=>{
    state=applyStreetVerseCityInvestment(state,districtId,kind,intensity);publish('investment')
  }
  const incident=(districtId:StreetVerseDistrictId,kind:StreetVerseCityIncidentKind,severity=.1)=>{
    state=applyStreetVerseCityIncident(state,districtId,kind,severity);publish('incident')
  }

  const onInvestment=(event:Event)=>{
    const d=(event as CustomEvent<Record<string,unknown>>).detail||{}
    const kind=String(d.kind||'business') as StreetVerseCityInvestmentKind
    if(!['housing','business','roads','power','police','fire','health','education','park','cleanup'].includes(kind))return
    invest(resolveDistrict(d),kind,finite(d.intensity,.08))
  }
  const onIncident=(event:Event)=>{
    const d=(event as CustomEvent<Record<string,unknown>>).detail||{}
    const kind=String(d.kind||'crime') as StreetVerseCityIncidentKind
    if(!['crime','fire','outage','traffic','blight'].includes(kind))return
    incident(resolveDistrict(d),kind,finite(d.severity,.1))
  }
  const onMissionComplete=(event:Event)=>{
    const d=(event as CustomEvent<Record<string,unknown>>).detail||{}
    const district=resolveDistrict(d)
    const text=JSON.stringify(d).toLowerCase()
    if(text.includes('school'))invest(district,'education',.035)
    else if(text.includes('fire')||text.includes('rescue'))invest(district,'fire',.035)
    else if(text.includes('police')||text.includes('safety'))invest(district,'police',.035)
    else if(text.includes('repair')||text.includes('road')||text.includes('ride'))invest(district,'roads',.025)
    else if(text.includes('park')||text.includes('basketball')||text.includes('pool'))invest(district,'park',.025)
    else invest(district,'business',.02)
  }
  const onStructureFire=(event:Event)=>{
    const d=(event as CustomEvent<Record<string,unknown>>).detail||{}
    if(d.burning===true)incident(resolveDistrict(d),'fire',.06)
  }
  const onSafetyIncident=(event:Event)=>{
    const d=(event as CustomEvent<Record<string,unknown>>).detail||{}
    const text=String(d.kind||'').toLowerCase()
    if(text.includes('gun')||text.includes('crime')||text.includes('shoot'))incident(resolveDistrict(d),'crime',.05)
  }
  const onBusinessAdded=(event:Event)=>{
    const d=(event as CustomEvent<Record<string,unknown>>).detail||{}
    invest(resolveDistrict(d),'business',.035)
  }
  const onGameplayAction=(event:Event)=>{
    const d=(event as CustomEvent<Record<string,unknown>>).detail||{}
    const action=String(d.action||'')
    const district=resolveDistrict(d)
    if(action==='open-business')invest(district,'business',.04)
    else if(action==='complete-delivery')invest(district,'roads',.018)
    else if(action==='complete-transit-mission')invest(district,'roads',.03)
    else if(action==='host-creator-event'){invest(district,'business',.018);invest(district,'park',.012)}
    else if(action==='public-safety-mission')invest(district,'police',.03)
  }

  if(typeof window!=='undefined'){
    addEventListener('tryamm:city-investment',onInvestment)
    addEventListener('tryamm:city-incident',onIncident)
    addEventListener('tryamm:streetverse-mission-complete',onMissionComplete)
    addEventListener('tryamm:streetverse-structure-fire-state',onStructureFire)
    addEventListener('tryamm:circle-park-safety-incident',onSafetyIncident)
    addEventListener('tryamm:business-passport-created',onBusinessAdded)
    addEventListener('tryamm:streetverse-gameplay-action',onGameplayAction)
  }

  const timer=typeof window!=='undefined'?window.setInterval(()=>{
    if(disposed)return
    state=evolveStreetVerseCityMonth(state)
    save(state)
    emit(state,'monthly-tick')
  },TICK_MS):0

  publish('startup')

  return {
    getState:()=>cloneState(state),
    invest,
    incident,
    tick:()=>{
      state=evolveStreetVerseCityMonth(state)
      publish('manual-tick')
      return cloneState(state)
    },
    dispose:()=>{
      disposed=true
      if(timer)window.clearInterval(timer)
      removeEventListener('tryamm:city-investment',onInvestment)
      removeEventListener('tryamm:city-incident',onIncident)
      removeEventListener('tryamm:streetverse-mission-complete',onMissionComplete)
      removeEventListener('tryamm:streetverse-structure-fire-state',onStructureFire)
      removeEventListener('tryamm:circle-park-safety-incident',onSafetyIncident)
      removeEventListener('tryamm:business-passport-created',onBusinessAdded)
      removeEventListener('tryamm:streetverse-gameplay-action',onGameplayAction)
    },
  }
}
