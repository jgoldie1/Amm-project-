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
    dataset:'syp8-uezg',
    file:'building-footprints.geojson',
    sourceMode:'city-socrata-source-dataset',
    caveat:'source footprint dataset is older than the current derived map; use as reconstruction baseline, not current-building certification',
  },
  {
    id:'chicago-street-centerlines',
    dataset:'6imu-meau',
    file:'street-centerlines.geojson',
    exportUrl:'https://data.cityofchicago.org/api/geospatial/6imu-meau?method=export&format=GeoJSON',
    sourceMode:'city-socrata-geospatial-export',
  },
  {
    id:'chicago-zoning-current',
    dataset:'dj47-wfun',
    file:'zoning-current.geojson',
    sourceMode:'city-socrata-current',
  },
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
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms))
const fetchWithRetry=async(url,headers={},attempts=4)=>{
  let last
  for(let attempt=1;attempt<=attempts;attempt++){
    const response=await fetch(url,{headers})
    if(response.ok)return response
    const detail=(await response.text().catch(()=>'' )).slice(0,300).replace(/\s+/g,' ')
    last=new Error(`HTTP ${response.status}${detail?' • '+detail:''}`)
    if(![429,500,502,503,504].includes(response.status)||attempt===attempts)break
    await sleep(900*attempt)
  }
  throw last||new Error('request failed')
}
const arcgisEnvelope=()=>JSON.stringify({
  xmin:bounds.west,ymin:bounds.south,xmax:bounds.east,ymax:bounds.north,
  spatialReference:{wkid:4326},
})
const fetchArcGISGeoJson=async source=>{
  const idParams=new URLSearchParams({
    where:'1=1',
    geometry:arcgisEnvelope(),
    geometryType:'esriGeometryEnvelope',
    inSR:'4326',
    spatialRel:'esriSpatialRelIntersects',
    returnIdsOnly:'true',
    f:'json',
  })
  const idUrl=`${source.arcgisQuery}?${idParams}`
  let idResponse
  try{idResponse=await fetchWithRetry(idUrl,{accept:'application/json'})}
  catch(error){throw new Error(`${source.id} ArcGIS ID query failed: ${error?.message||error}`)}
  const idJson=await idResponse.json()
  const objectIds=Array.isArray(idJson?.objectIds)?idJson.objectIds:[]
  if(!objectIds.length)return{url:idUrl,json:{type:'FeatureCollection',features:[]},geometryField:'arcgis-envelope',provider:'arcgis-feature-service'}
  const objectIdField=String(idJson.objectIdFieldName||idJson.objectIdField||'OBJECTID')

  const features=[],chunkSize=350
  let lastUrl=idUrl
  for(let i=0;i<objectIds.length;i+=chunkSize){
    const chunk=objectIds.slice(i,i+chunkSize)
    const params=new URLSearchParams({
      objectIds:chunk.join(','),
      outFields:'*',
      returnGeometry:'true',
      outSR:'4326',
      f:'geojson',
    })
    const url=`${source.arcgisQuery}?${params}`;lastUrl=url
    let response
    try{response=await fetchWithRetry(url,{accept:'application/geo+json,application/json'})}
    catch(error){throw new Error(`${source.id} ArcGIS feature chunk failed at ${i}/${objectIds.length}: ${error?.message||error}`)}
    const json=await response.json()
    if(json?.type!=='FeatureCollection'||!Array.isArray(json.features))throw new Error(source.id+' ArcGIS feature chunk did not return GeoJSON FeatureCollection')
    features.push(...json.features)
  }
  return{
    url:lastUrl,
    json:{type:'FeatureCollection',features},
    geometryField:`arcgis-envelope:${objectIdField}`,
    provider:'arcgis-feature-service',
  }
}

const geometryBounds=geometry=>{
  if(!geometry?.coordinates)return null
  let minLon=Infinity,minLat=Infinity,maxLon=-Infinity,maxLat=-Infinity
  const visit=value=>{
    if(!Array.isArray(value))return
    if(value.length>=2&&Number.isFinite(Number(value[0]))&&Number.isFinite(Number(value[1]))&&!Array.isArray(value[0])){
      const lon=Number(value[0]),lat=Number(value[1])
      minLon=Math.min(minLon,lon);maxLon=Math.max(maxLon,lon)
      minLat=Math.min(minLat,lat);maxLat=Math.max(maxLat,lat)
      return
    }
    for(const child of value)visit(child)
  }
  visit(geometry.coordinates)
  return Number.isFinite(minLon)?{minLon,minLat,maxLon,maxLat}:null
}
const intersectsBounds=geometry=>{
  const b=geometryBounds(geometry)
  if(!b)return false
  return b.maxLon>=bounds.west&&b.minLon<=bounds.east&&b.maxLat>=bounds.south&&b.minLat<=bounds.north
}
const fetchGeospatialExport=async source=>{
  const response=await fetchWithRetry(source.exportUrl,{accept:'application/geo+json,application/json'},3)
  const text=await response.text()
  let json
  try{json=JSON.parse(text)}catch{throw new Error(source.id+' geospatial export did not return JSON/GeoJSON')}
  if(json?.type!=='FeatureCollection'||!Array.isArray(json.features))throw new Error(source.id+' geospatial export did not return GeoJSON FeatureCollection')
  const features=json.features.filter(feature=>intersectsBounds(feature.geometry))
  return{
    url:source.exportUrl,
    json:{type:'FeatureCollection',features},
    geometryField:'local-bbox-filter',
    provider:'socrata-geospatial-export',
  }
}

const fetchGeoJson=async source=>{
  if(source.exportUrl)return fetchGeospatialExport(source)
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
  if(!json.features.length)throw new Error(source.id+' returned zero features inside the Chicago proof-zone bounds')
  const target=path.join(outDir,source.file)
  await fs.writeFile(target,JSON.stringify(json))
  manifest.sources.push({id:source.id,dataset:source.dataset,url,file:source.file,geometryField,provider,sourceMode:source.sourceMode,caveat:source.caveat||null,featureCount:json.features.length})
  console.log(source.id+': '+json.features.length+' features')
}
await fs.writeFile(path.join(outDir,'manifest.json'),JSON.stringify(manifest,null,2)+'\n')
console.log('StreetVerse Chicago reconstruction evidence written to '+outDir)
