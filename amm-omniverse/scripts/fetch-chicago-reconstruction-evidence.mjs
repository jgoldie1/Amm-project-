import fs from 'node:fs/promises'
import path from 'node:path'

const bounds={
  north:Number(process.env.SV_CHICAGO_NORTH||41.892),
  west:Number(process.env.SV_CHICAGO_WEST||-87.690),
  south:Number(process.env.SV_CHICAGO_SOUTH||41.845),
  east:Number(process.env.SV_CHICAGO_EAST||-87.625),
}
const outDir=path.resolve(process.argv[2]||'../release-evidence/chicago-reconstruction')
const sources=[
  {id:'chicago-building-footprints',dataset:'ssaf-e4ub',file:'building-footprints.geojson'},
  {id:'chicago-street-centerlines',dataset:'6imu-meau',file:'street-centerlines.geojson'},
  {id:'chicago-zoning-current',dataset:'7cve-jgbp',file:'zoning-current.geojson'},
]

const assertBounds=()=>{
  for(const [key,value] of Object.entries(bounds))if(!Number.isFinite(value))throw new Error('Invalid Chicago reconstruction bound: '+key)
  if(bounds.south>=bounds.north||bounds.west>=bounds.east)throw new Error('Invalid Chicago reconstruction bounding box')
}
const endpoint=dataset=>{
  const where=`within_box(the_geom, ${bounds.north}, ${bounds.west}, ${bounds.south}, ${bounds.east})`
  const params=new URLSearchParams({'$limit':'50000','$where':where})
  return `https://data.cityofchicago.org/resource/${dataset}.geojson?${params}`
}
const fetchGeoJson=async source=>{
  const url=endpoint(source.dataset)
  const response=await fetch(url,{headers:{accept:'application/geo+json,application/json'}})
  if(!response.ok)throw new Error(`${source.id} download failed: HTTP ${response.status}`)
  const json=await response.json()
  if(json?.type!=='FeatureCollection'||!Array.isArray(json.features))throw new Error(source.id+' did not return GeoJSON FeatureCollection')
  return{url,json}
}

assertBounds()
await fs.mkdir(outDir,{recursive:true})
const manifest={
  schema:'tryamm.streetverse.chicago-reconstruction-evidence.v1',
  proofZone:'Circle Park → Roosevelt → Taylor → UIC',
  reconstructionMode:'public-data-grounded-game-reconstruction',
  exactDigitalTwin:false,
  bounds,
  downloadedAt:new Date().toISOString(),
  sources:[],
}
for(const source of sources){
  const {url,json}=await fetchGeoJson(source)
  const target=path.join(outDir,source.file)
  await fs.writeFile(target,JSON.stringify(json))
  manifest.sources.push({id:source.id,dataset:source.dataset,url,file:source.file,featureCount:json.features.length})
  console.log(source.id+': '+json.features.length+' features')
}
await fs.writeFile(path.join(outDir,'manifest.json'),JSON.stringify(manifest,null,2)+'\n')
console.log('StreetVerse Chicago reconstruction evidence written to '+outDir)
