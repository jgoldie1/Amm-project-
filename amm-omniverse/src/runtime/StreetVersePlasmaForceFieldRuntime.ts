export type PlasmaShieldVehicleClass='flying-car'|'flying-bike'|'evtol'|'evtol-shuttle'

export type PlasmaShieldState={
  enabled:boolean
  energy:number
  heat:number
  cooldownMs:number
  lastUpdatedAt:number
}

export const STREETVERSE_PLASMA_FORCE_FIELD={
  id:'tryamm-plasma-force-field-v1',
  name:'TRYAMM Plasma Force Field',
  fictionBoundary:'StreetVerse fictional defensive energy shield. This is a game mechanic, not a claim of real-world plasma-force-field technology.',
  compatibleVehicleClasses:['flying-car','flying-bike','evtol','evtol-shuttle'] as PlasmaShieldVehicleClass[],
  maxEnergy:100,
  activationMinimum:18,
  drainPerSecond:7,
  rechargePerSecond:11,
  heatPerSecond:5,
  coolingPerSecond:9,
  maxHeat:100,
  overheatAt:88,
  cooldownAfterBreakMs:5000,
  damageAbsorptionFraction:.78,
  hardImpactEnergyCost:28,
  ordinaryImpactEnergyCost:12,
  visual:'cyan-violet spherical ion halo + impact ripple',
  weaponized:false,
  offensiveDischarge:false,
} as const

export function defaultPlasmaShieldState(now=Date.now()):PlasmaShieldState{
  return{enabled:false,energy:100,heat:0,cooldownMs:0,lastUpdatedAt:now}
}

export function togglePlasmaShield(state:PlasmaShieldState,now=Date.now()):PlasmaShieldState{
  if(state.enabled)return{...state,enabled:false,lastUpdatedAt:now}
  if(state.cooldownMs>0||state.energy<STREETVERSE_PLASMA_FORCE_FIELD.activationMinimum||state.heat>=STREETVERSE_PLASMA_FORCE_FIELD.overheatAt)return{...state,enabled:false,lastUpdatedAt:now}
  return{...state,enabled:true,lastUpdatedAt:now}
}

export function tickPlasmaShield(state:PlasmaShieldState,now=Date.now()):PlasmaShieldState{
  const dt=Math.max(0,Math.min(1,(now-state.lastUpdatedAt)/1000))
  let enabled=state.enabled
  let energy=state.energy
  let heat=state.heat
  let cooldownMs=Math.max(0,state.cooldownMs-dt*1000)
  if(enabled){
    energy=Math.max(0,energy-STREETVERSE_PLASMA_FORCE_FIELD.drainPerSecond*dt)
    heat=Math.min(100,heat+STREETVERSE_PLASMA_FORCE_FIELD.heatPerSecond*dt)
    if(energy<=0||heat>=STREETVERSE_PLASMA_FORCE_FIELD.overheatAt){
      enabled=false
      cooldownMs=STREETVERSE_PLASMA_FORCE_FIELD.cooldownAfterBreakMs
    }
  }else{
    energy=Math.min(100,energy+STREETVERSE_PLASMA_FORCE_FIELD.rechargePerSecond*dt)
    heat=Math.max(0,heat-STREETVERSE_PLASMA_FORCE_FIELD.coolingPerSecond*dt)
  }
  return{enabled,energy,heat,cooldownMs,lastUpdatedAt:now}
}

export function absorbPlasmaImpact(state:PlasmaShieldState,inputDamage:number,hardImpact=false,now=Date.now()){
  if(!state.enabled)return{state,remainingDamage:Math.max(0,inputDamage),absorbedDamage:0,shieldBroke:false}
  const cost=hardImpact?STREETVERSE_PLASMA_FORCE_FIELD.hardImpactEnergyCost:STREETVERSE_PLASMA_FORCE_FIELD.ordinaryImpactEnergyCost
  const energyRatio=Math.min(1,state.energy/Math.max(1,cost))
  const absorbed=Math.max(0,inputDamage)*STREETVERSE_PLASMA_FORCE_FIELD.damageAbsorptionFraction*energyRatio
  const energy=Math.max(0,state.energy-cost)
  const shieldBroke=energy<STREETVERSE_PLASMA_FORCE_FIELD.activationMinimum
  return{
    state:{...state,energy,enabled:shieldBroke?false:state.enabled,cooldownMs:shieldBroke?STREETVERSE_PLASMA_FORCE_FIELD.cooldownAfterBreakMs:state.cooldownMs,lastUpdatedAt:now},
    remainingDamage:Math.max(0,inputDamage-absorbed),
    absorbedDamage:absorbed,
    shieldBroke,
  }
}
