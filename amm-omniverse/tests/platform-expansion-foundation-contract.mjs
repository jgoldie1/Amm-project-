import fs from 'node:fs'

const pkgPath=new URL('../package.json',import.meta.url)
const foundationPath=new URL('../src/foundation/platformExpansionFoundation.ts',import.meta.url)
for(const file of [pkgPath,foundationPath]){if(!fs.existsSync(file))throw new Error(`Missing platform expansion contract: ${file.pathname}`)}

const pkg=JSON.parse(fs.readFileSync(pkgPath,'utf8'))
const foundation=fs.readFileSync(foundationPath,'utf8')
const requiredDependencies={
  'three-mesh-bvh':'0.9.14',
  '@dimforge/rapier3d-compat':'0.20.0',
  'recast-navigation':'0.43.1',
  '@recast-navigation/three':'0.43.1',
  'maplibre-gl':'6.7.0',
}
for(const [name,version] of Object.entries(requiredDependencies)){
  if(pkg.dependencies?.[name]!==version)throw new Error(`Platform dependency ${name} must be pinned to ${version}`)
}
if(pkg.devDependencies?.['@gltf-transform/cli']!=='4.5.0')throw new Error('glTF-Transform CLI must be pinned to 4.5.0')
if(pkg.dependencies?.colyseus)throw new Error('Colyseus must remain evidence-gated until realtime load evidence justifies adoption')
if(pkg.dependencies?.cesium)throw new Error('Cesium must remain evidence-gated until Twin Earth performance budgets justify adoption')
if(pkg.scripts?.['asset:optimize']!=='gltf-transform optimize')throw new Error('StreetVerse GLB optimization command must remain available')

for(const token of [
  "id:'gltf-transform'",
  "id:'three-mesh-bvh'",
  "id:'rapier3d'",
  "id:'recast-navigation'",
  "id:'maplibre-twin-earth'",
  "id:'colyseus-multiplayer'",
  "id:'cesium-planet-scale'",
  "loadStreetVerseSpatialAcceleration=()=>import('three-mesh-bvh')",
  "loadStreetVersePhysics=()=>import('@dimforge/rapier3d-compat')",
  "import('recast-navigation')",
  "import('@recast-navigation/three')",
  "loadTwinEarthMap=()=>import('maplibre-gl')",
  "id:'livekit-live-panels-pk'",
  "id:'obs-rtmp-whip-ingress'",
  "id:'egress-recording-hls-restream'",
  "id:'simulcast-dynacast'",
  "id:'stream-thumbnails-previews'",
  "id:'multi-destination-restream'",
  "id:'ai-room-participants'",
  "id:'sip-telephony-live'",
  "id:'scheduled-live-premieres'",
  "id:'audience-engagement'",
  "id:'recording-replay-clips'",
  "id:'replay-to-reel-pipeline'",
  "id:'captions-translation'",
  "id:'moderation-safety'",
  "id:'creator-commerce-overlays'",
  "id:'creator-revenue-analytics'",
  "id:'content-rights-watermarking'",
  "id:'low-bandwidth-accessibility-mode'",
  "payment verification",
  "seller payable balance",
]){
  if(!foundation.includes(token))throw new Error(`Platform expansion foundation missing ${token}`)
}

console.log('Platform expansion foundation contract PASS')
