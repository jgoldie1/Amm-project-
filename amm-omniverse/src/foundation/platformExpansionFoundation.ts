export type PlatformExpansionStatus='EXISTING_STACK'|'ADOPTED_FOUNDATION'|'PROVIDER_GATED'|'EVIDENCE_GATED'
export type PlatformExpansionLane='asset-pipeline'|'world-performance'|'physics'|'navigation'|'twin-earth'|'streaming'|'creator-commerce'|'accessibility'

export type PlatformExpansionCapability={
  id:string
  lane:PlatformExpansionLane
  status:PlatformExpansionStatus
  packageName?:string
  pinnedVersion?:string
  lazy?:boolean
  authority:'OFFLINE_TOOLING'|'CLIENT_SIMULATION'|'PRESENTATION_ONLY'|'SERVER_AUTHORITATIVE'
  purpose:string
  rollback:string
}

export const PLATFORM_ENGINE_CAPABILITIES:PlatformExpansionCapability[]=[
  {id:'gltf-transform',lane:'asset-pipeline',status:'ADOPTED_FOUNDATION',packageName:'@gltf-transform/cli',pinnedVersion:'4.5.0',authority:'OFFLINE_TOOLING',purpose:'Optimize and inspect Blender GLB exports before they enter the StreetVerse asset registry.',rollback:'Remove the offline optimization step; original Blender exports remain the source of truth.'},
  {id:'three-mesh-bvh',lane:'world-performance',status:'ADOPTED_FOUNDATION',packageName:'three-mesh-bvh',pinnedVersion:'0.9.14',lazy:true,authority:'CLIENT_SIMULATION',purpose:'Accelerate dense-scene raycasts, line-of-sight, ground queries and spatial checks in large StreetVerse districts.',rollback:'Fall back to native Three.js raycasting and existing collision/query paths.'},
  {id:'rapier3d',lane:'physics',status:'ADOPTED_FOUNDATION',packageName:'@dimforge/rapier3d-compat',pinnedVersion:'0.20.0',lazy:true,authority:'CLIENT_SIMULATION',purpose:'Provide an isolated rigid-body and collider engine for vehicle/object physics pilots without rewriting current traffic.',rollback:'Disable the physics adapter and keep current StreetVerse vehicle/collision runtime.'},
  {id:'recast-navigation',lane:'navigation',status:'ADOPTED_FOUNDATION',packageName:'recast-navigation',pinnedVersion:'0.43.1',lazy:true,authority:'CLIENT_SIMULATION',purpose:'Generate navmeshes and crowd paths for residents, responders and mission NPCs around buildings and roadblocks.',rollback:'Disable navmesh pilots and retain current scripted resident/responder routes.'},
  {id:'maplibre-twin-earth',lane:'twin-earth',status:'ADOPTED_FOUNDATION',packageName:'maplibre-gl',pinnedVersion:'6.7.0',lazy:true,authority:'PRESENTATION_ONLY',purpose:'Power accessible Chicago/world maps, Passport navigation, trade corridors and Twin Earth 2D/2.5D views.',rollback:'Return to existing non-map route and dashboard views.'},
  {id:'colyseus-multiplayer',lane:'streaming',status:'EVIDENCE_GATED',authority:'SERVER_AUTHORITATIVE',purpose:'Dedicated gameplay room/state server only if Supabase/LiveKit load evidence shows a measurable need.',rollback:'Keep Supabase realtime and LiveKit as the current multiplayer/realtime stack.'},
  {id:'cesium-planet-scale',lane:'twin-earth',status:'EVIDENCE_GATED',authority:'PRESENTATION_ONLY',purpose:'Future planet-scale 3D Twin Earth client only after mobile bundle and performance budgets justify it.',rollback:'Keep MapLibre plus StreetVerse/Three.js world views.'},
]

export const STREAMING_EXPANSION_CAPABILITIES:PlatformExpansionCapability[]=[
  {id:'livekit-live-panels-pk',lane:'streaming',status:'EXISTING_STACK',authority:'SERVER_AUTHORITATIVE',purpose:'Live rooms, co-host panels, PK sessions and realtime participant transport on the existing LiveKit stack.',rollback:'Keep existing single-room/live transport paths.'},
  {id:'stream-health-adaptive-quality',lane:'streaming',status:'ADOPTED_FOUNDATION',authority:'CLIENT_SIMULATION',purpose:'Track connection quality, reconnect state and device/network constraints so mobile users can degrade gracefully.',rollback:'Use current fixed quality and reconnect behavior.'},
  {id:'recording-replay-clips',lane:'streaming',status:'PROVIDER_GATED',authority:'SERVER_AUTHORITATIVE',purpose:'Server-authorized recording, replay and Reel/clip handoff. Provider egress/transcoding actions stay gated.',rollback:'Keep browser capture and existing Reel Composer paths.'},
  {id:'captions-translation',lane:'accessibility',status:'ADOPTED_FOUNDATION',authority:'PRESENTATION_ONLY',purpose:'Live captions, translation surfaces and readable overlays for streams, panels, missions and commerce.',rollback:'Keep original audio/chat with existing accessibility controls.'},
  {id:'moderation-safety',lane:'streaming',status:'ADOPTED_FOUNDATION',authority:'SERVER_AUTHORITATIVE',purpose:'Moderation events, participant controls, teen/adult lane enforcement and auditable stream safety decisions.',rollback:'Use existing manual/admin moderation controls.'},
  {id:'creator-commerce-overlays',lane:'creator-commerce',status:'ADOPTED_FOUNDATION',authority:'PRESENTATION_ONLY',purpose:'Product pins, storefront overlays, LIVE sale UI, sponsor placements and creator calls-to-action without giving the client settlement authority.',rollback:'Return to standard marketplace/storefront routes.'},
  {id:'low-bandwidth-accessibility-mode',lane:'accessibility',status:'ADOPTED_FOUNDATION',authority:'CLIENT_SIMULATION',purpose:'Reduce rendering/stream load, preserve captions and simplify controls on constrained phones and accessible UI modes.',rollback:'Use standard rendering and stream presentation.'},
]

export const COMMERCE_AUTHORITY_BOUNDARY={
  clientMay:['render','simulate','navigate','preview','compose','request'],
  serverOnly:['payment verification','inventory mutation','customs state','logistics settlement','seller payable balance','refund authority'],
} as const

export const loadStreetVerseSpatialAcceleration=()=>import('three-mesh-bvh')
export const loadStreetVersePhysics=()=>import('@dimforge/rapier3d-compat')
export const loadStreetVerseNavigation=()=>Promise.all([import('recast-navigation'),import('@recast-navigation/three')])
export const loadTwinEarthMap=()=>import('maplibre-gl')

export function getPlatformExpansionCapability(id:string){return PLATFORM_ENGINE_CAPABILITIES.find(item=>item.id===id)||STREAMING_EXPANSION_CAPABILITIES.find(item=>item.id===id)}
export function listAdoptedPlatformCapabilities(){return [...PLATFORM_ENGINE_CAPABILITIES,...STREAMING_EXPANSION_CAPABILITIES].filter(item=>item.status==='ADOPTED_FOUNDATION'||item.status==='EXISTING_STACK')}
