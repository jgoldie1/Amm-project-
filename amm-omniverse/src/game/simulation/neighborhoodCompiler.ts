import type { WorldSeed } from './worldBuilderPipeline'

export interface CompiledNeighborhood {
  id: string
  cityId: string
  name: string
  roads: number
  intersections: number
  parcels: number
  buildings: number
  homes: number
  businesses: number
  transitStops: number
  npcCapacity: number
  trafficCapacity: number
  missionSlots: number
  accessibleRoutes: number
}

/**
 * Deterministic starter compiler. It converts a registry seed into bounded
 * gameplay-capacity manifests. Real geographic/building data can replace the
 * starter metrics without changing the downstream LCS/gameplay contract.
 */
export function compileNeighborhoods(seed: WorldSeed): CompiledNeighborhood[] {
  return seed.neighborhoods.map((name,index)=>{
    const scale=1+index*.15
    return {
      id:`${seed.id}-${slug(name)}`,
      cityId:seed.id,
      name,
      roads:Math.round(24*scale),
      intersections:Math.round(18*scale),
      parcels:Math.round(90*scale),
      buildings:Math.round(70*scale),
      homes:Math.round(44*scale),
      businesses:Math.round(18*scale),
      transitStops:Math.max(4,Math.round(8*scale)),
      npcCapacity:Math.round(250*scale),
      trafficCapacity:Math.round(80*scale),
      missionSlots:Math.max(6,Math.round(10*scale)),
      accessibleRoutes:Math.max(4,Math.round(8*scale)),
    }
  })
}

export function validateCompiledNeighborhood(n:CompiledNeighborhood): string[] {
  const errors:string[]=[]
  if(n.roads<1) errors.push('roads')
  if(n.buildings<1) errors.push('buildings')
  if(n.homes<1) errors.push('homes')
  if(n.businesses<1) errors.push('businesses')
  if(n.transitStops<1) errors.push('transit')
  if(n.npcCapacity<1) errors.push('npc-capacity')
  if(n.missionSlots<1) errors.push('missions')
  if(n.accessibleRoutes<1) errors.push('accessibility')
  return errors
}

function slug(value:string){
  return value.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'')
}
