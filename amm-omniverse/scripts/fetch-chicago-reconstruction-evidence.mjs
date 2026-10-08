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
    caveat:'Building footprint source is used as reconstruction baseline only; it is not current-building certification.',
  },
  {
    id:'chicago-street-centerlines',
    dataset:'6imu-meau',
    file:'street-centerlines.geojson',
    arcgisQuery:'https://gisapps.cityofchicago.org/arcgis/rest/services/ExternalApps/Basemap_BlackWhite/MapServer/14/query',
    sourceMode:'city-arcgis-all-streets',
    caveat:'City ArcGIS All Streets geometry is used as the street reconstruction baseline; use for gameplay/world reconstruction, not present-day legal street certification.',
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

const geometryTypes=new Set(['point','multipoint','line','multiline','polygon','multipolygon','location'])
const geometryFieldCandidates=async dataset=>{
  const metadataUrl=`https://data.cityofchicago.org/api/views/${dataset}`
  const response=await fetchWithRetry(metadataUrl,{accept:'application/json'})
  const metadata=await response.json()
  const columns=Array.isArray(metadata?.columns)?metadata.columns:[]
  const dynamic=columns
    .filter(column=>geometryTypes.has(String(column?.dataTypeName||'').toLowerCase())||/(geom|shape|location)/i.test(String(column?.fieldName||column?.name||'')))
    .map(column=>String(column.fieldName||'').trim())
    .filter(Boolean)
  return[...new Set([...dynamic,'the_geom','shape','geometry'])]
}
const socrataEndpoint=(dataset,geometryField)=>{
  const where=`intersects(${geometryField}, '${bboxWkt()}')`
  const params=new URLSearchParams({'$limit':'50000','$where':where})
  return `https://data.cityofchicago.org/resource/${dataset}.geojson?${params}`
}

const fetchArcGISAllStreets=async source=>{
  const features=[]
  const pageSize=2000
  const geometry=`${bounds.west},${bounds.south},${bounds.east},${bounds.north}`
  let lastUrl=source.arcgisQuery
  for(let offset=0;offset<20000;offset+=pageSize){
    const params=new URLSearchParams({
      where:'1=1',
      geometry,
      geometryType:'esriGeometryEnvelope',
      inSR:'4326',
      spatialRel:'esriSpatialRelIntersects',
      outFields:'*',
      returnGeometry:'true',
      outSR:'4326',
      resultOffset:String(offset),
      resultRecordCount:String(pageSize),
      f:'geojson',
    })
    const url=`${source.arcgisQuery}?${params}`;lastUrl=url
    const response=await fetchWithRetry(url,{accept:'application/geo+json,application/json'},4)
    const json=await response.json()
    if(json?.type!=='FeatureCollection'||!Array.isArray(json.features)){
      const detail=JSON.stringify(json).slice(0,300)
      throw new Error(source.id+' ArcGIS query did not return GeoJSON FeatureCollection • '+detail)
    }
    features.push(...json.features)
    if(json.features.length<pageSize)break
  }
  return{
    url:lastUrl,
    json:{type:'FeatureCollection',features},
    geometryField:'arcgis-envelope-4326',
    provider:'city-arcgis-mapserver-all-streets',
  }
}

const fetchSocrataGeoJson=async source=>{
  const candidates=await geometryFieldCandidates(source.dataset)
  const failures=[]
  for(const geometryField of candidates){
    const url=socrataEndpoint(source.dataset,geometryField)
    const response=await fetch(url,{headers:{accept:'application/geo+json,application/json'}})
    if(response.ok){
      const json=await response.json()
      if(json?.type==='FeatureCollection'&&Array.isArray(json.features)&&json.features.length){
        return{url,json,geometryField,provider:'socrata'}
      }
      failures.push(`${geometryField}: zero/invalid features`)
      continue
    }
    const detail=(await response.text().catch(()=>'' )).slice(0,220).replace(/\s+/g,' ')
    failures.push(`${geometryField}: HTTP ${response.status}${detail?' '+detail:''}`)
  }
  throw new Error(`${source.id} download failed for geometry candidates • ${failures.join(' | ')}`)
}

const fetchGeoJson=source=>source.arcgisQuery?fetchArcGISAllStreets(source):fetchSocrataGeoJson(source)

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
  manifest.sources.push({
    id:source.id,dataset:source.dataset,url,file:source.file,geometryField,provider,
    sourceMode:source.sourceMode,caveat:source.caveat||null,featureCount:json.features.length,
  })
  console.log(source.id+': '+json.features.length+' features')
}
await fs.writeFile(path.join(outDir,'manifest.json'),JSON.stringify(manifest,null,2)+'\n')
console.log('StreetVerse Chicago reconstruction evidence written to '+outDir)
