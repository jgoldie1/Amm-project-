export type StreetVerseAssetKind='character'|'npc'|'vehicle'|'watercraft'|'building'|'interior'|'animal'|'prop'|'environment'|'audio'

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
  recovered?:boolean
  license?:'ORIGINAL'|'LICENSED'|'PLACEHOLDER'
  provenance?:string
}

export const STREETVERSE_ASSETS:StreetVerseAsset[]=[
  {id:'player-default',kind:'character',label:'StreetVerse Player',url:'/assets/streetverse/characters/player-default.glb',scale:1,fallback:'primitive',tags:['player','avatar']},
  {id:'npc-citizen-a',kind:'npc',label:'Citizen A',url:'/assets/streetverse/npcs/citizen-a.glb',scale:1,fallback:'primitive',tags:['citizen']},
  {id:'car-sedan-a',kind:'vehicle',label:'City Sedan',url:'/assets/streetverse/vehicles/sedan-a.glb',scale:1,fallback:'primitive',tags:['traffic','car'],license:'PLACEHOLDER',provenance:'Original unbranded StreetVerse vehicle class'},
  {id:'car-euro-lux',kind:'vehicle',label:'European Luxury Sedan',url:'/assets/streetverse/vehicles/euro-lux.glb',scale:1,fallback:'primitive',tags:['traffic','car','luxury','foreign-style'],license:'PLACEHOLDER',provenance:'Original unbranded luxury vehicle class; no third-party marks'},
  {id:'car-italian-gt',kind:'vehicle',label:'Italian-Style Grand Tourer',url:'/assets/streetverse/vehicles/italian-gt.glb',scale:1,fallback:'primitive',tags:['traffic','car','luxury','grand-tourer'],license:'PLACEHOLDER',provenance:'Original unbranded luxury vehicle class; no third-party marks'},
  {id:'car-super-01',kind:'vehicle',label:'Exotic Supercar',url:'/assets/streetverse/vehicles/exotic-supercar.glb',scale:1,fallback:'primitive',tags:['traffic','car','luxury','supercar'],license:'PLACEHOLDER',provenance:'Original unbranded supercar class; no third-party marks'},
  {id:'boat-speed-01',kind:'watercraft',label:'Lake Speedboat',url:'/assets/streetverse/boats/lake-speedboat.glb',scale:1,fallback:'primitive',tags:['boat','marina','rental'],license:'PLACEHOLDER',provenance:'Procedural StreetVerse demo watercraft'},
  {id:'boat-yacht-01',kind:'watercraft',label:'Luxury Motor Yacht',url:'/assets/streetverse/boats/luxury-motor-yacht.glb',scale:1,fallback:'primitive',tags:['boat','marina','luxury','rental'],license:'PLACEHOLDER',provenance:'Original unbranded StreetVerse watercraft class'},
  {id:'building-records',kind:'building',label:'Soul Records',url:'/assets/streetverse/buildings/soul-records.glb',scale:1,fallback:'primitive',district:'district-01',tags:['shop','music']},
  {id:'building-club',kind:'building',label:'Night Club',url:'/assets/streetverse/buildings/night-club.glb',scale:1,fallback:'primitive',district:'district-01',tags:['club','nightlife']},
  {id:'building-restaurant',kind:'building',label:'Restaurant',url:'/assets/streetverse/buildings/restaurant.glb',scale:1,fallback:'primitive',district:'district-01',tags:['food']},
  {id:'dog-a',kind:'animal',label:'City Dog',url:'/assets/streetverse/animals/dog-a.glb',scale:1,fallback:'primitive',tags:['animal','dog'],license:'PLACEHOLDER',provenance:'Procedural StreetVerse demo animal'},
  {id:'bird-a',kind:'animal',label:'Bird',url:'/assets/streetverse/animals/bird-a.glb',scale:1,fallback:'primitive',tags:['animal','bird'],license:'PLACEHOLDER',provenance:'Procedural StreetVerse demo animal'},
  {id:'deer-a',kind:'animal',label:'Urban Deer',url:'/assets/streetverse/animals/deer-a.glb',scale:1,fallback:'primitive',tags:['animal','deer'],license:'PLACEHOLDER',provenance:'Procedural StreetVerse demo animal'},
  {id:'horse-a',kind:'animal',label:'Riding Horse',url:'/assets/streetverse/animals/horse-a.glb',scale:1,fallback:'primitive',tags:['animal','horse'],license:'PLACEHOLDER',provenance:'Procedural StreetVerse demo animal'},
  {id:'city-ambience',kind:'audio',label:'City Ambience',url:'/assets/streetverse/audio/city-ambience.mp3',fallback:'hidden',tags:['audio','ambient']},

  {id:'reward-coin-gold',kind:'prop',label:'Gold Reward Coin',url:'/assets/streetverse/recovered/props/coin-gold.glb',scale:1,fallback:'hidden',tags:['reward','coin','recovered'],recovered:true},
  {id:'mission-crate',kind:'prop',label:'Mission Crate',url:'/assets/streetverse/recovered/props/crate.glb',scale:1,fallback:'hidden',tags:['mission','prop','recovered'],recovered:true},
  {id:'mission-key',kind:'prop',label:'Mission Key',url:'/assets/streetverse/recovered/props/key.glb',scale:1,fallback:'hidden',tags:['mission','key','recovered'],recovered:true},
  {id:'mission-chest',kind:'prop',label:'Mission Chest',url:'/assets/streetverse/recovered/props/chest.glb',scale:1,fallback:'hidden',tags:['mission','reward','recovered'],recovered:true},
  {id:'mission-finish-flag',kind:'prop',label:'Mission Finish Flag',url:'/assets/streetverse/recovered/props/finish-flag.glb',scale:1,fallback:'hidden',tags:['mission','finish','recovered'],recovered:true},
  {id:'city-tree',kind:'environment',label:'Recovered City Tree',url:'/assets/streetverse/recovered/environment/tree.glb',scale:1,fallback:'hidden',tags:['city','tree','recovered'],recovered:true},
  {id:'city-tree-pine',kind:'environment',label:'Recovered Pine Tree',url:'/assets/streetverse/recovered/environment/tree-pine.glb',scale:1,fallback:'hidden',tags:['city','tree','recovered'],recovered:true},
  {id:'city-rocks',kind:'environment',label:'Recovered Rocks',url:'/assets/streetverse/recovered/environment/rocks.glb',scale:1,fallback:'hidden',tags:['city','environment','recovered'],recovered:true},
  {id:'city-flowers',kind:'environment',label:'Recovered Flowers',url:'/assets/streetverse/recovered/environment/flowers.glb',scale:1,fallback:'hidden',tags:['city','environment','recovered'],recovered:true},
  {id:'city-grass',kind:'environment',label:'Recovered Grass',url:'/assets/streetverse/recovered/environment/grass.glb',scale:1,fallback:'hidden',tags:['city','environment','recovered'],recovered:true}
]

export function getStreetVerseAsset(id:string){return STREETVERSE_ASSETS.find(asset=>asset.id===id)}
export function getStreetVerseAssetsByKind(kind:StreetVerseAssetKind){return STREETVERSE_ASSETS.filter(asset=>asset.kind===kind)}
export function getRecoveredStreetVerseAssets(){return STREETVERSE_ASSETS.filter(asset=>asset.recovered)}
