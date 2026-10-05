import {lanePolicy,isLaneAllowedForAudience,type TryammContentLaneId} from '../data/TryammContentLanes'

export type StreetVerseCombatWeaponId='arc-sidearm'|'pulse-carbine'|'scatter-blaster'|'stun-projector'
export type StreetVerseCombatWeapon=Readonly<{
  id:StreetVerseCombatWeaponId
  label:string
  class:'sidearm'|'carbine'|'scatter'|'stun'
  magazine:number
  reserve:number
  cooldownMs:number
  impact:'stylized'|'stun'
  nonGraphic:true
}>

export const STREETVERSE_FICTIONAL_WEAPONS:Readonly<Record<StreetVerseCombatWeaponId,StreetVerseCombatWeapon>>={
  'arc-sidearm':{id:'arc-sidearm',label:'ARC SIDEARM',class:'sidearm',magazine:12,reserve:48,cooldownMs:420,impact:'stylized',nonGraphic:true},
  'pulse-carbine':{id:'pulse-carbine',label:'PULSE CARBINE',class:'carbine',magazine:24,reserve:96,cooldownMs:160,impact:'stylized',nonGraphic:true},
  'scatter-blaster':{id:'scatter-blaster',label:'SCATTER BLASTER',class:'scatter',magazine:6,reserve:30,cooldownMs:760,impact:'stylized',nonGraphic:true},
  'stun-projector':{id:'stun-projector',label:'STUN PROJECTOR',class:'stun',magazine:8,reserve:40,cooldownMs:650,impact:'stun',nonGraphic:true},
} as const

type CombatState={
  lane:TryammContentLaneId
  enabled:boolean
  audienceBand:string|null
  safeZone:string|null
  equipped:StreetVerseCombatWeaponId
  ammo:number
  reserve:number
  lastFireAt:number
}

const SAFE_ZONES=new Set(['campus-safe-zone','hospital-safe-zone','faithverse-safe-zone','kingdom-yahisrael','spawn-safe-zone','school-safe-zone'])
const BAND_KEY='tryamm.audience.profile.v1'
const COMBAT_KEY='tryamm.streetverse.combat.v1'

const readBand=()=>{
  try{return String(JSON.parse(localStorage.getItem(BAND_KEY)||'null')?.band||'')||null}catch{return null}
}
const readLane=():TryammContentLaneId=>{
  try{
    const params=new URLSearchParams(location.search)
    if(params.get('lane')==='new-america')return'streetverse-global-new-america'
    const stored=String(localStorage.getItem('tryamm.streetverse.content-lane')||'')
    if(stored==='streetverse-global-new-america')return stored
  }catch{}
  return'streetverse-global'
}

function freshState():CombatState{
  const lane=readLane()
  const weapon=STREETVERSE_FICTIONAL_WEAPONS['arc-sidearm']
  return{lane,enabled:false,audienceBand:readBand(),safeZone:null,equipped:weapon.id,ammo:weapon.magazine,reserve:weapon.reserve,lastFireAt:0}
}

function loadState(){
  const base=freshState()
  try{
    const raw=JSON.parse(localStorage.getItem(COMBAT_KEY)||'null')
    if(!raw)return base
    const id=(raw.equipped in STREETVERSE_FICTIONAL_WEAPONS?raw.equipped:'arc-sidearm') as StreetVerseCombatWeaponId
    const weapon=STREETVERSE_FICTIONAL_WEAPONS[id]
    return{...base,equipped:id,ammo:Math.max(0,Math.min(weapon.magazine,Number(raw.ammo)||weapon.magazine)),reserve:Math.max(0,Number(raw.reserve)||weapon.reserve)}
  }catch{return base}
}

function save(state:CombatState){
  try{localStorage.setItem(COMBAT_KEY,JSON.stringify({equipped:state.equipped,ammo:state.ammo,reserve:state.reserve}))}catch{}
}
function allowed(state:CombatState){
  const policy=lanePolicy(state.lane)
  return policy.weaponsAllowed&&policy.combatAllowed&&isLaneAllowedForAudience(state.lane,state.audienceBand||undefined)&&!SAFE_ZONES.has(String(state.safeZone||''))
}
function emit(state:CombatState,reason:string){
  const policy=lanePolicy(state.lane)
  window.dispatchEvent(new CustomEvent('tryamm:combat-state',{detail:{
    ...state,
    allowed:allowed(state),
    reason,
    policy:{weaponsAllowed:policy.weaponsAllowed,combatAllowed:policy.combatAllowed,realisticGoreAllowed:policy.realisticGoreAllowed},
    fictionalOnly:true,
    nonGraphic:true,
    realWorldInstruction:false,
  }}))
}

export function installStreetVerseCombatGameplayRuntime(){
  if(typeof window==='undefined')return()=>{}
  let state=loadState()
  const refresh=()=>{state.lane=readLane();state.audienceBand=readBand();state.enabled=allowed(state);emit(state,'refresh')}

  const equip=(id:StreetVerseCombatWeaponId)=>{
    if(!(id in STREETVERSE_FICTIONAL_WEAPONS))return false
    state.equipped=id
    const weapon=STREETVERSE_FICTIONAL_WEAPONS[id]
    state.ammo=Math.min(state.ammo||weapon.magazine,weapon.magazine)
    state.reserve=Math.max(state.reserve,weapon.reserve)
    save(state);emit(state,'equip');return true
  }

  const reload=()=>{
    const weapon=STREETVERSE_FICTIONAL_WEAPONS[state.equipped]
    if(!allowed(state))return false
    const needed=Math.max(0,weapon.magazine-state.ammo)
    const moved=Math.min(needed,state.reserve)
    state.ammo+=moved;state.reserve-=moved
    save(state);emit(state,'reload');return moved>0
  }

  const fire=(detail:Record<string,unknown>={})=>{
    const weapon=STREETVERSE_FICTIONAL_WEAPONS[state.equipped]
    const now=Date.now()
    if(!allowed(state)){emit(state,'blocked');return false}
    if(state.ammo<=0){emit(state,'empty');return false}
    if(now-state.lastFireAt<weapon.cooldownMs)return false
    state.lastFireAt=now
    state.ammo-=1
    save(state)
    window.dispatchEvent(new CustomEvent('tryamm:combat-shot',{detail:{
      weaponId:weapon.id,
      weaponClass:weapon.class,
      impact:weapon.impact,
      nonGraphic:true,
      fictional:true,
      source:'streetverse-new-america-rp',
      targetId:String(detail.targetId||''),
      serverVerificationRequired:true,
    }}))
    window.dispatchEvent(new CustomEvent('tryamm:rpg-combat-action',{detail:{weaponId:weapon.id,heat:weapon.impact==='stun'?1:2,source:'streetverse-new-america-rp'}}))
    emit(state,'fire')
    return true
  }

  const onEquip=(event:Event)=>equip(String((event as CustomEvent<{weaponId?:string}>).detail?.weaponId||'') as StreetVerseCombatWeaponId)
  const onReload=()=>reload()
  const onFire=(event:Event)=>fire((event as CustomEvent<Record<string,unknown>>).detail||{})
  const onZone=(event:Event)=>{state.safeZone=String((event as CustomEvent<{zoneId?:string}>).detail?.zoneId||'')||null;refresh()}
  const onAudience=()=>refresh()
  const onLane=(event:Event)=>{
    const lane=String((event as CustomEvent<{lane?:string}>).detail?.lane||'') as TryammContentLaneId
    if(lane in ({'kingdom-yahisrael':1,faithverse:1,'streetverse-global':1,'streetverse-global-new-america':1,'streetverse-after-dark':1} as Record<string,number>)){
      state.lane=lane
      try{localStorage.setItem('tryamm.streetverse.content-lane',lane)}catch{}
    }
    refresh()
  }

  addEventListener('tryamm:combat-equip',onEquip)
  addEventListener('tryamm:combat-reload',onReload)
  addEventListener('tryamm:combat-fire-request',onFire)
  addEventListener('tryamm:combat-zone',onZone)
  addEventListener('tryamm:audience-band',onAudience)
  addEventListener('tryamm:content-lane-change',onLane)

  refresh()
  window.dispatchEvent(new CustomEvent('tryamm:combat-runtime-ready',{detail:{
    lane:state.lane,
    fictionalWeapons:Object.keys(STREETVERSE_FICTIONAL_WEAPONS),
    kingdomExcluded:true,
    faithverseExcluded:true,
    safeZones:Array.from(SAFE_ZONES),
    nonGraphic:true,
  }}))

  return()=>{
    removeEventListener('tryamm:combat-equip',onEquip)
    removeEventListener('tryamm:combat-reload',onReload)
    removeEventListener('tryamm:combat-fire-request',onFire)
    removeEventListener('tryamm:combat-zone',onZone)
    removeEventListener('tryamm:audience-band',onAudience)
    removeEventListener('tryamm:content-lane-change',onLane)
  }
}
