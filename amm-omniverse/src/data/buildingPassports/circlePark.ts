export type BuildingPassportSourceClass='open-data'|'licensed'|'owner-authorized'|'resident-contributed'|'reference-only'
export type ReconstructionConfidence='verified'|'probable'|'placeholder'

export interface BuildingPassport {
  id:string
  name:string
  aliases:string[]
  location:{city:string;state:string;postalCode:string;country:string;campusAddress:string;referenceAddress:string}
  world:{verse:'streetverse';district:string;historicalLayers:string[]}
  knownFacts:{units?:number;buildings?:number;builtYear?:number;buildingMix?:string}
  reconstruction:{
    exterior:{footprint:boolean;facades:boolean;roof:boolean;doors:boolean;windows:boolean}
    interior:{floors:boolean;stairs:boolean;elevators:boolean;units:boolean;fixtures:boolean;plumbingSimulation:boolean}
    interactions:string[]
  }
  privacy:{
    currentResidentInteriors:'private'
    sensitiveBuildingSystems:'restricted'
    historicalUnitAccess:'consent-or-authorized-sources'
    exactCurrentSecuritySystems:'never-publish'
  }
  sourcePolicy:{
    googleStreetView:'reference-navigation-only'
    persistentAssets:string[]
  }
  confidence:Record<string,ReconstructionConfidence>
}

export const CIRCLE_PARK_BUILDING_PASSPORT:BuildingPassport={
  id:'chi-circle-park-1111-laflin',
  name:'Circle Park',
  aliases:['Circle Park Apartments'],
  location:{city:'Chicago',state:'IL',postalCode:'60607',country:'US',campusAddress:'1111 S Ashland Ave',referenceAddress:'1111 S Laflin St'},
  world:{verse:'streetverse',district:'Near West Side / University Village–Little Italy',historicalLayers:['current','resident-memory']},
  knownFacts:{units:418,buildings:19,builtYear:1983,buildingMix:'Primarily 2–3 story structures plus one 8-story mid-rise'},
  reconstruction:{
    exterior:{footprint:false,facades:false,roof:false,doors:false,windows:false},
    interior:{floors:false,stairs:false,elevators:false,units:false,fixtures:false,plumbingSimulation:false},
    interactions:['open-door','open-window','elevator-call','stairs-traverse','faucet-on-off','toilet-flush','drain-flow','business-lease','virtual-parking-reservation']
  },
  privacy:{currentResidentInteriors:'private',sensitiveBuildingSystems:'restricted',historicalUnitAccess:'consent-or-authorized-sources',exactCurrentSecuritySystems:'never-publish'},
  sourcePolicy:{googleStreetView:'reference-navigation-only',persistentAssets:['open municipal data','licensed imagery','owner-authorized plans','resident-contributed media with permission','TRYAMM-created scans/models']},
  confidence:{campus:'verified',unitCount:'verified',buildingCount:'verified',builtYear:'probable',interiors:'placeholder'}
}
