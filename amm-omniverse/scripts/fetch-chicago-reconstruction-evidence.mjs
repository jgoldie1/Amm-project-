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
  {
    id:'chicago-building-footprints',
    dataset:'ssaf-e4ub',
    file:'building-footprints.geojson',
    arcgisQuery:'https://services9.arcgis.com/AmgnhNUQOhIscOKJ/ArcGIS/rest/services/BuildingFootprints_Chicago/FeatureServer/93/query',
    sourceMode:'city-derived-arcgis-fallback',
  },
  {id:'chicago-street-centerlines',dataset:'6imu-meau',file:'street-centerlines.geojson',sourceMode:'city-socrata'},
  {id:'chicago-zoning-current',dataset:'7cve-jgbp',file:'zoning-current.geojson',sourceMode:'city-socrata'},
]

const assertBounds=()=>{
  for(const [key,value] of Object.entries(bounds))if(!Number.isFinite(value))throw new Error('Invalid Chicago reconstruction bound: '+key)
  if(bounds.south>=bounds.north||bounds.west>=bounds.east)throw new Error('Invalid Chicago reconstruction bounding box')
}
const bboxWkt=()=>`POLYGON((${bounds.west} ${bounds.south},${bounds.east} ${bounds.south},${bounds.east} ${bounds.north},${bounds.west} ${bounds.north},${bounds.west} ${bounds.south}))`
const geometryTypes=new Set(['point','multipoint','line','multiline','polygon','multipolygon','location'])
const geometryFieldCandidates=async dataset=>{
  const metadataUrl=`https://data.cityofchicago.org/api/views/${dataset}`
  const response=await fetch(metadataUrl,{headers:{accept:'application/json'}})
  if(!response.ok)throw new Error(`metadata download failed for ${dataset}: HTTP ${response.status}`)
  const metadata=await response.json()
  const columns=Array.isArray(metadata?.columns)?metadata.columns:[]
  const dynamic=columns
    .filter(column=>geometryTypes.has(String(column?.dataTypeName||'').toLowerCase())||/(geom|shape|location)/i.test(String(column?.fieldName||column?.name||'')))
    .map(column=>String(column.fieldName||'').trim())
    .filter(Boolean)
  return[...new Set([...dynamic,'the_geom','shape','geometry'])] 
}
const endpoint=(dataset,geometryField)=>{
  const where=`intersects(${geometryField}, '${bboxWkt()}')`
  const params=new URLSearchParams({'$limit':'50000','$where':where})
  return `https://data.cityofchicago.org/resource/${dataset}.geojson?${params}`
}
const fetchArcGISGeoJson=async source=>{
  const pageSize=2000,features=[]
  let offset=0,lastUrl=source.arcgisQuery
  while(features.length<50000){
    const params=new URLSearchParams({
      where:'1=1',
      geometry:`${bounds.west},${bounds.south},${bounds.east},${bounds.north}`,
      geometryType:'esriGeometryEnvelope',
      inSR:'4326',
      spatialRel:'esriSpatialRelIntersects',
      outFields:'*',
      returnGeometry:'true',
      outSR:'4326',
      f:'geojson',
      orderByFields:'OBJECTID',
      resultRecordCount:String(pageSize),
      resultOffset:String(offset),
    })
    const url=`${source.arcgisQuery}?${params}`;lastUrl=url
    const response=await fetch(url,{headers:{accept:'application/geo+json,application/json'}})
    if(!response.ok){
      const detail=(await response.text().catch(()=>'' )).slice(0,300).replace(/\s+/g,' ')
      throw new Error(`${source.id} ArcGIS fallback failed: HTTP ${response.status}${detail?' • '+detail:''}`)
    }
    const json=await response.json()
    if(json?.type!=='FeatureCollection'||!Array.isArray(json.features))throw new Error(source.id+' ArcGIS fallback did not return GeoJSON FeatureCollection')
    features.push(...json.features)
    if(json.features.length<pageSize)break
    offset+=pageSize
  }
  return{url:lastUrl,json:{type:'FeatureCollection',features},geometryField:'arcgis-envelope',provider:'arcgis-feature-service'}
}

const fetchGeoJson=async source=>{
  if(source.arcgisQuery)return fetchArcGISGeoJson(source)
  const candidates=await geometryFieldCandidates(source.dataset)
  const failures=[]
  for(const geometryField of candidates){
    const url=endpoint(source.dataset,geometryField)
    const response=await fetch(url,{headers:{accept:'application/geo+json,application/json'}})
    if(response.ok){
      const json=await response.json()
      if(json?.type!=='FeatureCollection'||!Array.isArray(json.features)){
        failures.push(`${geometryField}: invalid GeoJSON`)
        continue
      }
      return{url,json,geometryField,provider:'socrata'}
    }
    const detail=(await response.text().catch(()=>'' )).slice(0,220).replace(/\s+/g,' ')
    failures.push(`${geometryField}: HTTP ${response.status}${detail?' '+detail:''}`)
  }
  throw new Error(`${source.id} download failed for geometry candidates • ${failures.join(' | ')}`)
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
  const {url,json,geometryField,provider}=await fetchGeoJson(source)
  const target=path.join(outDir,source.file)
  await fs.writeFile(target,JSON.stringify(json))
  manifest.sources.push({id:source.id,dataset:source.dataset,url,file:source.file,geometryField,provider,sourceMode:source.sourceMode,featureCount:json.features.length})
  console.log(source.id+': '+json.features.length+' features')
}
await fs.writeFile(path.join(outDir,'manifest.json'),JSON.stringify(manifest,null,2)+'\n')
console.log('StreetVerse Chicago reconstruction evidence written to '+outDir)
