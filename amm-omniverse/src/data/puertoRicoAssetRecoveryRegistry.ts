export type PuertoRicoRecoverySource={
  id:string
  label:string
  category:'roads'|'buildings'|'terrain'|'lidar'|'imagery'|'landmarks'|'audio'|'vegetation'|'water'|'culture'
  source:string
  license:string
  status:'approved-source'|'needs-review'|'archive-search'
  notes?:string
}

export type PuertoRicoAnchor={
  id:string
  label:string
  lat:number
  lng:number
  kind:'city'|'historic'|'rainforest'|'coast'|'mountain'|'island'
  district:string
}

// Recovery-first rule: use archived assets first, then license-clear/open-data sources.
// Do not ingest scraped copyrighted models, logos, music, photographs or proprietary map tiles.
export const PUERTO_RICO_RECOVERY_SOURCES:PuertoRicoRecoverySource[]=[
  {id:'archive-history',label:'TRYAMM History/Memory Asset Archive',category:'culture',source:'internal-library',license:'verify-per-file',status:'archive-search',notes:'First priority before creating or importing anything new.'},
  {id:'osm-pr',label:'OpenStreetMap Puerto Rico extract',category:'roads',source:'https://download.geofabrik.de/north-america/us/puerto-rico.html',license:'ODbL 1.0',status:'approved-source',notes:'Roads, paths, building footprints, POIs and geographic structure. Preserve attribution and database-license requirements.'},
  {id:'usgs-3dep-pr',label:'USGS 3DEP / LidarExplorer',category:'lidar',source:'https://www.usgs.gov/tools/lidarexplorer',license:'US government public domain where marked',status:'approved-source',notes:'Use for elevation, lidar-derived terrain and topobathymetry after confirming dataset-level metadata.'},
  {id:'usgs-terrain-pr',label:'USGS elevation/terrain derivatives',category:'terrain',source:'USGS 3DEP',license:'US government public domain where marked',status:'approved-source'},
]

export const PUERTO_RICO_WORLD_ANCHORS:PuertoRicoAnchor[]=[
  {id:'san-juan',label:'San Juan',lat:18.4655,lng:-66.1057,kind:'city',district:'puerto-rico-san-juan'},
  {id:'viejo-san-juan',label:'Viejo San Juan',lat:18.4671,lng:-66.1185,kind:'historic',district:'puerto-rico-old-san-juan'},
  {id:'el-yunque',label:'El Yunque',lat:18.3119,lng:-65.7925,kind:'rainforest',district:'puerto-rico-el-yunque'},
  {id:'ponce',label:'Ponce',lat:18.0111,lng:-66.6141,kind:'city',district:'puerto-rico-ponce'},
  {id:'rincon',label:'Rincon',lat:18.3402,lng:-67.2499,kind:'coast',district:'puerto-rico-rincon'},
  {id:'culebra',label:'Culebra',lat:18.3030,lng:-65.3009,kind:'island',district:'puerto-rico-culebra'},
  {id:'vieques',label:'Vieques',lat:18.1263,lng:-65.4401,kind:'island',district:'puerto-rico-vieques'},
]

export const PUERTO_RICO_RECOVERY_TARGETS=[
  'roads-and-sidewalks','building-footprints','terrain-dem','coastline-and-water','rainforest-vegetation',
  'historic-district-shells','street-props','vehicles','local-ambient-audio','wildlife','interiors',
  'creator-location-tags','mission-locations','accessibility-pathing','reel-deep-links'
] as const

export function getPuertoRicoAnchor(id:string){return PUERTO_RICO_WORLD_ANCHORS.find(anchor=>anchor.id===id)}
