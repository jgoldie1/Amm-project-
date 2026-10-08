import fs from 'node:fs/promises'
import path from 'node:path'

const evidenceDir=path.resolve(process.argv[2]||'../release-evidence/chicago-reconstruction')
const outFile=path.resolve(process.argv[3]||'public/generated-data/chicago-proof-zone-v9.json')
const origin={lat:41.8705,lon:-87.6555}
const metersPerDegLat=111_320
const metersPerDegLon=111_320*Math.cos(origin.lat*Math.PI/180)
const maxRadiusMeters=2400

const readJson=async file=>JSON.parse(await fs.readFile(path.join(evidenceDir,file),'utf8'))
const flattenRings=geometry=>{
  if(!geometry)return[]
  if(geometry.type==='Polygon')return geometry.coordinates||[]
  if(geometry.type==='MultiPolygon')return (geometry.coordinates||[]).flat()
  if(geometry.type==='LineString')return [geometry.coordinates||[]]
  if(geometry.type==='MultiLineString')return geometry.coordinates||[]
  return[]
}
const localPoint=([lon,lat])=>[(lon-origin.lon)*metersPerDegLon,(lat-origin.lat)*metersPerDegLat]
const insideRadius=([x,z])=>Math.hypot(x,z)<=maxRadiusMeters
const simplify=(points,step=2)=>points.filter((_,i)=>i%step===0||i===points.length-1)
const ringBounds=points=>{
  const xs=points.map(p=>p[0]),zs=points.map(p=>p[1])
  return{minX:Math.min(...xs),maxX:Math.max(...xs),minZ:Math.min(...zs),maxZ:Math.max(...zs)}
}

const buildingsGeo=await readJson('building-footprints.geojson')
const streetsGeo=await readJson('street-centerlines.geojson')

const buildings=[]
for(const feature of buildingsGeo.features||[]){
  const ring=flattenRings(feature.geometry)[0]
  if(!ring?.length)continue
  const local=simplify(ring.map(localPoint),Math.max(1,Math.floor(ring.length/18)))
  const bounds=ringBounds(local),center=[(bounds.minX+bounds.maxX)/2,(bounds.minZ+bounds.maxZ)/2]
  if(!insideRadius(center))continue
  const width=Math.max(.5,bounds.maxX-bounds.minX),depth=Math.max(.5,bounds.maxZ-bounds.minZ)
  if(width>180||depth>180)continue
  buildings.push({
    id:String(feature.properties?.bldg_id||feature.properties?.BLDG_ID||''),
    center,width,depth,
    footprint:local,
    source:'city-of-chicago-building-footprints',
  })
}

const streets=[]
for(const feature of streetsGeo.features||[]){
  for(const ring of flattenRings(feature.geometry)){
    const local=simplify(ring.map(localPoint),Math.max(1,Math.floor(ring.length/32)))
    if(local.length<2||!local.some(insideRadius))continue
    streets.push({
      name:String(feature.properties?.street_nam||feature.properties?.streetname||feature.properties?.full_street||feature.properties?.street||'').trim(),
      points:local,
      source:'city-of-chicago-street-centerlines',
    })
  }
}

await fs.mkdir(path.dirname(outFile),{recursive:true})
const manifest={
  schema:'tryamm.streetverse.chicago-proof-zone.v9',
  generatedAt:new Date().toISOString(),
  origin,
  exactDigitalTwin:false,
  authority:'public-data-grounded-game-reconstruction',
  buildings,
  streets,
  counts:{buildings:buildings.length,streets:streets.length},
}
await fs.writeFile(outFile,JSON.stringify(manifest))
console.log(`Chicago proof-zone V9 compiled: ${buildings.length} buildings, ${streets.length} street paths → ${outFile}`)
