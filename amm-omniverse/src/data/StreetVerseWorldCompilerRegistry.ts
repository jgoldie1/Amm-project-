import { CIRCLE_PARK_BUILDING_PASSPORT, type BuildingPassport } from './buildingPassports/circlePark'

export type ReconstructionStage='source-discovery'|'rights-cleared'|'georeferenced'|'shell-model'|'interior-authorized'|'interactive'|'certified'
export interface WorldCompilerTarget {
  passport:BuildingPassport
  stage:ReconstructionStage
  requiredInputs:string[]
  outputs:string[]
  blockers:string[]
  rules:string[]
}

export const CIRCLE_PARK_WORLD_COMPILER_TARGET:WorldCompilerTarget={
  passport:CIRCLE_PARK_BUILDING_PASSPORT,
  stage:'source-discovery',
  requiredInputs:[
    'authoritative parcel/building footprints',
    'licensed or open exterior photos for front/sides/rear',
    'height/floor/elevation evidence',
    'owner-authorized or otherwise lawful floor plans where available',
    'accessibility/elevator evidence',
    'resident-contributed historical media with permission'
  ],
  outputs:[
    'georeferenced campus shell',
    'LOD0 footprint and terrain',
    'LOD1 building masses',
    'LOD2 licensed facade/roof reconstruction',
    'authorized interior navigation graph',
    'interactive fixture simulation',
    'historical resident-memory layer',
    'commercial-space and virtual-parking hooks'
  ],
  blockers:[
    'Do not infer private current interiors from exterior imagery.',
    'Do not publish exact current security/access-control systems.',
    'Do not persist Google Maps/Street View imagery as TRYAMM asset geometry or textures.',
    'Do not mark reconstructed details verified without source evidence.'
  ],
  rules:[
    'Every geometry element keeps source, rights and confidence metadata.',
    'Unknown geometry renders as a clearly tracked placeholder.',
    'Historical reconstructions are time-versioned rather than overwriting current reality.',
    'Mobile LODs must preserve navigation while reducing render cost.'
  ]
}

export const STREETVERSE_CHICAGO_RECONSTRUCTION_QUEUE=[
  CIRCLE_PARK_WORLD_COMPILER_TARGET,
] as const

export function getChicagoReconstructionTarget(id:string){
  return STREETVERSE_CHICAGO_RECONSTRUCTION_QUEUE.find(target=>target.passport.id===id)??null
}
