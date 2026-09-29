export type ComputeLane='render'|'physics'|'ai'|'world-sim'|'media'|'commerce'|'accessibility'
export interface VirtualComputeTile{id:string;lanes:ComputeLane[];priority:number;deviceLocal:boolean;cloudBurst:boolean}

export const TRYAMM_OMNI_FABRIC={
 name:'TRYAMM OmniFabric Virtual Chip',
 description:'Software-defined heterogeneous compute fabric for StreetVerse and TRYAMM. It is a runtime architecture, not fabricated silicon.',
 uniqueLayer:'Intent-to-World execution: one user or AI intent can schedule rendering, simulation, agents, media, commerce and accessibility as one dependency-safe transaction.',
 openSceneInterop:'OpenUSD-compatible adapter boundary',
 lanes:[
  'render','physics','ai','world-sim','media','commerce','accessibility',
 ] as ComputeLane[],
 principles:[
  'hardware-neutral scheduling','local-first when latency or privacy matters','cloud burst for heavy jobs',
  'graceful fallback without RTX hardware','deterministic reward-bearing simulation',
  'server-authoritative commerce','accessibility as a first-class compute lane',
  'asset provenance attached to world operations','city runtime and media runtime share one intent graph',
 ] as const,
}

export interface OmniIntent{
 id:string;action:string;cityId?:string;districtId?:string;requires:ComputeLane[];
 latencyClass:'instant'|'interactive'|'background';rewardBearing:boolean;
}

export function compileOmniIntent(intent:OmniIntent){
 const tiles:VirtualComputeTile[]=intent.requires.map((lane,i)=>({
  id:`${intent.id}:${lane}`,lanes:[lane],priority:intent.latencyClass==='instant'?100-i:intent.latencyClass==='interactive'?70-i:30-i,
  deviceLocal:lane==='render'||lane==='accessibility'||intent.latencyClass==='instant',
  cloudBurst:lane==='ai'||lane==='world-sim'||lane==='media',
 }))
 return{intent,tiles,requiresServerAuthority:intent.rewardBearing||intent.requires.includes('commerce'),
  executionGraph:tiles.map((t,i)=>({tile:t.id,dependsOn:i===0?[]:[tiles[i-1].id]}))}
}

export const OMNIFABRIC_FUTURE_SILICON_SPEC={
 phase:'architecture-research',
 blocks:['neural-render','world-simulation','physics','media-codec','spatial-audio','secure-ledger','accessibility-ai'],
 memory:'unified scene-and-agent memory concept',
 interconnect:'chiplet-ready fabric concept',
 note:'Future hardware specification only; no claim that TRYAMM has fabricated a semiconductor chip.',
} as const
