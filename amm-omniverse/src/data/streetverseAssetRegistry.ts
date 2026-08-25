export type StreetVerseAssetKind='character'|'npc'|'vehicle'|'building'|'interior'|'animal'|'prop'|'environment'|'audio'

export type StreetVerseAsset={
  id:string
  kind:StreetVerseAssetKind
  label:string
  url:string
  scale?:number
  rotationY?:number
  district?:string
  tags?:string[]
  fallback?:'primitive'|'hidden'
}

export const STREETVERSE_ASSETS:StreetVerseAsset[]=[
  {id:'player-default',kind:'character',label:'StreetVerse Player',url:'/assets/streetverse/characters/player-default.glb',scale:1,fallback:'primitive',tags:['player','avatar']},
  {id:'npc-citizen-a',kind:'npc',label:'Citizen A',url:'/assets/streetverse/npcs/citizen-a.glb',scale:1,fallback:'primitive',tags:['citizen']},
  {id:'car-sedan-a',kind:'vehicle',label:'Sedan A',url:'/assets/streetverse/vehicles/sedan-a.glb',scale:1,fallback:'primitive',tags:['traffic','car']},
  {id:'building-records',kind:'building',label:'Soul Records',url:'/assets/streetverse/buildings/soul-records.glb',scale:1,fallback:'primitive',district:'district-01',tags:['shop','music']},
  {id:'building-club',kind:'building',label:'Night Club',url:'/assets/streetverse/buildings/night-club.glb',scale:1,fallback:'primitive',district:'district-01',tags:['club','nightlife']},
  {id:'building-restaurant',kind:'building',label:'Restaurant',url:'/assets/streetverse/buildings/restaurant.glb',scale:1,fallback:'primitive',district:'district-01',tags:['food']},
  {id:'dog-a',kind:'animal',label:'Dog',url:'/assets/streetverse/animals/dog-a.glb',scale:1,fallback:'primitive',tags:['animal','dog']},
  {id:'bird-a',kind:'animal',label:'Bird',url:'/assets/streetverse/animals/bird-a.glb',scale:1,fallback:'primitive',tags:['animal','bird']},
  {id:'city-ambience',kind:'audio',label:'City Ambience',url:'/assets/streetverse/audio/city-ambience.mp3',fallback:'hidden',tags:['audio','ambient']}
]

export function getStreetVerseAsset(id:string){return STREETVERSE_ASSETS.find(asset=>asset.id===id)}
export function getStreetVerseAssetsByKind(kind:StreetVerseAssetKind){return STREETVERSE_ASSETS.filter(asset=>asset.kind===kind)}
