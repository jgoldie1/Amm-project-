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
  recovered?:boolean
  ownership?:'original'|'licensed'|'recovered'|'pending-clearance'
  commercialUse?:boolean
  provenance?:string
}

export const STREETVERSE_ASSETS:StreetVerseAsset[]=[
  {id:'player-default',kind:'character',label:'StreetVerse Player',url:'/assets/streetverse/characters/player-default.glb',scale:1,fallback:'primitive',tags:['player','avatar'],ownership:'original',commercialUse:true,provenance:'TRYAMM production asset slot'},
  {id:'npc-citizen-a',kind:'npc',label:'Citizen A',url:'/assets/streetverse/npcs/citizen-a.glb',scale:1,fallback:'primitive',tags:['citizen'],ownership:'original',commercialUse:true,provenance:'TRYAMM production asset slot'},
  {id:'car-sedan-a',kind:'vehicle',label:'Sedan A',url:'/assets/streetverse/vehicles/sedan-a.glb',scale:1,fallback:'primitive',tags:['traffic','car'],ownership:'original',commercialUse:true,provenance:'TRYAMM production asset slot'},
  {id:'car-euro-gt',kind:'vehicle',label:'Euro GT',url:'/assets/streetverse/vehicles/euro-gt.glb',scale:1,fallback:'hidden',tags:['traffic','luxury','foreign-inspired','car'],ownership:'original',commercialUse:true,provenance:'Original fictional vehicle design; no third-party badge required'},
  {id:'car-executive-ev',kind:'vehicle',label:'Executive EV',url:'/assets/streetverse/vehicles/executive-ev.glb',scale:1,fallback:'hidden',tags:['traffic','luxury','ev','car'],ownership:'original',commercialUse:true,provenance:'Original fictional vehicle design; no third-party badge required'},
  {id:'car-grand-tourer',kind:'vehicle',label:'Grand Tourer',url:'/assets/streetverse/vehicles/grand-tourer.glb',scale:1,fallback:'hidden',tags:['traffic','luxury','sport','car'],ownership:'original',commercialUse:true,provenance:'Original fictional vehicle design; no third-party badge required'},
  {id:'boat-sport-cruiser',kind:'vehicle',label:'Sport Cruiser',url:'/assets/streetverse/vehicles/sport-cruiser.glb',scale:1,fallback:'hidden',tags:['boat','marina','watercraft'],ownership:'original',commercialUse:true,provenance:'TRYAMM original watercraft asset slot'},
  {id:'boat-yacht',kind:'vehicle',label:'Omni Yacht',url:'/assets/streetverse/vehicles/omni-yacht.glb',scale:1,fallback:'hidden',tags:['boat','yacht','marina','luxury'],ownership:'original',commercialUse:true,provenance:'TRYAMM original watercraft asset slot'},
  {id:'building-records',kind:'building',label:'Soul Records',url:'/assets/streetverse/buildings/soul-records.glb',scale:1,fallback:'primitive',district:'district-01',tags:['shop','music'],ownership:'original',commercialUse:true,provenance:'TRYAMM production asset slot'},
  {id:'building-club',kind:'building',label:'Night Club',url:'/assets/streetverse/buildings/night-club.glb',scale:1,fallback:'primitive',district:'district-01',tags:['club','nightlife'],ownership:'original',commercialUse:true,provenance:'TRYAMM production asset slot'},
  {id:'building-restaurant',kind:'building',label:'Restaurant',url:'/assets/streetverse/buildings/restaurant.glb',scale:1,fallback:'primitive',district:'district-01',tags:['food'],ownership:'original',commercialUse:true,provenance:'TRYAMM production asset slot'},
  {id:'dog-a',kind:'animal',label:'Dog',url:'/assets/streetverse/animals/dog-a.glb',scale:1,fallback:'primitive',tags:['animal','dog'],ownership:'original',commercialUse:true,provenance:'TRYAMM production asset slot'},
  {id:'bird-a',kind:'animal',label:'Bird',url:'/assets/streetverse/animals/bird-a.glb',scale:1,fallback:'primitive',tags:['animal','bird'],ownership:'original',commercialUse:true,provenance:'TRYAMM production asset slot'},
  {id:'horse-a',kind:'animal',label:'Horse',url:'/assets/streetverse/animals/horse-a.glb',scale:1,fallback:'hidden',tags:['animal','horse','race'],ownership:'original',commercialUse:true,provenance:'TRYAMM original animal asset slot'},
  {id:'deer-a',kind:'animal',label:'Deer',url:'/assets/streetverse/animals/deer-a.glb',scale:1,fallback:'hidden',tags:['animal','deer','park'],ownership:'original',commercialUse:true,provenance:'TRYAMM original animal asset slot'},
  {id:'city-ambience',kind:'audio',label:'City Ambience',url:'/assets/streetverse/audio/city-ambience.mp3',fallback:'hidden',tags:['audio','ambient'],ownership:'pending-clearance',commercialUse:false,provenance:'Production audio slot; commercial release requires cleared source'},

  {id:'reward-coin-gold',kind:'prop',label:'Gold Reward Coin',url:'/assets/streetverse/recovered/props/coin-gold.glb',scale:1,fallback:'hidden',tags:['reward','coin','recovered'],recovered:true,ownership:'recovered',commercialUse:false,provenance:'Recovered archive asset; license review required before commercial use'},
  {id:'mission-crate',kind:'prop',label:'Mission Crate',url:'/assets/streetverse/recovered/props/crate.glb',scale:1,fallback:'hidden',tags:['mission','prop','recovered'],recovered:true,ownership:'recovered',commercialUse:false,provenance:'Recovered archive asset; license review required before commercial use'},
  {id:'mission-key',kind:'prop',label:'Mission Key',url:'/assets/streetverse/recovered/props/key.glb',scale:1,fallback:'hidden',tags:['mission','key','recovered'],recovered:true,ownership:'recovered',commercialUse:false,provenance:'Recovered archive asset; license review required before commercial use'},
  {id:'mission-chest',kind:'prop',label:'Mission Chest',url:'/assets/streetverse/recovered/props/chest.glb',scale:1,fallback:'hidden',tags:['mission','reward','recovered'],recovered:true,ownership:'recovered',commercialUse:false,provenance:'Recovered archive asset; license review required before commercial use'},
  {id:'mission-finish-flag',kind:'prop',label:'Mission Finish Flag',url:'/assets/streetverse/recovered/props/finish-flag.glb',scale:1,fallback:'hidden',tags:['mission','finish','recovered'],recovered:true,ownership:'recovered',commercialUse:false,provenance:'Recovered archive asset; license review required before commercial use'},
  {id:'city-tree',kind:'environment',label:'Recovered City Tree',url:'/assets/streetverse/recovered/environment/tree.glb',scale:1,fallback:'hidden',tags:['city','tree','recovered'],recovered:true,ownership:'recovered',commercialUse:false,provenance:'Recovered archive asset; license review required before commercial use'},
  {id:'city-tree-pine',kind:'environment',label:'Recovered Pine Tree',url:'/assets/streetverse/recovered/environment/tree-pine.glb',scale:1,fallback:'hidden',tags:['city','tree','recovered'],recovered:true,ownership:'recovered',commercialUse:false,provenance:'Recovered archive asset; license review required before commercial use'},
  {id:'city-rocks',kind:'environment',label:'Recovered Rocks',url:'/assets/streetverse/recovered/environment/rocks.glb',scale:1,fallback:'hidden',tags:['city','environment','recovered'],recovered:true,ownership:'recovered',commercialUse:false,provenance:'Recovered archive asset; license review required before commercial use'},
  {id:'city-flowers',kind:'environment',label:'Recovered Flowers',url:'/assets/streetverse/recovered/environment/flowers.glb',scale:1,fallback:'hidden',tags:['city','environment','recovered'],recovered:true,ownership:'recovered',commercialUse:false,provenance:'Recovered archive asset; license review required before commercial use'},
  {id:'city-grass',kind:'environment',label:'Recovered Grass',url:'/assets/streetverse/recovered/environment/grass.glb',scale:1,fallback:'hidden',tags:['city','environment','recovered'],recovered:true,ownership:'recovered',commercialUse:false,provenance:'Recovered archive asset; license review required before commercial use'}
]

export function getStreetVerseAsset(id:string){return STREETVERSE_ASSETS.find(asset=>asset.id===id)}
export function getStreetVerseAssetsByKind(kind:StreetVerseAssetKind){return STREETVERSE_ASSETS.filter(asset=>asset.kind===kind)}
export function getRecoveredStreetVerseAssets(){return STREETVERSE_ASSETS.filter(asset=>asset.recovered)}
export function getCommerciallyClearedStreetVerseAssets(){return STREETVERSE_ASSETS.filter(asset=>asset.commercialUse===true)}